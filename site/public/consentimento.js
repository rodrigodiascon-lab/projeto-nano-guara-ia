// nanoguará.ia: consentimento de cookies de marketing e pixel da Meta.
//
// Regra (LGPD, art. 7º, I): o pixel só existe na página DEPOIS que o visitante
// clica em "Aceitar". Antes disso, e depois de "Recusar", nenhum script, pixel
// ou requisição da Meta sai deste navegador. Por isso o carregamento do
// fbevents.js mora aqui e em nenhum HTML: a CSP libera o domínio, mas só este
// arquivo decide quando pedir.
//
// Nenhum dado pessoal vai para a Meta: sem advanced matching (fbq('init') só
// recebe o ID) e com autoConfig desligado, o que impede o pixel de ler botões e
// campos da página por conta própria. O evento Lead não leva parâmetro algum.
//
// Mesma regra de segurança do app.js: nada de innerHTML; o banner é montado
// com createElement e textContent.

// ID do Conjunto de dados (pixel) criado no Gerenciador de Eventos. Não é
// segredo: aparece no código-fonte de qualquer site com pixel. Vazio = banner
// não aparece e nada carrega, que é o estado seguro até o pixel existir.
const PIXEL_ID = '1129265532898131';

// Muda junto com o texto do banner ou com a lista do que o pixel faz: uma
// escolha feita sobre outro texto deixa de valer e o banner volta a perguntar.
const VERSAO_BANNER = '2026-10-11-pixel-meta-curto';
const CHAVE = 'ng-consentimento-marketing';

function leEscolha() {
  try {
    const r = JSON.parse(localStorage.getItem(CHAVE) || 'null');
    return r && r.versao === VERSAO_BANNER ? r.escolha : null;
  } catch {
    return null; // modo privado ou armazenamento bloqueado: pergunta de novo
  }
}

function gravaEscolha(escolha) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ escolha, versao: VERSAO_BANNER, em: new Date().toISOString() }));
  } catch { /* sem armazenamento a escolha vale só para esta página */ }
}

// ---------- Pixel ----------
let pixelLigado = false;

function ligaPixel() {
  if (pixelLigado || !PIXEL_ID) return;
  pixelLigado = true;
  // Fila do fbq equivalente ao snippet oficial, só que em arquivo próprio: o
  // snippet inline seria barrado pela CSP, que não tem unsafe-inline.
  if (!window.fbq) {
    const fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    };
    fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
    window.fbq = fbq;
    if (!window._fbq) window._fbq = fbq;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
  }
  window.fbq('set', 'autoConfig', false, PIXEL_ID);
  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
}

// Cookies que o pixel grava no nosso domínio. Apagar os dois é o que faz a
// revogação valer já, sem esperar os 90 dias de validade do _fbp.
function apagaCookiesMeta() {
  const host = location.hostname;
  const dominios = ['', host, '.' + host, '.' + host.split('.').slice(-3).join('.')];
  for (const nome of ['_fbp', '_fbc']) {
    for (const d of dominios) {
      document.cookie = `${nome}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? '; domain=' + d : ''}`;
    }
  }
}

// Disparado pelo app.js quando /api/lead responde 201. Evento sem parâmetros:
// nem nome, nem WhatsApp, nem área da clínica.
document.addEventListener('ng:lead', () => {
  if (pixelLigado && window.fbq) window.fbq('track', 'Lead');
});

// Clique em qualquer botão que abre o WhatsApp (wa.me). Evento Contact sem
// parâmetros: nem o texto pronto da mensagem, nem a página de origem além da URL
// que o próprio pixel já registra no PageView. O link genérico do rodapé fica de
// fora: é contato institucional, não resposta ao anúncio, e inflava o Contact
// das landings (auditoria de conversões, 2026-10-10).
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a[href^="https://wa.me/"]');
  if (a && !a.closest('footer') && pixelLigado && window.fbq) window.fbq('track', 'Contact');
}, true);

// ---------- Banner ----------
let banner = null;

function fechaBanner() {
  if (!banner) return;
  banner.remove();
  banner = null;
  document.body.classList.remove('com-aviso-cookies');
}

function decide(escolha) {
  gravaEscolha(escolha);
  fechaBanner();
  if (escolha === 'aceito') {
    ligaPixel();
  } else {
    if (pixelLigado && window.fbq) window.fbq('consent', 'revoke');
    apagaCookiesMeta();
  }
}

function abreBanner(foco) {
  if (banner) return;
  banner = document.createElement('section');
  banner.className = 'aviso-cookies';
  banner.setAttribute('aria-labelledby', 'avisoCookiesTitulo');

  const titulo = document.createElement('h2');
  titulo.id = 'avisoCookiesTitulo';
  titulo.textContent = 'Cookies de marketing';

  // Dois textos com as mesmas informações essenciais (pixel da Meta, para que
  // serve, dados fora do Brasil, link da política): o longo no desktop e o
  // curto no celular, onde o longo cobria 30% da tela e escondia o quiz de
  // /iaparaconsultorios (medido num iPhone em 2026-10-11). O CSS escolhe qual
  // aparece; os dois estão no DOM para não depender de JS de largura.
  const texto = document.createElement('p');
  const longo = document.createElement('span');
  longo.className = 'aviso-texto-longo';
  longo.textContent = 'Com a sua permissão, usamos o pixel da Meta para saber quais anúncios trazem visitas e contatos pelo WhatsApp e para mostrar nossos anúncios a quem já passou por aqui. A Meta trata esses dados em servidores fora do Brasil. O pixel só é ativado se você aceitar, e recusar não muda nada na navegação. ';
  const curto = document.createElement('span');
  curto.className = 'aviso-texto-curto';
  curto.textContent = 'Com sua permissão, o pixel da Meta (servidores fora do Brasil) mede nossos anúncios e os mostra a quem passou por aqui. ';
  texto.append(longo, curto);
  const saiba = document.createElement('a');
  saiba.href = '/privacidade#cookies';
  saiba.textContent = 'Saiba mais';
  texto.append(saiba, '.');

  // Aceitar e recusar com o mesmo peso visual: recusar não pode dar mais
  // trabalho nem parecer a opção errada (guia de cookies da ANPD, 2022).
  const acoes = document.createElement('div');
  acoes.className = 'aviso-cookies-acoes';
  const botao = (rotulo, escolha) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-secundario btn-sm';
    b.textContent = rotulo;
    b.addEventListener('click', () => decide(escolha));
    return b;
  };
  const recusar = botao('Recusar', 'recusado');
  acoes.append(recusar, botao('Aceitar', 'aceito'));

  banner.append(titulo, texto, acoes);
  document.body.append(banner);
  document.body.classList.add('com-aviso-cookies');
  // Só move o foco quando o próprio visitante pediu o banner (link do rodapé).
  // Na abertura automática, roubar o foco atrapalharia quem usa leitor de tela.
  if (foco) recusar.focus();
}

// ---------- Início ----------
if (PIXEL_ID) {
  // O rodapé traz o botão "Preferências de cookies" escondido: ele só faz
  // sentido quando existe algo para aceitar ou recusar.
  document.querySelectorAll('[data-preferencias-cookies]').forEach((el) => {
    el.hidden = false;
    const b = el.querySelector('button') || el;
    b.addEventListener('click', () => abreBanner(true));
  });

  const escolha = leEscolha();
  if (escolha === 'aceito') ligaPixel();
  else if (escolha === null) abreBanner(false);
}
