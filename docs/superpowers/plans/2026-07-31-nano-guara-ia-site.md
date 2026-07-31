# Site nanoguará.ia — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Colocar no ar o site one-page da nanoguará.ia em Cloudflare Workers, com formulário de leads (Turnstile + D1 + e-mail) e chat demo com IA real (Workers AI via AI Gateway), a partir do mockup aprovado na Fase 4.

**Architecture:** Um único Worker serve os assets estáticos (`public/`) e duas rotas de API (`POST /api/lead`, `POST /api/chat`). Leads persistem em D1 e notificam por Email Service (destino verificado, grátis). O chat responde por streaming SSE do modelo `@cf/zai-org/glm-4.7-flash` proxiado pelo AI Gateway. Frontend é o mockup aprovado (docs/mockup-aprovado-fase4.html) dividido em HTML/CSS/JS com fontes e assets de efeito self-hosted.

**Tech Stack:** Cloudflare Workers + Static Assets · D1 · Turnstile · Email Service (`send_email`) · Workers AI + AI Gateway · TypeScript · Vitest com `@cloudflare/vitest-pool-workers` · wrangler v4.

## Global Constraints

- Grafia da marca SEMPRE **"nanoguará.ia"** (uma palavra; wordmark bicolor "nano" + "guará.ia" verde).
- Copy 100% PT-BR; **zero em-dash (`—`/`–`)** em texto visível; label único de CTA: **"Chamar no WhatsApp"**.
- Números na copy SÓ os verificados com fonte: "62% ... (Opinion Box, 2025)" e "1 em cada 3 clínicas ... (Panorama das Clínicas e Hospitais 2025, Doctoralia e Feegow)". PROIBIDOS: "5 minutos" como estatística, "20-30% de faltas", "53% esqueceram", "55-70% das propostas".
- Tokens de design do `docs/nano-guara-ia-design.md` (acento único guaraná; pill buttons; cards 16px; tema claro+escuro; `prefers-reduced-motion` em toda animação).
- LGPD: consentimento explícito no formulário, sem cookies de rastreamento, política de privacidade publicada, dados mínimos.
- System prompt do chat NUNCA dá conselho médico/jurídico/psicológico, não inventa preços fechados e sempre oferece transferência pro WhatsApp.
- Modelo IA: `@cf/zai-org/glm-4.7-flash` (free plan; validar pt-BR na Task 9 antes do go-live). `wrangler dev` para IA exige `--remote`.
- Sem `run_worker_first` no config de assets (mantém assets grátis/ilimitados).
- Node ≥ 20; wrangler ^4; dependências mínimas (sem framework de frontend).

---

### Task 1: Scaffold do projeto Worker + teste de fumaça

**Files:**
- Create: `site/package.json`, `site/wrangler.jsonc`, `site/tsconfig.json`, `site/vitest.config.ts`, `site/src/index.ts`, `site/test/index.test.ts`, `site/public/index.html` (placeholder temporário)

**Interfaces:**
- Produces: Worker com router `fetch(request, env, ctx)`; `interface Env { DB: D1Database; AI: Ai; NOTIFY: SendEmail; ASSETS: Fetcher; TURNSTILE_SECRET_KEY: string; WHATSAPP_NUMBER: string; AI_GATEWAY_ID: string }` (bindings chegam nas tasks seguintes; declarar já o tipo completo em `src/types.ts` para todas as tasks usarem).

- [ ] **Step 1: Criar estrutura e package.json**

```bash
mkdir -p /Users/rodri/projeto-nano-guara-ia/site/{src,test,public,migrations,scripts}
cd /Users/rodri/projeto-nano-guara-ia/site
```

`site/package.json`:
```json
{
  "name": "nanoguara-site",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev --remote",
    "deploy": "wrangler deploy",
    "test": "vitest run",
    "types": "wrangler types"
  },
  "devDependencies": {
    "@cloudflare/vitest-pool-workers": "^0.8.0",
    "@cloudflare/workers-types": "^4.20250731.0",
    "typescript": "^5.6.0",
    "vitest": "^3.0.0",
    "wrangler": "^4.0.0"
  }
}
```

```bash
npm install
```

- [ ] **Step 2: wrangler.jsonc**

`site/wrangler.jsonc`:
```jsonc
{
  "name": "nanoguara-site",
  "main": "src/index.ts",
  "compatibility_date": "2026-07-31",
  "assets": { "directory": "./public", "binding": "ASSETS" },
  "d1_databases": [
    { "binding": "DB", "database_name": "nanoguara-leads", "database_id": "PREENCHER_NA_TASK_10", "migrations_dir": "migrations" }
  ],
  "ai": { "binding": "AI" },
  "send_email": [
    { "name": "NOTIFY", "destination_address": "rodrigodias.consultor@gmail.com" }
  ],
  "vars": {
    "WHATSAPP_NUMBER": "PREENCHER_NUMERO_DA_AGENCIA",
    "AI_GATEWAY_ID": "nanoguara"
  },
  "observability": { "enabled": true }
}
```

`site/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "ES2022", "moduleResolution": "bundler",
    "strict": true, "noEmit": true, "types": ["@cloudflare/workers-types", "@cloudflare/vitest-pool-workers"]
  },
  "include": ["src", "test"]
}
```

