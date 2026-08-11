# nanoguará.ia

Site institucional da **nanoguará.ia**, agência de IA para **clínicas e consultórios de saúde** (estética, harmonização facial, odontologia, dermatologia, fisioterapia, psicologia, nutrição e consultórios médicos) baseada em Manaus. Duas ofertas com o mesmo peso: **criação de sites** e **assistente virtual no WhatsApp**. Projeto **separado** da lucrec.ia.

> Reposicionado em 2026-08-11. Antes o site falava a "profissionais liberais" e tratava o assistente como carro-chefe; hoje a home apresenta site e assistente lado a lado, para clínicas.

**No ar em produção:** https://nanoguara.ia.br (desde 2026-08-02)

> Este README é o ponto de entrada. Os documentos detalhados de cada fase do planejamento ficam em [`docs/`](docs/) — este arquivo indexa e resume, não substitui.

## Origem do nome e da marca

**nanoguará vem de guaraná** (o fruto amazônico) — não do pássaro guará/íbis-escarlate. O logotipo (`site/public/brand/marca.svg`) representa a cápsula do guaraná partida, que no folclore amazônico é descrita como parecendo um olho:

- Círculo verde `#2E7D32` — casca/folhagem
- Círculo vermelho `#D5382F` — polpa aberta do fruto
- Elipse creme `#FDF9F0` — "esclera" do olho estilizado
- Elipse escura `#17231B` — "pupila"/semente
- Folha verde no topo + traços de circuito eletrônico à direita (referência a IA/tecnologia)

Paleta completa (tema claro / escuro) em [`docs/design/nano-guara-ia-design.md`](docs/design/nano-guara-ia-design.md).

## Status atual

Planejamento e execução do MVP **concluídos** (2026-07-31 a 2026-08-02, ciclo completo `/planejar` de 8 fases + execução via `subagent-driven-development`). 91 testes verdes, deploy manual via Wrangler, produção validada de ponta a ponta (Turnstile real, D1, e-mail de notificação, LGPD).

Trabalho pós-go-live já entregue: página `/portfolio` com 3 cases (2026-08-04); SEO local, `llms.txt`, landing de sites para clínicas e reposicionamento da home (2026-08-11).

## Arquitetura

Um único Cloudflare Worker (`site/`) serve os assets estáticos **e** a API — sem `run_worker_first`, para manter os assets estáticos grátis/ilimitados no free tier.

