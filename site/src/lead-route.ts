import { insertLead } from "./leads";
import { verifyTurnstile } from "./turnstile";
import { renderLeadEmail } from "./email";
import { jsonSeguro, mesmaOrigem } from "./http";

const LIMITE_BODY = 10_000;

function texto(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 && t.length <= max ? t : null;
}

/** Aceita "+" só como primeiro caractere; 10 a 13 dígitos. */
function normalizaWhatsapp(bruto: string): string | null {
  const limpo = bruto.replace(/[\s\-().]/g, "");
  return /^\+?\d{10,13}$/.test(limpo) ? limpo : null;
}

/**
 * Lê o corpo por stream e corta assim que os bytes acumulados passam do limite.
 * Content-Length é enviado pelo cliente e não é confiável (pode faltar em envio
 * chunked, ou vir declarado menor que o corpo real); esta é a checagem que
 * protege de verdade. Soma o byteLength de cada chunk (bytes), não o tamanho
 * da string decodificada (que conta unidades UTF-16 e mediria errado corpos
 * com acento ou emoji). Corpo ausente devolve string vazia, para cair no erro
 * de JSON inválido já existente em vez de estourar aqui.
 */
async function lerCorpoLimitado(request: Request, limiteBytes: number): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytesLidos = 0;
  let corpo = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesLidos += value.byteLength;
    if (bytesLidos > limiteBytes) {
      await reader.cancel();
      return null;
    }
    corpo += decoder.decode(value, { stream: true });
  }
  corpo += decoder.decode();
  return corpo;
}

export async function handleLead(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (!mesmaOrigem(request)) return jsonSeguro({ ok: false, erro: "Origem não permitida" }, 403);

  const raw = await lerCorpoLimitado(request, LIMITE_BODY);
  if (raw === null) return jsonSeguro({ ok: false, erro: "Mensagem grande demais" }, 413);

  const ip = request.headers.get("CF-Connecting-IP") ?? "anon";
  const rl = await env.LEAD_RL.limit({ key: ip });
  if (!rl.success)
    return jsonSeguro({ ok: false, erro: "Muitos envios seguidos. Tente pelo WhatsApp." }, 429);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("corpo JSON não é um objeto");
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return jsonSeguro({ ok: false, erro: "JSON inválido" }, 400);
  }

  if (body.consentimento !== true)
    return jsonSeguro({ ok: false, erro: "Consentimento é obrigatório (LGPD)" }, 400);

  const nome = texto(body.nome, 80);
  const profissao = texto(body.profissao, 40);
  const whatsappBruto = texto(body.whatsapp, 25);
  const dor = typeof body.dor === "string" ? body.dor.trim().slice(0, 500) : "";
  const origem = texto(body.origem, 40) ?? "form";
  const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";

  if (!nome || !profissao || !whatsappBruto)
    return jsonSeguro({ ok: false, erro: "Preencha nome, profissão e WhatsApp" }, 400);

  const whatsapp = normalizaWhatsapp(whatsappBruto);
  if (!whatsapp) return jsonSeguro({ ok: false, erro: "WhatsApp inválido" }, 400);

  const humano = await verifyTurnstile(
    env.TURNSTILE_SECRET_KEY,
    token,
    request.headers.get("CF-Connecting-IP"),
    env.TURNSTILE_HOSTNAME
  );
  if (!humano) return jsonSeguro({ ok: false, erro: "Verificação anti-spam falhou" }, 403);

  let id: number;
  try {
    id = await insertLead(env.DB, { nome, profissao, whatsapp, dor, origem });
  } catch (e) {
    console.error(JSON.stringify({ evt: "lead_d1_erro", err: String(e) }));
    return jsonSeguro({ ok: false, erro: "Não consegui salvar agora. Tente pelo WhatsApp." }, 503);
  }

  // Notificação minimizada; falha não bloqueia a resposta (lead já está no D1).
  const { subject, text } = renderLeadEmail({ id, nome, profissao });
  ctx.waitUntil(
    env.NOTIFY.send({ to: env.LEAD_TO, from: env.LEAD_FROM, subject, text }).catch((e: unknown) => {
      const code = (e as { code?: string })?.code ?? "";
      console.error(JSON.stringify({ evt: "lead_email_falhou", leadId: id, code, err: String(e) }));
    })
  );

  return jsonSeguro({ ok: true }, 201);
}
