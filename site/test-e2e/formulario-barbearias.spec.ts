import { test, expect, type Page } from "@playwright/test";

/**
 * Formulário de /guarabot/barbearias (SDR Guarabot, T16; R9.4 refinado no T19): com o
 * código devolvido pelo /api/lead o formulário some e fica UM botão "Abrir o WhatsApp e
 * enviar"; o código vai escondido na mensagem pronta e não aparece na tela. Quem inicia
 * a conversa é a pessoa. O /api/lead é simulado (o Worker não roda
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
  form.getByRole("button", { name: /Enviar e ir para o WhatsApp/ }).first().click();

const href = (codigo: string) =>
  "https://wa.me/5592981486875?text=" + encodeURIComponent(`Oi! Acabei de preencher o formulário do site. Meu código é ${codigo}.`);

test("com código: o formulário some, fica um único botão e o código não aparece na tela", async ({ page }) => {
  const form = await prepara(page, ['{"ok":true,"codigo":"GB-7K3QXM"}']);
  await enviar(form);
  await expect(form).toBeHidden();
  await expect(page.locator("#gbPasso")).toBeVisible();
  await expect(page.locator("#gbPasso")).toHaveAttribute("role", "status");
  await expect(page.locator("#gbPasso p")).toHaveText("Falta só um passo: toque aqui e envie a mensagem que já vai pronta.");
  await expect(page.locator("#gbWhats")).toHaveCount(1);
  await expect(page.locator("#gbWhats")).toHaveAttribute("href",
    "https://wa.me/5592981486875?text=Oi!%20Acabei%20de%20preencher%20o%20formul%C3%A1rio%20do%20site.%20Meu%20c%C3%B3digo%20%C3%A9%20GB-7K3QXM.");
  await expect(page.locator("#gbWhats")).toHaveAttribute("target", "_blank");
  await expect(page.locator("#gbWhats")).toHaveAttribute("rel", "noopener");
  await expect(page.locator("#gbWhats")).toHaveText("Abrir o WhatsApp e enviar");
  await expect(page.locator("#gbWhats")).toHaveAttribute("aria-label", "Abrir o WhatsApp e enviar (abre em nova aba)");
  await expect(page.locator("#gbWhats")).toBeFocused();
  await expect(page.getByText("GB-7K3QXM")).toHaveCount(0); // o código não aparece na tela (R9.4)
  await expect(page.locator("#gbPasso")).not.toHaveAttribute("style", /.*/); // CSP: nada de style inline
  await expect(page.locator("#gbWhats")).not.toHaveAttribute("style", /.*/);
  expect(origens.at(-1)).toBe("guarabot-barbearias"); // a origem vem do HTML, não do padrão do JS
  expect(href("GB-7K3QXM")).toBe(await page.locator("#gbWhats").getAttribute("href"));
});

test("controle: 201 sem código não cria botão e mantém a mensagem antiga", async ({ page }) => {
  const form = await prepara(page, ['{"ok":true}']);
  await enviar(form);
  await expect(page.locator("#gbMsg")).toHaveClass(/sucesso/);
  await expect(page.locator("#gbWhats")).toHaveCount(0);
  await expect(page.locator("#gbPasso")).toHaveCount(0);
  await expect(form).toBeVisible();
});
