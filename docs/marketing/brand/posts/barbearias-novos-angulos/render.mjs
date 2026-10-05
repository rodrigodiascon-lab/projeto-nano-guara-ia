// Renderiza as peças de index.html em PNG (feed 4:5 e story 9:16).
// Uso: node render.mjs   (usa o Playwright instalado em site/)
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(aqui, "../../../../../site/package.json"));
const { chromium } = require("@playwright/test");

const formatos = { feed: [1080, 1350], story: [1080, 1920] };
const pecas = { falta: "falta-lembrete-v1", conversa: "conversa-prova-v1" };

const browser = await chromium.launch();
for (const [peca, nome] of Object.entries(pecas)) {
  for (const [formato, [w, h]] of Object.entries(formatos)) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const url = pathToFileURL(path.join(aqui, "index.html")).href + `?peca=${peca}&formato=${formato}`;
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    const saida = path.join(aqui, "outputs", `guara-bot-barbearia-${nome}-${formato}-${w}x${h}.png`);
    await page.locator(".peca").screenshot({ path: saida });
    console.log(saida);
    await page.close();
  }
}
await browser.close();
