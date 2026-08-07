# Campanha de Engajamento no Amazonas — Onda 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produzir, documentar e validar os 10 conteúdos da primeira semana da campanha “O Amazonas não cabe numa legenda”: 7 posts estáticos, 2 carrosséis e 1 Reel.

**Architecture:** Um manifesto JSON será a fonte única de copy, calendário, séries, formatos, assets e hipóteses. Um renderizador HTML/CSS orientado por query string gerará posts e slides; scripts Node sem dependências novas chamarão o Gemini, renderizarão via Chrome e validarão dimensões e regras editoriais. O Reel será montado a partir de cinco frames verticais locais, mantendo o áudio para seleção nativa no Instagram no momento da publicação.

**Tech Stack:** HTML/CSS/JavaScript, Node.js (`node:test`, `fetch`, `child_process`), Google Gemini Interactions API com `gemini-3-pro-image-preview`, Chrome headless, FFmpeg, PNG/JPEG/MP4.

## Global Constraints

- Campanha: `O Amazonas não cabe numa legenda`.
- Este plano implementa apenas os 10 conteúdos dos primeiros 7 dias.
- Exatamente 7 posts estáticos 1080×1350, 2 carrosséis 1080×1350 por slide e 1 Reel 1080×1920.
- As quatro séries aprovadas precisam aparecer na Onda 1.
- Nenhuma arte pode conter “curta”, “comente”, “marque alguém”, recompensa, venda de IA, venda de WhatsApp ou CTA comercial.
- A legenda pode fazer pergunta genuína, mas não oferecer prêmio, material ou resposta automática.
- A marca aparece apenas como assinatura discreta `nanoguará.ia`.
- Imagens geradas usam exclusivamente `gemini-3-pro-image-preview`, sem chave gravada no repositório.
- Toda imagem final é local; HTML e CSS não dependem de URLs externas.
- Não inventar expressões, tradições, lendas, estatísticas ou citações.
- Timezone: `America/Manaus`.
- Política partidária, conteúdo religioso e figuras públicas ficam fora desta onda.

## Execution Precondition

The current main worktree already contains unrelated staged and unstaged changes. Before Task 1, use `superpowers:using-git-worktrees` to create an isolated worktree on a `codex/engajamento-amazonas-onda-1` branch. Run every command and commit in this plan inside that worktree; do not alter or absorb the existing main-worktree changes.

---

## File Map

```text
docs/marketing/brand/posts/engajamento-amazonas/
├── README.md
└── onda-1/
    ├── campaign.json
    ├── captions.md
    ├── prompts.json
    ├── index.html
    ├── reel-list.txt
    ├── assets/
    │   ├── marca.svg
    │   ├── fonts/{outfit-600,outfit-700,geist-400,geist-500}.woff2
    │   └── images/*.jpg
    ├── outputs/
    │   ├── static/*.png
    │   ├── carousels/{chuva-manaus,alem-cartao-postal}/slide-*.png
    │   ├── reel/frames/*.png
    │   ├── reel/amazonas-nos-detalhes.mp4
    │   └── preview-grid.png
    ├── scripts/
    │   ├── generate-images.mjs
    │   ├── render.mjs
    │   ├── export-captions.mjs
    │   ├── build-reel.sh
    │   └── verify.mjs
    └── tests/{campaign,outputs}.test.mjs
```

## Onda 1 — inventário exato

