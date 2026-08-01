# Status do Planejamento — nanoguará.ia (site institucional)

> Arquivo de estado da skill `/planejar`. **Planejamento CONCLUÍDO em 2026-07-31** (8 fases).
> Para executar: `superpowers:subagent-driven-development` apontando para o plano.

## Produto

Site institucional one-page da agência de IA **nanoguará.ia** — vitrine dos 7 serviços com captação de leads. Projeto novo, separado da lucrec.ia. O web app do Representante Comercial fica para um segundo ciclo da `/planejar`.

Serviços: assistente virtual para profissionais liberais (carro-chefe) · automação comercial · criação de sites · SEO e GEO · registro de marcas · consultoria LGPD · web app para representante comercial.

Marca: logo guaraná + circuito (verde/vermelho/preto/creme), slogan "Inteligência que gera resultados", grafia oficial **"nanoguará.ia"** (uma palavra; wordmark bicolor). **Asset oficial do site: SVG vetorial** em `docs/brand/marca.svg` + `docs/brand/avatar-chat.svg`, aprovado pelo usuário em 2026-07-31 (dispensou os PNGs originais para o site).

## Fases

| Fase | Status | Artefato |
|------|--------|----------|
| 0 — Preflight/Setup | ✅ | este arquivo |
| 1 — Brainstorm | ✅ aprovada | `docs/superpowers/specs/2026-07-31-nano-guara-ia-site-design.md` |
| 2 — Discovery (marca + persona) | ✅ aprovada | `docs/nano-guara-ia-perfil.md` + `~/pesquisas/pesquisa-dores-profissionais-liberais-ia-2026-07-31.md` |
| 3 — Pesquisa Técnica (Cloudflare-first) | ✅ aprovada | `docs/nano-guara-ia-stack.md` |
| 4 — Design | ✅ aprovada | `docs/nano-guara-ia-design.md` + `docs/mockup-aprovado-fase4.html` + [mockup publicado](https://claude.ai/code/artifact/c79e3b5e-4fe5-4e8f-a762-4d168d8bbdfc) |
| 5 — Escrita do Plano | ✅ | `docs/superpowers/plans/2026-07-31-nano-guara-ia-site.md` |
| 6 — Auditoria | ✅ | `docs/nano-guara-ia-audit.md` (40 achados: 6 P0, 11 P1, 14 P2, 9 P3) |
| 7 — Correção | ✅ | plano v2 (P0/P1/P2 aplicados; 4 P3 registrados como não aplicados, com motivo) |
| 8 — Montagem | ✅ | consistência, grafia normalizada e resumo final |

## Decisões que valem para a execução

- **Escopo:** site institucional one-page, 9 seções, PT-BR. v2 (fora do MVP): blog, páginas por serviço, cases, na mídia.
- **Público nº 1:** profissionais liberais. **Carro-chefe:** assistente virtual no WhatsApp.
- **Captação:** WhatsApp como CTA primário + chat demo com IA real + formulário curto.
- **Referência estrutural:** carecode.ai/pt (estrutura sim, cores não) — mapa em `docs/referencia-carecode-estrutura.md`.
- **Sem prova social no MVP:** proibido inventar métricas ou clientes; credibilidade vem da demo ao vivo.
- **Números permitidos na copy** (com fonte): 62% desistem de compra no WhatsApp (Opinion Box 2025) · 1 em cada 3 clínicas com mais de 11% de faltas (Doctoralia/Feegow 2025) · 59% rejeitam resposta automática genérica (Opinion Box 2025). **Banidos:** "5 minutos" como estatística, "20-30% de faltas", "53% esqueceram", "55-70% das propostas".
- **Diferencial de posicionamento:** dentista (CFO) e psicólogo (CFP) não podem anunciar preço em público, mas podem no 1:1 do WhatsApp — a agência configura o assistente dentro das regras do conselho de cada cliente.
- **Stack:** 100% Cloudflare (1 Worker com Static Assets + `/api/lead` + `/api/chat`, D1, Turnstile, Rate Limiting, Email Service, Workers AI `glm-4.7-flash` via AI Gateway, Web Analytics). Saídas só por cobertura: Registro.br (domínio), wa.me (WhatsApp), Gmail (inbox). Custo MVP ≈ R$ 40/ano.
- **Design:** direção "Guaraná Tech"; efeitos aprovados no herói (fundo Etheral + shimmer no H1) com as degradações obrigatórias da auditoria.
- **Ferramenta de design:** Claude Design dispensado nesta rodada; mockup navegável em Artifact fez o papel.

## Pendências para a execução (bloqueiam tasks específicas)

| Pendência | Bloqueia |
|-----------|----------|
| **Propagação da delegação de NS** — o Registro.br impõe carência de ~2h para delegar nameservers externos em domínio recém-registrado (aviso na tela em 01/08/2026 00:45). Conferir com `dig NS nanoguara.ia.br` até responder `bob`/`georgia.ns.cloudflare.com`, depois a zona sai de `pending` na Cloudflare. | Task 10 |
| Eval de pt-BR e adversarial do modelo (gate de go-live) | Task 9 |

**Já resolvidas:**
- ✅ **Marca:** SVG vetorial aprovado (`docs/brand/marca.svg` + `avatar-chat.svg`), dispensa os PNGs originais.
- ✅ **WhatsApp da agência:** **(92) 98148-6875** → `5592981486875` nos links `wa.me`. Preenchido no plano (var `WHATSAPP_NUMBER` e constante `WHATS`) e ativo no mockup.
- ✅ **Normas do CFO:** lidas em fonte primária; erro corrigido no perfil (a vedação de preço está no Código de Ética CFO-118/2012, art. 44, I — a 196/2019 trata só de imagens).
- ✅ **Domínio escolhido:** **`nanoguara.ia.br`**, apenas ele (a categoria `.ia.br` foi criada pelo NIC.br em 01/09/2025 para Inteligência Artificial, sem restrição de registro). Verificado livre em 2026-07-31; usuário iniciou o registro no Registro.br na mesma data. Já aplicado no plano (robots, sitemap, og:image, JSON-LD, `TURNSTILE_HOSTNAME`, comandos de smoke). `nanoguara.com.br` estava livre e fica como opção defensiva futura, fora do escopo atual.
- ✅ **Domínio registrado** (01/08/2026): titular R. DIAS PIMENTEL (CNPJ 21.091.816/0001-48), expira 31/07/2027, status `published`.
- ✅ **Zona criada na Cloudflare** (01/08/2026): id `c0e4884bfdf195138510a1f9e8efbaf7`, conta Lucrec.IA (`9ffd8d9ae61880d4421a279c2c8cfc10`), plano Free, status `pending`. NS: `bob.ns.cloudflare.com` / `georgia.ns.cloudflare.com`.
  - A UI "Adicionar site" **não funciona** com `.ia.br`: a pré-checagem `GET /registrar/domains/batch_check` devolve 422 (TLD fora do Cloudflare Registrar) e o `POST /zones` nunca dispara. Caminho que funciona: API Token com `Zona → Zona → Editar` + `Zona → DNS → Editar`, e `POST /zones` via curl.
- ✅ **DNSSEC removido + NS trocados no Registro.br** (01/08/2026): o formulário "Alterar servidores DNS" foi salvo com os dois NS da Cloudflare e **sem** acionar `+ DNSSEC`, o que derruba o registro DS junto. Confirmado: `dig DS nanoguara.ia.br` vazio.

## Próximo passo

Executar o plano com `superpowers:subagent-driven-development` apontando para `docs/superpowers/plans/2026-07-31-nano-guara-ia-site.md`. Nenhum código de produto foi escrito até aqui — o repo contém apenas documentação de planejamento e o mockup aprovado.