`site/vitest.config.ts`:
```ts
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: { wrangler: { configPath: "./wrangler.jsonc" }, miniflare: {} },
    },
  },
});
```

- [ ] **Step 3: Tipos e router mínimo**

`site/src/types.ts`:
```ts
export interface Env {
  DB: D1Database;
  AI: Ai;
  NOTIFY: SendEmail;
  ASSETS: Fetcher;
  TURNSTILE_SECRET_KEY: string;
  WHATSAPP_NUMBER: string;
  AI_GATEWAY_ID: string;
}
```

`site/src/index.ts`:
```ts
import type { Env } from "./types";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") {
      return Response.json({ ok: true });
    }
    // Rotas /api/lead e /api/chat entram nas Tasks 4 e 5.
    return new Response("Não encontrado", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

`site/public/index.html` (placeholder até a Task 6):
```html
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>nanoguará.ia</title></head>
<body><h1>nanoguará.ia</h1><p>Em breve.</p></body></html>
```

- [ ] **Step 4: Teste de fumaça (falha primeiro por arquivo inexistente, depois passa)**

`site/test/index.test.ts`:
```ts
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("router", () => {
  it("responde /api/health com ok", async () => {
    const res = await SELF.fetch("https://site.local/api/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("responde 404 para rota de API desconhecida", async () => {
    const res = await SELF.fetch("https://site.local/api/nada");
    expect(res.status).toBe(404);
  });
});
```

Run: `cd /Users/rodri/projeto-nano-guara-ia/site && npx vitest run test/index.test.ts`
Expected: PASS (2 testes). Nota: o pool workers sobe o Worker com o wrangler.jsonc; o `database_id` placeholder não impede testes locais (miniflare cria D1 local).

- [ ] **Step 5: Commit**

```bash
cd /Users/rodri/projeto-nano-guara-ia && git add site && git commit -m "feat(site): scaffold do Worker com router e teste de fumaça"
```

---

### Task 2: D1 — migration e repositório de leads

**Files:**
- Create: `site/migrations/0001_leads.sql`, `site/src/leads.ts`, `site/test/leads.test.ts`

**Interfaces:**
- Produces: `insertLead(db: D1Database, lead: LeadInput): Promise<number>` e `type LeadInput = { nome: string; profissao: string; whatsapp: string; dor: string; origem: string }`. Task 4 consome exatamente essas assinaturas.

- [ ] **Step 1: Migration**

`site/migrations/0001_leads.sql`:
```sql
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  profissao TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  dor TEXT NOT NULL DEFAULT '',
  origem TEXT NOT NULL DEFAULT 'form',
  consentimento INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_criado_em ON leads(criado_em);
```

- [ ] **Step 2: Teste que falha**

`site/test/leads.test.ts`:
```ts
import { env, applyD1Migrations } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import { insertLead } from "../src/leads";

// Nota: applyD1Migrations exige listar as migrations no vitest config (miniflare bindings).
// Alternativa robusta usada aqui: executar o SQL da migration direto no beforeAll.
const MIGRATION = `CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, profissao TEXT NOT NULL,
  whatsapp TEXT NOT NULL, dor TEXT NOT NULL DEFAULT '', origem TEXT NOT NULL DEFAULT 'form',
  consentimento INTEGER NOT NULL DEFAULT 1, criado_em TEXT NOT NULL DEFAULT (datetime('now')));`;

describe("leads", () => {
  beforeAll(async () => {
    await env.DB.exec(MIGRATION.replace(/\n/g, " "));
  });

  it("insere lead e retorna id", async () => {
    const id = await insertLead(env.DB, {
      nome: "Camila Andrade", profissao: "Dentista",
      whatsapp: "+5592988887777", dor: "demoro pra responder", origem: "form",
    });
    expect(id).toBeGreaterThan(0);
    const row = await env.DB.prepare("SELECT nome, profissao FROM leads WHERE id = ?").bind(id).first();
    expect(row).toMatchObject({ nome: "Camila Andrade", profissao: "Dentista" });
  });
});
```

Run: `npx vitest run test/leads.test.ts` — Expected: FAIL ("insertLead" não existe).

- [ ] **Step 3: Implementação**

`site/src/leads.ts`:
```ts
export type LeadInput = {
  nome: string;
  profissao: string;
  whatsapp: string;
  dor: string;
  origem: string;
};

export async function insertLead(db: D1Database, lead: LeadInput): Promise<number> {
  const r = await db
    .prepare(
      "INSERT INTO leads (nome, profissao, whatsapp, dor, origem, consentimento) VALUES (?, ?, ?, ?, ?, 1)"
    )
    .bind(lead.nome, lead.profissao, lead.whatsapp, lead.dor, lead.origem)
    .run();
  return Number(r.meta.last_row_id);
}
```

- [ ] **Step 4: Rodar e passar**

Run: `npx vitest run test/leads.test.ts` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/rodri/projeto-nano-guara-ia && git add site && git commit -m "feat(site): tabela e repositório de leads no D1"
```

---

### Task 3: Verificação Turnstile (server-side)

**Files:**
- Create: `site/src/turnstile.ts`, `site/test/turnstile.test.ts`

**Interfaces:**
- Produces: `verifyTurnstile(secret: string, token: string, ip: string | null): Promise<boolean>`. Task 4 consome exatamente essa assinatura. Endpoint real: `https://challenges.cloudflare.com/turnstile/v0/siteverify`.

- [ ] **Step 1: Teste que falha (mock de fetch outbound)**

`site/test/turnstile.test.ts`:
```ts
import { fetchMock } from "cloudflare:test";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { verifyTurnstile } from "../src/turnstile";

beforeAll(() => {
  fetchMock.activate();
  fetchMock.disableNetConnect();
});
afterEach(() => fetchMock.assertNoPendingInterceptors());

describe("verifyTurnstile", () => {
  it("retorna true quando siteverify aprova", async () => {
    fetchMock
      .get("https://challenges.cloudflare.com")
      .intercept({ path: "/turnstile/v0/siteverify", method: "POST" })
      .reply(200, JSON.stringify({ success: true }));
    expect(await verifyTurnstile("secreta", "token-ok", "1.2.3.4")).toBe(true);
  });

  it("retorna false quando siteverify reprova", async () => {
    fetchMock
      .get("https://challenges.cloudflare.com")
      .intercept({ path: "/turnstile/v0/siteverify", method: "POST" })
      .reply(200, JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] }));
    expect(await verifyTurnstile("secreta", "token-ruim", null)).toBe(false);
  });
});
```

Run: `npx vitest run test/turnstile.test.ts` — Expected: FAIL ("verifyTurnstile" não existe).

- [ ] **Step 2: Implementação**

`site/src/turnstile.ts`:
```ts
export async function verifyTurnstile(
  secret: string,
  token: string,
  ip: string | null
): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false; // indisponibilidade do siteverify NUNCA deixa lead passar sem verificação
  }
}
```

- [ ] **Step 3: Rodar e passar**

Run: `npx vitest run test/turnstile.test.ts` — Expected: PASS (2 testes).

- [ ] **Step 4: Commit**

```bash
cd /Users/rodri/projeto-nano-guara-ia && git add site && git commit -m "feat(site): verificação server-side do Turnstile"
```

---

### Task 4: POST /api/lead (validação + Turnstile + D1 + e-mail)

**Files:**
- Create: `site/src/lead-route.ts`, `site/test/lead-route.test.ts`
- Modify: `site/src/index.ts` (montar a rota)

**Interfaces:**
- Consumes: `insertLead` (Task 2), `verifyTurnstile` (Task 3).
- Produces: `handleLead(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>`. Contrato HTTP: body JSON `{ nome, profissao, whatsapp, dor?, origem?, turnstileToken, consentimento: true }`; 201 `{ ok: true }` · 400 `{ ok: false, erro }` · 403 token reprovado.

- [ ] **Step 1: Teste que falha**

`site/test/lead-route.test.ts`:
```ts
import { SELF, fetchMock } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";

const MIGRATION = `CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, profissao TEXT NOT NULL,
  whatsapp TEXT NOT NULL, dor TEXT NOT NULL DEFAULT '', origem TEXT NOT NULL DEFAULT 'form',
  consentimento INTEGER NOT NULL DEFAULT 1, criado_em TEXT NOT NULL DEFAULT (datetime('now')));`;

function turnstileOk() {
  fetchMock
    .get("https://challenges.cloudflare.com")
    .intercept({ path: "/turnstile/v0/siteverify", method: "POST" })
    .reply(200, JSON.stringify({ success: true }));
}

const bodyValido = {
  nome: "Paulo Menezes", profissao: "Advogado(a)", whatsapp: "(92) 98888-7777",
  dor: "perco cliente por demora", origem: "form", turnstileToken: "tok", consentimento: true,
};

describe("POST /api/lead", () => {
  beforeAll(async () => {
    const { env } = await import("cloudflare:test");
    await env.DB.exec(MIGRATION.replace(/\n/g, " "));
    fetchMock.activate();
    fetchMock.disableNetConnect();
  });

  it("cria lead com payload válido", async () => {
    turnstileOk();
    const res = await SELF.fetch("https://site.local/api/lead", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyValido),
    });
    expect(res.status).toBe(201);
  });

  it("rejeita sem consentimento", async () => {
    const res = await SELF.fetch("https://site.local/api/lead", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...bodyValido, consentimento: false }),
    });
    expect(res.status).toBe(400);
  });

  it("rejeita nome vazio", async () => {
    const res = await SELF.fetch("https://site.local/api/lead", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...bodyValido, nome: "" }),
    });
    expect(res.status).toBe(400);
  });

  it("rejeita token Turnstile reprovado", async () => {
    fetchMock
      .get("https://challenges.cloudflare.com")
      .intercept({ path: "/turnstile/v0/siteverify", method: "POST" })
      .reply(200, JSON.stringify({ success: false }));
    const res = await SELF.fetch("https://site.local/api/lead", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyValido),
    });
    expect(res.status).toBe(403);
  });
});
```

