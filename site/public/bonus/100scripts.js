// /bonus/100scripts. CSP estrita: sem innerHTML com dados, sem .style, sem inline.
// Dados do visitante e progresso ficam só no localStorage deste aparelho.
(function () {
  var D = window.NG100;
  if (!D) return;

  var WA_BASE = 'https://wa.me/?text=';
  var CHAVE_PERFIL = 'ng100:perfil';
  var CHAVE_FEITOS = 'ng100:feitos';

  var perfil = { nome: '', clinica: '', servico: '', valor: '' };
  var feitos = {};
  var filtro = { tipo: 'todos', valor: 0 };
  var busca = '';

  var ROTULOS = {
    nome: '[seu nome]',
    clinica: '[nome da clínica]',
    servico: '[seu atendimento]',
    valor: '[valor]'
  };

  // ---------- armazenamento (pode falhar em janela privada) ----------
  function ler(chave, padrao) {
    try {
      var bruto = window.localStorage.getItem(chave);
      return bruto ? JSON.parse(bruto) : padrao;
    } catch (e) { return padrao; }
  }
  function gravar(chave, valor) {
    try { window.localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* sem persistência */ }
  }

  // ---------- helpers de DOM ----------
  function el(tag, classe, texto) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto != null) n.textContent = texto;
    return n;
  }
  function $(id) { return document.getElementById(id); }

  // ---------- montagem da mensagem ----------
  // Quebra o modelo em pedaços: texto puro, dado do visitante e [campo a completar].
  // {da_clinica}, {na_clinica} e {a_clinica} trazem a preposição junto, para
  // "Consultório Dr. X" virar "do Consultório Dr. X" e não "da Consultório".
  var RE_TOKEN = /\{(nome|servico|valor|da_clinica|na_clinica|a_clinica)\}|\[[^\]]+\]/g;

  function semAcento(t) {
    return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  // Primeira palavra masculina comum em nome de consultório; o resto vai no feminino
  // ("a Clínica", "a Odonto Vida"), que é como se fala de clínica no dia a dia.
  var MASCULINOS = ['consultorio', 'consultorios', 'espaco', 'instituto', 'centro', 'studio', 'estudio',
    'nucleo', 'hospital', 'laboratorio', 'grupo', 'ambulatorio', 'atelie', 'complexo', 'dr', 'dr.', 'doutor'];

  function artigoDa(nome) {
    var primeira = semAcento(nome.trim().split(/\s+/)[0] || '');
    return MASCULINOS.indexOf(primeira) !== -1 ? 'o' : 'a';
  }

  var PREPOSICAO = { da_clinica: 'd', na_clinica: 'n', a_clinica: '' };

  function pedacos(modelo) {
    var out = [];
    var ultimo = 0;
    var m;
    RE_TOKEN.lastIndex = 0;
    while ((m = RE_TOKEN.exec(modelo)) !== null) {
      if (m.index > ultimo) out.push({ k: 'txt', v: modelo.slice(ultimo, m.index) });
      if (m[1] && m[1] in PREPOSICAO) {
        var clinica = perfil.clinica.trim();
        out.push({ k: 'txt', v: PREPOSICAO[m[1]] + (clinica ? artigoDa(clinica) : 'a') + ' ' });
        out.push(clinica ? { k: 'eu', v: clinica } : { k: 'var', v: ROTULOS.clinica });
      } else if (m[1]) {
        var preenchido = perfil[m[1]].trim();
        out.push(preenchido ? { k: 'eu', v: preenchido } : { k: 'var', v: ROTULOS[m[1]] });
      } else {
        out.push({ k: 'var', v: m[0] });
      }
      ultimo = m.index + m[0].length;
    }
    if (ultimo < modelo.length) out.push({ k: 'txt', v: modelo.slice(ultimo) });
    return out;
  }

  function textoPuro(modelo) {
    return pedacos(modelo).map(function (p) { return p.v; }).join('');
  }

  function pintar(modelo, alvo) {
    pedacos(modelo).forEach(function (p) {
      if (p.k === 'txt') { alvo.appendChild(document.createTextNode(p.v)); return; }
      alvo.appendChild(el('span', p.k === 'eu' ? 'bs-eu' : 'bs-var', p.v));
    });
  }

  // ---------- avisos ----------
  var timerAviso = null;
  function aviso(texto) {
    var s = $('bsStatus');
    s.textContent = texto;
    s.classList.add('vis');
    clearTimeout(timerAviso);
    timerAviso = setTimeout(function () { s.classList.remove('vis'); }, 2200);
  }

  // Plano B para navegador sem Clipboard API ou que a recusa (WebView, iframe).
  function copiarPorSelecao(texto) {
    return new Promise(function (ok, erro) {
      var t = document.createElement('textarea');
      t.value = texto;
      t.setAttribute('readonly', '');
      t.className = 'bs-fora';
      document.body.appendChild(t);
      t.select();
      var deu = false;
      try { deu = document.execCommand('copy'); } catch (e) { deu = false; }
      document.body.removeChild(t);
      deu ? ok() : erro();
    });
  }

  function copiar(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto).catch(function () { return copiarPorSelecao(texto); });
    }
    return copiarPorSelecao(texto);
  }

  function nScripts(n) { return n + (n === 1 ? ' script' : ' scripts'); }

  // ---------- contagens ----------
  function idDe(i) { return i + 1; }
  function totalFeitos() { return Object.keys(feitos).length; }

  function atualizarContagens() {
    var n = totalFeitos();
    $('bsProgUso').value = n;
    $('bsTextoUso').textContent = n + ' de ' + D.scripts.length + ' marcados como usados';
    var campos = ['nome', 'clinica', 'servico', 'valor'].filter(function (k) { return perfil[k].trim() !== ''; }).length;
    $('bsProgDados').value = campos;
    $('bsTextoDados').textContent = campos + ' de 4 campos preenchidos';
  }

  // ---------- filtros ----------
  function scriptsFiltrados() {
    var termo = semAcento(busca.trim());
    var lista = [];
    D.scripts.forEach(function (s, i) {
      var ok = true;
      if (!termo) {
        if (filtro.tipo === 'etapa') ok = s.e === filtro.valor;
        else if (filtro.tipo === 'situacao') ok = (s.s || []).indexOf(filtro.valor) !== -1;
      } else {
        var palheiro = semAcento(s.t + ' ' + s.q + ' ' + s.o + ' ' + s.m);
        ok = palheiro.indexOf(termo) !== -1;
      }
      if (ok) lista.push({ s: s, id: idDe(i) });
    });
    return lista;
  }

  function resumoDoFiltro(qtd) {
    var termo = busca.trim();
    if (termo) return nScripts(qtd) + ' com “' + termo + '”';
    if (filtro.tipo === 'situacao') {
      var sit = D.situacoes.filter(function (x) { return x.id === filtro.valor; })[0];
      return nScripts(qtd) + ' para: ' + sit.nome.toLowerCase();
    }
    if (filtro.tipo === 'todos') return 'Todos os ' + qtd + ' scripts';
    var et = D.etapas.filter(function (x) { return x.n === filtro.valor; })[0];
    return 'Etapa ' + et.n + ', ' + et.nome.toLowerCase() + ': ' + nScripts(qtd);
  }

  // ---------- renderização ----------
  function cartaoScript(item) {
    var s = item.s;
    var etapa = D.etapas[s.e - 1];
    var art = el('article', 'bs-script' + (feitos[item.id] ? ' feito' : ''));
    art.id = 'script-' + item.id;

    var topo = el('div', 'bs-script-topo');
    topo.appendChild(el('span', 'bs-card-n', 'Etapa ' + etapa.n + ': ' + etapa.nome));
    topo.appendChild(el('span', 'bs-script-num', 'nº ' + item.id));
    art.appendChild(topo);

    var titulo = el('h3', null, s.t);
    titulo.id = 'script-' + item.id + '-titulo';
    art.appendChild(titulo);

    var dl = el('dl', 'bs-meta');
    [['Quando usar', s.q], ['Onde usar', s.u || 'Conversa individual'], ['Por que funciona', s.o]].forEach(function (par) {
      var linha = el('div');
      linha.appendChild(el('dt', null, par[0]));
      linha.appendChild(el('dd', null, par[1]));
      dl.appendChild(linha);
    });
    art.appendChild(dl);

    var bolha = el('div', 'bs-bolha');
    var p = el('p');
    pintar(s.m, p);
    bolha.appendChild(p);
    art.appendChild(bolha);

    var acoes = el('div', 'bs-acoes');
    // Verde, e não o vermelho do CTA: são 100 botões e o vermelho fica só para "Chamar no WhatsApp".
    var bCopiar = el('button', 'btn bs-btn-copiar', 'Copiar texto');
    bCopiar.type = 'button';
    bCopiar.setAttribute('aria-describedby', titulo.id);
    bCopiar.addEventListener('click', function () {
      copiar(textoPuro(s.m)).then(
        function () { aviso('Texto copiado. Cole no WhatsApp.'); },
        function () { aviso('Não deu para copiar. Selecione o texto e copie à mão.'); }
      );
    });
    var bZap = el('a', 'btn btn-secundario', 'Abrir no WhatsApp');
    bZap.href = WA_BASE + encodeURIComponent(textoPuro(s.m));
    bZap.target = '_blank';
    bZap.rel = 'noopener';
    bZap.setAttribute('aria-describedby', titulo.id);

    var rotulo = el('label', 'bs-feito');
    var cx = el('input');
    cx.type = 'checkbox';
    cx.checked = !!feitos[item.id];
    cx.setAttribute('aria-describedby', titulo.id);
    cx.addEventListener('change', function () {
      if (cx.checked) feitos[item.id] = 1; else delete feitos[item.id];
      gravar(CHAVE_FEITOS, feitos);
      art.classList.toggle('feito', cx.checked);
      atualizarContagens();
    });
    rotulo.appendChild(cx);
    rotulo.appendChild(document.createTextNode('Já usei este'));

    acoes.appendChild(bCopiar);
    acoes.appendChild(bZap);
    acoes.appendChild(rotulo);
    art.appendChild(acoes);
    return art;
  }

  function renderLista() {
    var lista = scriptsFiltrados();
    var alvo = $('bsLista');
    alvo.textContent = '';
    var frag = document.createDocumentFragment();
    lista.forEach(function (item) { frag.appendChild(cartaoScript(item)); });
    alvo.appendChild(frag);
    $('bsVazio').hidden = lista.length !== 0;
    $('bsResumo').textContent = resumoDoFiltro(lista.length);
    renderPills();
  }

  function renderPills() {
    var alvo = $('bsPills');
    alvo.textContent = '';
    function pill(rotulo, ativo, aoClicar) {
      var b = el('button', 'bs-pill', rotulo);
      b.type = 'button';
      b.setAttribute('aria-pressed', ativo ? 'true' : 'false');
      b.addEventListener('click', aoClicar);
      alvo.appendChild(b);
    }
    var semBusca = busca.trim() === '';
    pill('Todos', semBusca && filtro.tipo === 'todos', function () { definirFiltro('todos', 0, false); });
    D.etapas.forEach(function (e) {
      pill(e.n + '. ' + e.nome, semBusca && filtro.tipo === 'etapa' && filtro.valor === e.n, function () {
        definirFiltro('etapa', e.n, false);
      });
    });
  }

  function definirFiltro(tipo, valor, rolar) {
    filtro = { tipo: tipo, valor: valor };
    busca = '';
    $('bsBusca').value = '';
    renderLista();
    if (rolar) {
      $('scripts').scrollIntoView({ behavior: reduzMovimento() ? 'auto' : 'smooth', block: 'start' });
      // Leva o foco ao título da lista, que tem o resumo do filtro como descrição.
      $('lib-titulo').focus({ preventScroll: true });
    }
    var hash = tipo === 'etapa' ? '#etapa-' + valor : tipo === 'situacao' ? '#situacao-' + valor : '#scripts';
    if (history.replaceState) history.replaceState(null, '', hash);
  }

  function reduzMovimento() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function cartaoNavegacao(titulo, desc, topoEsq, qtd, aoClicar) {
    var li = el('li');
    var b = el('button', 'bs-card-btn');
    b.type = 'button';
    var topo = el('span', 'bs-card-topo');
    topo.appendChild(el('span', 'bs-card-n', topoEsq));
    topo.appendChild(el('span', 'bs-card-qtd', nScripts(qtd)));
    b.appendChild(topo);
    b.appendChild(el('b', null, titulo));
    b.appendChild(el('span', 'bs-card-desc', desc));
    b.addEventListener('click', aoClicar);
    li.appendChild(b);
    return li;
  }

  function renderNavegacao() {
    var et = $('bsEtapas');
    D.etapas.forEach(function (e) {
      var qtd = D.scripts.filter(function (s) { return s.e === e.n; }).length;
      et.appendChild(cartaoNavegacao(e.nome, e.desc, 'Etapa ' + e.n, qtd, function () {
        definirFiltro('etapa', e.n, true);
      }));
    });
    var st = $('bsSituacoes');
    D.situacoes.forEach(function (x) {
      var qtd = D.scripts.filter(function (s) { return (s.s || []).indexOf(x.id) !== -1; }).length;
      st.appendChild(cartaoNavegacao(x.nome, x.desc, 'Situação', qtd, function () {
        definirFiltro('situacao', x.id, true);
      }));
    });
  }

  // ---------- formulário de dados ----------
  function ligarFormulario() {
    var campos = ['nome', 'clinica', 'servico', 'valor'];
    campos.forEach(function (k) {
      var input = $('f-' + k);
      input.value = perfil[k];
      input.addEventListener('input', function () {
        perfil[k] = input.value;
        gravar(CHAVE_PERFIL, perfil);
        atualizarContagens();
        renderLista();
      });
    });
    $('bsForm').addEventListener('submit', function (ev) { ev.preventDefault(); });
    $('bsLimpar').addEventListener('click', function () {
      campos.forEach(function (k) { perfil[k] = ''; $('f-' + k).value = ''; });
      gravar(CHAVE_PERFIL, perfil);
      atualizarContagens();
      renderLista();
      aviso('Seus dados foram apagados deste aparelho.');
    });
  }

  // ---------- link direto (#etapa-3, #situacao-preco) ----------
  function aplicarHash() {
    var h = window.location.hash;
    var m;
    if ((m = /^#etapa-([1-8])$/.exec(h))) { filtro = { tipo: 'etapa', valor: Number(m[1]) }; return true; }
    if ((m = /^#situacao-([a-z]+)$/.exec(h)) && D.situacoes.some(function (x) { return x.id === m[1]; })) {
      filtro = { tipo: 'situacao', valor: m[1] };
      return true;
    }
    return false;
  }

  // ---------- início ----------
  var salvoPerfil = ler(CHAVE_PERFIL, null);
  if (salvoPerfil && typeof salvoPerfil === 'object') {
    Object.keys(perfil).forEach(function (k) {
      if (typeof salvoPerfil[k] === 'string') perfil[k] = salvoPerfil[k].slice(0, 80);
    });
  }
  var salvoFeitos = ler(CHAVE_FEITOS, null);
  if (salvoFeitos && typeof salvoFeitos === 'object') feitos = salvoFeitos;

  aplicarHash();
  renderNavegacao();
  ligarFormulario();
  // A contagem da busca vai para uma região viva própria, com espera, para o
  // leitor de tela não repetir o resumo a cada tecla.
  var timerBusca = null;
  $('bsBusca').addEventListener('input', function () {
    busca = this.value;
    renderLista();
    clearTimeout(timerBusca);
    timerBusca = setTimeout(function () {
      var n = $('bsLista').children.length;
      $('bsAnuncioBusca').textContent = busca.trim() ? (n ? $('bsResumo').textContent : 'Nenhum script encontrado.') : '';
    }, 600);
  });
  atualizarContagens();
  renderLista();

  // Colar um link #etapa-N ou #situacao-x com a página já aberta também filtra.
  window.addEventListener('hashchange', function () {
    if (!aplicarHash()) return;
    busca = '';
    $('bsBusca').value = '';
    renderLista();
  });
})();
