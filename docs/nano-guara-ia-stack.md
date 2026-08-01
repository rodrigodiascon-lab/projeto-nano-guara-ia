# Stack — Site nanoguará.ia (Fase 3 /planejar · Cloudflare-first)

> 2026-07-31 · Arquitetura via `cloudflare-atlas` (retrieval-first) + fact-check adversarial independente contra docs ao vivo (0 claims refutados; qualificações incorporadas). Pricing verificado em 31/07/2026 — re-verificar antes de implementar.

## Arquitetura (100% Cloudflare)

```
Visitante
   │
   ▼
[DNS Cloudflare] ──► [Worker "nanoguara-site"]
                        ├─ Static Assets  → one-page (HTML/CSS/JS)   ← grátis e ilimitado
                        ├─ POST /api/lead → Turnstile siteverify → D1 (INSERT) → Email Service (notificação) 
                        └─ POST /api/chat → Workers AI (via AI Gateway) → SSE streaming
Botões WhatsApp → links wa.me (sem infra)
Beacon Web Analytics → métricas sem cookies (LGPD-friendly)
```

Um único Worker serve os assets E as duas rotas de API (padrão documentado: asset é servido primeiro; sem match, invoca o script). **Não usar `run_worker_first`** — com ele os requests de asset passariam a consumir a cota de 100k/dia do Free.

## Tabela de decisão (formato /planejar)

| Camada | Escolha Cloudflare | Saiu? Por que (cobertura/custo) | Alternativa |
|--------|--------------------|--------------------------------|-------------|
| Frontend (one-page) | **Workers + Static Assets** | — | — |
| Backend (form + chat) | **Workers** (mesmo Worker, rotas `/api/*`) | — | — |
| Banco (leads) | **D1** (tabela `leads`) | — | — |
| Anti-spam do formulário | **Turnstile** (widget managed) | — | — |
| Notificação de lead | **Email Service** (binding `send_email` → endereço verificado da agência) | — | — |
| LLM do chat demo | **Workers AI** — `@cf/zai-org/glm-4.7-flash` (citado nominalmente como disponível no Free no changelog 28/07/2026; qualidade pt-BR = hipótese a validar por eval antes do go-live; fallback: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`) | — | — |
| Proxy/observabilidade IA | **AI Gateway** (na frente do Workers AI via param `gateway` no `env.AI.run`) — analytics, logs e **rate limiting grátis**; streaming não é cacheado por padrão (valor aqui é observabilidade+rate limit, não cache) | — | — |
| Analytics | **Web Analytics** (beacon, sem cookies — argumento LGPD) | — | — |
| DNS/TLS/CDN | **Cloudflare DNS + SSL/TLS + cache** | — | — |
| Domínio: **`nanoguara.ia.br`** (oficial) + `nanoguara.com.br` (redireciona 301) | DNS, TLS e Redirect Rules na Cloudflare | **Cobertura:** `.br` não consta nos TLDs do Cloudflare Registrar | **Registro.br** (registro) com nameservers da Cloudflare |
| Canal WhatsApp | links `wa.me` com mensagem pré-preenchida por seção | **Cobertura:** WhatsApp é plataforma Meta, não infra | — (sem custo; API oficial WhatsApp só se o assistente de produção entrar em cena — fora do escopo do site) |
| Caixa de e-mail da agência | — | **Cobertura:** inbox não é produto CF (Email Routing pode encaminhar `contato@dominio` pro Gmail — usar!) | Gmail/e-mail existente da agência |

## Decisões de detalhe

1. **Formulário de leads:** POST `/api/lead` → valida token Turnstile no servidor (siteverify; token single-use, expira em 5 min) → `INSERT` no D1 (campos: nome, profissão, whatsapp, dor, consentimento LGPD, origem, timestamp) → `ctx.waitUntil(env.NOTIFY.send(...))` pro e-mail verificado da agência. Falha no e-mail não bloqueia a resposta ao visitante (lead já está no D1).
2. **Chat demo:** POST `/api/chat` com streaming SSE; system prompt com o contexto da agência (serviços, tom, regras — cabe no prompt, **sem RAG**: AI Search/Vectorize seria overkill pra um one-page). Rate limiting no AI Gateway (grátis) + limite de mensagens por sessão no cliente. Fallback de indisponibilidade → CTA WhatsApp (já previsto na spec).
3. **E-mail:** enviar SÓ para o endereço verificado da agência = **grátis em qualquer plano e fora da cota**. Auto-resposta ao lead (destinatário arbitrário) exigiria Workers Paid + sending domain onboardado → fica fora do MVP.
4. **Segurança/LGPD:** secret do Turnstile via `wrangler secret`; CSP liberando `challenges.cloudflare.com` e `static.cloudflareinsights.com`; sem cookies de tracking; consentimento explícito no formulário; política de privacidade no footer.
5. **Deploy:** `wrangler deploy` (Workers Builds com git opcional depois).

## Custo estimado (verificado ao vivo em 31/07/2026 — estimativa, não cotação)

Premissas: ~500 visitas/dia no início, ~30 conversas de chat/dia (~10 msgs cada), ~10 leads/dia.

| Item | Free tier | Uso estimado | Custo |
|------|-----------|--------------|-------|
| Workers (requests dinâmicos) | 100k/dia (Free) | < 1k/dia | R$ 0 |
| Static assets | grátis ilimitado | — | R$ 0 |
| D1 | 5M reads/dia, 100k writes/dia | ~10 writes/dia | R$ 0 |
| Turnstile | ilimitado | — | R$ 0 |
| Email Service (destino verificado) | grátis em todos os planos | ~10/dia | R$ 0 |
| Workers AI | 10.000 Neurons/dia | chat demo modesto (validar consumo real por eval) | R$ 0 |
| AI Gateway | core grátis (Free: 100k logs TOTAIS — monitorar) | — | R$ 0 |
| Web Analytics / DNS / TLS | grátis | — | R$ 0 |
| Domínios (`nanoguara.ia.br` + `nanoguara.com.br`) | — | Registro.br, 2 domínios | ~R$ 80/ano |
| **Total MVP** | | | **~R$ 80/ano (só os domínios)** |

Upgrade opcional futuro: **Workers Paid US$5/mês** desbloqueia auto-resposta ao lead por e-mail, modelos IA gated, CPU maior e 10M logs de AI Gateway. Estouro do free de Workers AI: US$0,011/1.000 Neurons.

## Gotchas registradas (do fact-check)

- Free plan: estourar 100k req/dia → erro 1027; estourar Neurons → 429/3036; modelos gated no Free → 403/5035.
- AI Gateway no Free guarda 100.000 logs NO TOTAL (não por mês) — desligar log em requests de health-check (`cf-aig-collect-log: false`).
- Web Analytics: ad-blockers subcontam; beacon único por página; CSP correto.
- D1: sempre `?` + `.bind()` (nunca interpolar SQL); migrations com `--remote` em produção.
- Turnstile: siteverify SEMPRE no servidor; campo `cf-turnstile-response`; `turnstile.reset()` após erro de submit.
