# guara.bot para barbearias: novos ângulos (falta e conversa)

Duas peças para substituir os clones da campanha "NG | guara.bot | Barbearias | Landing page | Manaus"
(AD03 v10 é clone da AD02; AD05 v5 é clone da AD04). Visual de interface, sem foto, para abrir bolsos
novos de público (diversidade criativa).

| Peça | Ângulo | Arquivos |
|---|---|---|
| `falta-lembrete-v1` | dor de falta (no-show), recurso real da landing: lembrete na véspera | feed 1080x1350, story 1080x1920 |
| `conversa-prova-v1` | prova: o guara.bot consultando horário livre e agendando | feed 1080x1350, story 1080x1920 |

Fonte: `index.html?peca=falta|conversa&formato=feed|story`. Render: `node render.mjs` (Playwright de `site/`).
Saídas em `outputs/` e copiadas para `docs/marketing/meta-ads/criativos/`.

## Copy do anúncio

**Falta (dor)**
- Texto principal: Cliente que marca e não aparece deixa a cadeira vazia. O guara.bot manda o lembrete na véspera pelo WhatsApp e o cliente confirma ali mesmo. Conheça como funciona na sua barbearia.
- Título: Lembrete na véspera, no WhatsApp (32)
- Botão: Saiba mais

**Conversa (prova)**
- Texto principal: Enquanto você corta, o guara.bot responde no WhatsApp, mostra os horários livres da sua agenda e marca o cliente. Veja na página como ele atende.
- Título: Veja o guara.bot atendendo (26)
- Botão: Saiba mais

## Regras conferidas
Sem travessão, sem número sem fonte (horários são exemplo de uso, como na landing), sem promessa de resultado,
sem prova social inventada, CTA único. Funções citadas (consulta agenda, agenda, lembrete) constam na landing.