Run: `npx vitest run test/lead-route.test.ts` — Expected: FAIL (404, rota não existe).

- [ ] **Step 2: Implementação da rota**

`site/src/lead-route.ts`:
```ts
import type { Env } from "./types";
import { insertLead } from "./leads";
import { verifyTurnstile } from "./turnstile";

type LeadBody = {
  nome?: unknown; profissao?: unknown; whatsapp?: unknown; dor?: unknown;
  origem?: unknown; turnstileToken?: unknown; consentimento?: unknown;
};

function texto(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 && t.length <= max ? t : null;
}

export async function handleLead(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let body: LeadBody;
  try {
    body = await request.json<LeadBody>();
  } catch {
    return Response.json({ ok: false, erro: "JSON inválido" }, { status: 400 });
  }

  if (body.consentimento !== true)
    return Response.json({ ok: false, erro: "Consentimento é obrigatório (LGPD)" }, { status: 400 });

  const nome = texto(body.nome, 80);
  const profissao = texto(body.profissao, 40);
  const whatsappBruto = texto(body.whatsapp, 25);
  const dor = typeof body.dor === "string" ? body.dor.trim().slice(0, 500) : "";
  const origem = texto(body.origem, 40) ?? "form";
  const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";

  if (!nome || !profissao || !whatsappBruto)
    return Response.json({ ok: false, erro: "Preencha nome, profissão e WhatsApp" }, { status: 400 });

  const whatsapp = whatsappBruto.replace(/[^\d+]/g, "");
  if (whatsapp.replace(/\D/g, "").length < 10 || whatsapp.replace(/\D/g, "").length > 13)
    return Response.json({ ok: false, erro: "WhatsApp inválido" }, { status: 400 });

  const humano = await verifyTurnstile(
    env.TURNSTILE_SECRET_KEY,
    token,
    request.headers.get("CF-Connecting-IP")
  );
  if (!humano) return Response.json({ ok: false, erro: "Verificação anti-spam falhou" }, { status: 403 });

  const id = await insertLead(env.DB, { nome, profissao, whatsapp, dor, origem });

  // Notificação: falha de e-mail não bloqueia a resposta (lead já está no D1).
  ctx.waitUntil(
    env.NOTIFY.send({
      to: "rodrigodias.consultor@gmail.com",
      from: "leads@SEU_DOMINIO_ONBOARDADO",
      subject: `Novo lead nanoguará.ia: ${nome} (${profissao})`,
      text: `Nome: ${nome}\nProfissão: ${profissao}\nWhatsApp: ${whatsapp}\nDor: ${dor || "(vazio)"}\nOrigem: ${origem}\nID: ${id}`,
      html: `<p><b>Novo lead</b></p><ul><li>Nome: ${nome}</li><li>Profissão: ${profissao}</li><li>WhatsApp: ${whatsapp}</li><li>Dor: ${dor || "(vazio)"}</li><li>Origem: ${origem}</li><li>ID: ${id}</li></ul>`,
    }).catch((e: unknown) => console.error("email de lead falhou", e))
  );

  return Response.json({ ok: true }, { status: 201 });
}
```

