import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";
// Mesma justificativa de test/geo.test.ts: HTML entra por import bruto do Vite;
// o JS vem pelo Worker, servido como asset de verdade.
import h from "../public/_headers?raw";
import indexHtml from "../public/index.html?raw";
import portfolioHtml from "../public/portfolio.html?raw";
import privacidadeHtml from "../public/privacidade.html?raw";
import clinicasHtml from "../public/servicos/sites-para-clinicas-de-estetica-em-manaus.html?raw";

const PAGINAS = {
  "index.html": indexHtml,
  "portfolio.html": portfolioHtml,
  "privacidade.html": privacidadeHtml,
  "servicos/sites-para-clinicas-de-estetica-em-manaus.html": clinicasHtml,
};

const js = async () => (await SELF.fetch("https://site.local/consentimento.js")).text();

/**
 * Pixel da Meta só depois do consentimento (LGPD, art. 7º, I). O
 * comportamento no navegador é medido em test-e2e/consentimento.spec.ts; aqui
 * ficam as guardas que falham em qualquer edição que fure a regra pelo HTML.
 */
describe("pixel da Meta atrás do consentimento", () => {
  for (const [pagina, html] of Object.entries(PAGINAS)) {
    // O snippet oficial da Meta é inline e carrega o pixel no load. Se alguém
    // colar ele numa página, o pixel passa a rodar antes de qualquer escolha.
    it(`${pagina} não carrega nada da Meta direto no HTML`, () => {
      expect(html).not.toContain("connect.facebook.net");
      expect(html).not.toContain("fbq(");
      expect(html).not.toContain("facebook.com/tr");
    });

    it(`${pagina} carrega o consentimento.js e oferece as preferências no rodapé`, () => {
      expect(html).toContain('<script src="/consentimento.js" defer></script>');
      const rodape = html.match(/<footer[\s\S]*?<\/footer>/)![0];
      expect(rodape).toMatch(/<li data-preferencias-cookies hidden><button type="button" class="link-cookies">Preferências de cookies<\/button><\/li>/);
    });
  }

  it("o consentimento.js é servido", async () => {
    const res = await SELF.fetch("https://site.local/consentimento.js");
    expect(res.status).toBe(200);
  });

  // Advanced matching é o que mandaria e-mail/telefone (em hash) para a Meta.
  // O init só pode receber o ID, e o autoConfig desligado impede o pixel de
  // ler campos e botões da página sozinho.
  it("inicia o pixel sem advanced matching e sem autoConfig", async () => {
    const s = await js();
    expect(s).toMatch(/fbq\('init', PIXEL_ID\);/);
    expect(s).not.toMatch(/fbq\('init', PIXEL_ID,/);
    expect(s).toContain("fbq('set', 'autoConfig', false, PIXEL_ID)");
  });

  it("o evento Lead sai sem parâmetro nenhum", async () => {
    const s = await js();
    expect(s).toContain("window.fbq('track', 'Lead');");
    expect(s).not.toMatch(/track', 'Lead',/);
  });

  it("o clique no WhatsApp vira Contact sem parâmetro nenhum", async () => {
    const s = await js();
    expect(s).toContain("window.fbq('track', 'Contact');");
    expect(s).not.toMatch(/track', 'Contact',/);
  });

  for (const landing of ["barbearias", "clinicas"]) {
    it(`a landing do guara.bot para ${landing} carrega o consentimento, não o pixel direto`, async () => {
      const html = await (await SELF.fetch(`https://site.local/guarabot/${landing}`)).text();
      expect(html).toContain('<script src="/consentimento.js" defer></script>');
      expect(html).not.toContain("connect.facebook.net");
      expect(html).toContain("data-preferencias-cookies");
    });
  }

  it("o quiz /iaparaconsultorios carrega o consentimento e avisa o Lead sem dado do quiz", async () => {
    const html = await (await SELF.fetch("https://site.local/iaparaconsultorios")).text();
    expect(html).toContain('<script src="/consentimento.js" defer></script>');
    expect(html).not.toContain("connect.facebook.net");
    expect(html).toContain("data-preferencias-cookies");
    const app = await (await SELF.fetch("https://site.local/app-iaparaconsultorios.js")).text();
    expect(app).toContain("document.dispatchEvent(new CustomEvent('ng:lead'));");
    expect(app).not.toContain("fbq");
  });

  it("o WhatsApp do rodapé não conta como Contact", async () => {
    const s = await js();
    expect(s).toContain("!a.closest('footer')");
  });

  it("o app.js avisa o envio do lead sem carregar dado do formulário", async () => {
    const app = await (await SELF.fetch("https://site.local/app.js")).text();
    expect(app).toContain("document.dispatchEvent(new CustomEvent('ng:lead'));");
    expect(app).not.toContain("fbq");
  });
});

describe("CSP libera só o necessário para o pixel", () => {
  const csp = h.match(/Content-Security-Policy: (.*)/)![1];
  const diretiva = (nome: string) => csp.split(";").map((d) => d.trim()).find((d) => d.startsWith(nome + " "))!;

  it("script-src libera o fbevents.js", () =>
    expect(diretiva("script-src")).toContain("https://connect.facebook.net"));
  it("img-src e connect-src liberam o envio de eventos", () => {
    expect(diretiva("img-src")).toContain("https://www.facebook.com");
    expect(diretiva("connect-src")).toContain("https://www.facebook.com");
  });
  it("continua sem unsafe-inline e sem curinga de domínio", () => {
    expect(csp).not.toContain("unsafe-inline");
    expect(csp).not.toMatch(/\*\.facebook/);
  });
});

describe("a política de privacidade cita a Meta", () => {
  const secao = privacidadeHtml.match(/<div id="cookies">([\s\S]*?)<\/div>/);

  it("tem a seção ancorável que o banner linka", () => {
    expect(secao, 'o <div id="cookies"> sumiu, e o "Saiba mais" do banner aponta para ele').not.toBeNull();
  });

  it("diz o que é, para que serve, o que vai e como revogar", () => {
    const t = secao![1];
    expect(t).toMatch(/pixel da Meta/);
    expect(t).toMatch(/somente se você aceitar/);
    expect(t).toMatch(/Para que serve/);
    expect(t).toMatch(/_fbp/);
    expect(t).toMatch(/art\. 33/);
    expect(t).toMatch(/Preferências de cookies/);
  });

  it("não afirma mais que o site não usa cookies de rastreamento", () => {
    expect(privacidadeHtml).not.toContain("não usa cookies de rastreamento");
  });
});

// Regra de copy do projeto: nada de travessão em texto visível.
describe("sem travessão no texto novo", () => {
  it("banner", async () => {
    const textos = (await js()).match(/textContent = '[^']*'|append\(\s*'[^']*'/g) ?? [];
    expect(textos.length).toBeGreaterThan(0);
    for (const t of textos) expect(t).not.toMatch(/[—–]/);
  });
  it("política de privacidade", () => {
    const visivel = privacidadeHtml.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, "");
    expect(visivel).not.toMatch(/[—–]/);
  });
});
