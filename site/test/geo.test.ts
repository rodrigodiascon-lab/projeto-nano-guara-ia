import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";
// Mesma justificativa de test/headers.test.ts: o runtime workerd do
// vitest-pool-workers não expõe filesystem real, então _headers e
// index.html são lidos em tempo de build via import bruto do Vite.
import h from "../public/_headers?raw";
import indexHtml from "../public/index.html?raw";
import clinicasHtml from "../public/servicos/sites-para-clinicas-de-estetica-em-manaus.html?raw";

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

  // Os dois já divergiram uma vez: o schema embutido foi repositionado para
  // clínicas e o schema.json continuou dizendo "profissionais liberais".
  // Como os dois descrevem a mesma organização, a divergência é o bug.
  it("descreve a organização igual ao schema.json servido", async () => {
    const embutido = JSON.parse(bloco![1])["@graph"]
      .find((n: { "@type": string }) => n["@type"] === "ProfessionalService");
    const servido = ((await (await SELF.fetch("https://site.local/schema.json")).json()) as {
      "@graph": Array<Record<string, unknown>>;
    })["@graph"].find((n) => n["@type"] === "ProfessionalService")!;

    for (const campo of ["name", "description", "url", "telephone"]) {
      expect(servido[campo], `campo ${campo} divergiu`).toEqual(embutido[campo]);
    }
    expect(servido.areaServed).toEqual(embutido.areaServed);
  });
});