Nota de teste: o binding `send_email` no miniflare aceita `send()` localmente (no-op registrado); se a versão local rejeitar, encapsular `env.NOTIFY.send` num try/catch já cobre (como acima, o catch engole).

- [ ] **Step 3: Montar a rota no router**

Em `site/src/index.ts`, dentro do `fetch`, antes do 404:
```ts
if (url.pathname === "/api/lead" && request.method === "POST") {
  const { handleLead } = await import("./lead-route");
  return handleLead(request, env, ctx);
}
```

- [ ] **Step 4: Rodar e passar**

Run: `npx vitest run test/lead-route.test.ts` — Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
cd /Users/rodri/projeto-nano-guara-ia && git add site && git commit -m "feat(site): rota /api/lead com Turnstile, D1 e notificação por e-mail"
```

---

### Task 5: POST /api/chat (Workers AI via AI Gateway, streaming SSE)

**Files:**
- Create: `site/src/chat-route.ts`, `site/test/chat-route.test.ts`
- Modify: `site/src/index.ts` (montar a rota)

**Interfaces:**
- Consumes: `env.AI`, `env.AI_GATEWAY_ID`, `env.WHATSAPP_NUMBER`.
- Produces: `handleChat(request: Request, env: Env): Promise<Response>`; contrato HTTP: body `{ mensagens: Array<{ papel: "user" | "assistant"; texto: string }> }` (máx 12 itens, 500 chars cada); resposta `text/event-stream` repassando o stream do modelo; 400 payload inválido. Exporta também `montarMensagens(historico)` e `MODELO = "@cf/zai-org/glm-4.7-flash"` e o `SYSTEM_PROMPT` (Task 9 reusa).

- [ ] **Step 1: Teste que falha (unidade da montagem + validação da rota)**

`site/test/chat-route.test.ts`:
```ts
import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { montarMensagens, SYSTEM_PROMPT } from "../src/chat-route";

