/**
 * Identificador do texto de autorização exibido no formulário (index.html,
 * label do checkbox #consent). MUDE ISTO junto com o texto: é o que permite
 * provar, depois, a que exatamente cada titular consentiu.
 */
export const VERSAO_CONSENTIMENTO = "2026-08-01-contato";

export type LeadInput = {
  nome: string;
  profissao: string;
  whatsapp: string;
  dor: string;
  origem: string;
  /** Valor que o titular de fato enviou, nunca uma constante do servidor. */
  consentimento: boolean;
  consentimentoVersao: string;
  /** Código "GB-XXXXXX" do SDR Guarabot; só a página de barbearias recebe, as outras origens mandam null. */
  codigoSdr?: string | null;
};

/** Crockford base32: sem I, L, O e U, que se confundem ao digitar. */
const ALFABETO_SDR = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * Código que o titular manda pelo WhatsApp para o SDR ligar a conversa ao
 * cadastro. 6 símbolos de 32 (30 bits) sorteados pelo gerador criptográfico;
 * cada byte & 31 cai em 0..31 sem viés, porque 256 é múltiplo de 32. Não é
 * segredo (a pessoa o envia por mensagem), mas não pode ser sequencial nem
 * adivinhável a partir do id.
 */
export function gerarCodigoSdr(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let c = "";
  for (const b of bytes) c += ALFABETO_SDR[b & 31];
  return `GB-${c}`;
}

/** O código já existe no D1 (índice único parcial da migration 0004). */
export function ehColisaoCodigoSdr(e: unknown): boolean {
  return /UNIQUE constraint failed: leads\.codigo_sdr/.test(String(e));
}

/** Retenção declarada na política de privacidade (privacidade.html). */
export const MESES_RETENCAO = 12;

/**
 * Apaga os leads cujo prazo de retenção venceu. Chamado pelo handler scheduled
 * em index.ts. Devolve quantas linhas saíram, para o log de auditoria: se a
 * ANPD ou um titular perguntar, o registro do expurgo é a prova de que o prazo
 * declarado é cumprido de fato.
 */
export async function expurgaLeadsVencidos(db: D1Database): Promise<number> {
  const r = await db
    .prepare(`DELETE FROM leads WHERE criado_em < datetime('now', '-${MESES_RETENCAO} months')`)
    .run();
  return Number(r.meta.changes ?? 0);
}

export async function insertLead(db: D1Database, lead: LeadInput): Promise<number> {
  // consentimento vai por bind, não como literal 1: a camada de persistência
  // não pode afirmar um consentimento que ela não observou.
  const r = await db
    .prepare(
      "INSERT INTO leads (nome, profissao, whatsapp, dor, origem, consentimento, consentimento_versao, codigo_sdr) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      lead.nome,
      lead.profissao,
      lead.whatsapp,
      lead.dor,
      lead.origem,
      lead.consentimento ? 1 : 0,
      lead.consentimentoVersao,
      lead.codigoSdr ?? null
    )
    .run();
  return Number(r.meta.last_row_id);
}
