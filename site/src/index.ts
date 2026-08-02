import { jsonSeguro, metodoNaoPermitido } from "./http";
import { handleLead } from "./lead-route";
import { handleChat } from "./chat-route";
import { expurgaLeadsVencidos } from "./leads";

/**
 * Serve a página 404 de public/ com status 404. Sem isto o Worker devolveria
 * JSON para qualquer URL inexistente fora de /api, e quem seguisse um link
 * quebrado veria `{"ok":false,...}` numa landing page comercial. O
 * not_found_handling do Static Assets só age quando o request não chega ao
 * Worker; como este Worker atende tudo que não casa com um asset, o fallback
 * tem que ser aqui.
 */
async function paginaNaoEncontrada(env: Env, url: URL): Promise<Response> {
  try {
    const res = await env.ASSETS.fetch(new URL("/404.html", url.origin));
    if (res.ok) {
      return new Response(res.body, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      });
    }
  } catch (e) {
    console.error(JSON.stringify({ evt: "erro_404_asset", err: String(e) }));
  }
  return jsonSeguro({ ok: false, erro: "Não encontrado" }, 404);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/health") return jsonSeguro({ ok: true });
      // O await não é decorativo: sem ele a promise escapa do bloco e o catch
      // abaixo nunca vê erro nenhum vindo das duas rotas.
      if (url.pathname === "/api/lead")
        return request.method === "POST" ? await handleLead(request, env, ctx) : metodoNaoPermitido();
      if (url.pathname === "/api/chat")
        return request.method === "POST" ? await handleChat(request, env) : metodoNaoPermitido();
      if (url.pathname.startsWith("/api/")) return jsonSeguro({ ok: false, erro: "Não encontrado" }, 404);
      return await paginaNaoEncontrada(env, url);
    } catch (e) {
      console.error(JSON.stringify({ evt: "erro_nao_tratado", path: url.pathname, err: String(e) }));
      return jsonSeguro({ ok: false, erro: "Erro interno" }, 500);
    }
  },

  /**
   * Expurgo diário dos leads vencidos. A política de privacidade promete apagar
   * os dados do formulário após 12 meses; este handler é o que cumpre a
   * promessa. Sem ele o texto seria compromisso público sem mecanismo por trás.
   */
  async scheduled(_controller: ScheduledController, env: Env, _ctx: ExecutionContext): Promise<void> {
    try {
      const apagados = await expurgaLeadsVencidos(env.DB);
      console.log(JSON.stringify({ evt: "expurgo_leads", apagados }));
    } catch (e) {
      console.error(JSON.stringify({ evt: "expurgo_leads_erro", err: String(e) }));
    }
  },
} satisfies ExportedHandler<Env>;
