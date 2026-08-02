export type LeadInput = {
  nome: string;
  profissao: string;
  whatsapp: string;
  dor: string;
  origem: string;
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
  const r = await db
    .prepare(
      "INSERT INTO leads (nome, profissao, whatsapp, dor, origem, consentimento) VALUES (?, ?, ?, ?, ?, 1)"
    )
    .bind(lead.nome, lead.profissao, lead.whatsapp, lead.dor, lead.origem)
    .run();
  return Number(r.meta.last_row_id);
}
