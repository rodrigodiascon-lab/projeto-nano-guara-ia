/** Remove quebras de linha e caracteres de controle (anti header-injection). */
export function limpo(s: string): string {
  return s.replace(/[\r\n\t\x00-\x1f]/g, " ").trim();
}

const PAGINA: Record<string, string> = {
  iaparaconsultorios: "quiz guara.bot",
  "guarabot-barbearias": "landing guara.bot barbearias",
  "guarabot-clinicas": "landing guara.bot clínicas",
  "guarabot-oftalmologia": "landing guara.bot oftalmologia",
  form: "formulário da página inicial",
};

// Só no quiz o campo "dor" é montado pelo próprio site: respostas sobre a
// clínica separadas por " | ". Nas outras origens é texto livre do titular.
const ORIGEM_COM_RESPOSTAS = "iaparaconsultorios";

/** O /api/lead aceita número nacional (10 ou 11 dígitos); o wa.me exige DDI. */
function comDDI(whatsapp: string): string {
  const d = whatsapp.replace(/\D/g, "");
  return d.length <= 11 ? `55${d}` : d;
}

function formataFone(digitos: string): string {
  if (!digitos.startsWith("55")) return `+${digitos}`;
  const n = digitos.slice(2);
  if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `+${digitos}`;
}

/** Formato do código do SDR Guarabot (igual ao `gerarCodigoSdr` e ao validador do n8n). */
const CODIGO_SDR = /^GB-[0-9A-HJKMNP-TV-Z]{6}$/;

const HORA_MANAUS = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Manaus",
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
});

/**
 * Aviso interno de lead, feito para responder em um toque: WhatsApp com link,
 * página de origem e, no quiz, as respostas sobre a clínica.
 * O texto livre da home NUNCA vem para cá: pode conter dado de saúde (art. 11
 * LGPD) e fica só no D1, que tem expurgo de 12 meses. A cópia no Gmail está
 * declarada em privacidade.html.
 * Sem campo `html`: texto puro elimina a classe inteira de injeção de
 * HTML/phishing pela caixa de entrada.
 * Lead de barbearias (SDR Guarabot): traz o código e não traz link para chamar
 * o número digitado. Quem inicia a conversa é o titular, mandando o código no
 * WhatsApp da empresa (R9.4 do SDR).
 */
export function renderLeadEmail(dados: {
  id: number;
  nome: string;
  profissao: string;
  whatsapp: string;
  dor: string;
  origem: string;
  recebidoEm: Date;
  codigo?: string | null;
}): { subject: string; text: string } {
  const nome = limpo(dados.nome);
  const profissao = limpo(dados.profissao);
  const origem = limpo(dados.origem);
  const pagina = PAGINA[origem] ?? origem;
  const digitos = comDDI(dados.whatsapp);
  const ehSdr = origem === "guarabot-barbearias";
  const codigo = dados.codigo && CODIGO_SDR.test(dados.codigo) ? dados.codigo : null;
  const contato = ehSdr
    ? (codigo ? [`Código: ${codigo}`] : [])
    : [`Responder agora: https://wa.me/${digitos}`];
  const hora = HORA_MANAUS.format(dados.recebidoEm).replace(",", "");

  const detalhes = origem === ORIGEM_COM_RESPOSTAS
    ? limpo(dados.dor).split(" | ").map((s) => s.trim()).filter(Boolean)
    : [
        `Profissão: ${profissao}`,
        ...(dados.dor.trim()
          ? ["", "A mensagem que a pessoa escreveu fica só no banco de leads, porque pode ter dado de saúde."]
          : []),
      ];

  return {
    subject: `Novo lead do ${pagina}: ${nome} (${profissao})`,
    text: [
      `Novo lead #${dados.id} · ${pagina}`,
      `Recebido em ${hora} (Manaus)`,
      "",
      `Nome: ${nome}`,
      `WhatsApp: ${formataFone(digitos)}`,
      ...contato,
      "",
      ...detalhes,
    ].join("\n"),
  };
}
