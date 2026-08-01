import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("router", () => {
  it("responde /api/health com ok", async () => {
    const res = await SELF.fetch("https://site.local/api/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("responde 404 para rota de API desconhecida", async () => {
    const res = await SELF.fetch("https://site.local/api/nada");
    expect(res.status).toBe(404);
  });

  it("responde 405 com Allow em GET nas rotas POST", async () => {
    for (const p of ["/api/lead", "/api/chat"]) {
      const res = await SELF.fetch(`https://site.local${p}`);
      expect(res.status).toBe(405);
      expect(res.headers.get("Allow")).toBe("POST");
    }
  });

  it("serve o index.html na raiz", async () => {
    const res = await SELF.fetch("https://site.local/");
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("nanoguará.ia");
  });

  it("bindings de rate limit disponíveis no ambiente de teste", async () => {
    const { env } = await import("cloudflare:test");
    expect(typeof env.LEAD_RL.limit).toBe("function");
    await expect(env.LEAD_RL.limit({ key: "x" })).resolves.toHaveProperty("success");
  });
});