describe("conteúdo citável servido sem JS (o mesmo que um crawler de IA vê)", () => {
  it("a home, como servida, contém as respostas de o que a agência faz, pra quem, como começa e onde atua", async () => {
    const res = await SELF.fetch("https://site.local/");
    expect(res.status).toBe(200);
    const body = await res.text();

    // O que a agência faz: as duas ofertas, com o mesmo peso.
    expect(body).toContain("O site traz a paciente. A IA responde, agenda e confirma.");
    expect(body).toContain("Peça 1: um site que a paciente acha antes de achar a concorrente.");
    expect(body).toContain("Peça 2: uma IA que responde de verdade.");

    // Pra quem.
    expect(body).toContain("Feita para clínicas e consultórios que vivem de agenda");
    expect(body).toContain("Odontologia");

    // Como começa.
    expect(body).toContain("A gente entra junto, configura junto e acompanha com você.");
    expect(body).toContain("Diagnóstico");

    // Onde atua: cidade e estado, não só país.
    expect(body).toContain("Agência brasileira de IA para clínicas e consultórios.");
    expect(body).toContain("De Manaus, Amazonas, atendendo todo o Brasil.");

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

describe("llms.txt", () => {
  it("responde 200 em text/plain com charset utf-8", async () => {
    const res = await SELF.fetch("https://site.local/llms.txt");
    expect(res.status).toBe(200);
    // Sem charset o arquivo é servido como US-ASCII e "guará" chega quebrado
    // justamente no arquivo que existe pra ensinar a grafia da marca às IAs.
    expect(res.headers.get("Content-Type")).toContain("charset=utf-8");
  });

  it("entrega o acento da marca intacto", async () => {
    const res = await SELF.fetch("https://site.local/llms.txt");
    const body = await res.text();
    expect(body).toContain("nanoguará.ia");
    expect(body).toContain("Manaus");
  });

  // O nome vem de guaraná, o FRUTO, e não do pássaro guará (íbis-escarlate).
  // A primeira versão destes arquivos afirmou "ave amazônica" e foi ao ar
  // assim. Como o propósito deles é justamente ensinar a marca às IAs, um
  // erro aqui se propaga para fora do site. Ver README.md na raiz.
  it("explica a origem do nome sem trocar o fruto pelo pássaro", async () => {
    for (const url of ["https://site.local/llms.txt", "https://site.local/llms-full.txt"]) {
      // Os asteriscos de ênfase do markdown caem fora antes da comparação:
      // sem isso o teste quebra por "**não** do" e não pelo fato em si.
      const body = (await (await SELF.fetch(url)).text()).replace(/\*/g, "");
      expect(body, `${url} não explica a origem`).toContain("guaraná");
      expect(body, `${url} não descarta o pássaro`).toMatch(/não\s+(vem\s+)?do pássaro guará/);
      expect(body, `${url} ainda chama a marca de ave`).not.toMatch(/guará[,\s].{0,20}ave amazônica/);
    }
  });

  it("a versão completa também responde e declara a sede", async () => {
    const res = await SELF.fetch("https://site.local/llms-full.txt");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("Manaus, Amazonas");
  });

  // Mesma guarda do schema: o site não tem depoimento nem nota, e um arquivo
  // escrito pra ser copiado por IA é o lugar mais fácil de vazar prova social
  // inventada sem ninguém perceber.
  it("não afirma cliente, nota ou depoimento inventado", async () => {
    for (const url of ["https://site.local/llms.txt", "https://site.local/llms-full.txt"]) {
      const body = await (await SELF.fetch(url)).text();
      expect(body).not.toMatch(/depoimento de|nota m[ée]dia|avaliaç[ãa]o de \d/i);
    }
    // O case que é modelo tem que continuar rotulado como modelo.
    const full = await (await SELF.fetch("https://site.local/llms-full.txt")).text();
    expect(full).toContain("não é cliente real");
  });
});

describe("página de serviço: sites para clínica de estética", () => {
  it("responde 200 na URL sem extensão", async () => {
    const res = await SELF.fetch(
      "https://site.local/servicos/sites-para-clinicas-de-estetica-em-manaus"
    );
    expect(res.status).toBe(200);
  });

  it("está no sitemap junto da home", async () => {
    const body = await (await SELF.fetch("https://site.local/sitemap.xml")).text();
    expect(body).toContain(
      "<loc>https://nanoguara.ia.br/servicos/sites-para-clinicas-de-estetica-em-manaus</loc>"
    );
  });

  it("a home aponta pra ela, senão a página nasce órfã", () => {
    expect(indexHtml).toContain('href="/servicos/sites-para-clinicas-de-estetica-em-manaus"');
  });

  const bloco = clinicasHtml.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
  );

  it("tem JSON-LD válido com Service, FAQPage e BreadcrumbList", () => {
    expect(bloco).not.toBeNull();
    const dados = JSON.parse(bloco![1]);
    const tipos = dados["@graph"].map((n: { "@type": string }) => n["@type"]);
    expect(tipos).toContain("Service");
    expect(tipos).toContain("FAQPage");
    expect(tipos).toContain("BreadcrumbList");
  });

  it("não reintroduz prova social inventada", () => {
    expect(bloco![1]).not.toContain("aggregateRating");
    expect(bloco![1]).not.toContain("review");
  });

  // O Google trata como violação o FAQPage cujas perguntas o visitante não
  // acha na página. Cada pergunta do schema tem que existir no HTML visível.
  it("toda pergunta do FAQPage aparece visível no corpo da página", () => {
    const dados = JSON.parse(bloco![1]);
    const faq = dados["@graph"].find((n: { "@type": string }) => n["@type"] === "FAQPage");
    const corpo = clinicasHtml.split("</head>")[1];
    for (const q of faq.mainEntity) {
      expect(corpo).toContain(q.name);
    }
  });

  // .reveal nasce com opacity:0 e só o app.js devolve a visibilidade. Uma
  // página de serviço que use .reveal sem carregar o app.js sai invisível —
  // foi exatamente o que quase aconteceu quando esta página foi escrita.
  // O CSS vem pelo Worker, e não por import ?raw: o Vite processa .css e
  // devolve string vazia no import bruto, o que faria o teste passar sozinho
  // sem nunca checar a regra que ele existe pra proteger.
  it("não usa .reveal, porque não carrega o app.js que a desliga", async () => {
    const css = await (await SELF.fetch("https://site.local/styles.css")).text();
    expect(css).toContain(".reveal{opacity:0");
    expect(clinicasHtml).not.toContain("app.js");
    expect(clinicasHtml).not.toContain("reveal");
  });

  it("carrega a cidade no title e na descrição, que é a busca que dá pra ganhar", () => {
    expect(clinicasHtml).toContain("<title>Site para clínica de estética em Manaus");
    const desc = clinicasHtml.match(/<meta name="description" content="([^"]+)"/);
    expect(desc![1]).toContain("Manaus");
  });
});

describe("cobertura da analytics", () => {
  // O beacon estava só na home: /portfolio e /privacidade não contavam visita
  // nenhuma, e o relatório parecia dizer que ninguém entrava nelas.
  it("todas as páginas HTML públicas carregam o beacon", async () => {
    for (const url of [
      "https://site.local/",
      "https://site.local/portfolio",
      "https://site.local/privacidade",
      "https://site.local/servicos/sites-para-clinicas-de-estetica-em-manaus",
    ]) {
      const body = await (await SELF.fetch(url)).text();
      expect(body, `sem beacon em ${url}`).toContain("static.cloudflareinsights.com/beacon.min.js");
    }
  });
});
