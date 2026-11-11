---
workflow: general-video
flow: automation
storyboard: no
message: "Paciente sem resposta no WhatsApp custa caro; o guara.bot responde e marca, e a conta do seu consultório sai em 4 perguntas"
destination: meta-ads
aspect: 1080x1920
language: pt-BR
audience: donos de consultório e clínica em Manaus
length: 30s
angle: diagnóstico pelo WhatsApp
---

## Intent

Vídeo-modelo A da campanha de clínicas (estudo `docs/marketing/meta-ads/analise-referencias-tolki-2026-10-16.md`). Um vídeo de texto animado, sem narração, que troca só o gancho dos primeiros 5 segundos: 4 versões renderizadas do mesmo projeto pela variável `gancho`. Funil escolhido pelo dono em 2026-10-16: diagnóstico grátis pelo WhatsApp. O dono pediu "faça tudo, está tudo autorizado, amanhã quero receber pronto" e foi dormir: execução autônoma.

## Assets

- assets/guara-*.png: poses oficiais do guara.bot (docs/marketing/brand/guara-bot/poses, reduzidas para 900 px, sem recolorir nem recortar): 01 boas-vindas, 04 explicando, 05 confirmação, 08 digitando, 12 apontando.
- assets/sfx/*.mp3: sons da biblioteca local (mesmos do vídeo da trilha de barbearias).
- assets/outfit-*.woff2, assets/geist-*.woff2, assets/gsap.min.js: fontes e GSAP locais.

## Customizations

- Variável `gancho` (enum): `2140` (Sábado, 21h40), `demora` (O paciente não reclama da demora), `de-cabeca` (Responda de cabeça), `62` (62% desistem, Opinion Box 2025).
- Rótulo "Consultório em Manaus" no primeiro segundo (decisão da conversa sobre como a Tolki acerta o público).

## Notes

- Sem música (o dono tirou a música do vídeo de barbearias em 2026-10-06); só sons de notificação e transição.
- O número da nanoguará é respondido pelo Rodrigo: o vídeo não promete que o guara.bot atende esse número nem resposta imediata ao diagnóstico.
- Conversas são exemplo, rotuladas. Horários e mensagens iguais aos da landing de clínicas.
- Render autorizado de antemão pelo dono ("tá tudo autorizado"); renderizar as 4 versões e entregar com folha de quadros.

## Rota pelo site (2026-10-16)

- O dono escolheu o site como rota principal. A frase final da chamada passou de "Responda 4 perguntas no WhatsApp e receba a conta." para "Coloque os números do seu consultório e veja a conta.", igual à calculadora da landing /guarabot/clinicas. Os renders da versão WhatsApp ficam em renders/ sem o sufixo "-site".
