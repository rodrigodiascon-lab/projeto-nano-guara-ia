// /guarabot/barbearias. CSP estrita: nada de .style, só classes e atributos.
(function () {
  if (!('IntersectionObserver' in window)) return;

  // 1. Barra fixa de WhatsApp (celular): esconde enquanto outro CTA de verdade
  //    está na tela, para não empilhar dois botões iguais nem cobrir o do card.
  var barra = document.querySelector('.gb-barra-whats');
  var alvosCta = document.querySelectorAll('.gb-hero .ctas .btn, .gb-calc-cta, .gb-cartao-preco .btn, .gb-final .btn, #gbForm');
  if (barra && alvosCta.length) {
    var visiveis = new Set();
    var ioCta = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) visiveis.add(e.target); else visiveis.delete(e.target);
      });
      var some = visiveis.size > 0;
      barra.classList.toggle('oculta', some);
      // inert tira a barra escondida da ordem de Tab e do leitor de tela.
      barra.toggleAttribute('inert', some);
    }, { threshold: 0, rootMargin: '0px 0px -80px 0px' });
    alvosCta.forEach(function (a) { ioCta.observe(a); });
  }

  // 2. Conversas de exemplo aparecem mensagem a mensagem ao entrar na tela.
  //    Sem JS ou com movimento reduzido, ficam visíveis desde o início (o CSS
  //    só esconde com [data-js] + .espera).
  var chats = document.querySelectorAll('[data-chat]');
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!chats.length || reduz) return;

  document.documentElement.setAttribute('data-js', '');
  chats.forEach(function (c) { c.classList.add('espera'); });

  var io = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.remove('espera');
      io.unobserve(e.target);
    });
  }, { threshold: 0.35 });
  chats.forEach(function (c) { io.observe(c); });

  // Rede de segurança: se o observer não disparar (aba em segundo plano,
  // navegador embutido do Instagram), nada fica invisível na tela.
  setTimeout(function () {
    chats.forEach(function (c) {
      var r = c.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) c.classList.remove('espera');
    });
  }, 1500);
})();

// 3. Conta do cliente perdido: mensagens por dia × valor do corte × 26 dias.
//    Sem JS, a página mostra a conta de exemplo já escrita no HTML.
(function () {
  var msgs = document.getElementById('calcMsgs');
  var valor = document.getElementById('calcValor');
  var total = document.getElementById('calcTotal');
  var conta = document.getElementById('calcConta');
  if (!msgs || !valor || !total) return;
  var DIAS = 26;
  var real = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  function num(el, max) {
    var n = parseFloat(String(el.value).replace(',', '.'));
    if (!isFinite(n) || n < 0) return 0;
    return Math.min(n, max);
  }
  function atualiza() {
    var m = num(msgs, 50), v = num(valor, 1000);
    // Valor acima do limite: mostra no campo o número que entrou na conta.
    if (+msgs.value > 50) msgs.value = 50;
    if (+valor.value > 1000) valor.value = 1000;
    total.textContent = real.format(m * v * DIAS);
    conta.textContent = m + (m === 1 ? ' mensagem' : ' mensagens') + ' × ' + real.format(v) + ' × ' + DIAS + ' dias de trabalho';
  }
  msgs.addEventListener('input', atualiza);
  valor.addEventListener('input', atualiza);
  document.getElementById('calc').addEventListener('submit', function (e) { e.preventDefault(); });
  atualiza();
})();

// 4. Formulário: mesmo POST /api/lead da home, com origem própria.
(function () {
  var form = document.getElementById('gbForm');
  var msg = document.getElementById('gbMsg');
  if (!form || !msg) return;
  function mostra(texto, tipo) {
    msg.textContent = texto;
    msg.className = 'form-msg ' + tipo;
    msg.hidden = false;
  }
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var botao = form.querySelector('button[type="submit"]');
    var bt = botao.querySelector('.btn-texto'), bs = botao.querySelector('.btn-seta');
    var t0 = bt.textContent, s0 = bs.textContent;
    botao.disabled = true; bt.textContent = 'Enviando...'; bs.textContent = 'Enviando...';
    var fd = new FormData(form);
    try {
      var res = await fetch('/api/lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: fd.get('nome'), profissao: fd.get('profissao'), whatsapp: fd.get('whatsapp'),
          origem: 'guarabot-barbearias', consentimento: true,
          turnstileToken: fd.get('cf-turnstile-response') || '',
        }),
      });
      if (res.status === 201) {
        mostra('Recebido! Vamos te chamar no WhatsApp em breve.', 'sucesso');
        form.reset();
        // Só um aviso sem dado nenhum; o consentimento.js decide se vira Lead da Meta.
        document.dispatchEvent(new CustomEvent('ng:lead'));
      } else {
        var r = await res.json().catch(function () { return {}; });
        mostra(r.erro || 'Não consegui enviar. Tente pelo WhatsApp.', 'erro');
      }
    } catch (err) {
      mostra('Sem conexão. Tente pelo WhatsApp.', 'erro');
    } finally {
      if (window.turnstile) window.turnstile.reset();
      botao.disabled = false; bt.textContent = t0; bs.textContent = s0;
    }
  });
})();

// 5. Turnstile só carrega quando o formulário chega perto da tela: a página
//    abre mais rápido e quem não rola até o fim não baixa o script.
(function () {
  var caixa = document.querySelector('#gbForm .cf-turnstile');
  if (!caixa) return;
  var carregado = false;
  window.gbTurnstilePronto = function () {
    if (window.turnstile) window.turnstile.render(caixa, { sitekey: caixa.getAttribute('data-sitekey'), theme: 'auto', size: 'compact' });
  };
  function carrega() {
    if (carregado) return;
    carregado = true;
    var sc = document.createElement('script');
    sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=gbTurnstilePronto';
    sc.async = true;
    document.head.appendChild(sc);
  }
  if (!('IntersectionObserver' in window)) { carrega(); return; }
  var io = new IntersectionObserver(function (es) {
    if (es.some(function (e) { return e.isIntersecting; })) { carrega(); io.disconnect(); }
  }, { rootMargin: '600px 0px' });
  io.observe(document.getElementById('contato'));
  // Quem foca o formulário pelo teclado ou por âncora também dispara.
  document.getElementById('gbForm').addEventListener('focusin', carrega, { once: true });
})();
