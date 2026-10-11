-- Código do formulário da página /guarabot/barbearias (SDR Guarabot, T16). O
-- titular recebe "GB-XXXXXX" na resposta e o manda pelo WhatsApp; é assim que
-- o SDR liga a conversa ao cadastro e à prova do consentimento, sem que o bot
-- jamais chame o número digitado no formulário.
--
-- Nulo para as outras origens (clínicas, home). O índice único é parcial: só
-- vale para as linhas com código, então as antigas não colidem entre si. O
-- código antigo do Worker ignora a coluna, por isso o rollback do deploy não
-- precisa desfazer esta migration.
ALTER TABLE leads ADD COLUMN codigo_sdr TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS leads_codigo_sdr_unico ON leads (codigo_sdr) WHERE codigo_sdr IS NOT NULL;
