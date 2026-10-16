import { test, expect, type Page, type Request } from "@playwright/test";

/**
 * Consentimento do pixel da Meta, no navegador.
 *
 * O consentimento.js é servido com um ID falso trocado na hora, no lugar do ID
 * real do repositório (ou vazio, para o caso "sem pixel configurado"). O fbevents.js da Meta é
 * interceptado e respondido com um stub que só anota as chamadas: nenhum teste
 * fala com a Meta de verdade.
 */
const ID_FALSO = "000000000000000";

async function prepara(page: Page, { comId = true } = {}) {
  const meta: string[] = [];
  page.on("request", (r: Request) => {
    if (/facebook\.(net|com)/.test(r.url())) meta.push(r.url());
  });
  // Troca o ID que estiver no arquivo (o real ou vazio) pelo falso, ou por vazio
  // quando o teste quer o estado "sem pixel configurado".
  await page.route("**/consentimento.js", async (route) => {
    const res = await route.fetch();
    const corpo = (await res.text()).replace(/const PIXEL_ID = '\d*';/, `const PIXEL_ID = '${comId ? ID_FALSO : ""}';`);
    await route.fulfill({ response: res, body: corpo });
  });
  // Stub do fbevents: pega a fila do fbq e passa a registrar tudo em window.__fbq.
  await page.route("https://connect.facebook.net/**", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `window.__fbq = Array.from(fbq.queue, (a) => Array.from(a));
             fbq.callMethod = function () { window.__fbq.push(Array.from(arguments)); };`,
    }));
  return meta;
}

const banner = (page: Page) => page.getByRole("region", { name: "Cookies de marketing" });

test("sem PIXEL_ID configurado, nada aparece e nada carrega", async ({ page }) => {
  const meta = await prepara(page, { comId: false });
  await page.goto("/index.html");
  await page.waitForLoadState("networkidle");
  await expect(banner(page)).toHaveCount(0);
  await expect(page.locator("[data-preferencias-cookies]")).toBeHidden();
  expect(meta).toEqual([]);
});

test("antes de escolher, o banner aparece e a Meta não recebe nada", async ({ page }) => {
  const meta = await prepara(page);
  await page.goto("/index.html");
  await expect(banner(page)).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(meta).toEqual([]);
  expect(await page.evaluate(() => typeof (window as any).fbq)).toBe("undefined");
});

test("recusar não carrega nada, nem na página seguinte", async ({ page }) => {
  const meta = await prepara(page);
  await page.goto("/index.html");
  await banner(page).getByRole("button", { name: "Recusar" }).click();
  await expect(banner(page)).toHaveCount(0);
  await page.goto("/portfolio.html");
  await page.waitForLoadState("networkidle");
  await expect(banner(page)).toHaveCount(0);
  expect(meta).toEqual([]);
});

test("aceitar carrega o pixel e dispara PageView sem advanced matching", async ({ page }) => {
  const meta = await prepara(page);
  await page.goto("/index.html");
  await banner(page).getByRole("button", { name: "Aceitar" }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__fbq)).toBeTruthy();
  const chamadas = await page.evaluate(() => (window as any).__fbq);
  expect(chamadas).toContainEqual(["set", "autoConfig", false, ID_FALSO]);
  expect(chamadas).toContainEqual(["init", ID_FALSO]); // só o ID: sem dados do titular
  expect(chamadas).toContainEqual(["track", "PageView"]);
  expect(meta.some((u) => u.includes("connect.facebook.net"))).toBe(true);

  // Próxima página: já aceito, carrega sem perguntar de novo.
  await page.goto("/privacidade.html");
  await expect(banner(page)).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => (window as any).__fbq)).toContainEqual(["track", "PageView"]);
});

test("Lead só sai com o pixel aceito e sem parâmetros", async ({ page }) => {
  await prepara(page);
  await page.goto("/index.html");
  await banner(page).getByRole("button", { name: "Aceitar" }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__fbq)).toBeTruthy();
  await page.evaluate(() => document.dispatchEvent(new CustomEvent("ng:lead")));
  const chamadas = await page.evaluate(() => (window as any).__fbq);
  expect(chamadas).toContainEqual(["track", "Lead"]);
});

test("Lead não sai quando o visitante recusou", async ({ page }) => {
  const meta = await prepara(page);
  await page.goto("/index.html");
  await banner(page).getByRole("button", { name: "Recusar" }).click();
  await page.evaluate(() => document.dispatchEvent(new CustomEvent("ng:lead")));
  await page.waitForLoadState("networkidle");
  expect(meta).toEqual([]);
});

test("Preferências de cookies no rodapé reabre o banner e revogar apaga o _fbp", async ({ page, context }) => {
  await prepara(page);
  await page.goto("/index.html");
  await banner(page).getByRole("button", { name: "Aceitar" }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__fbq)).toBeTruthy();
  await page.evaluate(() => { document.cookie = "_fbp=fb.1.123.456; path=/"; });

  const preferencias = page.getByRole("button", { name: "Preferências de cookies" });
  await expect(preferencias).toBeVisible();
  await preferencias.click();
  const recusar = banner(page).getByRole("button", { name: "Recusar" });
  await expect(recusar).toBeFocused(); // pedido pelo visitante: o foco vai para o banner
  await recusar.click();

  const chamadas = await page.evaluate(() => (window as any).__fbq);
  expect(chamadas).toContainEqual(["consent", "revoke"]);
  expect((await context.cookies()).map((c) => c.name)).not.toContain("_fbp");
});

