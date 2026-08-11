import { defineConfig, devices } from "@playwright/test";

/**
 * Suíte de layout com navegador de verdade, separada da suíte do Worker.
 *
 * Por que existe: os testes de test/layout.test.ts travam a REGRA CSS, porque
 * o runtime workerd do vitest-pool-workers não tem engine de layout. Isso pega
 * quem apagar a regra, mas não pega quem quebrar o layout por outro caminho —
 * um padding novo, um texto mais longo, um grid sem parada no mobile. Os três
 * vazamentos desta home (Turnstile, rodapé e o próprio Turnstile de novo em
 * outra largura) foram achados medindo no navegador, não lendo CSS.
 *
 * Serve os arquivos estáticos direto, sem o Worker: o layout nasce do HTML e do
 * CSS, e as rotas de API não participam dele. A consequência é que as URLs
 * limpas (/privacidade) não existem aqui — o Worker é quem as resolve — então
 * os testes pedem os .html.
 */
export default defineConfig({
  testDir: "./test-e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: "http://127.0.0.1:8899",
    // Rastro só do que falhou: um teste de layout que quebra é quase sempre
    // "qual elemento vazou", e o trace responde isso sem re-executar nada.
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "python3 -m http.server 8899 --bind 127.0.0.1 --directory public",
    url: "http://127.0.0.1:8899/index.html",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
  },
});
