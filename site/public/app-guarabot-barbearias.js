// /guarabot/barbearias. CSP estrita: nada de .style, só classes e atributos.
(function () {
  if (!('IntersectionObserver' in window)) return;

  // 1. Barra fixa de WhatsApp (celular): esconde enquanto outro CTA de verdade
  //    está na tela, para não empilhar dois botões iguais nem cobrir o do card.
  var barra = document.querySelector('.gb-barra-whats');
  var alvosCta = document.querySelectorAll('.gb-hero .ctas .btn, .gb-cartao-preco .btn, .gb-final .btn');
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
