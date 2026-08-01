const HEADERS_SEGUROS = {
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store",
  "Referrer-Policy": "strict-origin-when-cross-origin",
} as const;

export function jsonSeguro(data: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...HEADERS_SEGUROS, ...extra },
  });
}

export function metodoNaoPermitido(): Response {
  return jsonSeguro({ ok: false, erro: "Método não permitido" }, 405, { Allow: "POST" });
}

export function mesmaOrigem(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return true; // requests same-origin do próprio site podem omitir Origin
  try {
    return new URL(origin).hostname === new URL(request.url).hostname;
  } catch {
    return false;
  }
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
export async function lerCorpoLimitado(request: Request, limiteBytes: number): Promise<string | null> {
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
