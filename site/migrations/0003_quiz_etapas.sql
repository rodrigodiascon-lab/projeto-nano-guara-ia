-- Funil do questionário de /iaparaconsultorios: quantas pessoas chegam a cada
-- etapa, por dia e por anúncio de origem (utm_content). Só contadores
-- agregados: nenhuma linha por visitante, sem IP, sem cookie, sem resposta do
-- quiz e sem dado pessoal. Serve para saber em que pergunta o quiz perde gente
-- quando o tráfego pago traz visitas e poucos leads.
CREATE TABLE IF NOT EXISTS quiz_etapas (
  dia TEXT NOT NULL,                   -- data de Manaus, AAAA-MM-DD
  etapa TEXT NOT NULL,                 -- 1 a 6, envio, lead_ok
  utm_content TEXT NOT NULL DEFAULT '',
  total INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (dia, etapa, utm_content)
);