describe("montarMensagens", () => {
  it("prefixa system prompt e converte papéis", () => {
    const out = montarMensagens([
      { papel: "user", texto: "quanto custa?" },
      { papel: "assistant", texto: "depende do escopo" },
      { papel: "user", texto: "e pra dentista?" },
    ]);
    expect(out[0]).toEqual({ role: "system", content: SYSTEM_PROMPT });
    expect(out[1]).toEqual({ role: "user", content: "quanto custa?" });
    expect(out).toHaveLength(4);
  });

  it("trunca histórico a 12 mensagens e 500 chars", () => {
    const muitas = Array.from({ length: 30 }, (_, i) => ({
      papel: "user" as const, texto: "x".repeat(900) + i,
    }));
    const out = montarMensagens(muitas);
    expect(out.length).toBe(13); // system + 12
    expect(out[1].content.length).toBeLessThanOrEqual(500);
  });
});

describe("POST /api/chat", () => {
  it("rejeita payload sem mensagens", async () => {
    const res = await SELF.fetch("https://site.local/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});
// O caminho feliz (stream real do modelo) não roda no pool local (sem GPU):
// é validado na Task 9 (eval pt-BR contra o deploy) e no smoke da Task 10.
```

Run: `npx vitest run test/chat-route.test.ts` — Expected: FAIL (módulo não existe).

- [ ] **Step 2: Implementação**

`site/src/chat-route.ts`:
```ts
import type { Env } from "./types";

export const MODELO = "@cf/zai-org/glm-4.7-flash";

export const SYSTEM_PROMPT = [
  "Você é a assistente virtual da nanoguará.ia, agência brasileira de IA para profissionais liberais (médicos, dentistas, advogados, psicólogos, consultores).",
  "Serviços: Assistente Virtual no WhatsApp (atendimento, agendamento, confirmação, follow-up e pós-venda, 24 horas, com transferência pra humano), automação comercial, criação de sites, SEO e GEO, registro de marcas no INPI, consultoria LGPD e web app para representante comercial.",
  "Como funciona: 1) Diagnóstico gratuito por conversa; 2) Implantação configurada com a cara do cliente e as regras do conselho profissional dele (CFM, CFO, CFP, OAB); 3) Acompanhamento contínuo olhando conversas reais.",
  "Regras: responda SEMPRE em português brasileiro, tom caloroso e direto, respostas curtas (máximo 3 frases quando possível).",
  "NUNCA dê conselho médico, jurídico ou psicológico. NUNCA invente preço fechado: diga que o valor é definido no diagnóstico gratuito, sem surpresa.",
  "Se o visitante demonstrar interesse real, quiser preço fechado, ou pedir algo fora do seu alcance, ofereça continuar no WhatsApp da agência.",
  "Nunca finja ser humana: se perguntarem, diga que é a assistente de IA da agência, funcionando como demonstração do produto.",
].join(" ");

export type MsgCliente = { papel: "user" | "assistant"; texto: string };

export function montarMensagens(historico: MsgCliente[]): { role: string; content: string }[] {
  const recentes = historico.slice(-12).map((m) => ({
    role: m.papel === "assistant" ? "assistant" : "user",
    content: String(m.texto ?? "").slice(0, 500),
  }));
  return [{ role: "system", content: SYSTEM_PROMPT }, ...recentes];
}

export async function handleChat(request: Request, env: Env): Promise<Response> {
  let body: { mensagens?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, erro: "JSON inválido" }, { status: 400 });
  }
  const msgs = body.mensagens;
  if (!Array.isArray(msgs) || msgs.length === 0 || msgs.length > 12)
    return Response.json({ ok: false, erro: "Envie de 1 a 12 mensagens" }, { status: 400 });
  for (const m of msgs) {
    if (!m || (m.papel !== "user" && m.papel !== "assistant") || typeof m.texto !== "string")
      return Response.json({ ok: false, erro: "Formato de mensagem inválido" }, { status: 400 });
  }

  const stream = await env.AI.run(
    MODELO,
    { messages: montarMensagens(msgs as MsgCliente[]), stream: true, max_tokens: 512 },
    { gateway: { id: env.AI_GATEWAY_ID } }
  );

  return new Response(stream as ReadableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
    },
  });
}
```

- [ ] **Step 3: Montar rota no router**

Em `site/src/index.ts`, antes do 404:
```ts
if (url.pathname === "/api/chat" && request.method === "POST") {
  const { handleChat } = await import("./chat-route");
  return handleChat(request, env);
}
```

- [ ] **Step 4: Rodar e passar**

Run: `npx vitest run` — Expected: PASS (todos os testes das Tasks 1-5).

- [ ] **Step 5: Commit**

```bash
cd /Users/rodri/projeto-nano-guara-ia && git add site && git commit -m "feat(site): rota /api/chat com Workers AI via AI Gateway (SSE)"
```

---

### Task 6: Frontend de produção (portar o mockup aprovado)

**Files:**
- Create: `site/public/index.html`, `site/public/styles.css`, `site/public/app.js`, `site/public/privacidade.html`, `site/public/fx/mask.png`, `site/public/fx/noise.png`, `site/public/fonts/outfit-*.woff2`, `site/public/fonts/geist-*.woff2`, `site/public/brand/logo.png` (e variações), `site/public/_headers`
- Fonte da verdade visual: `docs/mockup-aprovado-fase4.html` (mockup aprovado na Fase 4)

**Interfaces:**
- Consumes: contratos HTTP de `/api/lead` (Task 4) e `/api/chat` (Task 5), exatamente como definidos.
- Produces: página final com Turnstile real, formulário e chat ligados na API.

- [ ] **Step 1: Assets self-hosted**

```bash
cd /Users/rodri/projeto-nano-guara-ia/site/public
mkdir -p fx fonts brand
# Máscara e ruído do efeito Etheral (hoje no CDN do Framer): baixar UMA vez e versionar
curl -o fx/mask.png  "https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png"
curl -o fx/noise.png "https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png"
```
Fontes: baixar Outfit (500/600/700) e Geist (400/500) em woff2 do Google Fonts/Vercel e salvar em `fonts/` (licenças OFL, ok). Logos: copiar os PNGs enviados pelo usuário para `brand/` (pendência da Fase 2; se ainda não estiverem em `docs/brand/`, pedir ao usuário antes desta task).

- [ ] **Step 2: Separar o mockup em HTML/CSS/JS**

- Copiar `docs/mockup-aprovado-fase4.html` e dividir: `<style>` inteiro vai pra `styles.css`; `<script>` inteiro vai pra `app.js`; o HTML fica em `index.html` com `<link rel="stylesheet" href="/styles.css">` e `<script src="/app.js" defer></script>`.
- Adicionar no topo do `styles.css` os `@font-face` (`font-display: swap`) e trocar os font-family: display `"Outfit"`, corpo `"Geist"` com fallbacks do mockup.
- Trocar as URLs do Framer por `/fx/mask.png` e `/fx/noise.png`.
- Trocar o SVG simplificado da navbar/chat pelo logo real (`/brand/logo.png`, `height=34`, `alt="nanoguará.ia"`).
- Adicionar `<meta name="description" content="Assistente virtual de IA no WhatsApp para profissionais liberais: atendimento 24 horas, agendamento, confirmação e pós-venda. Agência nanoguará.ia.">`, og:title/og:description/og:image (`/brand/og.png` 1200x630, gerar a partir do logo + tagline), `lang="pt-BR"`, favicon (`/brand/favicon.png`).

- [ ] **Step 3: Turnstile real no formulário**

No `index.html`, dentro do `<form id="leadForm">`, substituir `<div class="turnstile-slot">...</div>` por:
```html
<div class="cf-turnstile" data-sitekey="SITE_KEY_DA_TASK_10" data-theme="auto"></div>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

- [ ] **Step 4: Ligar formulário na API (substituir o submit fake do mockup)**

Em `app.js`, substituir o bloco `leadForm.addEventListener('submit', ...)` por:
```js
const form = document.getElementById('leadForm');
const okMsg = document.getElementById('okMsg');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const botao = form.querySelector('button[type="submit"]');
  botao.disabled = true; botao.textContent = 'Enviando...';
  const fd = new FormData(form);
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: fd.get('nome'), profissao: fd.get('profissao'),
        whatsapp: fd.get('whatsapp'), dor: fd.get('dor') || '',
        origem: 'form', consentimento: true,
        turnstileToken: fd.get('cf-turnstile-response') || '',
      }),
    });
    if (res.status === 201) {
      okMsg.style.display = 'block'; form.reset();
      if (window.turnstile) window.turnstile.reset();
    } else {
      const { erro } = await res.json().catch(() => ({ erro: 'Erro ao enviar' }));
      alertaFormulario(erro || 'Erro ao enviar. Tente pelo WhatsApp.');
      if (window.turnstile) window.turnstile.reset();
    }
  } catch {
    alertaFormulario('Sem conexão. Tente pelo WhatsApp.');
  } finally {
    botao.disabled = false; botao.textContent = 'Quero uma conversa';
  }
});
function alertaFormulario(txt) {
  okMsg.style.display = 'block';
  okMsg.textContent = txt;
  okMsg.style.borderColor = 'var(--erro)';
}
```

- [ ] **Step 5: Ligar o chat demo na API (substituir respostas roteirizadas)**

Em `app.js`, substituir o array `respostas` e a função `envia()` por:
```js
const historico = [];
async function envia() {
  const t = inp.value.trim(); if (!t) return;
  addMsg('out', t); historico.push({ papel: 'user', texto: t });
  inp.value = ''; inp.disabled = true;
  const pensando = addMsg('in', '...');
  try {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagens: historico.slice(-12) }),
    });
    if (!res.ok) throw new Error('falha');
    pensando.textContent = '';
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let acc = '', texto = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += dec.decode(value, { stream: true });
      // SSE do Workers AI: linhas "data: {json}\n\n" com {response: "trecho"} e final "data: [DONE]"
      const partes = acc.split('\n\n'); acc = partes.pop();
      for (const p of partes) {
        const linha = p.replace(/^data: /, '').trim();
        if (!linha || linha === '[DONE]') continue;
        try { texto += JSON.parse(linha).response || ''; } catch {}
        pensando.textContent = texto;
        log.scrollTop = log.scrollHeight;
      }
    }
    historico.push({ papel: 'assistant', texto });
  } catch {
    pensando.textContent = 'Estou fora do ar agora. Chama a gente direto no WhatsApp!';
  } finally {
    inp.disabled = false; inp.focus();
  }
}
function addMsg(tipo, txt) {
  const d = document.createElement('div');
  d.className = 'msg ' + tipo + ' show'; d.textContent = txt;
  log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
}
```

- [ ] **Step 6: Links WhatsApp reais + beacon Web Analytics**

- Todos os botões "Chamar no WhatsApp" viram `<a class="btn btn-primario" href="https://wa.me/NUMERO?text=MENSAGEM" target="_blank" rel="noopener">` com mensagem pré-preenchida por seção (ex.: herói `Oi! Vi o site da nanoguará.ia e quero saber mais sobre o assistente virtual.`; seção serviços idem com o nome do serviço). NUMERO vem da agência (mesmo valor de `WHATSAPP_NUMBER`).
- Antes do `</body>`: `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "TOKEN_DA_TASK_10"}'></script>`.

`site/public/_headers`:
```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com; frame-src https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; font-src 'self'
```
(Nota: o JS inline do mockup foi movido pra `app.js`, então `script-src` fica sem `unsafe-inline`; o CSS mantém `unsafe-inline` apenas pelos 2 styles inline do footer, que podem ser movidos pra classes se a auditoria pedir.)

- [ ] **Step 7: Política de privacidade**

`site/public/privacidade.html`: página simples com os tokens do design (mesmo CSS): quem somos, dados coletados (nome, profissão, WhatsApp, dor relatada, via formulário com consentimento), finalidade (contato comercial solicitado), base legal (consentimento, art. 7º I da LGPD), retenção (até pedido de exclusão), sem cookies de rastreamento (Web Analytics da Cloudflare é sem cookies), direitos do titular e canal de contato (e-mail da agência). Linkar no footer (o link "Política de Privacidade" já existe no mockup: apontar pra `/privacidade.html`).

- [ ] **Step 8: Verificação manual local**

Run: `cd site && npx wrangler dev --remote` e abrir `http://localhost:8787`:
- página renderiza com fontes Outfit/Geist e logo real; efeitos Etheral + shimmer rodando
- chat demo responde com IA REAL (via --remote)
- formulário com Turnstile de teste (usar site key de teste `1x00000000000000000000AA` + secret de teste no `.dev.vars`: `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA`) grava no D1 local
Expected: fluxo completo sem erro no console.

- [ ] **Step 9: Commit**

```bash
cd /Users/rodri/projeto-nano-guara-ia && git add site && git commit -m "feat(site): frontend de produção com Turnstile, chat IA e formulário reais"
```

---

### Task 7: Robots, sitemap e SEO básico

**Files:**
- Create: `site/public/robots.txt`, `site/public/sitemap.xml`
- Modify: `site/public/index.html` (JSON-LD)

- [ ] **Step 1: Arquivos**

`site/public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://SEU_DOMINIO/sitemap.xml
```

`site/public/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://SEU_DOMINIO/</loc></url>
  <url><loc>https://SEU_DOMINIO/privacidade.html</loc></url>
</urlset>
```

- [ ] **Step 2: JSON-LD no index.html (antes do `</body>`)**

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"ProfessionalService",
 "name":"nanoguará.ia","slogan":"Inteligência que gera resultados",
 "description":"Agência brasileira de IA para profissionais liberais: assistente virtual no WhatsApp, automação comercial, sites, SEO e GEO, registro de marcas e consultoria LGPD.",
 "areaServed":"BR","url":"https://SEU_DOMINIO/"}
