import { jsonSeguro, metodoNaoPermitido } from "./http";
import { handleLead } from "./lead-route";
import { handleChat } from "./chat-route";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/health") return jsonSeguro({ ok: true });
      if (url.pathname === "/api/lead")
        return request.method === "POST" ? handleLead(request, env, ctx) : metodoNaoPermitido();
      if (url.pathname === "/api/chat")
        return request.method === "POST" ? handleChat(request, env) : metodoNaoPermitido();
      if (url.pathname.startsWith("/api/")) return jsonSeguro({ ok: false, erro: "Não encontrado" }, 404);
      return jsonSeguro({ ok: false, erro: "Não encontrado" }, 404);
    } catch (e) {
      console.error(JSON.stringify({ evt: "erro_nao_tratado", path: url.pathname, err: String(e) }));
      return jsonSeguro({ ok: false, erro: "Erro interno" }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
