const { chromium } = require('/Users/rodri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp = require('/Users/rodri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs/promises');

const root = __dirname;
const source = path.join(root, 'meta-ads-assistente-virtual.html');
const outputDir = path.join(root, 'outputs', 'campanha-assistente-virtual');
const chromePath = '/Users/rodri/.cache/hyperframes/chrome/chrome-headless-shell/mac_arm-152.0.7928.2/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const formats = {
  'feed-4x5': { width: 1080, height: 1350, query: '' },
  'feed-1x1': { width: 1080, height: 1080, query: 'format=square' },
  'story-reels-9x16': { width: 1080, height: 1920, query: 'format=story' }
};

async function render() {
  await fs.mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--allow-file-access-from-files', '--hide-scrollbars', '--disable-background-networking']
  });

  try {
    for (const [name, spec] of Object.entries(formats)) {
      const page = await browser.newPage({ viewport: { width: spec.width, height: spec.height } });
      const suffix = spec.query ? `?${spec.query}` : '';
      await page.goto(`${pathToFileURL(source).href}${suffix}`, { waitUntil: 'load' });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        })));
      });
      await page.locator('#creative').screenshot({
        path: path.join(outputDir, `assistente-virtual-${name}.png`)
      });
      await page.close();
    }
  } finally {
    await browser.close();
  }

  const cells = [];
  const names = Object.keys(formats);
  for (const [index, name] of names.entries()) {
    const preview = await sharp(path.join(outputDir, `assistente-virtual-${name}.png`))
      .resize({ width: 300, height: 480, fit: 'contain', background: '#ece8df' })
      .png()
      .toBuffer();
    const label = Buffer.from(`
      <svg width="340" height="62" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#17231b"/>
        <text x="20" y="39" fill="#fffefa" font-family="Arial" font-size="20" font-weight="700">${name.toUpperCase()}</text>
      </svg>
    `);
    cells.push({ input: label, left: index * 340, top: 0 });
    cells.push({ input: preview, left: index * 340 + 20, top: 82 });
  }

  await sharp({
    create: { width: 340 * names.length, height: 582, channels: 4, background: '#ece8df' }
  }).composite(cells).png().toFile(path.join(outputDir, 'assistente-virtual-formatos.png'));
}

render().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
