// nanoguará.ia: script de produção.
// Porta o <script> do mockup aprovado (docs/mockup-aprovado-fase4.html) e liga
// o formulário e o chat de demonstração nas APIs reais (Task 4 e Task 5).
//
// Regra de segurança: nenhum innerHTML/insertAdjacentHTML recebe dado de rede
// ou de input do usuário. Texto de resposta da IA e mensagens de erro entram
// sempre por textContent ou por nós criados com createElement + append.

// ---------- Gate de efeitos: viewport, capacidade do dispositivo e reduced-motion ----------
// Ponto único que decide se os efeitos do herói (Etheral e Shimmer) rodam.
// Consultado pelos dois loops. `rm` é estado mutável: precisa ser reavaliado
// no evento "change" pra ligar/desligar a degradação no meio da visita.
let rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mqEfeitos = matchMedia('(min-width: 768px) and (hover: hover)');
let efeitosAtivos = !rm && mqEfeitos.matches;

const hero = document.querySelector('header');
const etheralHue = document.getElementById('etheralHue');
const titulo = document.getElementById('heroTitulo');

let heroVisivel = false, rafEtheral = null, timerShimmer = null, animShimmer = null;

// ---------- Fundo Etheral Shadow: hue-rotate a ~30fps, só com o herói na tela ----------
const DUR_HUE = 4000;
let t0Hue = null, ultimoHue = 0;
function giraHue(t) {
  if (!etheralHue || !efeitosAtivos || !heroVisivel) { rafEtheral = null; t0Hue = null; return; }
  if (t - ultimoHue >= 33) { // ~30fps: metade do custo, mesma leitura visual
    ultimoHue = t;
    if (t0Hue === null) t0Hue = t;
    etheralHue.setAttribute('values', String(((t - t0Hue) % DUR_HUE) / DUR_HUE * 360));
  }
  rafEtheral = requestAnimationFrame(giraHue);
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

// ---------- Sincronização: liga/desliga os dois loops a partir do gate ----------
function sincroniza() {
  if (efeitosAtivos && heroVisivel) {
    if (etheralHue && rafEtheral === null) rafEtheral = requestAnimationFrame(giraHue);
    if (suportaClip && timerShimmer === null && animShimmer === null) varre();
  } else {
    if (rafEtheral !== null) { cancelAnimationFrame(rafEtheral); rafEtheral = null; }
    paraShimmer();
  }
}

if (hero && 'IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => { heroVisivel = e.isIntersecting; sincroniza(); }, { threshold: 0 })
    .observe(hero);
} else {
  heroVisivel = true; // sem herói detectável ou sem suporte a IO: sem gate de viewport
}

mqEfeitos.addEventListener('change', (e) => { efeitosAtivos = !rm && e.matches; sincroniza(); });
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
  rm = e.matches;
  efeitosAtivos = !rm && mqEfeitos.matches;
  sincroniza();
});

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
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
}), { threshold: .2 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

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
  botao.disabled = true; botao.textContent = 'Enviando...';
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
    botao.disabled = false; botao.textContent = 'Quero uma conversa';
  }
});

// ---------- Chat de demonstração (Task 5: POST /api/chat, streaming SSE) ----------
const log = document.getElementById('demoLog');
const inp = document.getElementById('demoInput');
const btnEnviar = document.getElementById('demoSend');
const historico = [];
let enviando = false;

function addMsg(tipo, txt) {
  const d = document.createElement('div');
  d.className = 'msg ' + tipo + ' show';
  d.textContent = txt;
  log.appendChild(d); log.scrollTop = log.scrollHeight;
  return d;
}

async function envia() {
  if (enviando) return;
  const t = inp.value.trim(); if (!t) return;
  enviando = true; btnEnviar.disabled = true; inp.readOnly = true;
  addMsg('out', t); historico.push({ papel: 'user', texto: t });
  inp.value = '';
  const balao = addMsg('in', 'digitando...');
  let texto = '', pendente = null;
  const pintar = () => { balao.textContent = texto; log.scrollTop = log.scrollHeight; pendente = null; };
  try {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagens: historico.slice(-12) }),
    });
    if (!res.ok) throw new Error(String(res.status));
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
    pintar();
    historico.push({ papel: 'assistant', texto });
  } catch {
    balao.innerHTML = '';
    balao.append('Estou fora do ar agora. ');
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