| ID | Dia/hora | Série | Formato | Visual | Texto principal | Hipótese |
|---|---|---|---|---|---|---|
| `manifesto-nao-cabe` | 1, 09:00 | Manifestos da campanha | Estático | Documental | O AMAZONAS NÃO CABE NUMA LEGENDA. | Orgulho coletivo transforma a curtida em endosso. |
| `humor-chuva-corre` | 2, 11:30 | Só quem é daqui entende | Estático | Humor editorial | O CÉU DE MANAUS ESCURECEU. CORRE QUE AINDA DÁ TEMPO. | Situação cotidiana gera identificação imediata. |
| `carrossel-alem-cartao-postal` | 2, 19:30 | Isso também é Amazonas | Carrossel, 6 slides | Documental | AMAZONAS NÃO É SÓ O QUE APARECE NO CARTÃO-POSTAL. | Corrigir a percepção externa desperta orgulho e compartilhamento. |
| `memoria-cheiro-chuva` | 3, 18:00 | Memória de quem é daqui | Estático | Colagem afetiva | ALGUMAS SAUDADES TÊM CHEIRO DE CHUVA NO ASFALTO QUENTE. | Memória sensorial favorece curtidas e compartilhamentos. |
| `orgulho-rio-estrada` | 4, 12:00 | Isso também é Amazonas | Estático | Documental | TEM LUGAR QUE TEM ESTRADA. A GENTE TEM RIO. | Diferença concreta do território ativa orgulho local. |
| `carrossel-chuva-manaus` | 4, 19:30 | Só quem é daqui entende | Carrossel, 5 slides | Humor editorial | 5 MOMENTOS EM QUE A CHUVA DE MANAUS DECIDE SEU DIA. | Sequência reconhecível aumenta retenção. |
| `humor-frio-casaco` | 5, 11:30 | Só quem é daqui entende | Estático | Humor editorial | BAIXOU UM POUQUINHO A TEMPERATURA. O AMAZONENSE JÁ PROCURA O CASACO. | Humor sem ridicularização favorece identificação. |
| `memoria-rede-varanda` | 6, 09:30 | Memória de quem é daqui | Estático | Colagem afetiva | UMA REDE NA VARANDA JÁ FOI O MUNDO INTEIRO. | Objeto cotidiano ativa nostalgia afetiva. |
| `orgulho-manaus-futuro` | 7, 11:00 | Isso também é Amazonas | Estático | Documental | MANAUS NÃO É SÓ PORTA DA FLORESTA. É CASA DE QUEM CRIA O FUTURO. | Amplia a identidade local para cidade, criação e tecnologia. |
| `reel-amazonas-detalhes` | 7, 19:30 | Memória de quem é daqui | Reel, 15s | Documental | SE VOCÊ É DAQUI, VAI RECONHECER. | Montagem curta aumenta retenção e reconhecimento sensorial. |

No manifesto, os valores de `visualStyle` são exatamente `documental-cinematografico`, `humor-editorial` e `colagem-afetiva`, correspondendo às três etiquetas da tabela.

### Copy exata dos carrosséis

`carrossel-chuva-manaus`:

1. “5 MOMENTOS EM QUE A CHUVA DE MANAUS DECIDE SEU DIA.”
2. “VOCÊ OLHA O CÉU. ESTÁ CLARO. SAI SEM GUARDA-CHUVA.”
3. “DEZ MINUTOS DEPOIS, O VENTO MUDA E TODO MUNDO ACELERA O PASSO.”
4. “A CHUVA CAI COMO SE ESTIVESSE ATRASADA.”
5. “DEPOIS PASSA. O CALOR VOLTA. E MANAUS SEGUE COMO SE NADA TIVESSE ACONTECIDO.”

`carrossel-alem-cartao-postal`:

1. “AMAZONAS NÃO É SÓ O QUE APARECE NO CARTÃO-POSTAL.”
2. “É CIDADE QUE CRESCE OLHANDO PARA O RIO.”
3. “É FEIRA ABRINDO ANTES DO SOL.”
4. “É CIÊNCIA FEITA NO MEIO DA MAIOR FLORESTA TROPICAL DO MUNDO.”
5. “É GENTE CRIANDO, TRABALHANDO E EMPREENDENDO TODOS OS DIAS.”
6. “A FLORESTA É PARTE DE NÓS. MAS NUNCA FOI TUDO O QUE SOMOS.”

---

### Task 1: Create the campaign manifest and editorial contract tests

**Files:**
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/campaign.json`
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/tests/campaign.test.mjs`

**Interfaces:**
- Consumes: the approved inventory and carousel copy above.
- Produces: `campaign.json` with stable content IDs consumed by every later script.

- [ ] **Step 1: Write the failing contract test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const campaign = JSON.parse(await readFile(new URL("../campaign.json", import.meta.url), "utf8"));
const allText = campaign.contents.flatMap((item) => [item.artText, item.caption, ...(item.slides ?? [])]).filter(Boolean).join(" ").toLocaleLowerCase("pt-BR");

