import { describe, expect, it } from "vitest";
import { renderLeadEmail } from "../src/email";

// 18:55 UTC = 14:55 em Manaus (UTC-4, sem horário de verão).
const QUANDO = new Date("2026-09-15T18:55:00Z");

const QUIZ = {
  id: 2,
  nome: "rdp",
  profissao: "Medicina",
  whatsapp: "92981486875",
  dor: "Segmento: Medicina | Equipe de agendamento: 1 a 3 atendentes | Conversas/mês no WhatsApp: 301 a 1.000 | Integrar sistema de gestão: Sim (Feegow)",
  origem: "iaparaconsultorios",
  recebidoEm: QUANDO,
};

const HOME = {
  id: 7,
  nome: "Ana Prado",
  profissao: "Psicóloga",
  whatsapp: "+5592988887777",
  dor: "paciente com depressão grave não responde",
  origem: "form",
  recebidoEm: QUANDO,
};

describe("renderLeadEmail", () => {
  it("lead do quiz: página, horário de Manaus, WhatsApp clicável e uma resposta por linha", () => {
    const { subject, text } = renderLeadEmail(QUIZ);
    expect(subject).toBe("Novo lead do quiz guara.bot: rdp (Medicina)");
    expect(text).toContain("Recebido em 15/09/2026 14:55 (Manaus)");
    expect(text).toContain("WhatsApp: (92) 98148-6875");
    expect(text).toContain("Responder agora: https://wa.me/5592981486875");
    expect(text).toMatch(/^Equipe de agendamento: 1 a 3 atendentes$/m);
    expect(text).toMatch(/^Integrar sistema de gestão: Sim \(Feegow\)$/m);
  });

  // O texto livre da home pode trazer dado de saúde (art. 11 LGPD) e não sai
  // do banco. As respostas do quiz são sobre a clínica, não sobre pacientes.
  it("lead da home: nunca copia o texto livre para o email", () => {
    const { text } = renderLeadEmail(HOME);
    expect(text).not.toContain("depressão");
    expect(text).toContain("Profissão: Psicóloga");
    expect(text).toContain("https://wa.me/5592988887777");
    expect(text).toMatch(/fica só no banco de leads/);
  });

  it("número sem DDI ganha o 55 no link", () => {
    const { text } = renderLeadEmail({ ...QUIZ, whatsapp: "9298148-6875" });
    expect(text).toContain("https://wa.me/5592981486875");
  });

  it("neutraliza quebras de linha e controles vindos do lead", () => {
    const { subject, text } = renderLeadEmail({
      ...QUIZ,
      nome: "Ana\r\nBcc: alvo@x.com",
      dor: "Segmento: X\r\nBcc: alvo@x.com | Equipe de agendamento: Y",
    });
    expect(subject).not.toMatch(/[\r\n]/);
    expect(text).not.toMatch(/\r/);
    expect(text).not.toMatch(/^Bcc:/m);
  });

  it("o link do WhatsApp só leva dígitos", () => {
    const { text } = renderLeadEmail({ ...QUIZ, whatsapp: "92 98148-6875?text=golpe" });
    expect(text).toMatch(/https:\/\/wa\.me\/\d+$/m);
  });

  it("não emite campo html", () => {
    expect(renderLeadEmail(QUIZ)).not.toHaveProperty("html");
  });
});
