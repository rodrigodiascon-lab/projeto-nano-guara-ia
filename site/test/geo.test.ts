import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";
// Mesma justificativa de test/headers.test.ts: o runtime workerd do
// vitest-pool-workers não expõe filesystem real, então _headers e
// index.html são lidos em tempo de build via import bruto do Vite.
import h from "../public/_headers?raw";
import indexHtml from "../public/index.html?raw";

describe("robots.txt", () => {
  it("responde 200 e permite tudo, apontando pro sitemap", async () => {
    const res = await SELF.fetch("https://site.local/robots.txt");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("Allow: /");
    expect(body).toContain("Sitemap: https://nanoguara.ia.br/sitemap.xml");
    expect(body).not.toContain("Disallow: /");
  });
});

describe("sitemap.xml", () => {
  it("responde 200 e lista a home", async () => {
    const res = await SELF.fetch("https://site.local/sitemap.xml");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("<loc>https://nanoguara.ia.br/</loc>");
  });
});

describe("schema.json", () => {
  it("responde 200 como application/ld+json e é JSON válido", async () => {
    const res = await SELF.fetch("https://site.local/schema.json");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/ld+json");
    const body = await res.text();
    expect(() => JSON.parse(body)).not.toThrow();
  });

  it("tem @type ProfessionalService no grafo", async () => {
    const res = await SELF.fetch("https://site.local/schema.json");
    const data = (await res.json()) as { "@graph": Array<{ "@type": string }> };
    const tipos = data["@graph"].map((n) => n["@type"]);
    expect(tipos).toContain("ProfessionalService");
  });

  // Guarda contra prova social inventada: o site não tem cliente, nota ou
  // depoimento no MVP, então esses campos não podem aparecer no schema,
  // hoje ou em qualquer edição futura.
  it("não contém aggregateRating nem review, mesmo que alguém adicione depois", async () => {
    const res = await SELF.fetch("https://site.local/schema.json");
    const body = await res.text();
    expect(body).not.toContain("aggregateRating");
    expect(body).not.toContain("review");
  });
});

describe("index.html embute o JSON-LD na própria página", () => {
  // O Google só lê dados estruturados dentro do documento. Entregue por
  // <link rel="alternate"> o schema era ignorado, e o trabalho de GEO não
  // chegava a lugar nenhum. Um <script> de tipo não executável é bloco de
  // dados, então a CSP script-src 'self' não o bloqueia.
  const bloco = indexHtml.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
  );

  it("tem um <script type=application/ld+json> inline", () => {
    expect(bloco).not.toBeNull();
  });

  it("o conteúdo inline é JSON válido com ProfessionalService e WebSite", () => {
    const dados = JSON.parse(bloco![1]);
    const tipos = dados["@graph"].map((n: { "@type": string }) => n["@type"]);
    expect(tipos).toContain("ProfessionalService");
    expect(tipos).toContain("WebSite");
  });

  it("não reintroduz prova social inventada", () => {
    expect(bloco![1]).not.toContain("aggregateRating");
    expect(bloco![1]).not.toContain("review");
  });

  it("não voltou a depender do <link rel=alternate>, que o Google não lê", () => {
    expect(indexHtml).not.toContain('type="application/ld+json" href="/schema.json"');
  });
});

describe("conteúdo citável servido sem JS (o mesmo que um crawler de IA vê)", () => {
  it("a home, como servida, contém as respostas de o que a agência faz, pra quem, como começa e onde atua", async () => {
    const res = await SELF.fetch("https://site.local/");
    expect(res.status).toBe(200);
    const body = await res.text();

    // O que a agência faz.
    expect(body).toContain("Sua agenda cheia, sem você parar pra responder mensagem.");
    expect(body).toContain("O assistente é a porta de entrada. A agência cuida do resto.");

    // Pra quem.
    expect(body).toContain("Feita para quem vive de agenda e atende o próprio WhatsApp");
    expect(body).toContain("Médicos");

    // Como começa.
    expect(body).toContain("A gente entra junto, configura junto e acompanha com você.");
    expect(body).toContain("Diagnóstico");

    // Onde atua (país; ver ressalva de cidade no relatório da task).
    expect(body).toContain("Agência brasileira de IA para profissionais liberais.");

    // Os dois números verificados continuam com a fonte ao lado.
    expect(body).toContain("Fonte: Opinion Box, 2025");
    expect(body).toContain("Fonte: Panorama das Clínicas e Hospitais 2025, Doctoralia e Feegow");
  });
});

describe("CSP", () => {
  it("continua sem unsafe-inline mesmo com os novos arquivos públicos", () => {
    expect(h).toContain("style-src 'self'");
    expect(h).not.toContain("unsafe-inline");
  });
});