test("onda 1 has the approved inventory", () => {
  assert.equal(campaign.campaign, "O Amazonas não cabe numa legenda");
  assert.equal(campaign.timezone, "America/Manaus");
  assert.equal(campaign.contents.length, 10);
  assert.equal(campaign.contents.filter((x) => x.format === "static").length, 7);
  assert.equal(campaign.contents.filter((x) => x.format === "carousel").length, 2);
  assert.equal(campaign.contents.filter((x) => x.format === "reel").length, 1);
});

test("all four series are represented", () => {
  assert.deepEqual([...new Set(campaign.contents.map((x) => x.series))].sort(), [
    "Isso também é Amazonas", "Manifestos da campanha",
    "Memória de quem é daqui", "Só quem é daqui entende",
  ].sort());
});

test("forbidden engagement and sales prompts are absent", () => {
  for (const forbidden of ["curta", "comente", "marque alguém", "receba", "link na bio", "whatsapp"]) {
    assert.equal(allText.includes(forbidden), false, forbidden);
  }
});

test("double-post days use different series", () => {
  assert.deepEqual([...new Set(campaign.contents.map((x) => x.day))], [1, 2, 3, 4, 5, 6, 7]);
  for (const day of [2, 4, 7]) {
    const items = campaign.contents.filter((x) => x.day === day);
    assert.equal(items.length, 2);
    assert.equal(new Set(items.map((x) => x.series)).size, 2);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
node --test docs/marketing/brand/posts/engajamento-amazonas/onda-1/tests/campaign.test.mjs
```

Expected: FAIL with `ENOENT` for `campaign.json`.

- [ ] **Step 3: Create `campaign.json`**

Top-level shape:

```json
{
  "campaign": "O Amazonas não cabe numa legenda",
  "timezone": "America/Manaus",
  "wave": 1,
  "contents": []
}
```

Use one content object per inventory row. Required keys are `id`, `day`, `time`, `series`, `format`, `visualStyle`, `artText`, `caption`, `hypothesis` and `assets`. Carousels also receive the exact `slides` arrays above. The Reel receives `durationSeconds: 15` and `frames` with `chuva-centro-manaus.jpg`, `barco-rio-estrada.jpg`, `feira-amanhecer.jpg`, `rede-varanda.jpg` and `manaus-futuro.jpg`.

Use these exact captions:

```text
manifesto-nao-cabe: Não é só floresta, rio ou cidade. É o jeito como tudo isso vive junto — e dentro de quem chama este lugar de casa. Durante 30 dias, a nanoguará.ia vai contar um Amazonas que não cabe numa legenda. #Amazonas #Manaus
humor-chuva-corre: Quem é daqui conhece esse cálculo: o céu escureceu, o vento mudou e você ainda acredita que dá tempo de chegar seco. Quase nunca dá. #Manaus #Amazonas
carrossel-chuva-manaus: Em Manaus, a chuva não pergunta se você tinha compromisso. Ela chega, muda a rota, passa — e depois o calor age como se nada tivesse acontecido. Qual desses momentos você conhece bem? #Manaus #Amazonas
memoria-cheiro-chuva: Tem cheiro que abre uma porta inteira na memória. Chuva no asfalto quente é um deles. Qual cheiro te lembra casa? #Amazonas #Manaus
orgulho-rio-estrada: Para muita gente, o rio é paisagem. Aqui ele também é caminho, encontro e rotina. #Amazonas
humor-frio-casaco: Não precisa fazer frio de verdade. Basta o vento mudar um pouco para aparecer casaco em Manaus. O corpo pode nem precisar, mas o amazonense aproveita. #Manaus #Amazonas
carrossel-alem-cartao-postal: Quem vê o Amazonas de longe quase sempre enxerga a paisagem primeiro. Quem vive aqui enxerga também trabalho, ciência, cultura, cidade e futuro. O que mais precisa aparecer quando contam nossa história? #Amazonas #Manaus
memoria-rede-varanda: Uma rede, uma varanda e uma tarde sem pressa. Às vezes a memória de casa cabe inteira em coisas simples. #Amazonas
reel-amazonas-detalhes: Tem cenas que a gente reconhece antes mesmo de entender por quê. A luz, o movimento, o rio, a chuva. O Amazonas também mora nos detalhes. #Amazonas #Manaus
orgulho-manaus-futuro: Manaus também é laboratório, criação, tecnologia e trabalho. A floresta faz parte da nossa identidade — mas nunca foi o limite do que somos. #Manaus #Amazonas
```

- [ ] **Step 4: Run the contract test**

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/marketing/brand/posts/engajamento-amazonas/onda-1/campaign.json docs/marketing/brand/posts/engajamento-amazonas/onda-1/tests/campaign.test.mjs
git commit -m "feat(marketing): define conteúdo da onda 1 no Amazonas"
```

### Task 2: Add local brand assets and the Gemini image pipeline

**Files:**
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/prompts.json`
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/generate-images.mjs`
- Copy: `docs/marketing/brand/marca.svg` → `docs/marketing/brand/posts/engajamento-amazonas/onda-1/assets/marca.svg`
- Copy: `site/public/fonts/{outfit-600,outfit-700,geist-400,geist-500}.woff2` → `docs/marketing/brand/posts/engajamento-amazonas/onda-1/assets/fonts/`

**Interfaces:**
- Consumes: `GEMINI_API_KEY`, `prompts.json` and `gemini-3-pro-image-preview`.
- Produces: nine JPEGs in `assets/images/`, plus offline `--list` and `--dry-run` modes.

- [ ] **Step 1: Add a failing prompt-contract test**

```js
test("image prompts use the approved model and local filenames", async () => {
  const prompts = JSON.parse(await readFile(new URL("../prompts.json", import.meta.url), "utf8"));
  assert.equal(prompts.model, "gemini-3-pro-image-preview");
  assert.equal(prompts.images.length, 9);
  for (const image of prompts.images) {
    assert.match(image.filename, /^[a-z0-9-]+\.jpg$/);
    assert.match(image.prompt, /no text, no logo, no watermark/i);
  }
});
```

- [ ] **Step 2: Run tests and confirm `prompts.json` is missing**

Expected: FAIL with `ENOENT`.

- [ ] **Step 3: Create the nine prompt records**

All prompts begin with `High-end editorial documentary photography, contemporary State of Amazonas, Brazil, authentic and non-touristic, natural people and lived-in environments, deep forest greens and warm amber light, realistic skin and anatomy, 35mm photographic character,` and end with `respectful portrayal, no stereotypes, no text, no logo, no watermark, no distorted hands, no duplicate people.`

| Filename | Aspect | Middle scene description |
|---|---|---|
| `manifesto-cidade-rio.jpg` | 4:5 | Manaus riverfront at golden hour where urban life, working boats and the broad river coexist; no invented landmark. |
| `chuva-centro-manaus.jpg` | 4:5 | Sudden tropical downpour on a contemporary Manaus street; pedestrians accelerate under awnings; wet asphalt reflections. |
| `asfalto-chuva-memoria.jpg` | 4:5 | Close low-angle view of warm wet asphalt just after rain, faint steam and amber reflections. |
| `barco-rio-estrada.jpg` | 4:5 | Practical regional passenger boat crossing a broad river in daylight, ordinary local mobility rather than tourism. |
| `frio-casaco-manaus.jpg` | 4:5 | Smiling adult resident on an overcast Manaus morning wearing a light jacket despite the tropical setting. |
| `manaus-futuro.jpg` | 4:5 | Diverse young adult professionals in a contemporary local technology and maker workspace, tropical daylight. |
| `rede-varanda.jpg` | 4:5 | Simple lived-in Amazonian veranda with a fabric hammock in late-afternoon light; no person. |
| `feira-amanhecer.jpg` | 4:5 | Busy urban market in Manaus opening before sunrise, vendors arranging regional produce. |
| `porto-trabalho.jpg` | 4:5 | Workers and passengers moving through a practical Manaus river port, boats and city layers visible. |

- [ ] **Step 4: Implement `generate-images.mjs`**

Use:

```js
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
const key = process.env.GEMINI_API_KEY;
```

Implement `--list`, `--dry-run`, an exact filename selector such as `--only=chuva-centro-manaus.jpg`, and default generate-missing behavior. POST `{ model, input: [{ type: "text", text: prompt }] }` with `x-goog-api-key`; locate the first `steps[].content[]` item with `type === "image"`; decode `data` from base64. Never overwrite an existing JPEG, print the key or leave partial output on failure.

- [ ] **Step 5: Run offline verification**

```bash
node --test docs/marketing/brand/posts/engajamento-amazonas/onda-1/tests/campaign.test.mjs
node docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/generate-images.mjs --list
node docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/generate-images.mjs --dry-run
```

Expected: tests PASS; list contains nine JPEG names; dry-run prints the approved model for every record.

- [ ] **Step 6: Commit**

```bash
git add docs/marketing/brand/posts/engajamento-amazonas/onda-1/prompts.json docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/generate-images.mjs docs/marketing/brand/posts/engajamento-amazonas/onda-1/assets
git commit -m "feat(marketing): adiciona pipeline visual da campanha Amazonas"
```

### Task 3: Build the shared HTML renderer

**Files:**
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/index.html`
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/render.mjs`

**Interfaces:**
- Consumes: `campaign.json`, local fonts, logo and JPEGs.
- Produces: one creative selected by a concrete query such as `?creative=manifesto-nao-cabe`, with optional `&slide=1` or `&reelFrame=1`.

- [ ] **Step 1: Add a failing offline renderer test**

```js
test("renderer is offline-safe and exposes approved visual systems", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.equal(/https?:\/\//.test(html), false);
  assert.match(html, /documental-cinematografico/);
  assert.match(html, /humor-editorial/);
  assert.match(html, /colagem-afetiva/);
  assert.match(html, /1080px/);
  assert.match(html, /1350px/);
});
```

- [ ] **Step 2: Run tests and confirm `index.html` is missing**

Expected: FAIL with `ENOENT`.

- [ ] **Step 3: Implement the renderer shell**

Use exact tokens:

```css
:root { --w:1080px; --h:1350px; --deep:#123b26; --green:#2e7d32; --cream:#fdf9f0; --paper:#f7f9f5; --red:#d5382f; --red-light:#ef5a4c; --ink:#17231b; --pad:72px; }
```

Implement `.documental-cinematografico` as full-bleed photo plus green scrim, `.humor-editorial` as 66% photo plus 34% cream band, and `.colagem-afetiva` as two local crops with cream borders on deep green. Carousels keep series label top-left and `n/total` top-right in fixed positions. Reel frames switch to 1080×1920 and keep critical text between y=250 and y=1600. No template renders a CTA.

- [ ] **Step 4: Implement `render.mjs`**

Use Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` with headless, no-sandbox, disabled GPU, hidden scrollbars, local-file access and device scale factor 1. Support selectors such as `--only=manifesto-nao-cabe`, plus `--list` and `--force`; refuse missing local assets; never overwrite without `--force`. `--list` must report 7 static PNGs, 11 carousel slides and 5 Reel frames.

- [ ] **Step 5: Run tests and list planned renders**

```bash
node --test docs/marketing/brand/posts/engajamento-amazonas/onda-1/tests/campaign.test.mjs
node docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/render.mjs --list
```

- [ ] **Step 6: Commit**

```bash
git add docs/marketing/brand/posts/engajamento-amazonas/onda-1/index.html docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/render.mjs docs/marketing/brand/posts/engajamento-amazonas/onda-1/tests/campaign.test.mjs
git commit -m "feat(marketing): cria renderizador da campanha Amazonas"
```

### Task 4: Generate and approve the nine source photographs

**Files:**
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/assets/images/*.jpg`

**Interfaces:**
- Consumes: `prompts.json`, `generate-images.mjs` and `GEMINI_API_KEY`.
- Produces: nine reviewed source photographs used by every final format.

- [ ] **Step 1: Confirm API access without exposing the key**

```bash
test -n "$GEMINI_API_KEY" && echo "GEMINI_API_KEY available"
```

Expected: exactly `GEMINI_API_KEY available`.

- [ ] **Step 2: Generate the nine missing assets**

```bash
node docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/generate-images.mjs
```

Expected: nine non-empty JPEGs in `assets/images/`.

- [ ] **Step 3: Create and inspect a contact sheet**

Create a temporary local HTML page containing the nine images with filename captions and render it to `outputs/source-contact-sheet.png`. Inspect at original detail for anatomy, duplicated objects, invented lettering, tourist clichés and regional incoherence.

- [ ] **Step 4: Regenerate each failed image individually**

Move a rejected file outside `assets/images/`, strengthen only the failing part of its prompt, and run:

```bash
node docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/generate-images.mjs --only=chuva-centro-manaus.jpg
```

Do not continue until all nine images pass. Never commit rejected generations.

- [ ] **Step 5: Commit approved photographs with their prompts**

```bash
git add docs/marketing/brand/posts/engajamento-amazonas/onda-1/assets/images docs/marketing/brand/posts/engajamento-amazonas/onda-1/prompts.json
git commit -m "feat(marketing): adiciona fotografias da onda 1 no Amazonas"
```

### Task 5: Render and review the seven static posts

**Files:**
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/outputs/static/*.png`
- Modify if needed: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/index.html`

**Interfaces:**
- Consumes: seven static manifest entries and approved JPEGs.
- Produces: seven publication-ready 1080×1350 PNGs.

- [ ] **Step 1: Render all static posts**

```bash
for id in manifesto-nao-cabe humor-chuva-corre memoria-cheiro-chuva orgulho-rio-estrada humor-frio-casaco memoria-rede-varanda orgulho-manaus-futuro; do
  node docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/render.mjs --only="$id" --force
done
```

Expected: seven PNGs in `outputs/static/`.

- [ ] **Step 2: Perform thumbnail and cultural QA**

Inspect each at full size and at 150px width. Reject when the hook is unreadable at 150px, the signature competes with the hook, anatomy or objects are malformed, text covers a face, the scene looks like a tourist advertisement, or generated lettering/watermarks remain.

- [ ] **Step 3: Correct only the failing layer**

For hierarchy failures, edit `index.html`. For photographic failures, return only that filename to Task 4. Re-render only the affected content ID with `--force`.

- [ ] **Step 4: Commit approved statics**

```bash
git add docs/marketing/brand/posts/engajamento-amazonas/onda-1/index.html docs/marketing/brand/posts/engajamento-amazonas/onda-1/outputs/static
git commit -m "feat(marketing): finaliza posts estáticos da onda 1"
```

### Task 6: Render and review the two carousels

**Files:**
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/outputs/carousels/chuva-manaus/slide-01.png` through `slide-05.png`
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/outputs/carousels/alem-cartao-postal/slide-01.png` through `slide-06.png`
- Modify if needed: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/index.html`

**Interfaces:**
- Consumes: exact slide copy from this plan.
- Produces: 11 sequential 1080×1350 PNGs with stable navigation positions.

- [ ] **Step 1: Render both carousels**

```bash
node docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/render.mjs --only=carrossel-chuva-manaus --force
node docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/render.mjs --only=carrossel-alem-cartao-postal --force
```

- [ ] **Step 2: Verify narrative and visual continuity**

Confirm slide numbers, series label and reading direction stay fixed; copy exactly matches the approved arrays; covers remain readable at 150px; no final slide asks for interaction; `alem-cartao-postal` balances river, city, feira, science/work and people without reducing the state to scenery.

- [ ] **Step 3: Correct and re-render only the failing carousel**

Use the same `--only` command. Regenerate a source photograph only when the photograph itself is the failure.

- [ ] **Step 4: Commit approved carousels**

```bash
git add docs/marketing/brand/posts/engajamento-amazonas/onda-1/index.html docs/marketing/brand/posts/engajamento-amazonas/onda-1/outputs/carousels
git commit -m "feat(marketing): finaliza carrosséis da onda 1"
```

### Task 7: Build the 15-second Reel master

**Files:**
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/reel-list.txt`
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/build-reel.sh`
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/outputs/reel/frames/frame-01.png` through `frame-05.png`
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/outputs/reel/amazonas-nos-detalhes.mp4`

**Interfaces:**
- Consumes: five local images listed in the Reel manifest entry.
- Produces: a silent 15-second H.264 master at 1080×1920. Instagram-native audio is selected at publication, so copyrighted audio is never committed.

- [ ] **Step 1: Render five Reel frames**

Run `render.mjs --only=reel-amazonas-detalhes --force` with this exact frame text:

1. `SE VOCÊ É DAQUI, VAI RECONHECER.`
2. `A CHUVA MUDA O RITMO.`
3. `O RIO MUDA O CAMINHO.`
4. `A CIDADE ACORDA CEDO.`
5. `O AMAZONAS TAMBÉM MORA NOS DETALHES.`

All critical text stays between y=250 and y=1600.

- [ ] **Step 2: Create `reel-list.txt`**

```text
file 'outputs/reel/frames/frame-01.png'
duration 2.5
file 'outputs/reel/frames/frame-02.png'
duration 2.5
file 'outputs/reel/frames/frame-03.png'
duration 2.5
file 'outputs/reel/frames/frame-04.png'
duration 2.5
file 'outputs/reel/frames/frame-05.png'
duration 5
file 'outputs/reel/frames/frame-05.png'
```

- [ ] **Step 3: Implement `build-reel.sh`**

The executable script runs from `onda-1/` and calls:

```bash
ffmpeg -y -f concat -safe 0 -i reel-list.txt \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p" \
  -t 15 -an -c:v libx264 -profile:v high -level 4.1 -movflags +faststart \
  outputs/reel/amazonas-nos-detalhes.mp4
```

- [ ] **Step 4: Build and inspect the master**

```bash
cd docs/marketing/brand/posts/engajamento-amazonas/onda-1
./scripts/build-reel.sh
ffprobe -v error -show_entries stream=width,height,duration,codec_name -of default=noprint_wrappers=1 outputs/reel/amazonas-nos-detalhes.mp4
```

Expected: `codec_name=h264`, `width=1080`, `height=1920`, duration approximately 15 seconds.

- [ ] **Step 5: Commit Reel assets and script**

```bash
git add docs/marketing/brand/posts/engajamento-amazonas/onda-1/reel-list.txt docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/build-reel.sh docs/marketing/brand/posts/engajamento-amazonas/onda-1/outputs/reel
git commit -m "feat(marketing): adiciona Reel da onda 1 no Amazonas"
```

### Task 8: Export captions, calendar and measurement instructions

**Files:**
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/export-captions.mjs`
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/captions.md`
- Create: `docs/marketing/brand/posts/engajamento-amazonas/README.md`

**Interfaces:**
- Consumes: captions and schedule from `campaign.json`.
- Produces: human-readable publication sheet without a second editable copy source.

- [ ] **Step 1: Implement `export-captions.mjs`**

Sort by `day`, then `time`, and output this exact block shape for every item:

```markdown
## Dia 1 · 09:00 · manifesto-nao-cabe

**Série:** Manifestos da campanha
**Formato:** Estático
**Hipótese:** Orgulho coletivo transforma a curtida em endosso da campanha.

Não é só floresta, rio ou cidade. É o jeito como tudo isso vive junto — e dentro de quem chama este lugar de casa. Durante 30 dias, a nanoguará.ia vai contar um Amazonas que não cabe numa legenda. #Amazonas #Manaus

**Métricas após 48h:** alcance ___ · curtidas ___ · compartilhamentos ___ · salvamentos ___ · visitas ao perfil ___ · curtidas/alcance ___
```

The script overwrites only `captions.md`.

- [ ] **Step 2: Export and scan captions**

```bash
node docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/export-captions.mjs
rg -ni "curta|comente|marque alguém|link na bio|whatsapp" docs/marketing/brand/posts/engajamento-amazonas/onda-1/captions.md
```

Expected: `rg` returns no matches.

- [ ] **Step 3: Write the campaign README**

Document links to the approved spec and this plan, the 7-day schedule, render commands, one-image regeneration, Reel build, caption export, and the measurement rule. Baseline is the median of the last 10 organic non-boosted posts, or all available organic posts if fewer than 10. Boost eligibility requires beating that baseline and ranking in the top quartile of the wave by likes/reach. For the silent Reel master, instruct the publisher to add a non-lyrical ambient or instrumental track from Instagram’s licensed library.

- [ ] **Step 4: Commit documentation**

```bash
git add docs/marketing/brand/posts/engajamento-amazonas/README.md docs/marketing/brand/posts/engajamento-amazonas/onda-1/captions.md docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/export-captions.mjs
git commit -m "docs(marketing): adiciona calendário e legendas da onda 1"
```

### Task 9: Add output verification and complete final QA

**Files:**
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/verify.mjs`
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/tests/outputs.test.mjs`
- Create: `docs/marketing/brand/posts/engajamento-amazonas/onda-1/outputs/preview-grid.png`
- Modify: `docs/marketing/brand/posts/README.md`

**Interfaces:**
- Consumes: all Onda 1 outputs.
- Produces: pass/fail verification and one visual handoff sheet.

- [ ] **Step 1: Write output inventory tests**

Implement a PNG header reader with Node `readFile`; width is UInt32BE at byte 16 and height at byte 20. Assert:

```js
assert.equal(staticPngs.length, 7);
assert.equal(carouselPngs.length, 11);
assert.equal(reelFrames.length, 5);
assert.deepEqual(readPngSize(anyFeedPng), { width: 1080, height: 1350 });
assert.deepEqual(readPngSize(anyReelFrame), { width: 1080, height: 1920 });
```

Also assert `amazonas-nos-detalhes.mp4` exists and is non-empty.

- [ ] **Step 2: Run output tests**

```bash
node --test docs/marketing/brand/posts/engajamento-amazonas/onda-1/tests/outputs.test.mjs
```

Expected: PASS if Tasks 5–7 are complete. Fix missing deliverables instead of weakening assertions.

- [ ] **Step 3: Implement `verify.mjs`**

It must run both test files; scan `index.html`, `campaign.json` and `captions.md` for forbidden CTA phrases; reject `http://` or `https://` in the renderer; call `ffprobe`; and fail unless the Reel is H.264, 1080×1920 and 14.5–15.5 seconds. Success prints exactly:

```text
PASS: 7 static + 11 carousel slides + 1 reel + 5 reel frames
```

- [ ] **Step 4: Build `preview-grid.png`**

Create a local preview HTML with the seven statics, two carousel covers and five Reel frames, labeled by ID. Render it to `outputs/preview-grid.png`; it is review-only, not an Instagram deliverable.

- [ ] **Step 5: Run complete verification**

```bash
node docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/verify.mjs
```

Expected: exact PASS summary above.

- [ ] **Step 6: Update the master posts README**

Add an `Engajamento Amazonas` section to `docs/marketing/brand/posts/README.md` linking to `engajamento-amazonas/README.md`, `onda-1/captions.md` and `onda-1/outputs/preview-grid.png`.

- [ ] **Step 7: Final commit**

```bash
git add docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/verify.mjs docs/marketing/brand/posts/engajamento-amazonas/onda-1/tests/outputs.test.mjs docs/marketing/brand/posts/engajamento-amazonas/onda-1/outputs/preview-grid.png docs/marketing/brand/posts/README.md
git commit -m "test(marketing): valida entregáveis da onda 1 no Amazonas"
```

## Final verification before handoff

- [ ] Run `node --test docs/marketing/brand/posts/engajamento-amazonas/onda-1/tests/*.test.mjs` and confirm all tests pass.
- [ ] Run `node docs/marketing/brand/posts/engajamento-amazonas/onda-1/scripts/verify.mjs` and confirm the exact PASS summary.
- [ ] Open `outputs/preview-grid.png` and inspect every composition at original size.
- [ ] Play `outputs/reel/amazonas-nos-detalhes.mp4` from beginning to end.
- [ ] Confirm campaign commits contain no API key, rejected generation, `.DS_Store`, browser-companion state or unrelated file.
- [ ] Record the baseline likes/reach median before the first publication.
