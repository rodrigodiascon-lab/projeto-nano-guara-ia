import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";
// O runtime workerd do vitest-pool-workers não expõe o filesystem real (o
// node:fs ali é um shim isolado do bundle), então o conteúdo é lido em tempo
// de build via import bruto do Vite, não por readFileSync em runtime.
import h from "../public/_headers?raw";
import indexHtml from "../public/index.html?raw";
// noscript.css não pode ser importado com ?raw/?inline: o plugin de CSS do
// Vite trata imports de .css como no-op durante SSR (é o mesmo motivo pelo
// qual "../public/styles.css?raw" também vem vazio neste runtime), então o
// conteúdo real é obtido servindo o arquivo de verdade via SELF.fetch, do
// jeito que "serve o index.html na raiz" já faz em index.test.ts.

describe("_headers", () => {
  it.each([
    "script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
    "frame-src https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "style-src 'self'",
    "X-Content-Type-Options: nosniff",
    "Cache-Control: public, max-age=31536000, immutable",
  ])("contém %s", (t) => expect(h).toContain(t));

  it("não usa unsafe-inline", () => expect(h).not.toContain("unsafe-inline"));
});

describe("fallback sem JavaScript (.reveal)", () => {
  // Trava a decisão: sem JS, os blocos .reveal não podem sumir da tela (o
  // site vende GEO, e boa parte dos rastreadores de IA não roda JavaScript).
  // O fallback tem que ser um arquivo próprio referenciado por <noscript>,
  // nunca um style inline, porque a CSP acima usa style-src 'self' sem
  // unsafe-inline. Este teste falha se alguém remover o fallback ou afrouxar
  // a política para liberar estilo inline.
  it("index.html referencia noscript.css dentro de <noscript>", () => {
    expect(indexHtml).toContain('<noscript><link rel="stylesheet" href="/noscript.css"></noscript>');
  });

  it("index.html não usa <style> inline dentro de <noscript>", () => {
    expect(indexHtml).not.toMatch(/<noscript>\s*<style/);
  });

  it("noscript.css é servido e neutraliza a animação de .reveal", async () => {
    const res = await SELF.fetch("https://site.local/noscript.css");
    expect(res.status).toBe(200);
    const css = await res.text();
    expect(css).toContain(".reveal{opacity:1;transform:none;transition:none}");
  });

  it("a CSP continua sem unsafe-inline (não afrouxada para viabilizar o fallback)", () => {
    expect(h).toContain("style-src 'self'");
    expect(h).not.toContain("unsafe-inline");
  });
});
