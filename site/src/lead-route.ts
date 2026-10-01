import { insertLead, VERSAO_CONSENTIMENTO } from "./leads";
import { verifyTurnstile } from "./turnstile";
import { renderLeadEmail } from "./email";
import { jsonSeguro, mesmaOrigem, lerCorpoLimitado } from "./http";

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
    id = await insertLead(env.DB, {
      nome,
      profissao,
      whatsapp,
      dor,
      origem,
      consentimento: body.consentimento === true,
      consentimentoVersao: VERSAO_CONSENTIMENTO,
    });
  } catch (e) {
    console.error(JSON.stringify({ evt: "lead_d1_erro", err: String(e) }));
    return jsonSeguro({ ok: false, erro: "Não consegui salvar agora. Tente pelo WhatsApp." }, 503);
  }

  // Falha no email não bloqueia a resposta: o lead já está no D1.
  const { subject, text } = renderLeadEmail({ id, nome, profissao, whatsapp, dor, origem, recebidoEm: new Date() });
  ctx.waitUntil(
    env.NOTIFY.send({ to: env.LEAD_TO, from: env.LEAD_FROM, subject, text }).catch((e: unknown) => {
      const code = (e as { code?: string })?.code ?? "";
      console.error(JSON.stringify({ evt: "lead_email_falhou", leadId: id, code, err: String(e) }));
    })
  );

  return jsonSeguro({ ok: true }, 201);
}