</script>
```

- [ ] **Step 3: Commit**

```bash
cd /Users/rodri/projeto-nano-guara-ia && git add site && git commit -m "feat(site): robots, sitemap e JSON-LD"
```

---

### Task 8: Degradação de performance dos efeitos do herói

**Files:**
- Modify: `site/public/styles.css`, `site/public/app.js`

- [ ] **Step 1: Regras de degradação (aprovadas no design doc)**

Em `styles.css`:
```css
/* Mobile: efeito Etheral estático (sem filtro de displacement, pesado em GPU) */
@media (max-width: 767px) {
  .etheral { filter: blur(4px); }
}
@media (prefers-reduced-motion: reduce) {
  .etheral { filter: blur(4px); }
  .hero h1.shimmer { background-size: 100% 100% !important; }
}
```

Em `app.js`, condicionar os dois loops (hue do Etheral e sweep do shimmer):
```js
const efeitosAtivos = !rm && matchMedia('(min-width: 768px)').matches;
// usar `efeitosAtivos` no lugar de `!rm` nas duas inicializações (etheralHue e varre())
```

- [ ] **Step 2: Verificar**

Run: `npx wrangler dev` + DevTools em viewport mobile (375px): sem loops de animação rodando; desktop: efeitos ativos. Expected: confirmado visualmente.

- [ ] **Step 3: Commit**

```bash
cd /Users/rodri/projeto-nano-guara-ia && git add site && git commit -m "perf(site): degradação dos efeitos do herói em mobile e reduced-motion"
```

---

### Task 9: Eval de pt-BR do modelo (gate de go-live)

**Files:**
- Create: `site/scripts/eval-ptbr.mjs`

- [ ] **Step 1: Script de eval**

`site/scripts/eval-ptbr.mjs`:
```js
// Roda contra o dev remoto ou o deploy: node scripts/eval-ptbr.mjs https://host
const base = process.argv[2] ?? "http://localhost:8787";
const perguntas = [
  "Oi, o que vocês fazem?",
  "Quanto custa o assistente?",
  "Sou dentista, posso divulgar preço no Instagram?",
  "Funciona pra advogado?",
  "Vocês atendem fora de Manaus?",
  "Tenho medo de parecer robô pros meus pacientes",
  "Como funciona a implantação?",
  "Me passa o telefone de vocês",
];
for (const p of perguntas) {
  const res = await fetch(`${base}/api/chat`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensagens: [{ papel: "user", texto: p }] }),
  });
  let texto = "";
  const dec = new TextDecoder();
  for await (const chunk of res.body) {
    for (const parte of dec.decode(chunk, { stream: true }).split("\n\n")) {
      const linha = parte.replace(/^data: /, "").trim();
      if (!linha || linha === "[DONE]") continue;
      try { texto += JSON.parse(linha).response ?? ""; } catch {}
    }
  }
  console.log(`\n=== ${p}\n${texto}`);
}
```

- [ ] **Step 2: Rodar e avaliar (humano no loop)**

Run: `npx wrangler dev --remote` em um terminal; `node scripts/eval-ptbr.mjs` em outro.
Critérios de aprovação (avaliação do usuário/agência): português natural sem anglicismo estranho; nunca inventa preço fechado; nunca dá conselho de saúde/jurídico; oferece WhatsApp quando faz sentido; tom caloroso.
**Se reprovar:** trocar `MODELO` em `src/chat-route.ts` por `@cf/meta/llama-3.3-70b-instruct-fp8-fast` e repetir. Registrar o resultado no PR/commit.

- [ ] **Step 3: Commit**

```bash
cd /Users/rodri/projeto-nano-guara-ia && git add site && git commit -m "test(site): eval de pt-BR do chat (gate de go-live)"
```

---

### Task 10: Provisionamento e deploy

**Files:**
- Modify: `site/wrangler.jsonc` (IDs reais), `site/public/index.html` (site key, beacon token, wa.me), `site/public/robots.txt` + `sitemap.xml` + JSON-LD (domínio real)

- [ ] **Step 1: Recursos Cloudflare (uma vez, com o usuário logado no wrangler)**

```bash
cd /Users/rodri/projeto-nano-guara-ia/site
npx wrangler d1 create nanoguara-leads          # copiar database_id pro wrangler.jsonc
npx wrangler d1 migrations apply nanoguara-leads --remote
```
No dashboard (passos de UI, exigem o usuário):
1. **Turnstile** → criar widget (managed) pro domínio → copiar site key pro `index.html` e `echo "SECRET" | npx wrangler secret put TURNSTILE_SECRET_KEY`.
2. **AI Gateway** → criar gateway `nanoguara` → ligar rate limiting (ex.: 30 req/min) e logs.
3. **Email Service** → verificar `rodrigodias.consultor@gmail.com` como destination address (grátis em qualquer plano). O `from` do e-mail exige domínio onboardado; enquanto não onboardar, usar o remetente permitido pelos routing domains da conta (ver dash) e atualizar `lead-route.ts`.
4. **Web Analytics** → adicionar site → copiar token pro beacon no `index.html`.
5. **Domínio** → registrar `.com.br` no Registro.br, apontar nameservers pra Cloudflare, adicionar rota/custom domain no Worker. (Confirmar na busca do dash se o Registrar cobre `.br`; premissa: não cobre.)

- [ ] **Step 2: Deploy e smoke de produção**

```bash
npx wrangler deploy
```
Smoke manual: abrir o domínio → formulário com Turnstile real grava no D1 (`npx wrangler d1 execute nanoguara-leads --remote --command "SELECT * FROM leads ORDER BY id DESC LIMIT 3"`) e chega e-mail; chat responde em pt-BR; `node scripts/eval-ptbr.mjs https://SEU_DOMINIO` passa; Lighthouse (Performance ≥ 90 mobile) sem regressão de CLS.

