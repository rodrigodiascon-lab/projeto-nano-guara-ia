import { test, expect } from "@playwright/test";

/**
 * Landing de clínicas recebe os anúncios de consultórios (2026-10-15). A
 * mensagem pronta do WhatsApp leva o anúncio de origem, do utm_content, para que
 * cada conversa diga de onde veio sem depender de cookie.
 */

const textoDo = async (page, seletor: string) => {
  const href = await page.locator(seletor).first().getAttribute("href");
  return new URL(href!).searchParams.get("text");
};

test("utm_content válido entra no fim da mensagem, sem '+' no lugar dos espaços", async ({ page }) => {
  await page.goto("/guarabot/clinicas.html?utm_content=OBJ01&utm_campaign=guarabot_consultorios");
  const hero = page.locator('.gb-hero a[href^="https://wa.me/"]').first();
  const href = (await hero.getAttribute("href"))!;
  expect(href).not.toContain("+");
  expect(await textoDo(page, '.gb-hero a[href^="https://wa.me/"]')).toBe(
    "Oi, tenho um consultório e quero saber do guara.bot. (ref obj01)",
  );
  // Rodapé: link genérico, sem texto, fica intacto.
  await expect(page.locator('footer a[href^="https://wa.me/"]').first()).toHaveAttribute("href", "https://wa.me/5592981486875");
});

test("sem utm, ou com utm fora do padrão, a mensagem não muda", async ({ page }) => {
  for (const q of ["", "?utm_content=%3Cscript%3E", "?utm_content=" + "a".repeat(31)]) {
    await page.goto("/guarabot/clinicas.html" + q);
    expect(await textoDo(page, '.gb-hero a[href^="https://wa.me/"]')).toBe(
      "Oi, tenho um consultório e quero saber do guara.bot.",
    );
  }
});
