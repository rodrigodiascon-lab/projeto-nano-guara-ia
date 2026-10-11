import { jsonSeguro, mesmaOrigem, lerCorpoLimitado } from "./http";

const LIMITE_BODY = 300;

/**
 * Etapas aceitas. A lista fechada impede que alguém encha a tabela com nomes
 * arbitrários: 1 a 6 são as telas do quiz, "envio" é o toque no botão final
 * depois da validação e "lead_ok" é o 201 do /api/lead.
 */
export const ETAPAS_QUIZ = new Set(["1", "2", "3", "4", "5", "6", "envio", "lead_ok"]);

/** utm_content dos anúncios (obj01, sur10, ps02...). Fora do padrão vira vazio. */
function utmValida(v: unknown): string {
  return typeof v === "string" && /^[a-z0-9_-]{1,30}$/.test(v) ? v : "";
}

/**
 * Soma 1 no contador do dia, etapa e anúncio. Sem linha por visitante, sem IP
 * e sem resposta do quiz: o registro só diz "mais uma pessoa chegou aqui".
 * O cliente usa sendBeacon e ignora a resposta; o 400 para etapa fora da lista
 * existe para o teste pegar regressão.
 */
export async function handleQuizEtapa(request: Request, env: Env): Promise<Response> {
  if (!mesmaOrigem(request)) return jsonSeguro({ ok: false, erro: "Origem não permitida" }, 403);

  const raw = await lerCorpoLimitado(request, LIMITE_BODY);
  if (raw === null) return jsonSeguro({ ok: false, erro: "Mensagem grande demais" }, 413);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("não é objeto");
    body = parsed as Record<string, unknown>;
  } catch {
    return jsonSeguro({ ok: false, erro: "JSON inválido" }, 400);
  }

  const etapa = typeof body.etapa === "string" ? body.etapa : "";
  if (!ETAPAS_QUIZ.has(etapa)) return jsonSeguro({ ok: false, erro: "Etapa inválida" }, 400);

  await env.DB.prepare(
    `INSERT INTO quiz_etapas (dia, etapa, utm_content, total)
     VALUES (date('now', '-4 hours'), ?1, ?2, 1)
     ON CONFLICT (dia, etapa, utm_content) DO UPDATE SET total = total + 1`
  ).bind(etapa, utmValida(body.utm)).run();

  return new Response(null, { status: 204 });
}
