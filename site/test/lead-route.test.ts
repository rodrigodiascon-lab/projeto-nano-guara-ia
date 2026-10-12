import { SELF, fetchMock } from "cloudflare:test";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

beforeAll(() => { fetchMock.activate(); fetchMock.disableNetConnect(); });
afterEach(() => fetchMock.assertNoPendingInterceptors());

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

function post(body: unknown, headers: Record<string, string> = {}, ip: string = crypto.randomUUID()) {
  return SELF.fetch("https://site.local/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": ip, ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/lead", () => {
  it("cria lead com payload válido", async () => {
    turnstileOk();
    expect((await post(bodyValido)).status).toBe(201);
  });

  it("rejeita sem consentimento", async () => {
    expect((await post({ ...bodyValido, consentimento: false })).status).toBe(400);
  });

  it("rejeita nome vazio", async () => {
    expect((await post({ ...bodyValido, nome: "" })).status).toBe(400);
  });

  it("rejeita token Turnstile reprovado", async () => {
    fetchMock
      .get("https://challenges.cloudflare.com")
      .intercept({ path: "/turnstile/v0/siteverify", method: "POST" })
      .reply(200, JSON.stringify({ success: false }));
    expect((await post(bodyValido)).status).toBe(403);
  });

  it("rejeita origem cruzada", async () => {
    expect((await post(bodyValido, { Origin: "https://site-do-atacante.com" })).status).toBe(403);
  });

  it.each([
    ["+55 92 98888-7777", 201],
    ["(92) 98888-7777", 201],
    ["abc", 400],
    ["9+9+9+8888777", 400],
    ["12345678901234567", 400],
    ["119999888", 400],
  ])("valida whatsapp %s → %i", async (whatsapp, status) => {
    if (status === 201) turnstileOk();
    expect((await post({ ...bodyValido, whatsapp })).status).toBe(status);
  });

  it("trunca dor em 500 chars", async () => {
    turnstileOk();
    const res = await post({ ...bodyValido, dor: "x".repeat(501) });
    expect(res.status).toBe(201);
    const { env } = await import("cloudflare:test");
    const row = await env.DB.prepare("SELECT dor FROM leads ORDER BY id DESC LIMIT 1").first<{ dor: string }>();
    expect(row!.dor.length).toBe(500);
  });

  it("rejeita body acima do limite", async () => {
    const res = await SELF.fetch("https://site.local/api/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": "20000",
        "CF-Connecting-IP": crypto.randomUUID(),
      },
      body: JSON.stringify({ ...bodyValido, dor: "x".repeat(19000) }),
    });
    expect(res.status).toBe(413);
  });

  it("corta corpo grande mesmo sem Content-Length (leitura por stream)", async () => {
    const bytes = new TextEncoder().encode(JSON.stringify({ ...bodyValido, dor: "x".repeat(19000) }));
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });
    const res = await SELF.fetch("https://site.local/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json", "CF-Connecting-IP": crypto.randomUUID() },
      body: stream,
      duplex: "half",
    } as RequestInit & { duplex: "half" });
    expect(res.status).toBe(413);
  });

  it("corta no 6o envio seguido do mesmo IP", async () => {
    const ip = "203.0.113.77";
    for (let i = 0; i < 5; i++) turnstileOk();
    for (let i = 0; i < 5; i++) {
      expect((await post(bodyValido, {}, ip)).status).toBe(201);
    }
    expect((await post(bodyValido, {}, ip)).status).toBe(429);
  });
});

// --- SDR Guarabot (T16): código do formulário de barbearias e aviso ao n8n -----------------------------------------
import { env as envTeste, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { vi } from "vitest";
import { handleLead, whatsappBrasileiro } from "../src/lead-route";
import { gerarCodigoSdr } from "../src/leads";

const URL_SDR = "https://n8n.test/webhook/sdr-guarabot/lead-site";
const TOKEN_SDR = "token-de-teste-vitest";
const PADRAO = /^GB-[0-9A-HJKMNP-TV-Z]{6}$/;
const barbearia = { ...bodyValido, profissao: "Barbearia", origem: "guarabot-barbearias" };
const envSdr = () => ({ ...envTeste, SDR_WEBHOOK_URL: URL_SDR, SDR_WEBHOOK_TOKEN: TOKEN_SDR }) as unknown as Env;

function req(body: unknown) {
  return new Request("https://site.local/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": crypto.randomUUID() },
    body: JSON.stringify(body),
  });
}

/** Interceptor do n8n que guarda cabeçalhos e corpo recebidos. */
function sdrRecebe(responder: (i: ReturnType<ReturnType<typeof fetchMock.get>["intercept"]>) => unknown = (i) => i.reply(200, "ok")) {
  const visto: { headers?: Record<string, string>; body?: string } = {};
  responder(fetchMock.get("https://n8n.test").intercept({
    path: "/webhook/sdr-guarabot/lead-site", method: "POST",
    headers: (h: Record<string, string>) => { visto.headers = h; return true; },
    body: (b: string) => { visto.body = b; return true; },
  }));
  return visto;
}

