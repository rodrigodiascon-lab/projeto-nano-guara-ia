// nanoguará.ia: script de produção.
// Porta o <script> do mockup aprovado (docs/mockup-aprovado-fase4.html) e liga
// o formulário e o chat de demonstração nas APIs reais (Task 4 e Task 5).
//
// Regra de segurança: nenhum innerHTML/insertAdjacentHTML recebe dado de rede
// ou de input do usuário. Texto de resposta da IA e mensagens de erro entram
// sempre por textContent ou por nós criados com createElement + append.

const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Gradient Shimmer no headline (Web Animations API) ----------
// Estado padrão do H1 é texto sólido (ver styles.css); o gradiente só aparece
// quando a classe .anima está presente, adicionada aqui só quando a
// varredura de fato vai animar.
const titulo = document.getElementById('heroTitulo');
if (titulo && !rm && CSS.supports('background-clip', 'text') && typeof titulo.animate === 'function') {
  const SPREAD = 150, DUR = 1450, PAUSA = 1100;
  titulo.classList.add('anima');
  let varre = () => {
    const w = titulo.getBoundingClientRect().width || 600;
    const layer = w + SPREAD * 2;
    titulo.style.backgroundSize = layer + 'px 100%';
    const ini = -SPREAD - layer / 2, fim = w + SPREAD - layer / 2;
    const anim = titulo.animate(
      [{ backgroundPosition: ini + 'px center' }, { backgroundPosition: fim + 'px center' }],
      { duration: DUR, easing: 'cubic-bezier(0.45,0,0.55,1)', fill: 'forwards' });
    anim.onfinish = () => setTimeout(varre, PAUSA);
  };
  varre();
}

// ---------- Fundo Etheral Shadow: hue-rotate contínuo ----------
// Só roda com o herói na tela (IntersectionObserver), com throttle de ~30fps,
// e para se o usuário ligar "reduzir movimento" durante a visita.
const etheralHue = document.getElementById('etheralHue');
if (etheralHue && !rm) {
  const DUR = 4000, FRAME_MS = 1000 / 30;
  let t0 = null, ultimoFrame = 0, ativo = false, rodando = false;

  function passo(t) {
    if (!ativo) { rodando = false; return; }
    if (t0 === null) t0 = t;
    if (t - ultimoFrame >= FRAME_MS) {
      etheralHue.setAttribute('values', String(((t - t0) % DUR) / DUR * 360));
      ultimoFrame = t;
    }
    requestAnimationFrame(passo);
  }
  function inicia() {
    if (rodando) return;
    rodando = true; t0 = null;
    requestAnimationFrame(passo);
  }

  const headerEl = document.querySelector('header');
  if (headerEl && 'IntersectionObserver' in window) {
    const ioHero = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        ativo = e.isIntersecting;
        if (ativo) inicia();
      });
    }, { threshold: 0 });
    ioHero.observe(headerEl);
  } else {
    ativo = true;
    inicia();
  }

  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (e.matches) ativo = false;
  });
}

// ---------- Chat mockup do herói: mensagens em sequência (storytelling) ----------
const heroMsgs = document.querySelectorAll('#chatHero .msg');
if (rm) heroMsgs.forEach((m) => m.classList.add('show'));
else heroMsgs.forEach((m, i) => setTimeout(() => m.classList.add('show'), 800 + i * 1100));

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
