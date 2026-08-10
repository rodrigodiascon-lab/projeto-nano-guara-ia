import path from "node:path";
import { defineWorkersConfig, readD1Migrations } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig(async () => {
  const migrations = await readD1Migrations(path.join(__dirname, "migrations"));
  return {
    // Sem isto o Vite escolhe sozinho onde põe o cache de dependências e acaba
    // em public/node_modules/.vite, porque os testes importam os HTML de public
    // com ?raw. O .gitignore esconde a pasta do repositório, mas o wrangler lê
    // o diretório do disco: quem rodasse `npm test` e depois `npm run deploy`
    // publicava o cache junto, servido em 200 sob /node_modules/. Aqui o cache
    // nasce fora de public; o public/.assetsignore cobre o resto.
    cacheDir: path.join(__dirname, "node_modules/.vite"),
    test: {
      setupFiles: ["./test/apply-migrations.ts"],
      poolOptions: {
        workers: {
          wrangler: { configPath: "./wrangler.jsonc" },
          miniflare: {
            bindings: { TEST_MIGRATIONS: migrations },
            ratelimits: {
              CHAT_RL: { simple: { limit: 10, period: 60 } },
              LEAD_RL: { simple: { limit: 5, period: 60 } },
            },
          },
        },
      },
    },
  };
});
