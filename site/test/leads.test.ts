import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { insertLead } from "../src/leads";

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
