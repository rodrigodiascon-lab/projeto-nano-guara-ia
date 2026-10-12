import { test, expect, type Page } from "@playwright/test";

/**
 * Formulário de /guarabot/barbearias (SDR Guarabot, T16): com o código devolvido
 * pelo /api/lead aparece UM botão "Chamar no WhatsApp" com o código na mensagem;
 * quem inicia a conversa é a pessoa. O /api/lead é simulado (o Worker não roda
 * aqui), o Turnstile é bloqueado e o consentimento.js vira vazio para o aviso de
 * cookies não ficar por cima do botão.
 */
const origens: string[] = [];
async function prepara(page: Page, respostas: string[]) {
  await page.route("https://challenges.cloudflare.com/**", (route) => route.abort());
  await page.route("**/consentimento.js", (route) => route.fulfill({ contentType: "application/javascript", body: "" }));
  let i = 0;
  await page.route("**/api/lead", (route) => {
    origens.push(route.request().postDataJSON().origem);
    return route.fulfill({ status: 201, contentType: "application/json", body: respostas[Math.min(i++, respostas.length - 1)] });
  });
  await page.goto("/guarabot/barbearias.html");
  const form = page.locator("#gbForm");
  await form.getByLabel("Nome").fill("TESTE 1");
  await form.getByLabel("Segmento do negócio").selectOption("Barbearia");
  await form.getByLabel("WhatsApp", { exact: true }).fill("92988887777");
  await form.locator("#gbConsent").check();
  return form;
}

const enviar = (form: ReturnType<Page["locator"]>) =>
  form.getByRole("button", { name: /Enviar e pegar meu código/ }).first().click();

const href = (codigo: string) =>
  "https://wa.me/5592981486875?text=" + encodeURIComponent(`Oi! Acabei de preencher o formulário do site. Meu código é ${codigo}.`);

test("com código: um único botão com o código na mensagem; reenviar troca o código sem duplicar", async ({ page }) => {
  const form = await prepara(page, ['{"ok":true,"codigo":"GB-7K3QXM"}', '{"ok":true,"codigo":"GB-AAAAAA"}']);
  await enviar(form);
  await expect(page.locator("#gbMsg")).toHaveClass(/sucesso/);
  await expect(page.locator("#gbWhats")).toHaveCount(1);
  await expect(page.locator("#gbWhats")).toHaveAttribute("href",
    "https://wa.me/5592981486875?text=Oi!%20Acabei%20de%20preencher%20o%20formul%C3%A1rio%20do%20site.%20Meu%20c%C3%B3digo%20%C3%A9%20GB-7K3QXM.");
  await expect(page.locator("#gbWhats")).toHaveAttribute("target", "_blank");
  await expect(page.locator("#gbWhats")).toHaveAttribute("rel", "noopener");
  await expect(page.locator("#gbWhats")).toHaveText("Chamar no WhatsApp");
  await expect(page.locator("#gbWhats")).toHaveAttribute("aria-label", "Chamar no WhatsApp (abre em nova aba)");
  await expect(page.locator("#gbMsg")).toHaveText("Recebido! Toque no botão abaixo para falar com a gente no WhatsApp.");
  await expect(page.locator("#gbWhats")).toBeFocused();

  await form.getByLabel("Nome").fill("TESTE 1");
  await form.getByLabel("Segmento do negócio").selectOption("Barbearia");
  await form.getByLabel("WhatsApp", { exact: true }).fill("92988887777");
  await form.locator("#gbConsent").check();
  await enviar(form);
  await expect(page.locator("#gbWhats")).toHaveCount(1);
  await expect(page.locator("#gbWhats")).toHaveAttribute("href", href("GB-AAAAAA"));
  await expect(page.locator("#gbWhats")).not.toHaveAttribute("style", /.*/); // CSP: nada de style inline
  expect(origens.at(-1)).toBe("guarabot-barbearias"); // a origem vem do HTML, não do padrão do JS
});

test("controle: 201 sem código não cria botão e mantém a mensagem antiga", async ({ page }) => {
  const form = await prepara(page, ['{"ok":true}']);
  await enviar(form);
  await expect(page.locator("#gbMsg")).toHaveClass(/sucesso/);
  await expect(page.locator("#gbWhats")).toHaveCount(0);
});
