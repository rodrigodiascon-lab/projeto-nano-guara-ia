import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

function post(body: unknown, headers: Record<string, string> = {}) {
  return SELF.fetch("https://site.local/api/quiz-etapa", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

async function total(etapa: string, utm: string): Promise<number> {
  const r = await env.DB.prepare("SELECT SUM(total) AS t FROM quiz_etapas WHERE etapa = ?1 AND utm_content = ?2")
    .bind(etapa, utm).first<{ t: number | null }>();
  return r?.t ?? 0;
}

describe("POST /api/quiz-etapa", () => {
  it("soma 1 no contador da etapa e do anúncio", async () => {
    const antes = await total("3", "obj01");
    expect((await post({ etapa: "3", utm: "obj01" })).status).toBe(204);
    expect((await post({ etapa: "3", utm: "obj01" })).status).toBe(204);
    expect(await total("3", "obj01")).toBe(antes + 2);
  });

  it("aceita envio e lead_ok", async () => {
    expect((await post({ etapa: "envio", utm: "ps02" })).status).toBe(204);
    expect((await post({ etapa: "lead_ok", utm: "ps02" })).status).toBe(204);
  });

  it("recusa etapa fora da lista", async () => {
    expect((await post({ etapa: "drop table", utm: "x" })).status).toBe(400);
    expect((await post({ etapa: "7" })).status).toBe(400);
  });

  it("guarda utm fora do padrão como vazio", async () => {
    const antes = await total("2", "");
    expect((await post({ etapa: "2", utm: "<script>" })).status).toBe(204);
    expect(await total("2", "")).toBe(antes + 1);
  });

  it("recusa outra origem", async () => {
    expect((await post({ etapa: "1" }, { Origin: "https://evil.example" })).status).toBe(403);
  });

  it("não guarda nada além de dia, etapa, anúncio e total", async () => {
    const cols = await env.DB.prepare("PRAGMA table_info(quiz_etapas)").all<{ name: string }>();
    expect(cols.results.map((c) => c.name).sort()).toEqual(["dia", "etapa", "total", "utm_content"]);
  });

  it("GET não é permitido", async () => {
    expect((await SELF.fetch("https://site.local/api/quiz-etapa")).status).toBe(405);
  });
});

describe("o quiz registra as etapas sem dado pessoal", () => {
  it("app-iaparaconsultorios.js chama /api/quiz-etapa só com etapa e utm", async () => {
    const app = await (await SELF.fetch("https://site.local/app-iaparaconsultorios.js")).text();
    expect(app).toContain("/api/quiz-etapa");
    expect(app).toContain("JSON.stringify({ etapa, utm: utmAnuncio })");
  });
});
