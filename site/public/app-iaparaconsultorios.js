// Quiz de captura do guara.bot. Todo estado visual muda por atributo, classe
// ou hidden, nunca por .style: a CSP do site (style-src 'self' sem
// unsafe-inline) bloquearia style escrito por JS.

const quiz = document.getElementById('quiz');
const contagem = document.getElementById('contagem');
const btnVoltar = document.getElementById('btnVoltar');
const respostas = {};
const historico = [1];

// ---------- Turnstile (render explícito na última etapa) ----------
let turnstileId = null;
function renderizaTurnstile() {
  if (turnstileId !== null || !window.turnstile) return;
  const box = document.getElementById('turnstileBox');
  turnstileId = window.turnstile.render(box, {
    sitekey: box.dataset.sitekey,
    theme: 'auto',
    size: 'flexible',
    // Só aparece se o Cloudflare precisar de desafio; senão resolve invisível
    // e não empurra o botão para fora da tela.
    appearance: 'interaction-only',
  });
}
// Chamado pelo api.js (?onload=) caso o script chegue depois de a pessoa já
// estar na última etapa.
window.onTurnstileCarregado = () => { if (quiz.dataset.etapa === '6') renderizaTurnstile(); };

function tokenAtual() {
  if (turnstileId === null || !window.turnstile) return '';
  return window.turnstile.getResponse(turnstileId) || '';
}
// Sem token o /api/lead devolve 403 e o lead não entra no banco. Espera um
// pouco pelo desafio invisível, mas nunca segura o WhatsApp mais que o limite.
async function esperaToken(limiteMs) {
  const fim = Date.now() + limiteMs;
  while (Date.now() < fim) {
    const t = tokenAtual();
    if (t) return t;
    await new Promise((r) => setTimeout(r, 200));
  }
  return tokenAtual();
}

// Enquanto "integrar" não é respondido, assume-se a trilha longa (6 etapas).
function trilhaTotal() {
  return respostas.integrar === 'Não' ? 5 : 6;
}

// Funil do quiz: conta quantas pessoas chegam a cada etapa, por anúncio de
// origem. Só o nome da etapa e o utm_content vão para o servidor, uma vez por
// etapa e por carregamento da página; nada de resposta, nome ou telefone.
// Melhor esforço: se o beacon falhar, o quiz segue igual.
const etapasRegistradas = new Set();
const utmAnuncio = (new URLSearchParams(location.search).get('utm_content') || '').slice(0, 30);
function registraEtapa(etapa) {
  if (etapasRegistradas.has(etapa)) return;
  etapasRegistradas.add(etapa);
  try {
    const corpo = new Blob([JSON.stringify({ etapa, utm: utmAnuncio })], { type: 'application/json' });
    if (!navigator.sendBeacon || !navigator.sendBeacon('/api/quiz-etapa', corpo)) {
      fetch('/api/quiz-etapa', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: corpo }).catch(() => {});
    }
  } catch { /* sem registro, sem problema */ }
}

function mostraEtapa(n) {
  registraEtapa(String(n));
  document.querySelectorAll('.etapa').forEach((e) => { e.hidden = Number(e.dataset.etapa) !== n; });
  quiz.dataset.etapa = String(n);
  const total = trilhaTotal();
  const posicao = historico.length;
  // (posicao - 1): a barra mostra o que já foi respondido, não a etapa atual.
  const pct = Math.round(((posicao - 1) / total) * 10) * 10;
  quiz.dataset.progress = String(Math.min(100, Math.max(0, pct)));
  // Na última etapa o total já é certo, mas "5 de 5" logo depois de "4 de 6"
  // confunde; "Último passo" diz o que importa.
  contagem.textContent = n === 6 ? 'Último passo' : `Pergunta ${posicao} de ${total}`;
  btnVoltar.hidden = historico.length <= 1;
  if (n === 6) renderizaTurnstile();
}

function avanca(destino) {
  historico.push(destino);
  mostraEtapa(destino);
  // Foco na pergunta nova: o leitor de tela anuncia a troca.
  const h2 = document.querySelector(`.etapa[data-etapa="${destino}"] h2`);
  if (h2) { h2.setAttribute('tabindex', '-1'); h2.focus({ preventScroll: true }); }
  // No celular, traz o topo do card de volta à vista sem pular a página.
  const topo = quiz.getBoundingClientRect().top;
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (topo < 0) quiz.scrollIntoView({ block: 'start', behavior: suave ? 'smooth' : 'auto' });
}

