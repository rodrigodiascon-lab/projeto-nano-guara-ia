// /guarabot/oftalmologia: os dois detalhes animados da página.
// CSP estrita: nada de .style. A pupila do olho anda pelo atributo `transform`
// do SVG (atributo de apresentação, não estilo inline); o resto é classe.
// Com movimento reduzido, nada se mexe: o CSS já mostra o estado final.
(function () {
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduz || !('IntersectionObserver' in window)) return;

  // 1. Pupila do bloco "Paciente chega preparado" dilata uma vez ao aparecer.
  //    Sem a classe, a pupila fica no tamanho normal: nada some da tela.
  var iris = document.querySelector('.go-cel-iris');
  if (iris) {
    var ioIris = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { iris.classList.add('dilata'); ioIris.disconnect(); }
    }, { threshold: 0.6 });
    ioIris.observe(iris);
  }

  // 2. Olho do guaraná: pisca uma vez ao entrar na tela; com mouse (ponteiro
  //    fino), a pupila acompanha o cursor dentro do branco do olho.
  var sec = document.querySelector('.go-olho-sec');
  var olho = document.querySelector('.go-olho');
  var pupila = document.querySelector('.go-olho-pupila');
  if (!sec || !olho || !pupila) return;

  var ioOlho = new IntersectionObserver(function (es) {
    if (es.some(function (e) { return e.isIntersecting; })) { olho.classList.add('pisca'); ioOlho.disconnect(); }
  }, { threshold: 0.5 });
  ioOlho.observe(olho);

  if (!window.matchMedia('(pointer: fine)').matches) return;
  // Unidades do viewBox: o branco do olho tem rx 6.5 / ry 5 e a pupila 4.5 / 3.4,
  // então a pupila anda no máximo 1.8 na horizontal e 1.4 na vertical.
  var MAX_X = 1.8, MAX_Y = 1.4, pendente = null, ativo = false;
  function move() {
    var r = olho.getBoundingClientRect();
    // Centro do olho dentro do SVG: x 19, y 22 num viewBox de 3 1 32 36.
    var cx = r.left + r.width * (19 - 3) / 32, cy = r.top + r.height * (22 - 1) / 36;
    var dx = pendente.x - cx, dy = pendente.y - cy, d = Math.hypot(dx, dy) || 1;
    var f = Math.min(1, d / 260); // mais longe, mais encostada na borda
    var x = (dx / d) * MAX_X * f, y = (dy / d) * MAX_Y * f;
    pupila.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ')');
    pendente = null;
  }
  // Só escuta o mouse enquanto a seção está na tela.
  new IntersectionObserver(function (es) { ativo = es.some(function (e) { return e.isIntersecting; }); })
    .observe(sec);
  window.addEventListener('pointermove', function (ev) {
    if (!ativo) return;
    var agendar = pendente === null;
    pendente = { x: ev.clientX, y: ev.clientY };
    if (agendar) requestAnimationFrame(move);
  }, { passive: true });
})();
