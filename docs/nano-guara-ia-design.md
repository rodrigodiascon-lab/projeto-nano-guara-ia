# Design — Site nanoguará.ia

> Fase 4 da /planejar · 2026-07-31 · Direção via `design-taste-frontend` (anti-slop) · Marca existente ACOMODADA, não reinventada · **Aprovado pelo usuário** (telas na seção 4; efeitos do herói na 4.1).

## 1. Design Read & Dials

**Read:** landing one-page de agência de IA para profissionais liberais brasileiros (não-técnicos; decisores de consultório/escritório), linguagem calorosa-premium brasileira com credibilidade tech, estrutura CareCode adaptada, marca guaraná existente.

**Dials:** `DESIGN_VARIANCE: 7` · `MOTION_INTENSITY: 5` · `VISUAL_DENSITY: 3`

**Direção nomeada:** **"Guaraná Tech"** — o calor amazônico da marca (verde vivo, vermelho do fruto, formas orgânicas arredondadas) sobre uma base clara e limpa de site de produto sério. NÃO é: dark tech genérico, roxo-IA, glassmorphism, nem o âmbar/escuro da CareCode (estrutura sim, pele não).

## 2. Tokens

### Cor (tema claro é o default; dark mode espelhado; UM acento: vermelho-guaraná)

```css
:root {
  /* Neutros com leve casta verde (evita o creme-papel genérico) */
  --bg:            #F7F9F5;  /* fundo página */
  --surface:       #FFFFFF;  /* cards */
  --surface-deep:  #123B26;  /* seções de destaque (verde profundo) — mesma família, MESMO tema */
  --text:          #17231B;  /* off-black esverdeado (nunca #000) */
  --text-muted:    #55655B;

  /* Marca */
  --verde:         #2E7D32;  /* folha/circuito — estrutural: wordmark, ícones, links */
  --verde-escuro:  #1B4D2E;  /* headings sobre claro, fundo footer */
  --guarana:       #D5382F;  /* ACENTO ÚNICO: CTAs primários, destaques de energia */
  --guarana-hover: #B72C24;
  --creme:         #FDF9F0;  /* respiros pontuais (badge, chat balão) */

  /* Semânticos */
  --ok: #2E7D32;  --erro: #B3261E;  --foco: #2E7D32;
}
[data-theme="dark"] {
  --bg: #0E1A13;  --surface: #16241B;  --surface-deep: #0A140E;
  --text: #EDF3EE;  --text-muted: #9DB0A3;
  --verde: #6FBF73;  --verde-escuro: #A5D6A7;
  --guarana: #EF5A4C;  --guarana-hover: #D5382F;  --creme: #1E2C22;
}
```

Regras: contraste WCAG AA em tudo (AAA no herói); vermelho SÓ em CTA/acento (nunca em blocos grandes — vira alerta); botão WhatsApp usa o acento guaraná com ícone do WhatsApp (não o verde-Whats — consistência de acento único; o ícone comunica o canal).

### Tipografia (sans-only; zero serif; zero Inter-default)

- **Display/headings:** `Outfit` (geométrica arredondada — ecoa o wordmark do logo; pesos 500-700; `tracking-tight`)
- **Corpo/UI:** `Geist` (regular/medium; corpo `max-width: 65ch`, `leading-relaxed`)
- Self-hosted com `font-display: swap`. Ênfase em headline = bold/italic da MESMA família.
- Escala: h1 `clamp(2.25rem, 5vw, 3.75rem)` (máx 2 linhas) · h2 `clamp(1.75rem, 3vw, 2.5rem)` · corpo 1rem/1.125rem.

### Forma & espaçamento

- **Shape lock (regra documentada):** botões = pill (raio total; ecoa o fruto) · cards = 16px · inputs = 10px. Aplicado 100% da página.
- Seções `py-16`→`py-24`; container `max-w-[1200px]`; grid CSS (nunca flex-math); herói `min-h-[100dvh]` com `pt` ≤ 6rem.
- **Motivo de circuito** do logo como grafismo de fundo em 2-3 seções (SVG derivado do logo, verde 8-12% opacidade) — assinatura visual da marca, com parcimônia.

### Ícones & imagens

- Ícones: `@phosphor-icons` (weight regular/duotone, stroke consistente) — combina com as formas arredondadas. Uma família só.
- Imagens: geradas/reais nas seções-chave (herói já tem o mockup de chat; "Pra quem é" usa retratos reais de profissionais — picsum-seed no mock, fotos geradas na implementação). Zero fake-screenshot de divs: **o mockup de chat do herói e a demo são componentes REAIS funcionais** (mini-versão da UI verdadeira).
- Logo: versões do usuário em `docs/brand/` (pendente); fundo claro usa a versão colorida.

## 3. Inventário de componentes

