import { describe, expect, it } from "vitest";
// O runtime workerd do vitest-pool-workers não expõe o filesystem real (o
// node:fs ali é um shim isolado do bundle), então o conteúdo é lido em tempo
// de build via import bruto do Vite, não por readFileSync em runtime.
import h from "../public/_headers?raw";

describe("_headers", () => {
  it.each([
    "script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
    "frame-src https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "X-Content-Type-Options: nosniff",
    "Cache-Control: public, max-age=31536000, immutable",
  ])("contém %s", (t) => expect(h).toContain(t));

  it("não usa unsafe-inline", () => expect(h).not.toContain("unsafe-inline"));
});
