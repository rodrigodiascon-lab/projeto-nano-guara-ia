// node scripts/indexnow.mjs [url...]  - avisa Bing/Yandex que URLs mudaram
//
// O IndexNow existe porque o Bing não tem "solicitar indexação" público como o
// Google: a alternativa seria conta no Webmaster Tools. Aqui a prova de posse é
// a chave hospedada no próprio domínio, então isto roda sem login nenhum.
//
// A chave é PÚBLICA por definição — quem conseguir lê-la só consegue pedir
// rastreamento das suas próprias páginas, que é justamente o que queremos.
// Trocar de chave é publicar outro arquivo e mudar a constante abaixo.

import { readdir } from "node:fs/promises";

const HOST = "nanoguara.ia.br";
const CHAVE = "ad9b6f6c7c03472eaf1a7998cac74d925dd00464";

const PADRAO = [
  `https://${HOST}/`,
  `https://${HOST}/servicos/sites-para-clinicas-de-estetica-em-manaus`,
  `https://${HOST}/portfolio`,
  `https://${HOST}/privacidade`,
];

// Falha cedo se o arquivo da chave saiu de public/: sem ele o IndexNow aceita o
// POST e descarta em silêncio na validação, e ninguém fica sabendo.
const arquivos = await readdir(new URL("../public/", import.meta.url));
if (!arquivos.includes(`${CHAVE}.txt`)) {
  console.error(`erro: public/${CHAVE}.txt não existe. Sem ele a chave não é validável.`);
  process.exit(1);
}

const urlList = process.argv.slice(2).length ? process.argv.slice(2) : PADRAO;
const corpo = JSON.stringify({
  host: HOST,
  key: CHAVE,
  keyLocation: `https://${HOST}/${CHAVE}.txt`,
  urlList,
});

let falhou = false;
for (const endpoint of ["https://api.indexnow.org/IndexNow", "https://www.bing.com/indexnow"]) {
  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: corpo,
    });
    // 200 = aceito, 202 = aceito com validação de chave pendente. Os dois servem.
    const ok = r.status === 200 || r.status === 202;
    console.log(`${ok ? "ok  " : "FALHA"} ${r.status} ${endpoint}`);
    if (!ok) {
      falhou = true;
      console.error("  resposta:", (await r.text()).slice(0, 200));
    }
  } catch (e) {
    falhou = true;
    console.error(`FALHA ${endpoint}: ${e}`);
  }
}
console.log(`${urlList.length} URL(s) enviada(s).`);
process.exit(falhou ? 1 : 0);
