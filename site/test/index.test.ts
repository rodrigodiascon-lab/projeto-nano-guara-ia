import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import assetsIgnore from "../public/.assetsignore?raw";
import vitestConfig from "../vitest.config.ts?raw";

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

  it("serve a página de portfólio", async () => {
    const res = await SELF.fetch("https://site.local/portfolio");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("GP Representação Comercial");
    expect(body).toContain("RD Representações");
    expect(body).toContain("Carla Dias Dermatologia");
  });

  /**
   * O wrangler publica o diretório public inteiro, lendo do DISCO — o
   * .gitignore não tem voz nenhuma nisso. O Vite, ao rodar os testes, criava
   * seu cache de dependências em public/node_modules/.vite (os testes importam
   * os HTML de public com ?raw), e esse cache era publicado junto: medido em
   * 200, com content-type application/json, sob /node_modules/.vite/...
   *
   * A correção tem duas camadas, porque cada uma sozinha é frágil: o cacheDir
   * no vitest.config.ts faz o cache nascer fora de public, e o .assetsignore
   * barra qualquer coisa que ainda apareça lá. Apagar a pasta não conta como
   * correção — ela volta no `npm test` seguinte.
   */
  it("nenhum cache de ferramenta é servido", async () => {
    for (const p of [
      "/node_modules/.vite/vitest/x/deps_ssr/package.json",
      "/node_modules/",
      "/.claude-flow/neural/patterns.json",
      "/.claude-flow/policy/state.json",
    ]) {
      const res = await SELF.fetch(`https://site.local${p}`);
      expect(res.status, `${p} respondeu ${res.status}`).toBe(404);
    }
  });

  // Dois casos já apareceram, de ferramentas diferentes: o Vite e o
  // claude-flow. Ambos escolheram sozinhos escrever dentro de public, e ambos
  // eram invisíveis no `git status`. É lista de exclusão, não de bons modos:
  // ferramenta nova no projeto exige conferir onde ela escreve.
  it("o .assetsignore barra os caches de ferramenta conhecidos", () => {
    const linhas = assetsIgnore.split("\n").map((l) => l.trim());
    for (const cache of ["node_modules", ".claude-flow"]) {
      expect(linhas, `${cache} saiu do .assetsignore`).toContain(cache);
    }
  });

  it("o cache do Vite é apontado para fora de public", () => {
    const dir = vitestConfig.match(/cacheDir:\s*path\.join\(__dirname,\s*"([^"]+)"/)?.[1];
    expect(dir, "cacheDir sumiu do vitest.config.ts").toBeTruthy();
    expect(dir, "o cache do Vite voltou a cair dentro de public").not.toMatch(/^public\b/);
  });

  it("bindings de rate limit disponíveis no ambiente de teste", async () => {
    const { env } = await import("cloudflare:test");
    expect(typeof env.LEAD_RL.limit).toBe("function");
    await expect(env.LEAD_RL.limit({ key: "x" })).resolves.toHaveProperty("success");
  });
});