- [ ] **Step 3: Commit final**

```bash
cd /Users/rodri/projeto-nano-guara-ia && git add site && git commit -m "chore(site): IDs de produção e deploy inicial"
```

---

## Self-Review (executada na escrita)

1. **Cobertura da spec:** 9 seções do one-page → Task 6 (porta o mockup aprovado que as contém); captação 3 canais → Tasks 4 (form), 5+6 (chat), 6 (wa.me); prova/demo → Task 5; LGPD → Tasks 4 (consentimento), 6 (privacidade, CSP, sem trackers); performance → Task 8; SEO mínimo do MVP → Task 7; critérios de sucesso (demo útil) → Task 9. v2 (blog, páginas por serviço, cases) fora do escopo, conforme spec.
2. **Placeholders:** os únicos valores "PREENCHER" são segredos/IDs que só existem após provisionar (Task 10) e o número de WhatsApp da agência (dado do usuário). Nenhum "TBD" de lógica.
3. **Consistência de tipos:** `LeadInput` (Task 2) = campos usados na Task 4; `verifyTurnstile(secret, token, ip)` idêntico nas Tasks 3-4; `MsgCliente`/`montarMensagens`/`MODELO`/`SYSTEM_PROMPT` (Task 5) reusados na Task 9; contrato SSE do chat consumido no `app.js` da Task 6 bate com o formato `data: {response}` do Workers AI.
```
