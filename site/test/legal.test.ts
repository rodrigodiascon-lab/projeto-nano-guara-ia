import { describe, expect, it } from "vitest";
// Mesma justificativa de test/geo.test.ts: o runtime workerd do
// vitest-pool-workers não expõe filesystem real, então o HTML é lido em tempo
// de build via import bruto do Vite.
import indexHtml from "../public/index.html?raw";
import portfolioHtml from "../public/portfolio.html?raw";
import privacidadeHtml from "../public/privacidade.html?raw";
import clinicasHtml from "../public/servicos/sites-para-clinicas-de-estetica-em-manaus.html?raw";
import consultoriosHtml from "../public/iaparaconsultorios.html?raw";
import barbeariasHtml from "../public/guarabot/barbearias.html?raw";
import clinicasLandingHtml from "../public/guarabot/clinicas.html?raw";
import oftalmologiaHtml from "../public/guarabot/oftalmologia.html?raw";

const RAZAO_SOCIAL = "R D Pimentel Serviços";
const CNPJ = "21.091.816/0001-48";

// As páginas HTML públicas repetem o mesmo rodapé na mão. Toda guarda de
// rodapé vale para todas, senão a próxima edição conserta uma e esquece as outras.
const PAGINAS = {
  "index.html": indexHtml,
  "portfolio.html": portfolioHtml,
  "privacidade.html": privacidadeHtml,
  "servicos/sites-para-clinicas-de-estetica-em-manaus.html": clinicasHtml,
  "iaparaconsultorios.html": consultoriosHtml,
  "guarabot/barbearias.html": barbeariasHtml,
  "guarabot/clinicas.html": clinicasLandingHtml,
  "guarabot/oftalmologia.html": oftalmologiaHtml,
};

/**
 * Identificação da pessoa jurídica no rodapé. Por decisão do dono do projeto
 * entra só razão social, cidade/UF e CNPJ — endereço não.
 */
