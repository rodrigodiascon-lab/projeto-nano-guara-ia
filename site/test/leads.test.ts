import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { expurgaLeadsVencidos, insertLead, MESES_RETENCAO } from "../src/leads";

describe("leads", () => {
  it("insere lead e retorna id", async () => {
    const id = await insertLead(env.DB, {
      nome: "Camila Andrade", profissao: "Dentista",
      whatsapp: "+5592988887777", dor: "demoro pra responder", origem: "form",
    });
    expect(id).toBeGreaterThan(0);
    const row = await env.DB.prepare("SELECT nome, profissao FROM leads WHERE id = ?").bind(id).first();
    expect(row).toMatchObject({ nome: "Camila Andrade", profissao: "Dentista" });
  });

  it("aplica a migration real, com índice", async () => {
    const r = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_leads_criado_em'"
    ).first();
    expect(r).not.toBeNull();
  });
});

// A política de privacidade promete apagar os dados após 12 meses. Estes testes
// são o que impede a promessa de virar texto sem mecanismo por trás.
describe("expurgo por retenção", () => {
  async function insereCom(criadoEm: string): Promise<number> {
    const r = await env.DB.prepare(
      "INSERT INTO leads (nome, profissao, whatsapp, dor, origem, consentimento, criado_em) VALUES (?,?,?,?,?,1,?)"
    ).bind("Fulano", "Dentista", "+5592988887777", "", "form", criadoEm).run();
    return Number(r.meta.last_row_id);
  }

  it("apaga o que passou do prazo e preserva o que está dentro", async () => {
    const vencido = await insereCom("2020-01-01 00:00:00");
    const recente = await insertLead(env.DB, {
      nome: "Recente", profissao: "Médico(a)",
      whatsapp: "+5592988887777", dor: "", origem: "form",
    });

    const apagados = await expurgaLeadsVencidos(env.DB);
    expect(apagados).toBeGreaterThanOrEqual(1);

    const foi = await env.DB.prepare("SELECT id FROM leads WHERE id = ?").bind(vencido).first();
    const ficou = await env.DB.prepare("SELECT id FROM leads WHERE id = ?").bind(recente).first();
    expect(foi).toBeNull();
    expect(ficou).not.toBeNull();
  });

  it("não apaga um lead exatamente na véspera do vencimento", async () => {
    // 1 dia a menos que o prazo: tem que sobreviver. Protege contra alguém
    // trocar o sinal da comparação ou a unidade do intervalo.
    const id = await insereCom("2020-01-01 00:00:00");
    await env.DB.prepare(
      `UPDATE leads SET criado_em = datetime('now', '-${MESES_RETENCAO} months', '+1 day') WHERE id = ?`
    ).bind(id).run();

    await expurgaLeadsVencidos(env.DB);
    const ficou = await env.DB.prepare("SELECT id FROM leads WHERE id = ?").bind(id).first();
    expect(ficou).not.toBeNull();
  });

  it("devolve 0 quando não há nada vencido", async () => {
    await insertLead(env.DB, {
      nome: "Novo", profissao: "Dentista",
      whatsapp: "+5592988887777", dor: "", origem: "form",
    });
    expect(await expurgaLeadsVencidos(env.DB)).toBe(0);
  });
});
