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
};

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
      "INSERT INTO leads (nome, profissao, whatsapp, dor, origem, consentimento, consentimento_versao) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      lead.nome,
      lead.profissao,
      lead.whatsapp,
      lead.dor,
      lead.origem,
      lead.consentimento ? 1 : 0,
      lead.consentimentoVersao
    )
    .run();
  return Number(r.meta.last_row_id);
}
