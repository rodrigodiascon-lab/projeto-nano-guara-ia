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

  it("corta no 6o envio seguido do mesmo IP", async () => {
    const ip = "203.0.113.77";
    for (let i = 0; i < 5; i++) turnstileOk();
    for (let i = 0; i < 5; i++) {
      expect((await post(bodyValido, {}, ip)).status).toBe(201);
    }
    expect((await post(bodyValido, {}, ip)).status).toBe(429);
  });
});
