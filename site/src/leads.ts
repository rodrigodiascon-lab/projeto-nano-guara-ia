export type LeadInput = {
  nome: string;
  profissao: string;
  whatsapp: string;
  dor: string;
  origem: string;
};

export async function insertLead(db: D1Database, lead: LeadInput): Promise<number> {
  const r = await db
    .prepare(
      "INSERT INTO leads (nome, profissao, whatsapp, dor, origem, consentimento) VALUES (?, ?, ?, ?, ?, 1)"
    )
    .bind(lead.nome, lead.profissao, lead.whatsapp, lead.dor, lead.origem)
    .run();
  return Number(r.meta.last_row_id);
}
