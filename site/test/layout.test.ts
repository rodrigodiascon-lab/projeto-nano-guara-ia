import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";
// Mesma justificativa de test/geo.test.ts: o index.html entra por import bruto
// do Vite, e o CSS vem pelo Worker (import ?raw de .css devolve string vazia,
// o que faria a asserção passar sozinha sem checar nada).
import indexHtml from "../public/index.html?raw";
import portfolioHtml from "../public/portfolio.html?raw";
import privacidadeHtml from "../public/privacidade.html?raw";
import clinicasHtml from "../public/servicos/sites-para-clinicas-de-estetica-em-manaus.html?raw";

// As quatro páginas HTML públicas repetem o mesmo rodapé na mão. Toda guarda de
// rodapé vale para as quatro, senão a próxima edição conserta uma e esquece três.
const PAGINAS = {
  "index.html": indexHtml,
  "portfolio.html": portfolioHtml,
  "privacidade.html": privacidadeHtml,
  "servicos/sites-para-clinicas-de-estetica-em-manaus.html": clinicasHtml,
};

/**
 * Rolagem horizontal na home em viewport mobile (medido a 375px: scrollWidth
 * 390 contra clientWidth 375, sobrando 15px).
 *
 * Causa: o widget do Turnstile é renderizado com 300px fixos, dentro de um
 * shadow root fechado que o nosso CSS não alcança. O .cf-turnstile que o
 * hospeda é grid item do #leadForm, e todo grid item nasce com min-width:auto
 * — cujo piso é o tamanho min-content do conteúdo. Os 300px do widget viravam
 * então um piso intransponível que subia a cadeia:
 *
 *   .cf-turnstile  300  (piso vindo do widget)
 *   #leadForm      366  = 300 + 32*2 de padding + 1*2 de borda
 *   .wrap          327  = 375 - 24*2 de padding   <- só isso estava disponível
 *
 * O form não conseguia descer de 366px, vazava até x=390 e a página inteira
 * ganhava barra de rolagem. min-width:0 dispensa o piso automático: o wrapper
 * do Turnstile passa a acompanhar a coluna em vez de ditá-la.
 *
 * Não dá para medir layout aqui — o runtime workerd do vitest-pool-workers não
 * tem engine de layout. O que estes testes travam é a regra CSS e a estrutura
 * que a torna necessária, que é onde a regressão aconteceria.
 */
describe("#contato não pode voltar a empurrar a home além da viewport", () => {
  const css = async () => (await SELF.fetch("https://site.local/styles.css")).text();

  it("a regra .cf-turnstile declara min-width:0", async () => {
    const regra = (await css()).match(/\.cf-turnstile\s*\{([^}]*)\}/);
    expect(regra, "a regra .cf-turnstile sumiu do styles.css").not.toBeNull();
    expect(regra![1], "sem min-width:0 os 300px do Turnstile voltam a ser piso do form")
      .toMatch(/min-width:\s*0/);
  });

  // Sem esta guarda o teste acima vira decoração: se o widget sair de dentro do
  // form, ou o form deixar de ser grid, a regra continua no CSS sem proteger
  // nada — e quem mexer depois não tem como saber que ela ficou obsoleta.
  it("o widget continua dentro do #leadForm, que é o grid que sofria o piso", async () => {
    const form = indexHtml.match(/<form id="leadForm"[\s\S]*?<\/form>/);
    expect(form, "o #leadForm sumiu do index.html").not.toBeNull();
    expect(form![0], "o .cf-turnstile saiu de dentro do #leadForm").toContain("cf-turnstile");
    expect(await css(), "o form deixou de ser grid; revisar o porquê do min-width:0")
      .toMatch(/\bform\s*\{[^}]*display:\s*grid/);
  });

  // O piso só aperta porque .wrap e form gastam 114px dos 375 em padding e
  // borda (24*2 + 32*2 + 1*2). Se alguém aumentar esses valores, os 300px do
  // widget deixam de caber de novo mesmo com min-width:0 — aí o widget passa a
  // pintar por fora do cartão. Trava os números que a conta assume.
  it("o padding do .wrap e do form seguem nos valores que a conta assume", async () => {
    const folha = await css();
    expect(folha).toMatch(/\.wrap\s*\{[^}]*padding:\s*0 24px/);
    expect(folha).toMatch(/\bform\s*\{[^}]*padding:\s*32px/);
  });
});

/**
 * Segundo vazamento, independente do #contato e encontrado medindo a 320px:
 * `footer .cols` era o único grid do arquivo sem parada no mobile. As três
 * trilhas de `2fr 1fr 1fr` mais 40px de gap duas vezes davam 373px de piso —
 * um número ditado pelo conteúdo, não pela viewport, então não melhorava por
 * mais estreita que ela ficasse. Medido a 360px antes da correção:
 * scrollWidth 373 contra clientWidth 360.
 */
describe("o rodapé não pode voltar a ser mais largo que a tela", () => {
  it("footer .cols tem parada no mobile, com no máximo duas colunas", async () => {
    const folha = await (await SELF.fetch("https://site.local/styles.css")).text();
    const bloco = folha.match(
      /@media\s*\(\s*max-width:\s*(\d+)px\s*\)\s*\{\s*footer\s+\.cols\s*\{([^}]*)\}/
    );
    expect(bloco, "footer .cols voltou a não ter breakpoint mobile").not.toBeNull();
    // Precisa pegar celular de verdade: 820px é o mesmo corte já usado pela nav
    // e pelo .portfolio-grid.
    expect(Number(bloco![1]), "o breakpoint subiu acima do que cobre celular")
      .toBeLessThanOrEqual(900);
    expect(bloco![2], "o mobile voltou a ter três colunas")
      .toMatch(/grid-template-columns:\s*1fr(\s+1fr)?\s*[;}]/);
  });
});

/**
 * Identificação da pessoa jurídica no rodapé. Por decisão do dono do projeto
 * entra só razão social, cidade/UF e CNPJ — endereço não.
 */
describe("identificação legal no rodapé", () => {
  const CNPJ = "21.091.816/0001-48";

  for (const [pagina, html] of Object.entries(PAGINAS)) {
    it(`${pagina} declara a empresa, a praça e o CNPJ`, () => {
      const legal = html.match(/<div class="legal">([\s\S]*?)<\/div>/);
      expect(legal, "o bloco .legal sumiu").not.toBeNull();
      expect(legal![1]).toContain("R D Pimentel Serviços");
      expect(legal![1]).toContain("Manaus, AM");
      expect(legal![1]).toContain(CNPJ);
    });
  }

  // Guarda de dígito verificador: um CNPJ errado no rodapé é informação legal
  // incorreta publicada, e um typo num número de 14 dígitos não salta aos olhos
  // em revisão. Se alguém trocar o número, a conta acusa.
  it("o CNPJ publicado tem dígitos verificadores válidos", () => {
    const n = CNPJ.replace(/\D/g, "");
    expect(n).toHaveLength(14);
    const dv = (base: string, pesos: number[]) => {
      const soma = pesos.reduce((s, p, i) => s + Number(base[i]) * p, 0);
      const r = soma % 11;
      return r < 2 ? 0 : 11 - r;
    };
    expect(dv(n, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])).toBe(Number(n[12]));
    expect(dv(n, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])).toBe(Number(n[13]));
  });
});