| Rota | Método | Comportamento |
|---|---|---|
| `/` , `/portfolio` , `/privacidade` | GET | HTML estático (Cloudflare Static Assets) |
| `/servicos/sites-para-clinicas-de-estetica-em-manaus` | GET | Landing da oferta de sites (`Service` + `FAQPage` + `BreadcrumbList`) |
| `/llms.txt` , `/llms-full.txt` | GET | Resumo da empresa para sistemas de IA (`text/plain; charset=utf-8`) |
| `/api/health` | GET | `{ok:true}` |
| `/api/lead` | POST | Turnstile → grava lead no D1 → notifica por e-mail (texto puro, sem HTML) |
| `/api/chat` | POST | Streaming SSE via Workers AI (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`) por AI Gateway |
| qualquer `/api/*` desconhecida | * | 404 JSON |
| qualquer outra URL | * | 404 HTML (`404.html`) |
| *(cron diário, 05:00 UTC)* | — | Expurga leads com mais de 12 meses (retenção LGPD) |

Bindings (`site/wrangler.jsonc`): D1 `DB` (`nanoguara-leads`), `AI`, rate limits `CHAT_RL` (10/60s) e `LEAD_RL` (5/60s), `send_email` `NOTIFY`, Static Assets. Custo estimado: **~R$ 40/ano** (só o domínio) — decisão documentada em [`docs/engenharia/nano-guara-ia-stack.md`](docs/engenharia/nano-guara-ia-stack.md).

Código-fonte: `src/index.ts` (roteador), `chat-route.ts`, `lead-route.ts`, `email.ts`, `leads.ts`, `http.ts` (headers de segurança, validação de origem), `turnstile.ts`.

## Rodando localmente

```bash
cd site
npm install
npm run dev      # wrangler dev --remote
npm test         # vitest run — 91 testes
npm run types    # regenera worker-configuration.d.ts
npm run deploy   # wrangler deploy (manual — não há CI/CD configurado)
```

## Documentação

O mapa completo e a ordem de leitura ficam em [`docs/README.md`](docs/README.md). Para retomar o projeto rapidamente, comece pelo [status do planejamento](docs/produto/nano-guara-ia-planejamento-status.md).

## Portfólio (`/portfolio`)

4 cases publicados, todos com link externo:

1. **GP Representação Comercial** — landing page (Manaus, AM) — `gp-representacao.pages.dev`
2. **RD Representações** — webapp de uso interno — `rd-representacoes.lucrec-ia.workers.dev`
3. **Carla Dias Dermatologia** — *modelo de site* (rotulado explicitamente como não-cliente-real) — `dra-carla-dias.pages.dev`
4. **Clínica Renove** — *modelo de site* (rotulado explicitamente como não-cliente-real) — `clinica-estetica-demo.pages.dev`

## Pendências e decisões em aberto

- **`/api/chat` sem Turnstile** — decisão consciente do usuário para não criar atrito na demo pública; risco é consumo de cota por terceiros, não vazamento de dado. Revisitar se o consumo de neurons subir sem explicação.
- **~09/08/2026** — conferir no AI Crawl Control se `OAI-SearchBot`/`PerplexityBot` continuam acessando o site.
- **15/09/2026** — Cloudflare muda os defaults de bloqueio de bots; pode afetar rastreadores de IA.
- **Web app do Representante Comercial** (7º serviço listado no site) segue fora de escopo — precisa de um novo ciclo `/planejar`.
- **Mídia dos posts fora do git** (2026-08-11): de `docs/marketing/brand/posts/` versionamos só a receita (README, `prompts.md`, `legendas.md`, `index.html`, filelists, SVG). PNG, JPG, MP4 e as cópias de fonte estão no `.gitignore` — abrir um `index.html` de post num clone limpo mostra imagem quebrada até regenerar.
- **`site/public/` é servido na web**: qualquer arquivo ali vira URL pública no deploy seguinte, mesmo sem link apontando pra ele. Cinco imagens de Instagram ficaram expostas assim até 2026-08-11 e foram para `docs/marketing/posts-instagram/`. Ao colocar arquivo em `public/`, assuma que ele é público. Hoje `site/public/brand/` guarda só o que o site usa de fato: `og.png` (meta tags), `favicon.svg`, `favicon.png`, e `marca.svg` + `avatar-chat.svg`, que não são requisitados como arquivo porque o SVG é inlinado no HTML — ficam como fonte da marca, duplicados em `docs/marketing/brand/`.
- **Google Search Console: verificado em 2026-08-11**, como propriedade de domínio (`sc-domain:nanoguara.ia.br`), pelo registro TXT `google-site-verification=uQX0gU…` no apex da zona da Cloudflare. **Não remova esse TXT** — é ele que mantém a propriedade verificada. Sitemap enviado. Falta pedir indexação das 4 URLs. Atenção: a mesma conta Google tem a propriedade `lucrec.ia.br`, verificada em 2026-07-09; confira o seletor antes de enviar qualquer coisa.
- **Bing: as URLs são avisadas por IndexNow**, não pelo Webmaster Tools. A prova de posse é o arquivo `site/public/<chave>.txt`; **não apague** — sem ele o IndexNow aceita o POST e descarta em silêncio na validação. Reenviar após publicar: `node scripts/indexnow.mjs` (sem argumento manda as 4 URLs; com argumentos manda só as passadas). Conta no Webmaster Tools continua opcional, e só ela dá relatório de desempenho.
- **Perfil da Empresa no Google** segue sem configurar. Textos, categorias e imagens já estão prontos em [`docs/marketing/perfil-google/`](docs/marketing/perfil-google/).
- **`sameAs` do schema vazio** — falta a URL do Instagram e do LinkedIn para o Google e as IAs confirmarem a existência da empresa fora do próprio site.
- **Rolagem horizontal de 15px no mobile** (viewport 375px), originada na seção `#contato`: o `<form>` mede 366px enquanto todos os filhos medem 300px. Pré-existente, confirmado contra produção.
- Sem CI/CD — deploy é manual via `npm run deploy`.

## Convenção de commits

Prefixos em português, minúsculo, sem em-dash: `feat(site):`, `fix(site):`, `docs:`, `chore:`, `copy:`, `perf(site):`, `design(...):`, `seo:`, `plano:`, `test(site):`.