describe("identificação legal no rodapé", () => {
  for (const [pagina, html] of Object.entries(PAGINAS)) {
    it(`${pagina} declara a empresa, a praça e o CNPJ`, () => {
      const legal = html.match(/<div class="legal">([\s\S]*?)<\/div>/);
      expect(legal, "o bloco .legal sumiu").not.toBeNull();
      expect(legal![1]).toContain(RAZAO_SOCIAL);
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

/**
 * A política de privacidade descrevia bem o tratamento — que dado entra, com
 * que base legal, por quanto tempo — mas em nenhum momento dizia QUEM trata.
 * A LGPD pede o controlador identificado e um canal de contato para o titular
 * (art. 9º, I e III), e "a nanoguará.ia" é nome comercial, não pessoa jurídica.
 * Sem isso, o titular não tem contra quem exercer os direitos que a própria
 * política lista.
 */
describe("a política de privacidade identifica o controlador", () => {
  const secao = privacidadeHtml.match(/<div id="controlador">([\s\S]*?)<\/div>/);

  it("existe uma seção de controlador ancorável", () => {
    expect(secao, 'o <div id="controlador"> sumiu da privacidade.html').not.toBeNull();
  });

  it("nomeia a pessoa jurídica, o CNPJ e a praça", () => {
    expect(secao![1], "a razão social sumiu").toContain(RAZAO_SOCIAL);
    expect(secao![1], "o CNPJ sumiu").toContain(CNPJ);
    expect(secao![1], "a praça sumiu").toMatch(/Manaus/);
  });

  it("diz, com essa palavra, que é a controladora dos dados", () => {
    expect(secao![1]).toMatch(/controladora dos dados/);
  });

  // Direito listado sem canal para exercê-lo é letra morta. O canal é o
  // WhatsApp porque é o único que o projeto realmente tem — não há e-mail de
  // contato em lugar nenhum do site. Se um dia houver, troque aqui também.
  it("oferece um canal de contato que existe de verdade", () => {
    expect(secao![1], "o canal de contato do titular sumiu")
      .toContain("wa.me/5592981486875");
  });

  it("a seção de direitos aponta para esse canal, em vez de repetir outro", () => {
    const direitos = privacidadeHtml.match(
      /<h2>Seus direitos como titular dos dados<\/h2>([\s\S]*?)<\/div>/
    );
    expect(direitos, "a seção de direitos sumiu").not.toBeNull();
    expect(direitos![1]).toContain('href="#controlador"');
  });

  // Os dois números descrevem a mesma empresa em lugares diferentes da mesma
  // página; divergirem é o bug. Já aconteceu uma vez neste repo com o schema
  // embutido contra o schema.json (ver geo.test.ts).
  it("o CNPJ da política bate com o do rodapé da mesma página", () => {
    const rodape = privacidadeHtml.match(/<div class="legal">([\s\S]*?)<\/div>/)![1];
    const naPolitica = secao![1].match(/[\d.]{10,}\/\d{4}-\d{2}/)?.[0];
    const noRodape = rodape.match(/[\d.]{10,}\/\d{4}-\d{2}/)?.[0];
    expect(naPolitica, "a política e o rodapé divergiram no CNPJ").toBe(noRodape);
  });

  /**
   * O art. 41 da LGPD manda indicar encarregado. O art. 11 da Resolução
   * CD/ANPD nº 2/2022 dispensa agentes de tratamento de pequeno porte dessa
   * indicação — mas o § 1º cobra, em troca, um canal de comunicação com o
   * titular. Rodrigo optou por invocar a dispensa em 2026-08-10; o
   * enquadramento é declaração dele sobre a própria operação, não algo
   * verificável a partir do repositório.
   *
   * O ponto frágil é a troca: quem remover o canal de contato derruba a
   * contrapartida e deixa a página invocando uma dispensa que ela deixou de
   * cumprir. Os dois são checados juntos, por isso.
   */
  const dispensa = privacidadeHtml.match(/<div id="encarregado">([\s\S]*?)<\/div>/);

  it("declara o enquadramento e a dispensa com a base normativa certa", () => {
    expect(dispensa, 'a seção <div id="encarregado"> sumiu').not.toBeNull();
    expect(dispensa![1], "sumiu o enquadramento como pequeno porte")
      .toMatch(/agente de tratamento de pequeno porte/);
    expect(dispensa![1], "sumiu a resolução que embasa a dispensa")
      .toMatch(/Resolução CD\/ANPD nº 2/);
    expect(dispensa![1], "sumiu o art. 11, que é o que dispensa a indicação")
      .toMatch(/art\. 11/);
  });

  // Cuidado com o escopo: procurar o wa.me no documento inteiro não serve de
  // guarda nenhuma, porque o botão do WhatsApp na navbar casa com o mesmo
  // padrão e faz o teste passar mesmo com o canal do titular removido. A
  // primeira versão desta asserção tinha esse furo e passou batida no ensaio
  // de remoção. O que precisa valer é a corrente inteira: a seção da dispensa
  // aponta para a do controlador, e é lá que o canal tem que estar.
  it("mantém a contrapartida do § 1º: sem encarregado, tem que haver canal", () => {
    expect(dispensa![1], "a dispensa deixou de apontar para onde está o canal")
      .toContain('href="#controlador"');
    expect(secao![1], "a dispensa foi invocada mas o canal do titular sumiu da seção do controlador — o art. 11, § 1º cobra o canal em troca")
      .toContain("wa.me/5592981486875");
  });

  // Editar o texto de uma política datada sem mexer na data deixa publicado um
  // documento que mente sobre a própria vigência.
  it("a data de atualização acompanhou a última edição do texto", () => {
    const data = privacidadeHtml.match(/Última atualização: ([^<.]+)/)?.[1];
    expect(data, "o carimbo de atualização sumiu").toBeTruthy();
    expect(data, "a data ficou para trás da edição que incluiu o formulário da landing de barbearias")
      .toBe("8 de outubro de 2026");
  });
});
