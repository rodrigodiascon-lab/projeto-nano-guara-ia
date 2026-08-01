import { describe, expect, it } from "vitest";
import { renderLeadEmail } from "../src/email";

describe("renderLeadEmail", () => {
  it("não inclui whatsapp nem o texto da dor (minimização LGPD)", () => {
    const { text } = renderLeadEmail({ id: 7, nome: "Ana Prado", profissao: "Psicóloga" });
    expect(text).toContain("#7");
    expect(text).toContain("Ana Prado");
    expect(text).not.toMatch(/\d{4,}/); // nenhum telefone
  });

  it("neutraliza quebras de linha e controles vindos do lead", () => {
    const { subject, text } = renderLeadEmail({
      id: 1, nome: "Ana\r\nBcc: alvo@x.com", profissao: "Dentista",
    });
    expect(subject).not.toMatch(/[\r\n]/);
    expect(text).not.toMatch(/\r/);
  });

  it("não emite campo html", () => {
    expect(renderLeadEmail({ id: 1, nome: "X", profissao: "Y" })).not.toHaveProperty("html");
  });
});
