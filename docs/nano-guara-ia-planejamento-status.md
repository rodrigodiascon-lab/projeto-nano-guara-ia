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
| 1 — Brainstorm | ⏳ em andamento | | doc de escopo |
| 2 — Discovery (adaptada: marca própria + persona) | pendente | | `docs/nano-guara-ia-perfil.md` |
| 3 — Pesquisa Técnica (Cloudflare-first) | pendente | | tabela de decisão de stack |
| 4 — Design (design-taste-frontend + DesignSync) | pendente | | `docs/nano-guara-ia-design.md` |
| 5 — Escrita do Plano | pendente | | `docs/superpowers/plans/YYYY-MM-DD-nano-guara-ia-site.md` |
| 6 — Auditoria | pendente | | `docs/nano-guara-ia-audit.md` |
| 7 — Correção | pendente | | plano corrigido |
| 8 — Montagem | pendente | | resumo final |

## Decisões tomadas

- 2026-07-31 — Fase 0: preflight ok; skill `design-sync` NÃO existe no marketplace (verificado via `npx skills find`) → Fase 4 usa a tool `DesignSync` direto, fallback mockup `artifact-design`. Mood board opcional dispensado (sem GEMINI_API_KEY na sessão). Motor de pesquisa: Exa via MCP.
- 2026-07-31 — Escopo: produto = site institucional (decisão do usuário via AskUserQuestion).

## Próxima fase

**Fase 1 — Brainstorm** (`superpowers:brainstorming`): proposta de valor, público, serviço carro-chefe, jornada do visitante, MVP do site (páginas + mecanismo de captação de leads), pesquisa de concorrentes via `pesquisa -f`. Gate: usuário aprova escopo.
