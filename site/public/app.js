// nanoguará.ia: script de produção.
// Porta o <script> do mockup aprovado (docs/mockup-aprovado-fase4.html) e liga
// o formulário e o chat de demonstração nas APIs reais (Task 4 e Task 5).
//
// Regra de segurança: nenhum innerHTML/insertAdjacentHTML recebe dado de rede
// ou de input do usuário. Texto de resposta da IA e mensagens de erro entram
// sempre por textContent ou por nós criados com createElement + append.

// ---------- Gate de efeitos: viewport, capacidade do dispositivo e reduced-motion ----------
// Ponto único que decide se os efeitos do herói (Topografia e Shimmer) rodam.
// Consultado pelos dois efeitos. `rm` é estado mutável: precisa ser reavaliado
// no evento "change" pra ligar/desligar a degradação no meio da visita.
let rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mqEfeitos = matchMedia('(min-width: 768px) and (hover: hover)');
let efeitosAtivos = !rm && mqEfeitos.matches;

const hero = document.querySelector('header');
const topo = document.getElementById('heroTopo');
const titulo = document.getElementById('heroTitulo');

let heroVisivel = false, timerShimmer = null, animShimmer = null;

// ---------- Fundo do herói: topografia luminosa ----------
// Curvas de nível deterministicas (semente fixa) desenhadas uma vez em SVG.
// A deriva das camadas e a faixa de luz que as acende são CSS puro, ligado e
// desligado pela classe .anima, entao nao ha loop de JS por frame aqui.
function desenhaTopografia() {
  if (!topo || topo.firstChild) return;

  const W = 1200, H = 760, MARGIN = 96, STEP = 60;
  const SEMENTE = 7, CAMADAS = 3, DENSIDADE = 1.15, DERIVA = 1, LINHA = 1.4;
  // area de leitura: as curvas rareiam aqui pra nao competir com o titulo
  const LEITURA = { x: 0.02, y: 0.10, w: 0.56, h: 0.80 };
  // o relevo se concentra do lado do mockup de conversa
  const FOCAIS = [{ x: 0.76, y: 0.38 }, { x: 0.62, y: 0.72 }];

  const r1 = (n) => Math.round(n * 10) / 10;
  const limita = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

  function sorteio(semente) {
    let a = semente >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function curva(pts) {
    let d = `M ${r1(pts[0][0])} ${r1(pts[0][1])}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
      d += ` C ${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)},`
         + ` ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)},`
         + ` ${r1(p2[0])} ${r1(p2[1])}`;
    }
    return d;
  }

  const focais = FOCAIS.map((f, i) => ({
    x: f.x * W, y: f.y * H, amp: 74 - i * 12, sx: 210 - i * 26, sy: 150 - i * 18,
  }));

  const camadas = [];
  for (let li = 0; li < CAMADAS; li++) {
    const s = sorteio(SEMENTE * 2654435761 + li * 40503 + 17);
    const harmonicos = Array.from({ length: 3 }, () => ({
      f: 0.0032 + s() * 0.0052,
      a: (5 + s() * 9) * (1 - li * 0.12),
      p: s() * Math.PI * 2,
      g: (s() - 0.5) * 0.012,
    }));
    const qtd = Math.max(5, Math.round((8 + DENSIDADE * 6) * (1 - li * 0.07)));
    const passo = (H + MARGIN * 2) / qtd;
    const linhas = [];
    for (let k = 0; k < qtd; k++) {
      const baseY = -MARGIN + passo * (k + 0.5) + (s() - 0.5) * 7;
      const pts = [];
      for (let x = -MARGIN; x <= W + MARGIN; x += STEP) {
        let desl = 0;
        for (const f of focais) {
          const dx = x - f.x, ex = Math.exp(-(dx * dx) / (2 * f.sx * f.sx));
          const dy = baseY - f.y, vy = Math.exp(-(dy * dy) / (2 * f.sy * f.sy));
          desl += f.amp * ex * (0.52 + 0.48 * vy * (dy >= 0 ? 1 : -1)) * (1 - li * 0.14);
        }
        for (const h of harmonicos) desl += h.a * Math.sin(x * h.f + h.p + baseY * h.g);
        pts.push([x, baseY - desl]);
      }
      linhas.push({ d: curva(pts), o: r1(limita(0.46 - li * 0.12, 0.12, 0.5)) });
    }
    const dir = li % 2 === 0 ? -1 : 1;
    camadas.push({
      linhas,
      dx: r1(dir * (18 - li * 4) * DERIVA),
      dy: r1(-(7 - li * 1.5) * DERIVA),
      dur: r1(16 + li * 6 + (li === 0 ? 0 : 2)),
    });
  }

  const area = {
    cx: (LEITURA.x + LEITURA.w / 2) * W, cy: (LEITURA.y + LEITURA.h / 2) * H,
    rx: (LEITURA.w / 2) * W * 1.18, ry: (LEITURA.h / 2) * H * 1.18,
  };
  const NS = 'http://www.w3.org/2000/svg';
  const no = (nome, attr) => {
    const e = document.createElementNS(NS, nome);
    for (const k in attr) e.setAttribute(k, attr[k]);
    return e;
  };
  const grad = (id, cx, cy, r, paradas) => {
    const g = no('radialGradient', { id, cx, cy, r });
    for (const [off, cor, op] of paradas) {
      g.appendChild(no('stop', { offset: off, 'stop-color': cor, 'stop-opacity': op }));
    }
    return g;
  };

  const svg = no('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid slice', role: 'presentation' });
  const defs = no('defs');
  defs.appendChild(grad('topoWash', `${(focais[0].x / W) * 100}%`, `${(focais[0].y / H) * 100}%`, '72%',
    [['0%', 'var(--topo-acento)', '0.16'], ['55%', 'var(--topo-acento)', '0.05'], ['100%', 'var(--topo-acento)', '0']]));
  defs.appendChild(grad('topoLuz', '50%', '50%', '50%',
    [['0%', '#fff', '1'], ['55%', '#fff', '0.55'], ['100%', '#fff', '0']]));
  defs.appendChild(grad('topoAreaGrad', '50%', '50%', '50%',
    [['0%', 'rgb(26,26,26)', '1'], ['62%', 'rgb(120,120,120)', '1'], ['100%', '#fff', '1']]));

  const mArea = no('mask', { id: 'topoArea', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H });
  mArea.appendChild(no('rect', { x: 0, y: 0, width: W, height: H, fill: '#fff' }));
  mArea.appendChild(no('ellipse', { cx: r1(area.cx), cy: r1(area.cy), rx: r1(area.rx), ry: r1(area.ry), fill: 'url(#topoAreaGrad)' }));
  defs.appendChild(mArea);

  const mLuz = no('mask', { id: 'topoLuzMask', maskUnits: 'userSpaceOnUse', x: -W, y: -H, width: W * 3, height: H * 3 });
  const varredura = no('g', { class: 'topo-varre' });
  varredura.appendChild(no('ellipse', { cx: W / 2, cy: H * 0.5, rx: W * 0.42, ry: H * 0.72, fill: 'url(#topoLuz)' }));
  mLuz.appendChild(varredura);
  defs.appendChild(mLuz);

  svg.appendChild(defs);
  svg.appendChild(no('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#topoWash)' }));

  const conjunto = no('g', { mask: 'url(#topoArea)' });
  camadas.forEach((c, li) => {
    const g = no('g', { class: 'topo-camada', 'data-i': li });
    g.style.setProperty('--dx', c.dx + 'px');
    g.style.setProperty('--dy', c.dy + 'px');
    g.style.setProperty('--dur', c.dur + 's');
    g.style.animationDelay = r1(-li * 2.5) + 's';
    const apagadas = no('g', { class: 'topo-dim' });
    const acesas = no('g', { class: 'topo-bri', mask: 'url(#topoLuzMask)' });
    for (const l of c.linhas) {
      apagadas.appendChild(no('path', { d: l.d, 'stroke-opacity': l.o, 'stroke-width': r1(LINHA * (1 - li * 0.12)), 'stroke-linecap': 'round' }));
      acesas.appendChild(no('path', { d: l.d, 'stroke-opacity': '0.9', 'stroke-width': r1(LINHA * (1 - li * 0.08)), 'stroke-linecap': 'round' }));
    }
    g.appendChild(apagadas);
    g.appendChild(acesas);
    conjunto.appendChild(g);
  });
  svg.appendChild(conjunto);
  topo.appendChild(svg);
}

// ---------- Gradient Shimmer no headline (Web Animations API) ----------
// Estado padrão do H1 é texto sólido (ver styles.css); o gradiente só existe
// com a classe .anima presente, adicionada aqui só enquanto a varredura de
// fato está rodando, e removida assim que ela para.
const SPREAD = 150, DUR_SWEEP = 1450, PAUSA = 1100;
const suportaClip = titulo && (CSS.supports('background-clip', 'text') || CSS.supports('-webkit-background-clip', 'text'));
function varre() {
  if (!suportaClip || typeof titulo.animate !== 'function' || !efeitosAtivos || !heroVisivel) return;
  titulo.classList.add('anima');
  const w = titulo.getBoundingClientRect().width || 600;
  const layer = w + SPREAD * 2;
  titulo.style.backgroundSize = layer + 'px 100%';
  const ini = -SPREAD - layer / 2, fim = w + SPREAD - layer / 2;
  animShimmer = titulo.animate(
    [{ backgroundPosition: ini + 'px center' }, { backgroundPosition: fim + 'px center' }],
    { duration: DUR_SWEEP, easing: 'cubic-bezier(0.45,0,0.55,1)', fill: 'forwards' }
  );
  animShimmer.onfinish = () => { timerShimmer = setTimeout(varre, PAUSA); };
}
function paraShimmer() {
  clearTimeout(timerShimmer); timerShimmer = null;
  if (animShimmer) { animShimmer.cancel(); animShimmer = null; }
  if (titulo) titulo.classList.remove('anima'); // volta ao texto sólido legível
}

// ---------- Sincronização: liga/desliga os dois efeitos a partir do gate ----------
function sincroniza() {
  if (efeitosAtivos && heroVisivel) {
    if (topo) topo.classList.add('anima');
    if (suportaClip && timerShimmer === null && animShimmer === null) varre();
  } else {
    if (topo) topo.classList.remove('anima');
    paraShimmer();
  }
}

if (hero && 'IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => { heroVisivel = e.isIntersecting; sincroniza(); }, { threshold: 0 })
    .observe(hero);
} else {
  heroVisivel = true; // sem herói detectável ou sem suporte a IO: sem gate de viewport
}

// Safari até 13.1 não implementa addEventListener em MediaQueryList, só o
// addListener antigo. Sem este fallback a chamada lança TypeError e aborta todo
// o resto do arquivo: o reveal nunca roda e a página fica praticamente em
// branco abaixo do herói, com formulário e chat mortos.
function ouveMq(mq, fn) {
  if (typeof mq.addEventListener === 'function') mq.addEventListener('change', fn);
  else if (typeof mq.addListener === 'function') mq.addListener(fn);
}

ouveMq(mqEfeitos, (e) => { efeitosAtivos = !rm && e.matches; sincroniza(); });
ouveMq(matchMedia('(prefers-reduced-motion: reduce)'), (e) => {
  rm = e.matches;
  efeitosAtivos = !rm && mqEfeitos.matches;
  sincroniza();
});

// O fundo do herói é desenhado SEMPRE, inclusive em mobile e com movimento
// reduzido: ele é a textura da página, não um enfeite animado. O gate acima
// controla só a deriva das camadas e a faixa de luz, via classe .anima.
desenhaTopografia();

// Não disputar a main thread durante o carregamento
if ('requestIdleCallback' in window) requestIdleCallback(sincroniza);
else addEventListener('load', sincroniza);

// ---------- Chat mockup do herói: mensagens em sequência (storytelling) ----------
// Dispara só quando o herói entra na tela, pra não perder a sequência em
// mobile (onde o herói pode estar fora da viewport no load).
const heroMsgs = document.querySelectorAll('#chatHero .msg');
function disparaChatHero() {
  if (rm) heroMsgs.forEach((m) => m.classList.add('show'));
  else heroMsgs.forEach((m, i) => setTimeout(() => m.classList.add('show'), 800 + i * 1100));
}
if (heroMsgs.length) {
  if (hero && 'IntersectionObserver' in window) {
    const ioChatHero = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { disparaChatHero(); ioChatHero.disconnect(); }
    }, { threshold: 0 });
    ioChatHero.observe(hero);
  } else {
    disparaChatHero();
  }
}

// ---------- Reveal on scroll ----------
// Sem IntersectionObserver, tudo que é .reveal ficaria com opacity:0 para
// sempre: o fallback revela de uma vez em vez de esconder o conteúdo.
const alvosReveal = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
  }), { threshold: .2 });
  alvosReveal.forEach((el) => io.observe(el));
} else {
  alvosReveal.forEach((el) => el.classList.add('on'));
}

// ---------- WhatsApp ----------
const WHATS = '5592981486875'; // (92) 98148-6875 em formato internacional, só dígitos
function linkWhats(msg) {
  return `https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`;
}

// ---------- Formulário de leads (Task 4: POST /api/lead) ----------
const form = document.getElementById('leadForm');
const okMsg = document.getElementById('okMsg');
function mostraMsg(texto, tipo) {
  okMsg.textContent = texto;
  okMsg.className = 'form-msg ' + tipo;
  okMsg.hidden = false;
}
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const botao = form.querySelector('button[type="submit"]');
  // O botão tem dois spans (texto + chamada com seta) para o efeito de hover do
  // CSS. Reescrever botao.textContent direto apagaria os dois; troca-se o texto
  // de cada span e restaura-se o original depois, em vez de textContent puro.
  const botaoTexto = botao.querySelector('.btn-texto');
  const botaoSeta = botao.querySelector('.btn-seta');
  const textoOriginal = botaoTexto.textContent;
  const setaOriginal = botaoSeta.textContent;
  botao.disabled = true; botaoTexto.textContent = 'Enviando...'; botaoSeta.textContent = 'Enviando...';
  const fd = new FormData(form);
  try {
    const res = await fetch('/api/lead', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: fd.get('nome'), profissao: fd.get('profissao'), whatsapp: fd.get('whatsapp'),
        dor: fd.get('dor') || '', origem: 'form', consentimento: true,
        turnstileToken: fd.get('cf-turnstile-response') || '',
      }),
    });
    if (res.status === 201) {
      mostraMsg('Recebido! Vamos te chamar no WhatsApp em breve.', 'sucesso');
      form.reset();
    } else {
      const { erro } = await res.json().catch(() => ({ erro: '' }));
      mostraMsg(erro || 'Não consegui enviar. Tente pelo WhatsApp.', 'erro');
    }
  } catch {
    mostraMsg('Sem conexão. Tente pelo WhatsApp.', 'erro');
  } finally {
    if (window.turnstile) window.turnstile.reset();
    botao.disabled = false; botaoTexto.textContent = textoOriginal; botaoSeta.textContent = setaOriginal;
  }
});

// ---------- Chat de demonstração (Task 5: POST /api/chat, streaming SSE) ----------
const log = document.getElementById('demoLog');
const inp = document.getElementById('demoInput');
const btnEnviar = document.getElementById('demoSend');
const historico = [];
let enviando = false;

function addMsg(tipo, txt, mudo) {
  const d = document.createElement('div');
  d.className = 'msg ' + tipo + ' show';
  d.textContent = txt;
  // O #demoLog é uma região aria-live: reescrever o texto do balão a cada
  // quadro do streaming faria o leitor de tela reanunciar a resposta inteira
  // repetidas vezes. O balão em construção fica mudo e, no fim, é trocado por
  // um nó novo, cuja inserção dispara um anúncio único.
  if (mudo) d.setAttribute('aria-hidden', 'true');
  log.appendChild(d); log.scrollTop = log.scrollHeight;
  return d;
}

async function envia() {
  if (enviando) return;
  const t = inp.value.trim(); if (!t) return;
  enviando = true; btnEnviar.disabled = true; inp.readOnly = true;
  addMsg('out', t); historico.push({ papel: 'user', texto: t });
  inp.value = '';
  const balao = addMsg('in', 'digitando...', true);
  let texto = '', pendente = null, msgErro = '';
  const pintar = () => { balao.textContent = texto; log.scrollTop = log.scrollHeight; pendente = null; };
  try {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagens: historico.slice(-12) }),
    });
    if (!res.ok) {
      // O servidor manda um texto próprio em 429 e 400 ("mandou muitas
      // mensagens seguidas", "mensagem longa demais"). Dizer "estou fora do ar"
      // nesses casos é informação errada: o serviço está no ar.
      const corpo = await res.json().catch(() => ({}));
      msgErro = corpo.erro || '';
      throw new Error(String(res.status));
    }
    const reader = res.body.getReader(); const dec = new TextDecoder(); let acc = '';
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      acc += dec.decode(value, { stream: true });
      const partes = acc.split('\n\n'); acc = partes.pop();
      for (const p of partes) {
        const linha = p.replace(/^data: /, '').trim();
        if (!linha || linha === '[DONE]') continue;
        try { texto += JSON.parse(linha).response || ''; } catch { /* evento não-JSON: ignorar */ }
      }
      if (!pendente) pendente = requestAnimationFrame(pintar);
    }
    if (pendente) cancelAnimationFrame(pendente);
    balao.remove();
    addMsg('in', texto);
    historico.push({ papel: 'assistant', texto });
  } catch {
    // A mensagem recusada NÃO pode ficar no histórico: ela seria reenviada em
    // toda requisição seguinte (slice(-12)), o servidor recusaria de novo e o
    // chat travaria pelo resto da sessão exibindo erro com o serviço no ar.
    historico.pop();
    balao.removeAttribute('aria-hidden');
    balao.textContent = '';
    balao.append((msgErro || 'Estou fora do ar agora.') + ' ');
    const a = document.createElement('a');
    a.href = linkWhats('Oi! A demo do site estava fora do ar. Quero falar com alguém.');
    a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Chamar no WhatsApp';
    balao.append(a);
  } finally {
    enviando = false; btnEnviar.disabled = false; inp.readOnly = false; inp.focus();
  }
}
btnEnviar.addEventListener('click', envia);
inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') envia(); });
