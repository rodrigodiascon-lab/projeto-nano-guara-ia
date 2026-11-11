---
format: 1080x1920
duration: 30.5s
message: "Paciente sem resposta no WhatsApp custa caro; o guara.bot responde e marca, e a conta do seu consultório sai em 4 perguntas"
arc: Gancho (variável) → Espera → Conta → Resposta → Atendimento inteiro → Chamada
audience: donos de consultório e clínica em Manaus
mode: autonomous
version: v1
---

# guara.bot clínicas: vídeo-modelo A (Reels/Stories, 9:16)

## Decisões

- **Um projeto, quatro vídeos:** só o gancho (0 a 5 s) muda, pela variável `gancho`. O resto é idêntico, para comparar ganchos com o mesmo corpo.
- **Grade de batidas do gancho, igual nas quatro versões:** 0,10 s rótulo do público; 0,25 s batida A; 1,45 s batida B (som pop); 2,60 s batida C (whoosh); 3,30 s batida D (impacto); 4,72 s saída. Assim os sons servem para todas as versões.
- **Sem narração e sem música:** texto grande legível no mudo, sons de notificação.
- **Catálogo consultado** (count-up, chat-thread, sdf-iris): os balões do catálogo são estilo iMessage; mantido o estilo de conversa do vídeo de barbearias, já aprovado pelo dono. Contagem feita pela regra `counting-dynamic-scale`; íris como no vídeo de barbearias.
- **Mascote só a partir da cena 4:** a virada é ele chegando.

## Frame 1 — Gancho

- scene: rótulo "Consultório em Manaus" e o gancho escolhido pela variável
- duration: 5s
- status: outline
- src: index.html (cena inline: lê a variável `gancho`)
- blueprint: kinetic-type-beats
- rules: spring-pop-entrance, waterfall-entry, counting-dynamic-scale (versão 62)
- audio: click no rótulo, pop em 1,45 s, whoosh em 2,6 s, impacto em 3,3 s

Versões: `2140` (Sábado / 21h40 / notificação "Qual o valor da limpeza?" / "Quem responde?"); `demora` ("O paciente não reclama da demora." / balão "Tem horário amanhã?" há 40 min / "Ele marca em outro lugar."); `de-cabeca` ("Responda de cabeça:" / "Quantos pacientes chamaram seu WhatsApp este mês?" / "Quantos marcaram?"); `62` (62% contando / "das pessoas desistem de comprar depois de uma experiência ruim no WhatsApp." / Opinion Box, 2025 / "E o WhatsApp do seu consultório?").

## Frame 2 — Espera

- scene: celular do consultório recebendo mensagens que ninguém responde
- duration: 5s
- status: outline
- src: compositions/s02-espera.html
- blueprint: device-surface-showcase (cursorless, tela parada com balões chegando)
- rules: waterfall-entry, spring-pop-entrance
- audio: ping por balão, impacto grave no último

Título em dois golpes: "Você atende o paciente." / "Ninguém atende o WhatsApp." Balões da landing: "Qual o valor da consulta?" (há 5 min), "Vocês atendem sábado?" (há 40 min), "Tudo bem, já marquei em outro lugar." (há 2 h, borda vermelha). Rótulo "exemplo".

## Frame 3 — Conta

- scene: cartão creme com a conta de exemplo da landing e o total contando
- duration: 5.5s
- status: outline
- src: compositions/s03-conta.html
- blueprint: dataviz-countup
- rules: counting-dynamic-scale, waterfall-entry
- audio: click por linha, impacto no total

"Quanto custa a mensagem que ficou sem resposta?" / 2 mensagens sem resposta por dia × R$ 150 a consulta × 22 dias de atendimento = R$ 6.600 por mês / "em consultas que podem estar ficando fora da agenda". Rótulo "conta de exemplo".

## Frame 4 — Resposta

- scene: o guara.bot chega e responde a mesma hora da noite, marca e carimba
- duration: 7s
- status: outline
- src: compositions/s04-resposta.html
- blueprint: agent-progress-theater (conversa que se constrói até a confirmação)
- rules: spring-pop-entrance, press-release-spring (carimbo)
- audio: pop na entrada do mascote, ping/pop por balão, chime + impacto no carimbo

"Com o guara.bot," / "resposta na hora." Conversa da landing às 21h40: "Tem horário para consulta na quinta?" → "Tenho quinta às 9h, 10h30 e 15h. Qual fica melhor para você?" → "10h30" → "Pronto: quinta, 10h30. Na véspera eu te lembro." + carimbo "Marcado". Poses: 01 entra, 08 enquanto conversa, 05 no carimbo.

## Frame 5 — Atendimento inteiro

- scene: lista de quatro selos e o mascote explicando
- duration: 3.5s
- status: outline
- src: compositions/s05-inteiro.html
- blueprint: grid-card-assemble (lista vertical que se acumula)
- rules: waterfall-entry
- audio: click por selo

"Faz o atendimento inteiro." Selos: Responde valor e convênio / Mostra só horário livre / Marca e lembra na véspera / Saúde vai para a sua equipe (vermelho). Rodapé: "No WhatsApp que o consultório já usa."

## Frame 6 — Chamada

- scene: íris vermelha, pergunta final, mascote apontando para o botão do anúncio
- duration: 4.5s
- status: outline
- src: compositions/s06-chamada.html
- blueprint: titlecard-reveal
- rules: spring-pop-entrance
- audio: impacto na íris, pop no mascote

"Quanto o seu consultório deixa sem resposta?" / "Coloque os números do seu consultório e veja a conta." (versão site; a versão WhatsApp dizia "Responda 4 perguntas no WhatsApp e receba a conta.") / "Assistente de IA para consultórios e clínicas de Manaus." / guara.bot / nanoguará.ia. Quadro parado no final.
