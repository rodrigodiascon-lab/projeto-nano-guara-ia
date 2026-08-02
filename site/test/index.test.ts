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

  // Antes, o Worker devolvia JSON para toda URL inexistente e o 404.html
  // caprichado nunca era visto por ninguém: quem seguisse um link quebrado
  // encontrava {"ok":false,...} cru numa landing page comercial.
  it("serve a página 404 em HTML para rota inexistente fora de /api", async () => {
    const res = await SELF.fetch("https://site.local/nao-existe");
    expect(res.status).toBe(404);
    expect(res.headers.get("Content-Type")).toContain("text/html");
    const body = await res.text();
    expect(body).toContain("nanoguará.ia");
    expect(body).not.toContain('"ok":false');
  });

  it("mantém JSON no 404 de rota de API, que não é navegada por gente", async () => {
    const res = await SELF.fetch("https://site.local/api/nada");
    expect(res.headers.get("Content-Type")).toContain("application/json");
  });

  it("bindings de rate limit disponíveis no ambiente de teste", async () => {
    const { env } = await import("cloudflare:test");
    expect(typeof env.LEAD_RL.limit).toBe("function");
    await expect(env.LEAD_RL.limit({ key: "x" })).resolves.toHaveProperty("success");
  });
});
