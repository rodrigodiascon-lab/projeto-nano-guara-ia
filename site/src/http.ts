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
