CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  profissao TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  dor TEXT NOT NULL DEFAULT '',
  origem TEXT NOT NULL DEFAULT 'form',
  consentimento INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_criado_em ON leads(criado_em);