test("o banner tem Aceitar e Recusar com o mesmo peso e não vaza a 320px", async ({ page }) => {
  await prepara(page);
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/index.html");
  const b = banner(page);
  await expect(b).toBeVisible();
  const aceitar = b.getByRole("button", { name: "Aceitar" });
  const recusar = b.getByRole("button", { name: "Recusar" });
  expect(await aceitar.getAttribute("class")).toBe(await recusar.getAttribute("class"));
  const caixa = await b.boundingBox();
  expect(caixa!.x).toBeGreaterThanOrEqual(0);
  expect(caixa!.x + caixa!.width).toBeLessThanOrEqual(320);
  const rolagem = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(rolagem).toBe(0);
});

test("clique no WhatsApp da landing de barbearias vira Contact só com o pixel aceito", async ({ page }) => {
  await prepara(page);
  await page.route("https://wa.me/**", (route) => route.fulfill({ body: "ok" }));
  await page.goto("/guarabot/barbearias.html");
  await banner(page).getByRole("button", { name: "Aceitar" }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__fbq)).toBeTruthy();
  await page.evaluate(() => {
    const a = document.querySelector('a[href^="https://wa.me/"]') as HTMLAnchorElement;
    a.addEventListener("click", (e) => e.preventDefault());
    a.click();
  });
  const chamadas = await page.evaluate(() => (window as any).__fbq);
  expect(chamadas).toContainEqual(["track", "Contact"]);
});

// Landings de saúde: mesmo formulário e mesma regra de Contact, origem própria.
for (const [pagina, nome, area] of [
  ["clinicas", "clínicas", "Odontologia"],
  ["oftalmologia", "oftalmologia", "Clínica de oftalmologia"],
]) {
  test(`landing de ${nome}: WhatsApp vira Contact e o rodapé não`, async ({ page }) => {
    await prepara(page);
    await page.route("https://wa.me/**", (route) => route.fulfill({ body: "ok" }));
    await page.goto(`/guarabot/${pagina}.html`);
    await banner(page).getByRole("button", { name: "Aceitar" }).click();
    await expect.poll(() => page.evaluate(() => (window as any).__fbq)).toBeTruthy();
    const contatos = () => page.evaluate(() =>
      (window as any).__fbq.filter((c: unknown[]) => c[0] === "track" && c[1] === "Contact").length);
    const clica = (sel: string) => page.evaluate((s) => {
      const a = document.querySelector(s) as HTMLAnchorElement;
      a.addEventListener("click", (e) => e.preventDefault());
      a.click();
    }, sel);

    await clica('footer a[href^="https://wa.me/"]');
    expect(await contatos()).toBe(0);
    await clica('.gb-hero a[href^="https://wa.me/"]');
    expect(await contatos()).toBe(1);
  });

  test(`landing de ${nome}: formulário aceito pelo /api/lead vira Lead, com origem própria`, async ({ page }) => {
    await prepara(page);
    await page.route("https://challenges.cloudflare.com/**", (route) => route.abort());
    let corpo: Record<string, unknown> = {};
    await page.route("**/api/lead", async (route) => {
      corpo = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: "application/json", body: '{"ok":true}' });
    });
    await page.goto(`/guarabot/${pagina}.html`);
    await banner(page).getByRole("button", { name: "Aceitar" }).click();
    await expect.poll(() => page.evaluate(() => (window as any).__fbq)).toBeTruthy();

    const form = page.locator("#gbForm");
    await form.getByLabel("Nome").fill("TESTE 1");
    await form.getByLabel("Área de atuação").selectOption(area);
    await form.getByLabel("WhatsApp").fill("92988887777");
    await form.locator("#gbConsent").check();
    await form.getByRole("button", { name: /Quero que me chamem/ }).first().click();

    await expect(page.locator("#gbMsg")).toHaveClass(/sucesso/);
    expect(corpo.origem).toBe(`guarabot-${pagina}`);
    const chamadas = await page.evaluate(() => (window as any).__fbq);
    expect(chamadas).toContainEqual(["track", "Lead"]);
  });
}

test("o aviso tem respiro lateral também na landing de barbearias", async ({ page }) => {
  await prepara(page);
  for (const url of ["/index.html", "/guarabot/barbearias.html"]) {
    await page.goto(url);
    const pad = await banner(page).evaluate((el) => {
      const c = getComputedStyle(el);
      return [c.paddingLeft, c.paddingTop].map(parseFloat);
    });
    expect(pad[0], url).toBeGreaterThanOrEqual(14);
    expect(pad[1], url).toBeLessThanOrEqual(24);
  }
});

test("no celular o aviso é compacto e não esconde as opções do quiz", async ({ page }) => {
  await prepara(page);
  await page.setViewportSize({ width: 375, height: 664 });
  await page.goto("/iaparaconsultorios.html");
  const b = banner(page);
  await expect(b).toBeVisible();
  const caixa = (await b.boundingBox())!;
  // Antes da mudança de 2026-10-11 o aviso tinha 200px e deixava só "Medicina" à vista.
  expect(caixa.height).toBeLessThanOrEqual(130);
  const visiveis = await page.evaluate((topo) =>
    [...document.querySelectorAll(".etapa:not([hidden]) label")].filter((l) => l.getBoundingClientRect().bottom <= topo).length,
    caixa.y);
  expect(visiveis).toBeGreaterThanOrEqual(3);
  // O texto curto mantém o essencial do consentimento e o link da política.
  await expect(b).toContainText("pixel da Meta");
  await expect(b).toContainText("fora do Brasil");
  await expect(b.getByRole("link", { name: "Saiba mais" })).toBeVisible();
});
