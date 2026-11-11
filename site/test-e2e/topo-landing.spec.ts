import { test, expect } from "@playwright/test";

/**
 * Landing de clínicas abre no topo (2026-10-16): pelo anúncio, no celular, ela
 * aparecia no meio. Simula o navegador devolvendo a rolagem de uma visita anterior.
 */
test.use({ viewport: { width: 390, height: 700 }, isMobile: true, hasTouch: true });

test("volta ao topo quando o navegador restaura a rolagem antiga", async ({ page }) => {
  await page.goto("/guarabot/clinicas.html?utm_content=ps01");
  await page.evaluate(() => window.scrollTo(0, 4000));
  await page.reload();
  await page.waitForLoadState("load");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("com âncora no endereço, respeita a âncora", async ({ page }) => {
  await page.goto("/guarabot/clinicas.html#perguntas");
  await page.waitForLoadState("load");
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
});