/** Consome um interceptor que o Worker não deveria ter usado (o afterEach exige zero pendentes). */
async function consomeSobra() {
  expect(fetchMock.pendingInterceptors().length).toBe(1);
  await fetch(URL_SDR, { method: "POST", headers: { "X-SDR-Token": "x" }, body: "{}" });
}

describe("SDR Guarabot (T16)", () => {
  it("barbearias: o email ao Rodrigo traz o código e não o link para o número digitado", async () => {
    turnstileOk();
    const enviados: { text: string }[] = [];
    const env = { ...envTeste, NOTIFY: { send: async (m: { text: string }) => { enviados.push(m); } } } as unknown as Env;
    const ctx = createExecutionContext();
    const res = await handleLead(req(barbearia), env, ctx);
    await waitOnExecutionContext(ctx);
    const r = await res.json<{ codigo: string }>();
    expect(enviados).toHaveLength(1);
    expect(enviados[0].text).toContain(`Código: ${r.codigo}`);
    expect(enviados[0].text).not.toContain("wa.me");
  });

  it("barbearias: 201 com codigo, 1 POST ao n8n com o token e as 7 chaves, codigo gravado no D1", async () => {
    turnstileOk();
    const visto = sdrRecebe();
    const ctx = createExecutionContext();
    const res = await handleLead(req(barbearia), envSdr(), ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(201);
    const r = await res.json<{ ok: boolean; codigo: string }>();
    expect(r.ok).toBe(true);
    expect(r.codigo).toMatch(PADRAO);
    expect(visto.headers?.["x-sdr-token"] ?? visto.headers?.["X-SDR-Token"]).toBe(TOKEN_SDR);
    const corpo = JSON.parse(visto.body!);
    expect(Object.keys(corpo).sort()).toEqual(["codigo", "consentimentoVersao", "nome", "origem", "recebidoEm", "siteId", "whatsapp"]);
    expect(corpo.whatsapp).toBe("92988887777");
    expect(corpo.codigo).toBe(r.codigo);
    expect(typeof corpo.siteId).toBe("number");
    const row = await envTeste.DB.prepare("SELECT codigo_sdr FROM leads WHERE id = ?").bind(corpo.siteId).first<{ codigo_sdr: string }>();
    expect(row!.codigo_sdr).toBe(r.codigo);
  });

  it.each(["form", "guarabot-clinicas", "guarabot-barbearias-teste"])("outra origem (%s) nao recebe codigo nem vai ao SDR (allowlist)", async (origem) => {
    turnstileOk();
    sdrRecebe();
    const ctx = createExecutionContext();
    const res = await handleLead(req({ ...bodyValido, origem }), envSdr(), ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    await consomeSobra();
  });

  it("0 de discagem antes do DDD sai: (092) 98888-7777 vai ao SDR como 92988887777", async () => {
    turnstileOk();
    const visto = sdrRecebe();
    const ctx = createExecutionContext();
    const res = await handleLead(req({ ...barbearia, whatsapp: "(092) 98888-7777" }), envSdr(), ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(201);
    expect(JSON.parse(visto.body!).whatsapp).toBe("92988887777");
  });

  it("falha do n8n nao quebra o cadastro; n8n lento nao atrasa a resposta", async () => {
    turnstileOk();
    sdrRecebe((i) => i.replyWithError(new Error("rede caiu")));
    const ctx1 = createExecutionContext();
    const r1 = await handleLead(req(barbearia), envSdr(), ctx1);
    await waitOnExecutionContext(ctx1);
    expect(r1.status).toBe(201);
    const { codigo } = await r1.json<{ codigo: string }>();
    expect(await envTeste.DB.prepare("SELECT 1 AS x FROM leads WHERE codigo_sdr = ?").bind(codigo).first()).not.toBeNull();

    turnstileOk();
    sdrRecebe((i) => i.reply(200, "ok").delay(3000));
    const ctx2 = createExecutionContext();
    const t0 = Date.now();
    const r2 = await handleLead(req(barbearia), envSdr(), ctx2);
    const ms = Date.now() - t0;
    expect(r2.status).toBe(201);
    expect(ms).toBeLessThan(1000);
    await waitOnExecutionContext(ctx2);
  });

  // --- revisão geral de 12/10 ---------------------------------------------------------------------------
  it.each(["+1 212 555 0123", "(11) 1234-5678", "92 1888-7777", "(92) 98888 77777"])(
    "barbearias: número que o SDR recusa (%s) volta 400 e não grava; controle: mesma entrada em clínicas passa", async (w) => {
      const res = await handleLead(req({ ...barbearia, whatsapp: w }), envSdr(), createExecutionContext());
      expect(res.status).toBe(400);
      expect(await envTeste.DB.prepare("SELECT 1 AS x FROM leads WHERE whatsapp = ?").bind(w.replace(/[\s\-().]/g, "")).first()).toBeNull();
    });

  it("barbearias: números brasileiros válidos passam (fixo, celular, +55, 0 antes do DDD)", () => {
    expect(["(92) 3233-4455", "92 98888-7777", "+55 92 98888-7777", "(092) 98888-7777"].map((w) => whatsappBrasileiro(w.replace(/[\s\-().]/g, "").replace(/^0(?=\d{10,11}$)/, ""))))
      .toEqual(["559232334455", "5592988887777", "5592988887777", "5592988887777"]);
  });

  it("sem config ou com URL sem https: não chama o n8n e loga lead_sdr_sem_config sem dado pessoal", async () => {
    const logs: string[] = [];
    const esp = vi.spyOn(console, "error").mockImplementation((m: string) => { logs.push(String(m)); });
    try {
      for (const env of [envTeste as unknown as Env, { ...envSdr(), SDR_WEBHOOK_URL: "http://n8n.test/webhook/sdr-guarabot/lead-site" } as unknown as Env]) {
        turnstileOk();
        const ctx = createExecutionContext();
        expect((await handleLead(req(barbearia), env, ctx)).status).toBe(201);
        await waitOnExecutionContext(ctx);
      }
    } finally { esp.mockRestore(); }
    const sem = logs.filter((l) => l.includes("lead_sdr_sem_config"));
    expect(sem).toHaveLength(2);
    for (const l of sem) expect(Object.keys(JSON.parse(l)).sort()).toEqual(["evt", "leadId"]);
  });

  it("n8n responde 500 ou demora mais que 5 s: o cadastro fica e o log traz só leadId e status", async () => {
    const logs: string[] = [];
    const esp = vi.spyOn(console, "error").mockImplementation((m: string) => { logs.push(String(m)); });
    try {
      turnstileOk();
      sdrRecebe((i) => i.reply(500, "erro"));
      const c1 = createExecutionContext();
      expect((await handleLead(req(barbearia), envSdr(), c1)).status).toBe(201);
      await waitOnExecutionContext(c1);
      turnstileOk();
      sdrRecebe((i) => i.reply(200, "ok").delay(6000));
      const c2 = createExecutionContext();
      expect((await handleLead(req(barbearia), envSdr(), c2)).status).toBe(201);
      await waitOnExecutionContext(c2);
    } finally { esp.mockRestore(); }
    const falhas = logs.filter((l) => l.includes("lead_sdr_falhou")).map((l) => JSON.parse(l));
    expect(falhas.map((f) => f.status)).toEqual([500, 0]); // 0 = abortado pelo timeout de 5 s
    for (const l of logs) { expect(l).not.toContain(barbearia.nome); expect(l).not.toContain("98888"); }
  }, 15000);

  it("sem os secrets do SDR: 201 com codigo e nenhuma chamada", async () => {
    turnstileOk();
    sdrRecebe();
    const ctx = createExecutionContext();
    const res = await handleLead(req(barbearia), envTeste as unknown as Env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(201);
    expect((await res.json<{ codigo: string }>()).codigo).toMatch(PADRAO);
    await consomeSobra();
  });

  it("colisao de codigo: 3 colisoes e depois codigo livre -> 201; 4 colisoes -> 503", async () => {
    await envTeste.DB.prepare("INSERT INTO leads (nome, profissao, whatsapp, dor, origem, consentimento, consentimento_versao, codigo_sdr) VALUES ('x','x','92900000000','','guarabot-barbearias',1,'v','GB-777777')").run();
    const real = crypto.getRandomValues.bind(crypto);
    let colisoes = 3;
    const espiao = vi.spyOn(crypto, "getRandomValues").mockImplementation(<T extends ArrayBufferView | null>(a: T): T => {
      if (a instanceof Uint8Array && a.length === 6 && colisoes > 0) { colisoes -= 1; a.fill(7); return a; }
      return real(a as never) as T;
    });
    try {
      turnstileOk();
      const ctx = createExecutionContext();
      const ok = await handleLead(req(barbearia), envTeste as unknown as Env, ctx);
      await waitOnExecutionContext(ctx);
      expect(ok.status).toBe(201);
      expect((await ok.json<{ codigo: string }>()).codigo).not.toBe("GB-777777");

      colisoes = 4;
      turnstileOk();
      const ctx2 = createExecutionContext();
      const ruim = await handleLead(req(barbearia), envTeste as unknown as Env, ctx2);
      await waitOnExecutionContext(ctx2);
      expect(ruim.status).toBe(503);
      expect(await ruim.json()).toEqual({ ok: false, erro: "Não consegui salvar agora. Tente pelo WhatsApp." });
    } finally {
      espiao.mockRestore();
    }
  });

  it("gerarCodigoSdr: 200 codigos casam o padrao e sao distintos", () => {
    const vistos = new Set(Array.from({ length: 200 }, () => gerarCodigoSdr()));
    expect(vistos.size).toBe(200);
    for (const c of vistos) expect(c).toMatch(PADRAO);
  });
});
