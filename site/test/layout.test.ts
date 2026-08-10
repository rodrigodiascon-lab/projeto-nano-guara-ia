import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";
// Mesma justificativa de test/geo.test.ts: o index.html entra por import bruto
// do Vite, e o CSS vem pelo Worker (import ?raw de .css devolve string vazia,
// o que faria a asserção passar sozinha sem checar nada).
import indexHtml from "../public/index.html?raw";


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
 * ganhava barra de rolagem.
 *
 * A correção tem duas partes, e as duas precisam continuar de pé:
 *
 * 1. data-size="compact" (150x140) no index.html. É o que faz o widget caber:
 *    o tamanho vem do atributo, porque o widget mora num shadow root fechado
 *    e nenhum seletor nosso o alcança. Com 150px sobra folga até a 320px.
 * 2. min-width:0 no CSS, de rede. Dispensa o piso automático, então nem um
 *    estado de erro do widget nem uma volta ao tamanho padrão reabrem a
 *    rolagem horizontal — no pior caso ele só deixa de caber no cartão.
 *
 * Sem a parte 1, com o padrão de 300px, o widget parava de vazar a página mas
 * passava a pintar 6px por fora do cartão a 375px, e voltava a rolar abaixo de
 * 357px. Medido depois das duas: 320px, 360px e 375px sem sobra nenhuma.
 *
 * Não dá para medir layout aqui — o runtime workerd do vitest-pool-workers não
 * tem engine de layout. O que estes testes travam é a regra CSS e a estrutura
 * que a torna necessária, que é onde a regressão aconteceria.
 */
describe("#contato não pode voltar a empurrar a home além da viewport", () => {
  const css = async () => (await SELF.fetch("https://site.local/styles.css")).text();

  // Parte 1: o atributo. É ele que decide o tamanho do widget — sem compact
  // volta o padrão de 300px, que não cabe na coluna do form no celular.
  it("o widget é pedido no tamanho compact", () => {
    const div = indexHtml.match(/<div class="cf-turnstile"[^>]*>/);
    expect(div, "a div .cf-turnstile sumiu do index.html").not.toBeNull();
    expect(div![0], 'sem data-size="compact" o widget volta aos 300px do padrão')
      .toMatch(/data-size="compact"/);
  });

  // Parte 2: a rede.
  it("a regra .cf-turnstile declara min-width:0", async () => {
    const regra = (await css()).match(/\.cf-turnstile\s*\{([^}]*)\}/);
    expect(regra, "a regra .cf-turnstile sumiu do styles.css").not.toBeNull();
    expect(regra![1], "sem min-width:0 a largura do widget volta a ser piso do form")
      .toMatch(/min-width:\s*0/);
  });

  // O min-height existe pra reservar a altura do widget antes de ele carregar,
  // senão o botão de enviar salta pra baixo no meio do preenchimento. Se o
  // data-size mudar e este número ficar para trás, volta o salto — por isso os
  // dois são checados juntos, e não cada um por si.
  it("o min-height reservado corresponde à altura do tamanho escolhido", async () => {
    const alturaPorTamanho: Record<string, number> = { compact: 140, normal: 65, flexible: 65 };
    const tamanho = indexHtml.match(/<div class="cf-turnstile"[^>]*data-size="(\w+)"/)?.[1] ?? "normal";
    const regra = (await css()).match(/\.cf-turnstile\s*\{([^}]*)\}/)![1];
    const reservado = Number(regra.match(/min-height:\s*(\d+)px/)?.[1]);
    expect(reservado, `min-height não bate com o data-size="${tamanho}"`)
      .toBe(alturaPorTamanho[tamanho]);
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

  // .wrap e form gastam 114px da viewport em padding e borda (24*2 + 32*2 +
  // 1*2). No pior caso que o site atende, 320px, sobram 206px para os 150px do
  // compact — uma folga de 28px por lado. Quem aumentar esses paddings come a
  // folga e devolve o widget para fora do cartão, então os números ficam
  // travados aqui junto da conta que os justifica.
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