| Componente | Notas |
|-----------|-------|
| Navbar | 1 linha, ≤72px, logo + 4 âncoras + CTA pill guaraná |
| Botão primário | pill guaraná, texto ≤3 palavras, `:active scale-[0.98]`, AA |
| Botão secundário | outline verde sobre claro |
| Chat WhatsApp mockup (herói) | componente real animado: mensagens entram em sequência (storytelling do produto; `prefers-reduced-motion` → estático) |
| Widget chat demo | mesma UI do mockup, conectada à API; estados: digitando/erro/fallback-WhatsApp |
| Card de serviço | surface branca, 16px, ícone duotone verde, 1 frase, link |
| Card antes/depois | 2 colunas dor→solução, fundo creme pontual |
| Faixa de profissões | chips pill com ícone (substitui logo-wall) |
| Formulário de leads | labels ACIMA, erro abaixo, Turnstile, consentimento LGPD, estados completos |
| Passos (Como funciona) | 3 passos verbo-direto (Diagnóstico · Implantação · Acompanhamento) — sem "Etapa 1/2/3" |
| Footer | verde-profundo, links, privacidade/LGPD |

## 4. Telas (mockup em Artifact — decisão do usuário: "vc faz baseado no site carecode")

- **Mockup navegável (v1):** https://claude.ai/code/artifact/c79e3b5e-4fe5-4e8f-a762-4d168d8bbdfc — one-page completo com as 9 seções da spec, direção Guaraná Tech sobre a estrutura CareCode. Fonte: `scratchpad/nano-guara-mockup.html` (descartável — o código de produção nasce na Fase 5, do zero, usando estes tokens).
- Inclui: chat WhatsApp animado no herói (mensagens em sequência), demo interativa roteirizada (no site real: Workers AI), formulário com estados e consentimento LGPD, dark mode espelhado, reduced-motion.
- Limitações deliberadas do mockup: fontes do sistema (produção usa Outfit/Geist self-hosted), logo simplificado em SVG (produção usa os PNGs de `docs/brand/`), Turnstile como slot demarcado, sem fotos reais na faixa de profissões (produção: fotos geradas/reais).
- Claude Design foi dispensado pelo usuário nesta rodada (sem escrita na conta).

### Efeitos aprovados no herói (decisão do usuário, 2026-07-31: "os dois juntos")

1. **Fundo Etheral Shadow** — sombras orgânicas animadas (filtro SVG feTurbulence + feDisplacementMap + hueRotate em loop) em 2 camadas: verde `--etheral-a` + guaraná sutil `--etheral-b`, theme-aware.
2. **Gradient Shimmer no H1** — varredura de banda multi-stop da marca (verde vivo → branco → laranja → guaraná) via `background-clip:text` + Web Animations API; loop 1,45s + pausa 1,1s.

Implementação de referência (vanilla, sem React/framer-motion): `docs/mockup-aprovado-fase4.html`.

**Ajustes obrigatórios definidos pela auditoria da Fase 6** (já refletidos no plano de implementação):
- Máscara do Etheral **self-hosted e otimizada** para WebP ≤120 KB (o PNG do CDN do Framer tem 1,24 MB / 5000px). A camada de ruído **não é usada** pelo mockup aprovado — não baixar.
- Ambos os loops ficam atrás de `IntersectionObserver` (só rodam com o herói na tela) + throttle de ~30fps; degradação por `(max-width:767px)`, `(hover:none)` e `prefers-reduced-motion`, reavaliada em `change`.
- Base do shimmer sobe para `color-mix(85% texto)` (AAA no herói) e o **estado padrão do H1 é texto sólido**: o gradiente só entra via classe `.anima` quando a varredura roda, senão o centro do título ficaria branco/invisível.
- No tema escuro os CTAs mantêm o vermelho escuro (`#D5382F`): o `#EF5A4C` com texto branco reprova WCAG AA.

## 5. Motion (motivada, contida)

- Herói: mensagens do chat mockup em sequência (storytelling) + fade-up do headline.
- Seções: reveal `whileInView`-style (CSS/JS leve, stagger 60ms) — hierarquia de leitura.
- CTAs: hover com leve elevação; `:active` press. SEM marquee, SEM scroll-hijack, SEM loops infinitos decorativos.
- Tudo atrás de `prefers-reduced-motion`.

## 6. Pre-flight (compromissos anti-slop)

Zero em-dash em qualquer texto visível · zero eyebrows além de 1 a cada 3 seções · zero "3 cards iguais" (grade de serviços será assimétrica 2+2+2 com card do assistente maior) · zero métricas inventadas (só os números verificados da Fase 2, com fonte) · zero nomes genéricos em exemplos (usar nomes brasileiros verossímeis nas conversas do chat) · tema único na página · 1 acento · CTA de intenção única ("Chamar no WhatsApp" — um label só, em todas as ocorrências).
