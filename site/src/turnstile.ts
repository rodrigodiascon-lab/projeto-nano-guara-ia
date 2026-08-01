const ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  secret: string,
  token: string,
  ip: string | null,
  hostnameEsperado: string
): Promise<boolean> {
  if (!token || token.length > 2048) return false;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean; hostname?: string };
    if (data.success !== true) return false;
    // hostname só é validado quando configurado (em dev/local fica vazio)
    if (hostnameEsperado && data.hostname && data.hostname !== hostnameEsperado) return false;
    return true;
  } catch (e) {
    console.error(JSON.stringify({ evt: "turnstile_falha", err: String(e) }));
    return false; // indisponibilidade NUNCA deixa passar sem verificação
  }
}
