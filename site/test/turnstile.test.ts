import { fetchMock } from "cloudflare:test";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { verifyTurnstile } from "../src/turnstile";

beforeAll(() => { fetchMock.activate(); fetchMock.disableNetConnect(); });
afterEach(() => fetchMock.assertNoPendingInterceptors());

function siteverify(body: unknown, status = 200) {
  fetchMock
    .get("https://challenges.cloudflare.com")
    .intercept({ path: "/turnstile/v0/siteverify", method: "POST" })
    .reply(status, JSON.stringify(body));
}

describe("verifyTurnstile", () => {
  it("aprova quando success e hostname batem", async () => {
    siteverify({ success: true, hostname: "nanoguara.ia.br" });
    expect(await verifyTurnstile("s", "tok", "1.2.3.4", "nanoguara.ia.br")).toBe(true);
  });

  it("reprova quando success é false", async () => {
    siteverify({ success: false, "error-codes": ["invalid-input-response"] });
    expect(await verifyTurnstile("s", "tok", null, "nanoguara.ia.br")).toBe(false);
  });

  it("reprova token válido emitido para outro hostname", async () => {
    siteverify({ success: true, hostname: "site-do-atacante.com" });
    expect(await verifyTurnstile("s", "tok", null, "nanoguara.ia.br")).toBe(false);
  });

  it("reprova HTTP não-ok sem tentar parsear", async () => {
    siteverify({}, 500);
    expect(await verifyTurnstile("s", "tok", null, "nanoguara.ia.br")).toBe(false);
  });

  it("reprova token vazio ou gigante sem chamar a rede", async () => {
    expect(await verifyTurnstile("s", "", null, "x")).toBe(false);
    expect(await verifyTurnstile("s", "a".repeat(2049), null, "x")).toBe(false);
  });
});
