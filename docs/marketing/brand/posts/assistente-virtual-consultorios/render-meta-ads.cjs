const { chromium } = require('/Users/rodri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp = require('/Users/rodri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs/promises');

const root = __dirname;
const source = path.join(root, 'meta-ads-v2.html');
const outputDir = path.join(root, 'outputs', 'complete');
const chromePath = '/Users/rodri/.cache/hyperframes/chrome/chrome-headless-shell/mac_arm-152.0.7928.2/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const angles = ['controle', 'faltas', 'resposta', 'bot', 'recepcao'];
const formats = {
  feed: { width: 1080, height: 1350, query: '' },
  square: { width: 1080, height: 1080, query: 'format=square' },
  story: { width: 1080, height: 1920, query: 'format=story' }
};

async function renderAll() {
  await fs.mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--allow-file-access-from-files', '--hide-scrollbars', '--disable-background-networking']
  });

  try {
    for (const angle of angles) {
      for (const [format, spec] of Object.entries(formats)) {
        const page = await browser.newPage({ viewport: { width: spec.width, height: spec.height } });
        const query = [spec.query, `angle=${angle}`].filter(Boolean).join('&');
        const url = `${pathToFileURL(source).href}?${query}`;
        await page.goto(url, { waitUntil: 'load' });
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all([...document.images].map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          })));
        });
        const file = path.join(outputDir, `meta-ads-v3-${angle}-${format}.png`);
        await page.locator('#creative').screenshot({ path: file });
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  await renderContactSheet();
}

async function renderContactSheet() {
  const cellWidth = 280;
  const cellHeight = 500;
  const imageWidth = 238;
  const imageHeight = 420;
  const sheetWidth = cellWidth * angles.length;
  const sheetHeight = cellHeight * Object.keys(formats).length;
  const composites = [];

  for (const [row, format] of Object.keys(formats).entries()) {
    for (const [column, angle] of angles.entries()) {
      const input = path.join(outputDir, `meta-ads-v3-${angle}-${format}.png`);
      const preview = await sharp(input)
        .resize({ width: imageWidth, height: imageHeight, fit: 'contain', background: '#ece8df' })
        .png()
        .toBuffer();
      const label = Buffer.from(`
        <svg width="${cellWidth}" height="54" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#17231b"/>
          <text x="18" y="22" fill="#fffefa" font-family="Arial" font-size="15" font-weight="700">${angle.toUpperCase()}</text>
          <text x="18" y="43" fill="#a8d5a9" font-family="Arial" font-size="13">${format.toUpperCase()}</text>
        </svg>
      `);
      composites.push({ input: label, left: column * cellWidth, top: row * cellHeight });
      composites.push({ input: preview, left: column * cellWidth + 21, top: row * cellHeight + 65 });
    }
  }

  await sharp({
    create: { width: sheetWidth, height: sheetHeight, channels: 4, background: '#ece8df' }
  }).composite(composites).png().toFile(path.join(outputDir, 'meta-ads-v3-contact-sheet.png'));
}

renderAll().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