btnVoltar.addEventListener('click', () => {
  if (historico.length <= 1) return;
  historico.pop();
  mostraEtapa(historico[historico.length - 1]);
});

// "click", e não "change": ao voltar e tocar na mesma resposta o radio já está
// marcado, "change" não dispara e o quiz ficava parado sem botão nenhum.
function aoEscolher(nome, fn) {
  document.querySelectorAll(`input[name="${nome}"]`).forEach((r) => {
    r.addEventListener('click', () => fn(r.value));
  });
}

// Grupo com "Outro": escolha comum avança; "Outro" abre campo e botão.
function grupoComOutro(nome, sufixo, proximo) {
  const campo = document.getElementById(`campo${sufixo}Outro`);
  const texto = document.getElementById(`${sufixo.toLowerCase()}OutroTexto`);
  const acoes = document.getElementById(`acoes${sufixo}`);
  aoEscolher(nome, (valor) => {
    const outro = valor === 'Outro';
    campo.hidden = !outro;
    acoes.hidden = !outro;
    if (outro) { texto.focus(); return; }
    respostas[nome] = valor;
    avanca(proximo);
  });
  document.getElementById(`btnContinuar${sufixo}`).addEventListener('click', () => {
    const v = texto.value.trim();
    if (!v) { texto.focus(); return; }
    respostas[nome] = v;
    avanca(proximo);
  });
}

grupoComOutro('segmento', 'Segmento', 2);
aoEscolher('equipe', (v) => { respostas.equipe = v; avanca(3); });
aoEscolher('volume', (v) => { respostas.volume = v; avanca(4); });
aoEscolher('integrar', (v) => { respostas.integrar = v; avanca(v === 'Sim' ? 5 : 6); });
grupoComOutro('software', 'Software', 6);

// ---------- Etapa 6: contato + envio ----------
const WHATS = '5592981486875'; // mesmo número de /app.js
function linkWhats(msg) { return `https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`; }

const form = document.getElementById('quizForm');
const okMsg = document.getElementById('okMsg');
const linkFinal = document.getElementById('linkWhatsFinal');
const acoesFinal = document.querySelector('.quiz-acoes-final');
// A mensagem muda de lugar no DOM: erro vai logo abaixo do campo com problema
// (no celular, acima do botão ficava ~350px longe do campo e fora da tela);
// sucesso fica acima do botão.
function mostraMsg(texto, tipo, depoisDe) {
  okMsg.textContent = texto;
  okMsg.className = 'form-msg ' + tipo;
  if (depoisDe) depoisDe.after(okMsg); else acoesFinal.before(okMsg);
  okMsg.hidden = false;
}

// aria-invalid faz o leitor de tela anunciar o campo com erro junto com a
// mensagem (aria-describedby="okMsg" no HTML). Ao corrigir, some o estado e o
// texto: com o texto velho lá, o próximo campo seria descrito pelo erro antigo.
const camposValidados = ['campoNome', 'campoTelefone', 'consent'].map((id) => document.getElementById(id));
camposValidados.forEach((c) => {
  c.addEventListener(c.type === 'checkbox' ? 'change' : 'input', () => {
    if (!c.hasAttribute('aria-invalid')) return;
    c.removeAttribute('aria-invalid');
    okMsg.hidden = true;
    okMsg.textContent = '';
  });
});
function erroNoCampo(campo, texto) {
  camposValidados.forEach((c) => c.removeAttribute('aria-invalid'));
  campo.setAttribute('aria-invalid', 'true');
  mostraMsg(texto, 'erro', campo.closest('.consent') || campo.closest('label'));
  // focus() sozinho rola só até o campo; a mensagem, logo abaixo, podia ficar
  // fora da tela (consentimento em 375×667). Primeiro o campo, depois a
  // mensagem, os dois com "nearest": se já estão à vista, nada se move.
  campo.focus({ preventScroll: true });
  (campo.closest('.consent') || campo.closest('label')).scrollIntoView({ block: 'nearest' });
  okMsg.scrollIntoView({ block: 'nearest' });
}

