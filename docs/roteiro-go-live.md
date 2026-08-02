# Roteiro de go-live: nanoguará.ia

> Task 10 do plano. Escrito em 2026-08-01, com o estado real do projeto já refletido.
> Tudo que dependia só de código está pronto: 59 testes verdes, 9 tasks fechadas.

## Como usar este roteiro

Cada item diz **quem faz**. Os marcados com 🧑 são seus, porque criam recursos ou credenciais na sua conta. Os marcados com 🤖 são meus, e eu executo assim que você me passar o que o item anterior produziu.

Faça na ordem. Alguns itens dependem do anterior.

---

## Já resolvido, não precisa fazer

| Item | Estado |
|---|---|
| Registro do domínio | `nanoguara.ia.br`, titular R. DIAS PIMENTEL, expira 01/08/2027 |
| Zona na Cloudflare | Ativa, conta Lucrec.IA, plano Free |
| DNSSEC do Registro.br | Desativado antes da troca de nameservers, sem quebrar resolução |
| Nameservers | Delegados: `bob.ns.cloudflare.com` e `georgia.ns.cloudflare.com` |
| Domínio real nos arquivos | `robots.txt`, `sitemap.xml`, `schema.json` e `index.html` |
| Link canonical | Adicionado apontando para `https://nanoguara.ia.br/` |
| Formato do SSE do chat | Verificado contra a API real. Modelo `@cf/meta/llama-3.3-70b-instruct-fp8-fast` |
| Eval do chat | Aprovado. Ver `docs/nano-guara-ia-eval-chat.md` |

O item 6 do Step 1 do plano (domínio e DNSSEC) está **integralmente concluído**. Os dois bloqueios que ele descreve já foram contornados.

---

## Parte A: recursos que você cria

### A1. 🧑 Banco de dados D1

Rode no terminal, dentro de `site/`:

```bash
npx wrangler d1 create nanoguara-leads
```

A saída traz um `database_id`. **Me mande esse valor** (não é secreto, é um identificador).

### A2. 🤖 Aplico o id e rodo a migration

Com o id em mãos, eu preencho o `wrangler.jsonc`, regenero os tipos e aplico a migration em produção. Depois confirmo que a tabela existe.

### A3. 🧑 Turnstile

Painel da Cloudflare → **Turnstile** → **Add widget**.

- Nome: `nanoguara-site`
- Domínio: `nanoguara.ia.br`
- Modo: **Managed**

Isso gera dois valores:
- **Site key** (público, vai no HTML): me mande.
- **Secret key** (secreto): **não me mande pelo chat.** Rode você mesmo, dentro de `site/`:

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Ele pede a chave, você cola, e ela vai direto para a Cloudflare sem passar por aqui.

### A4. 🧑 Email Routing, para a notificação de lead chegar

Painel → zona `nanoguara.ia.br` → **Email** → **Email Routing**.

1. Habilite o Email Routing na zona (ele cria os registros MX automaticamente).
2. Em **Destination addresses**, adicione `rodrigodias.consultor@gmail.com` e confirme pelo link que chega no Gmail.
3. Crie um endereço de rota, por exemplo `contato@nanoguara.ia.br`, encaminhando para o Gmail.

**Me mande** qual endereço remetente você quer usar (a sugestão é `contato@nanoguara.ia.br`). Ele vira o `LEAD_FROM`.

> Por que isso importa: a pesquisa em documentação oficial mostrou que enviar para um endereço verificado é grátis e fora de cota, mas o remetente precisa pertencer a um domínio de Email Routing da conta. Sem isso, o lead grava no banco mas o e-mail não chega.

### A5. 🧑 AI Gateway

Painel → **AI** → **AI Gateway** → **Create Gateway**.

- Nome: **`nanoguara`** (exatamente assim; o `wrangler.jsonc` já aponta para esse nome)
- Ative **rate limiting**: 30 requisições por minuto
- Deixe os logs ligados por enquanto

> Fica atento a um limite: no plano Free o AI Gateway guarda 100.000 logs **no total**, não por mês. Quando passar da fase de depuração, vale desligar a coleta.

### A6. 🧑 Web Analytics

Painel → **Analytics & Logs** → **Web Analytics** → **Add a site** → `nanoguara.ia.br`.

Ele gera um **token de beacon**. Me mande (é público, vai no HTML).

### A7. 🧑 Verificar se os rastreadores de IA estão bloqueados

**Este é o item que descobrimos na pesquisa e que ninguém teria olhado.**

Desde 01/07/2025 a Cloudflare bloqueia rastreadores de IA por padrão em domínio novo. O `nanoguara.ia.br` foi cadastrado em 01/08/2026, ou seja, depois dessa mudança.

Painel → zona `nanoguara.ia.br` → **Controle de rastreamento de IA** (AI Crawl Control).

Confira o estado e **permita** os de busca e citação: `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`, `Amzn-SearchBot`, além do `Googlebot`.

Sobre os de treino (`GPTBot`, `ClaudeBot`, `Google-Extended`, `Meta-ExternalAgent`, `Amazonbot`): a recomendação registrada no plano é **permitir**, porque a agência vive de ser encontrada. É decisão sua.

**Me diga o que encontrou lá**, mesmo que já estivesse tudo liberado. Isso vira registro.

