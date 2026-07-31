# Status do Planejamento — nano guará.ia (site institucional)

> Arquivo de estado da skill `/planejar`. Atualizado ao fim de cada fase.
> Plano aprovado: `/Users/rodri/.claude/plans/projeto-nano-guar-ia-fizzy-nygaard.md`

## Produto

Site institucional da agência de IA **nano guará.ia** — vitrine dos 7 serviços com captação de leads. Projeto novo, separado da lucrec.ia. Web app do Representante Comercial fica para um segundo ciclo da `/planejar`.

Serviços da agência: automação comercial · assistente virtual para profissionais liberais (atendimento, agendamento, follow-up, pós-vendas) · criação de sites · SEO e GEO · registro de marcas · consultoria LGPD · web app para representante comercial.

Identidade visual JÁ PRONTA: logo guaraná + circuito (verde/vermelho/preto/creme), slogan "Inteligência que gera resultados". Imagens do logo: pendente salvar em `docs/brand/` (usuário enviou 3 PNGs no chat de 2026-07-31).

## Fases

| Fase | Status | Data | Artefato |
|------|--------|------|----------|
| 0 — Preflight/Setup | ✅ concluída | 2026-07-31 | este arquivo |
| 1 — Brainstorm | ✅ concluída (aguardando revisão da spec pelo usuário) | 2026-07-31 | `docs/superpowers/specs/2026-07-31-nano-guara-ia-site-design.md` |
| 2 — Discovery (adaptada: marca própria + persona) | ✅ concluída (aguardando confirmação do usuário) | 2026-07-31 | `docs/nano-guara-ia-perfil.md` + `~/pesquisas/pesquisa-dores-profissionais-liberais-ia-2026-07-31.md` |
| 3 — Pesquisa Técnica (Cloudflare-first) | ✅ concluída (aguardando aprovação da stack pelo usuário) | 2026-07-31 | `docs/nano-guara-ia-stack.md` |
| 4 — Design (design-taste-frontend + mockup Artifact) | ✅ concluída (aguardando aprovação do mockup + design doc) | 2026-07-31 | `docs/nano-guara-ia-design.md` + mockup https://claude.ai/code/artifact/c79e3b5e-4fe5-4e8f-a762-4d168d8bbdfc |
| 5 — Escrita do Plano | pendente | | `docs/superpowers/plans/YYYY-MM-DD-nano-guara-ia-site.md` |
| 6 — Auditoria | pendente | | `docs/nano-guara-ia-audit.md` |
| 7 — Correção | pendente | | plano corrigido |
| 8 — Montagem | pendente | | resumo final |

## Decisões tomadas

- 2026-07-31 — Fase 0: preflight ok; skill `design-sync` NÃO existe no marketplace (verificado via `npx skills find`) → Fase 4 usa a tool `DesignSync` direto, fallback mockup `artifact-design`. Mood board opcional dispensado (sem GEMINI_API_KEY na sessão). Motor de pesquisa: Exa via MCP.
- 2026-07-31 — Escopo: produto = site institucional (decisão do usuário via AskUserQuestion).
- 2026-07-31 — Fase 1: público nº1 = profissionais liberais; carro-chefe = Assistente Virtual; captação = WhatsApp (primário) + assistente demo no site + formulário; formato = one-page; SEM prova social no MVP; estrutura clonada/adaptada de carecode.ai/pt (estrutura sim, cores não) → 9 seções aprovadas pelo usuário. Referência: `docs/referencia-carecode-estrutura.md`. Repo git inicializado.

## Próxima fase

**Gate pendente:** usuário aprovar a stack `docs/nano-guara-ia-stack.md`. Depois → **Fase 4 — Design**: `design-taste-frontend` (direção + design system adaptando a marca guaraná) e telas via tool `DesignSync` (Claude Design; confirmar antes de escrever na conta), fallback `artifact-design`. Pendências herdadas: salvar os 3 PNGs do logo em `docs/brand/`; ler CFO-196/2019 na fonte primária; confirmar no dash que Cloudflare Registrar não cobre .br (premissa); eval de pt-BR do modelo `@cf/zai-org/glm-4.7-flash` antes do go-live.

- 2026-07-31 — Fase 3: stack 100% Cloudflare aprovada pela atlas + fact-check adversarial (0 refutados). 1 Worker (Static Assets + /api/lead + /api/chat), D1, Turnstile, Email Service (destino verificado = grátis), Workers AI glm-4.7-flash via AI Gateway (rate limit grátis; streaming não cacheia), Web Analytics. Saídas da Cloudflare só por cobertura: registro .br (Registro.br), WhatsApp (wa.me), inbox (Gmail via Email Routing). Custo MVP ≈ R$ 40/ano (domínio); upgrade opcional Workers Paid US$5/mês. Sem RAG (system prompt basta).

- 2026-07-31 — Fase 2: pesquisa em funil (`/pesquisa -f`, motor Exa) com Phase Gate por subagent independente (2 rodadas de verificação + fixes). Números seguros pra copy: 62% desistem de compra no WhatsApp (Opinion Box 2025), 1 em 3 clínicas com >11% de faltas (Doctoralia/Feegow 2025), 59% rejeitam resposta automática genérica (Opinion Box). Números BANIDOS: "5 minutos" como estatística, "20-30% faltas", "53% esqueceram", "55-70% propostas". Diferencial descoberto: regras de publicidade por conselho (dentista/psicólogo não anunciam preço em público → assistente no 1:1 é o fit).
