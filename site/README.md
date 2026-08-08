# Aplicação do site

Cloudflare Worker que serve o site estático e as APIs da nanoguará.ia.

## Estrutura

| Caminho | Responsabilidade |
|---|---|
| `src/` | Worker, rotas HTTP, chat, leads, e-mail e Turnstile |
| `public/` | HTML, CSS, JavaScript, SEO e assets publicados |
| `test/` | Testes Vitest executados no ambiente de Workers |
| `migrations/` | Migrações do banco D1, em ordem numérica |
| `scripts/` | Utilitários manuais, incluindo a avaliação do chat |
| `wrangler.jsonc` | Bindings, rotas, cron e configuração de deploy |

## Comandos

```bash
npm install
npm run dev
npm test
npm run types
npm run deploy
```

`npm run dev` usa recursos remotos do Cloudflare. O deploy é manual e deve ser seguido pelo smoke test descrito em [`../docs/operacoes/roteiro-go-live.md`](../docs/operacoes/roteiro-go-live.md).

## Fluxos principais

- `POST /api/lead`: valida origem e Turnstile, aplica rate limit, persiste no D1 e envia notificação.
- `POST /api/chat`: valida a requisição, aplica rate limit e responde por streaming SSE usando Workers AI.
- Cron diário: remove leads além do prazo de retenção definido para LGPD.

Não coloque segredos no repositório. Variáveis sensíveis devem ser configuradas pelos mecanismos do Wrangler/Cloudflare.