---

## Parte B: o que eu faço com o que você me passar

### B1. 🤖 Preencher os quatro placeholders

| Placeholder | Onde | Vem de |
|---|---|---|
| `PREENCHER_NA_TASK_10` | `wrangler.jsonc`, `database_id` | A1 |
| `PREENCHER_REMETENTE_NA_TASK_10` | `wrangler.jsonc`, `LEAD_FROM` | A4 |
| `SITE_KEY_DA_TASK_10` | `index.html`, Turnstile | A3 |
| `TOKEN_DA_TASK_10` | `index.html`, beacon | A6 |

### B2. 🤖 Verificação anti-placeholder, que bloqueia o deploy

```bash
grep -rn "PREENCHER\|SITE_KEY_DA_TASK_10\|TOKEN_DA_TASK_10" site/ --exclude-dir=node_modules
```

Precisa voltar **vazio**. Qualquer ocorrência impede o deploy.

### B3. 🤖 Regenerar tipos, rodar a suíte e fazer o deploy

```bash
npx wrangler types && npx vitest run && npx tsc --noEmit
npx wrangler deploy
```

### B4. 🤖 Ligar o domínio ao Worker

Adicionar `nanoguara.ia.br` como custom domain do Worker e criar a Redirect Rule 301 de `www` para o apex.

---

## Parte C: verificação depois do ar

Nada aqui é opcional. Cada item que falhar vira correção antes de considerar o site publicado.

### C1. 🤖 Cabeçalhos de segurança chegaram

```bash
curl -sI https://nanoguara.ia.br/ | grep -i content-security-policy
```

Confirma que o `_headers` foi aplicado pela Cloudflare.

### C2. 🤖 Conteúdo visível para rastreador de IA

```bash
curl -sA "GPTBot" https://nanoguara.ia.br/ | grep -c "porta de entrada"
curl -sA "OAI-SearchBot" https://nanoguara.ia.br/ | grep -c "Chamar no WhatsApp"
```

Os dois precisam retornar número maior que zero. Zero significa bloqueio no AI Crawl Control ou conteúdo dependente de JavaScript.

### C3. 🤖 Turnstile está mesmo protegendo

```bash
curl -X POST https://nanoguara.ia.br/api/lead \
  -H 'Content-Type: application/json' \
  -d '{"nome":"teste","profissao":"teste","whatsapp":"92988887777","turnstileToken":"lixo","consentimento":true}'
```

Precisa retornar **403**. Se retornar 201, o secret de teste vazou para produção e é problema sério.

### C4. 🧑 Formulário de ponta a ponta

Abra o site, preencha o formulário de verdade e envie.

Depois eu confirmo que gravou:

```bash
npx wrangler d1 execute nanoguara-leads --remote \
  --command "SELECT id, nome, profissao, criado_em FROM leads ORDER BY id DESC LIMIT 3"
```

E **você confere se o e-mail chegou** no Gmail. Se não chegou, eu investigo com `npx wrangler tail` procurando `lead_email_falhou`.

> Lembre do que a notificação carrega, por decisão de LGPD: só id, nome e profissão. O WhatsApp e o texto da mensagem ficam no banco, porque o campo livre pode conter dado de saúde.

### C5. 🤖 Rate limit funcionando

15 requisições seguidas em `/api/chat` precisam terminar em 429.

### C6. 🤖 Eval do chat contra o site no ar

```bash
cd site && node scripts/eval-chat.mjs https://nanoguara.ia.br
```

Sai com código 0 se o transporte estiver bom. O conteúdo eu levo para você aprovar nos cinco critérios, como fizemos na Task 9.

### C7. 🧑 Verificação visual, a que eu não consigo fazer

Abra o site numa aba **em primeiro plano** e confirme:

- as quatro mensagens do chat entrando em sequência no balão do herói
- o fundo mudando de tom lentamente
- uma varredura de luz passando pelo título
- o título legível o tempo todo, em nenhum momento invisível
- no celular: nada disso animando, e o título sólido e legível

Isso ficou pendente da Task 8 porque nenhuma aba de teste que eu controlo fica em primeiro plano, e o navegador não dispara essas animações em aba oculta.

### C8. 🤖 Lighthouse mobile

Metas do plano: Performance ≥ 90, Acessibilidade ≥ 95, CLS < 0,1.

---

## Depois do go-live

- **Uma semana depois:** conferir no AI Crawl Control se `OAI-SearchBot` e `PerplexityBot` apareceram. Se não apareceram, algo ainda bloqueia.
- **15/09/2026:** entram novos defaults de bloqueio de bots na Cloudflare. Reavaliar a configuração do A7 nessa data.
- **Se trocar o modelo do chat:** repetir o eval inteiro. O prompt foi ajustado para este modelo.

---

## O que fica de fora, por decisão registrada

| Item | Motivo |
|---|---|
| `llms.txt` | 97% dos arquivos nunca recebem requisição e o Google declarou que não usa |
| `nanoguara.com.br` defensivo | Estava livre em 31/07. Fora do escopo do MVP |
| Fotos reais na faixa "Pra quem é" | Adiado por você na revisão de design |
| Imagem OG com a fonte Outfit | Usa fonte do sistema. Afeta só o cartão de preview de link |
