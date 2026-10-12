import { insertLead, gerarCodigoSdr, ehColisaoCodigoSdr, VERSAO_CONSENTIMENTO } from "./leads";
import { verifyTurnstile } from "./turnstile";
import { renderLeadEmail } from "./email";
import { jsonSeguro, mesmaOrigem, lerCorpoLimitado } from "./http";

const LIMITE_BODY = 10_000;

/**
 * Secrets do SDR Guarabot (n8n). Opcionais: sem eles o formulário funciona como
 * antes e só não avisa o SDR. Ficam fora do worker-configuration.d.ts, que é
 * gerado pelo `wrangler types`.
 */
type EnvSdr = Env & { SDR_WEBHOOK_URL?: string; SDR_WEBHOOK_TOKEN?: string };

/** Só esta origem entra no SDR (allowlist, repetida no n8n): clínicas e home nunca. */
const ORIGEM_SDR = "guarabot-barbearias";
/** Novas tentativas quando o código sorteado já existe; a 4ª colisão vira 503. */
const SORTEIOS_EXTRA = 3;

function texto(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 && t.length <= max ? t : null;
}

/** Aceita "+" só como primeiro caractere; 10 a 13 dígitos. O 0 de discagem antes do DDD ("(092) …") sai. */
function normalizaWhatsapp(bruto: string): string | null {
  const limpo = bruto.replace(/[\s\-().]/g, "").replace(/^0(?=\d{10,11}$)/, "");
  return /^\+?\d{10,13}$/.test(limpo) ? limpo : null;
}

/**
 * Mesma regra do SDR (sdr-guarabot/lib/normaliza.js): número brasileiro com DDD válido, celular com o 9.
 * Só para barbearias: o código só vale se o SDR aceitar o número (senão o código fica órfão).
 */
export function whatsappBrasileiro(bruto: string): string | null {
  let d = bruto.replace(/\D/g, "");
  if (d.length === 10) d = `55${d}`;
  else if (d.length === 11) {
    if (d[2] !== "9") return null;
    d = `55${d}`;
  }
  if (!d.startsWith("55")) return null;
  if (d.length === 12) {
    const p = d[4];
    if (p >= "6" && p <= "9") d = `${d.slice(0, 4)}9${d.slice(4)}`;
    else if (!(p >= "2" && p <= "5")) return null;
  } else if (d.length === 13) {
    if (d[4] !== "9") return null;
  } else return null;
  return Number(d.slice(2, 4)) < 11 ? null : d;
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
  if (origem === ORIGEM_SDR && !whatsappBrasileiro(whatsapp))
    return jsonSeguro({ ok: false, erro: "Confira o WhatsApp: número do Brasil com DDD" }, 400);

  const humano = await verifyTurnstile(
    env.TURNSTILE_SECRET_KEY,
    token,
    request.headers.get("CF-Connecting-IP"),
    env.TURNSTILE_HOSTNAME
  );
  if (!humano) return jsonSeguro({ ok: false, erro: "Verificação anti-spam falhou" }, 403);

  const ehBarbearias = origem === ORIGEM_SDR;
  let id = 0;
  let codigo: string | null = null;
  for (let tentativa = 0; ; tentativa += 1) {
    codigo = ehBarbearias ? gerarCodigoSdr() : null;
    try {
      id = await insertLead(env.DB, {
        nome,
        profissao,
        whatsapp,
        dor,
        origem,
        consentimento: body.consentimento === true,
        consentimentoVersao: VERSAO_CONSENTIMENTO,
        codigoSdr: codigo,
      });
      break;
    } catch (e) {
      if (ehBarbearias && ehColisaoCodigoSdr(e) && tentativa < SORTEIOS_EXTRA) continue;
      console.error(JSON.stringify({ evt: "lead_d1_erro", err: String(e) }));
      return jsonSeguro({ ok: false, erro: "Não consegui salvar agora. Tente pelo WhatsApp." }, 503);
    }
  }

  // SDR Guarabot: só registra o cadastro e a prova do consentimento. O bot nunca
  // chama este número; quem inicia a conversa é o titular, mandando o código.
  // Falha ou demora do n8n não atrasa nem quebra a resposta (waitUntil + timeout).
  const sdr = env as EnvSdr;
  const urlSdr = sdr.SDR_WEBHOOK_URL ?? "";
  if (ehBarbearias && codigo && (!urlSdr.startsWith("https://") || !sdr.SDR_WEBHOOK_TOKEN)) {
    // sem os dois secrets (ou URL sem https) o lead não vai ao SDR; o log avisa, sem dado pessoal
    console.error(JSON.stringify({ evt: "lead_sdr_sem_config", leadId: id }));
  } else if (ehBarbearias && codigo && sdr.SDR_WEBHOOK_TOKEN) {
    const corpo = {
      codigo, nome, whatsapp, origem, consentimentoVersao: VERSAO_CONSENTIMENTO,
      recebidoEm: new Date().toISOString(), siteId: id,
    };
    ctx.waitUntil(
      fetch(urlSdr, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-SDR-Token": sdr.SDR_WEBHOOK_TOKEN },
        body: JSON.stringify(corpo),
        signal: AbortSignal.timeout(5000),
      })
        .then((r) => {
          if (!r.ok) console.error(JSON.stringify({ evt: "lead_sdr_falhou", leadId: id, status: r.status }));
          return r.body?.cancel();
        })
        .catch(() => console.error(JSON.stringify({ evt: "lead_sdr_falhou", leadId: id, status: 0 })))
    );
  }

  // Falha no email não bloqueia a resposta: o lead já está no D1.
  const { subject, text } = renderLeadEmail({ id, nome, profissao, whatsapp, dor, origem, recebidoEm: new Date(), codigo });
  ctx.waitUntil(
    env.NOTIFY.send({ to: env.LEAD_TO, from: env.LEAD_FROM, subject, text }).catch((e: unknown) => {
      const code = (e as { code?: string })?.code ?? "";
      console.error(JSON.stringify({ evt: "lead_email_falhou", leadId: id, code, err: String(e) }));
    })
  );

  return jsonSeguro(codigo ? { ok: true, codigo } : { ok: true }, 201);
}
