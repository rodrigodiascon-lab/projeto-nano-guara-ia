/** Remove quebras de linha e caracteres de controle (anti header-injection). */
export function limpo(s: string): string {
  return s.replace(/[\r\n\t\x00-\x1f]/g, " ").trim();
}

/**
 * Notificação MINIMIZADA: só id, nome e profissão.
 * WhatsApp e o texto da "dor" (que pode conter dado sensível de saúde,
 * art. 11 LGPD) ficam no D1 e são consultados por quem tem acesso ao banco.
 * Sem campo `html` — notificação interna em texto puro elimina a classe
 * inteira de injeção de HTML/phishing pela caixa de entrada.
 */
export function renderLeadEmail(dados: { id: number; nome: string; profissao: string }): {
  subject: string;
  text: string;
} {
  const nome = limpo(dados.nome);
  const profissao = limpo(dados.profissao);
  return {
    subject: `Novo lead nanoguará.ia #${dados.id}: ${nome}`,
    text: [
      `Novo lead #${dados.id}`,
      `Nome: ${nome}`,
      `Profissão: ${profissao}`,
      "",
      "Contato e mensagem completa estão no banco de leads (D1):",
      `  wrangler d1 execute nanoguara-leads --remote --command "SELECT * FROM leads WHERE id = ${dados.id}"`,
    ].join("\n"),
  };
}