let enviando = false;
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (quiz.dataset.etapa !== '6' || enviando) return; // Enter num campo "Outro" não submete

  const nome = document.getElementById('campoNome').value.trim();
  const telefone = document.getElementById('campoTelefone').value.replace(/\D/g, '');
  const email = document.getElementById('campoEmail').value.trim();

  if (!nome) { erroNoCampo(document.getElementById('campoNome'), 'Preencha seu nome.'); return; }
  // Mesma regra do servidor (lead-route.ts): 10 a 13 dígitos.
  if (telefone.length < 10 || telefone.length > 13) {
    erroNoCampo(document.getElementById('campoTelefone'), 'Confira o telefone com DDD, por exemplo (92) 98888-7777.');
    return;
  }
  if (!document.getElementById('consent').checked) {
    erroNoCampo(document.getElementById('consent'), 'Marque a autorização de contato para continuar.');
    return;
  }
  camposValidados.forEach((c) => c.removeAttribute('aria-invalid'));

  enviando = true;
  registraEtapa('envio');
  const btn = document.getElementById('btnFinalizar');
  btn.disabled = true;
  btn.querySelector('.btn-texto').textContent = 'Enviando...';
  btn.querySelector('.btn-seta').textContent = 'Enviando...';

  const integrarTxt = respostas.integrar === 'Sim'
    ? `Sim (${respostas.software || 'não especificado'})`
    : 'Não';
  const linhas = [
    `Segmento: ${respostas.segmento || '-'}`,
    `Equipe de agendamento: ${respostas.equipe || '-'}`,
    `Conversas/mês no WhatsApp: ${respostas.volume || '-'}`,
    `Integrar sistema de gestão: ${integrarTxt}`,
  ];

  const token = await esperaToken(3000);

  // Melhor esforço: grava no mesmo banco de leads do site pelo /api/lead, com
  // origem própria. O email NÃO vai para o banco: a política de privacidade
  // ainda não o lista entre os dados coletados. Ele segue só na mensagem que a
  // própria pessoa envia. keepalive: o envio sobrevive à troca de página.
  const envio = fetch('/api/lead', {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome,
      profissao: (respostas.segmento || 'Não informado').slice(0, 40),
      whatsapp: telefone,
      dor: linhas.join(' | ').slice(0, 500),
      origem: 'iaparaconsultorios',
      consentimento: true,
      turnstileToken: token,
    }),
  }).then((res) => {
    // Só um aviso, sem dado nenhum do quiz. Quem decide se vira evento Lead da
    // Meta é o consentimento.js, e só com o pixel aceito.
    if (res.status === 201) {
      document.dispatchEvent(new CustomEvent('ng:lead'));
      registraEtapa('lead_ok');
    }
  }).catch(() => {});

  const msgWhats = [
    'Oi! Fiz o quiz do guara.bot no site e quero saber mais.',
    '',
    ...linhas,
    '',
    `Meu nome: ${nome}`,
    ...(email ? [`Meu email: ${email}`] : []),
  ].join('\n');
  const url = linkWhats(msgWhats);

  mostraMsg('Perfeito! Abrindo o WhatsApp com suas respostas...', 'sucesso');
  // O botão "Enviando..." parado dá cara de erro se o redirect não abrir; o
  // link passa a ser a ação principal.
  document.querySelector('.quiz-acoes-final').hidden = true;
  document.getElementById('microNota').hidden = true;
  linkFinal.href = url;
  linkFinal.hidden = false;
  quiz.dataset.progress = '100';
  document.getElementById('avatarFinal').src = '/brand/guara-bot/05-confirmacao-128.webp';

  // Espera a resposta do /api/lead (o Lead da Meta sai dela) antes de trocar
  // de página, mas nunca segura o WhatsApp mais que 2 s.
  const minimo = new Promise((r) => setTimeout(r, 700));
  const limite = new Promise((r) => setTimeout(r, 2000));
  Promise.race([Promise.all([envio, minimo]), limite]).then(() => { window.location.href = url; });
});

mostraEtapa(1);
