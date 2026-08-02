declare module "cloudflare:test" {
  interface ProvidedEnv extends Env {
    TEST_MIGRATIONS: D1Migration[];
  }
}

// Import bruto do Vite (usado em headers.test.ts para ler public/_headers em
// tempo de build, já que o runtime workerd do vitest-pool-workers não expõe
// o filesystem real).
declare module "*?raw" {
  const content: string;
  export default content;
}
