# Status do Planejamento — nanoguará.ia (site institucional)

> Arquivo de estado da skill `/planejar`. **Planejamento CONCLUÍDO em 2026-07-31** (8 fases).
> Para executar: `superpowers:subagent-driven-development` apontando para o plano.

## Produto

Site institucional one-page da agência de IA **nanoguará.ia** — vitrine dos 7 serviços com captação de leads. Projeto novo, separado da lucrec.ia. O web app do Representante Comercial fica para um segundo ciclo da `/planejar`.

Serviços: assistente virtual para profissionais liberais (carro-chefe) · automação comercial · criação de sites · SEO e GEO · registro de marcas · consultoria LGPD · web app para representante comercial.

Marca: logo guaraná + circuito (verde/vermelho/preto/creme), slogan "Inteligência que gera resultados", grafia oficial **"nanoguará.ia"** (uma palavra; wordmark bicolor). **Asset oficial do site: SVG vetorial** em `docs/marketing/brand/marca.svg` + `docs/marketing/brand/avatar-chat.svg`, aprovado pelo usuário em 2026-07-31 (dispensou os PNGs originais para o site).

## Fases

| Fase | Status | Artefato |
|------|--------|----------|
| 0 — Preflight/Setup | ✅ | este arquivo |
| 1 — Brainstorm | ✅ aprovada | `docs/historico/planejamento/specs/2026-07-31-nano-guara-ia-site-design.md` |
| 2 — Discovery (marca + persona) | ✅ aprovada | `docs/produto/nano-guara-ia-perfil.md` + `~/pesquisas/pesquisa-dores-profissionais-liberais-ia-2026-07-31.md` |
| 3 — Pesquisa Técnica (Cloudflare-first) | ✅ aprovada | `docs/engenharia/nano-guara-ia-stack.md` |
| 4 — Design | ✅ aprovada | `docs/design/nano-guara-ia-design.md` + `docs/design/mockup-aprovado-fase4.html` + [mockup publicado](https://claude.ai/code/artifact/c79e3b5e-4fe5-4e8f-a762-4d168d8bbdfc) |
| 5 — Escrita do Plano | ✅ | `docs/historico/planejamento/plans/2026-07-31-nano-guara-ia-site.md` |
| 6 — Auditoria | ✅ | `docs/engenharia/nano-guara-ia-audit.md` (40 achados: 6 P0, 11 P1, 14 P2, 9 P3) |
| 7 — Correção | ✅ | plano v2 (P0/P1/P2 aplicados; 4 P3 registrados como não aplicados, com motivo) |
| 8 — Montagem | ✅ | consistência, grafia normalizada e resumo final |

## Decisões que valem para a execução

- **Escopo:** site institucional one-page, 9 seções, PT-BR. v2 (fora do MVP): blog, páginas por serviço, cases, na mídia.
- **Público nº 1:** profissionais liberais. **Carro-chefe:** assistente virtual no WhatsApp.
- **Captação:** WhatsApp como CTA primário + chat demo com IA real + formulário curto.
- **Referência estrutural:** carecode.ai/pt (estrutura sim, cores não) — mapa em `docs/referencias/referencia-carecode-estrutura.md`.
- **Sem prova social no MVP:** proibido inventar métricas ou clientes; credibilidade vem da demo ao vivo.
- **Números permitidos na copy** (com fonte): 62% desistem de compra no WhatsApp (Opinion Box 2025) · 1 em cada 3 clínicas com mais de 11% de faltas (Doctoralia/Feegow 2025) · 59% rejeitam resposta automática genérica (Opinion Box 2025). **Banidos:** "5 minutos" como estatística, "20-30% de faltas", "53% esqueceram", "55-70% das propostas".
- **Diferencial de posicionamento:** dentista (CFO) e psicólogo (CFP) não podem anunciar preço em público, mas podem no 1:1 do WhatsApp — a agência configura o assistente dentro das regras do conselho de cada cliente.
- **Stack:** 100% Cloudflare (1 Worker com Static Assets + `/api/lead` + `/api/chat`, D1, Turnstile, Rate Limiting, Email Service, Workers AI `llama-3.3-70b-instruct-fp8-fast` via AI Gateway (o `glm-4.7-flash` do planejamento foi reprovado no smoke de 01/08/2026, confirmando o achado P1-4 da auditoria: é modelo de raciocínio e não emite resposta), Web Analytics). Saídas só por cobertura: Registro.br (domínio), wa.me (WhatsApp), Gmail (inbox). Custo MVP ≈ R$ 40/ano.
- **Design:** direção "Guaraná Tech"; efeitos aprovados no herói (fundo Etheral + shimmer no H1) com as degradações obrigatórias da auditoria.
- **Ferramenta de design:** Claude Design dispensado nesta rodada; mockup navegável em Artifact fez o papel.

## Pendências para a execução (bloqueiam tasks específicas)

| Pendência | Bloqueia |
|-----------|----------|
| Eval de pt-BR e adversarial do modelo (gate de go-live) | Task 9 |

**Já resolvidas:**
- ✅ **Marca:** SVG vetorial aprovado (`docs/marketing/brand/marca.svg` + `avatar-chat.svg`), dispensa os PNGs originais.
- ✅ **WhatsApp da agência:** **(92) 98148-6875** → `5592981486875` nos links `wa.me`. Preenchido no plano (var `WHATSAPP_NUMBER` e constante `WHATS`) e ativo no mockup.
- ✅ **Normas do CFO:** lidas em fonte primária; erro corrigido no perfil (a vedação de preço está no Código de Ética CFO-118/2012, art. 44, I — a 196/2019 trata só de imagens).
- ✅ **Domínio escolhido:** **`nanoguara.ia.br`**, apenas ele (a categoria `.ia.br` foi criada pelo NIC.br em 01/09/2025 para Inteligência Artificial, sem restrição de registro). Verificado livre em 2026-07-31; usuário iniciou o registro no Registro.br na mesma data. Já aplicado no plano (robots, sitemap, og:image, JSON-LD, `TURNSTILE_HOSTNAME`, comandos de smoke). `nanoguara.com.br` estava livre e fica como opção defensiva futura, fora do escopo atual.
- ✅ **Domínio registrado** (01/08/2026): titular R. DIAS PIMENTEL (CNPJ 21.091.816/0001-48), expira 31/07/2027, status `published`.
- ✅ **Zona criada na Cloudflare** (01/08/2026): id `c0e4884bfdf195138510a1f9e8efbaf7`, conta Lucrec.IA (`9ffd8d9ae61880d4421a279c2c8cfc10`), plano Free, status `pending`. NS: `bob.ns.cloudflare.com` / `georgia.ns.cloudflare.com`.
  - A UI "Adicionar site" **não funciona** com `.ia.br`: a pré-checagem `GET /registrar/domains/batch_check` devolve 422 (TLD fora do Cloudflare Registrar) e o `POST /zones` nunca dispara. Caminho que funciona: API Token com `Zona → Zona → Editar` + `Zona → DNS → Editar`, e `POST /zones` via curl.
- ✅ **Domínio 100% no ar na Cloudflare** (01/08/2026): delegação propagada (`dig NS` responde `bob`/`georgia.ns.cloudflare.com`) e a zona saiu de `pending` para **ativa** — painel confirma "Seu domínio agora está protegido pela Cloudflare", Configuração de DNS `Completo`. Nada mais bloqueia a Task 10 além do código.
- ✅ **DNSSEC removido + NS trocados no Registro.br** (01/08/2026): o formulário "Alterar servidores DNS" foi salvo com os dois NS da Cloudflare e **sem** acionar `+ DNSSEC`, o que derruba o registro DS junto. Confirmado: `dig DS nanoguara.ia.br` vazio.

## Execução: CONCLUÍDA (2026-08-02)

As 10 tasks do plano foram executadas e o site está **no ar em https://nanoguara.ia.br**. Tudo em `main`, 76 testes verdes, `tsc` limpo.

Depois do merge rodou uma **revisão completa em 5 dimensões** (segurança, frontend, SEO/GEO, conteúdo/LGPD e produção) com verificação adversarial: 28 achados brutos, 11 confirmados, 3 refutados. Somados aos 4 achados da revisão final de branch, **13 dos 15 foram corrigidos e verificados em produção**. Destaques do que a revisão pegou e nenhum teste pegaria:

- O chat inventava promessa de resultado ("até 30% mais agendamentos"), vedada pelo CFM e CFO. Corrigido no `SYSTEM_PROMPT` e reverificado em produção com 3 perguntas adversariais e a eval completa de 12.
- A política de privacidade afirmava que a conversa não é salva, mas o AI Gateway loga por padrão. Corrigido com `collectLog: false`, então a frase virou verdade.
- A purga de 12 meses era promessa sem mecanismo. Agora existe handler `scheduled` com cron diário.
- O registro de consentimento não provava nada (literal `1` em toda linha). Migration 0002 grava qual texto de autorização o titular aceitou.

Infra de zona fechada em 2026-08-02: **Always Use HTTPS** ligado e **`www`** criado (registro A proxied para o endereço de descarte `192.0.2.1` + Redirect Rule 301 para o apex, preservando caminho e query string). Seis rotas de entrada testadas, todas chegando ao canônico.

### Aberto por decisão do usuário

- **`/api/chat` sem Turnstile.** O gate de `Origin` é fail-open, então `curl` passa. Consequência: consumo da cota de Workers AI por terceiros e histórico forjável. Não é vazamento de dado. Revisitar se o consumo de neurons subir sem explicação.

### Datas a observar

- **~09/08/2026:** conferir no AI Crawl Control se `OAI-SearchBot` e `PerplexityBot` estão passando.
- **15/09/2026:** a Cloudflare muda as regras padrão de bloqueio de bots.

## Próximo passo

O site institucional está entregue. O **web app do Representante Comercial** segue fora de escopo e pede um segundo ciclo da `/planejar`.
