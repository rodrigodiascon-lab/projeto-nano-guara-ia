import { test, expect, type Page } from "@playwright/test";

/**
 * Rolagem horizontal indevida, medida no navegador.
 *
 * O sintoma é sempre o mesmo: document.scrollWidth maior que o clientWidth.
 * A home já vazou por três causas distintas, e nenhuma delas seria pega lendo
 * CSS — os 300px fixos do Turnstile subindo pelo min-width:auto do grid, o
 * footer .cols sem parada no mobile, e o iframe do Turnstile pintando fora da
 * própria caixa depois da primeira correção.
 */

/** Chave de teste oficial do Cloudflare: renderiza o widget real em qualquer
 *  domínio, inclusive localhost, e sempre passa. A de produção é amarrada a
 *  nanoguara.ia.br e falha aqui, deixando a div vazia — e uma div vazia não
 *  tem os 150px do widget, que é justamente o que precisa ser medido. */
const SITEKEY_TESTE = "1x00000000000000000000AA";

/** Larguras que importam: 320 é o iPhone SE de primeira geração, 360 é a maior
 *  parte do Android, 375 é onde o bug foi reportado. As três de cima entram
 *  para que uma correção de mobile não quebre o desktop em silêncio. */
const LARGURAS = [320, 360, 375, 414, 768, 1280];

const PAGINAS = [
  { nome: "home", url: "/index.html", temFormulario: true },
  { nome: "privacidade", url: "/privacidade.html", temFormulario: false },
  { nome: "portfólio", url: "/portfolio.html", temFormulario: false },
  { nome: "serviço: clínicas", url: "/servicos/sites-para-clinicas-de-estetica-em-manaus.html", temFormulario: false },
  { nome: "404", url: "/404.html", temFormulario: false },
];

/**
 * Devolve quem de fato empurra a página, e não todo mundo cuja caixa passa da
 * borda. Duas armadilhas custaram tempo quando isso foi investigado à mão:
 *
 * - o SVG da topografia do herói tem paths gigantes, mas vive dentro de um
 *   header com overflow:hidden, então não gera rolagem nenhuma;
 * - o botão da navbar tem overflow:hidden nele mesmo (os dois textos do hover
 *   dividem a mesma célula de grid), então o scrollWidth dele é maior que a
 *   caixa sem que nada escape.
 *
 * Sem esses dois filtros, o relatório de falha vira ruído e esconde a causa.
 */
async function culpados(page: Page) {
  return page.evaluate(() => {
    const limite = document.documentElement.clientWidth;
    const recorta = (el: Element) => getComputedStyle(el).overflowX !== "visible";
    const achados: Array<{ tag: string; cls: string; id: string; ate: number }> = [];

    for (const el of Array.from(document.querySelectorAll("*"))) {
      if (el instanceof SVGElement) continue;
      let ancestralRecorta = false;
      for (let p = el.parentElement; p; p = p.parentElement) {
        if (recorta(p)) { ancestralRecorta = true; break; }
      }
      if (ancestralRecorta) continue;

      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      // Se o próprio elemento recorta, o que transborda dele não escapa.
      const ate = recorta(el) ? r.right : Math.max(r.right, r.left + el.scrollWidth);
      if (ate > limite + 0.5) {
        achados.push({
          tag: el.tagName,
          cls: (el.className || "").toString().slice(0, 40),
          id: el.id,
          ate: Math.round(ate * 10) / 10,
        });
      }
    }
    return achados.sort((a, b) => b.ate - a.ate).slice(0, 5);
  });
}

test.describe("nenhuma página rola na horizontal", () => {
  for (const pagina of PAGINAS) {
    for (const largura of LARGURAS) {
      test(`${pagina.nome} a ${largura}px`, async ({ page }) => {
        await page.setViewportSize({ width: largura, height: 900 });

        if (pagina.temFormulario) {
          // Troca a sitekey no HTML antes de o navegador executá-lo.
          await page.route(`**${pagina.url}`, async (route) => {
            const resposta = await route.fetch();
            const html = (await resposta.text()).replace(
              /data-sitekey="[^"]*"/,
              `data-sitekey="${SITEKEY_TESTE}"`
            );
            await route.fulfill({ response: resposta, body: html });
          });
        }

        await page.goto(pagina.url);
        await page.evaluate(() => document.fonts.ready);

        if (pagina.temFormulario) {
          // Sem esta espera o teste mede o formulário antes de o widget existir
          // e passa por ausência, não por correção — que é o pior tipo de teste
          // verde. O token só aparece quando o widget resolveu o desafio.
          const token = page.locator('input[name="cf-turnstile-response"]');
          await expect(
            token,
            "o widget do Turnstile não renderizou; sem ele a medição não vale"
          ).toHaveValue(/.+/, { timeout: 20_000 });
        }

        const medida = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));

        const sobra = medida.scrollWidth - medida.clientWidth;
        const quem = sobra > 0 ? await culpados(page) : [];
        expect(
          sobra,
          `${pagina.nome} a ${largura}px sobrou ${sobra}px ` +
            `(scrollWidth ${medida.scrollWidth} contra clientWidth ${medida.clientWidth}). ` +
            `Quem passa da borda: ${JSON.stringify(quem)}`
        ).toBe(0);
      });
    }
  }
});

/**
 * O widget do Turnstile é a causa do bug original e a única peça da página cuja
 * largura vem de terceiro. Vale medir o que se espera dele, e não só a ausência
 * de rolagem: se a rolagem sumir por outro motivo (alguém escondendo o widget,
 * por exemplo), estes testes continuam cobrando que ele esteja inteiro dentro
 * do cartão.
 */
test.describe("o widget do Turnstile cabe dentro do formulário", () => {
  for (const largura of [320, 375]) {
    test(`a ${largura}px não ultrapassa a borda do cartão`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.route("**/index.html", async (route) => {
        const resposta = await route.fetch();
        const html = (await resposta.text()).replace(
          /data-sitekey="[^"]*"/,
          `data-sitekey="${SITEKEY_TESTE}"`
        );
        await route.fulfill({ response: resposta, body: html });
      });
      await page.goto("/index.html");
      await expect(page.locator('input[name="cf-turnstile-response"]')).toHaveValue(/.+/, {
        timeout: 20_000,
      });

      const m = await page.evaluate(() => {
        const t = document.querySelector(".cf-turnstile") as HTMLElement;
        const form = document.getElementById("leadForm") as HTMLElement;
        const tr = t.getBoundingClientRect();
        const fr = form.getBoundingClientRect();
        return {
          // scrollWidth pega o iframe que pinta além da caixa: foi assim que o
          // vazamento de 6px sobreviveu à primeira correção sem ser notado.
          pintaAte: tr.left + Math.max(t.scrollWidth, tr.width),
          cartaoAte: fr.right,
          alturaWidget: tr.height,
        };
      });

      expect(
        Math.round(m.pintaAte),
        `o widget pinta até ${Math.round(m.pintaAte)}px e o cartão termina em ${Math.round(m.cartaoAte)}px`
      ).toBeLessThanOrEqual(Math.round(m.cartaoAte));

      // O compact tem 140px de altura documentada; o render real fica em ~148.
      // Se alguém voltar para o tamanho padrão (65px), isto acusa antes de o
      // min-height do CSS ficar defasado e o botão de enviar passar a saltar.
      expect(m.alturaWidget, "a altura não é a do tamanho compact").toBeGreaterThan(100);
    });
  }
});
