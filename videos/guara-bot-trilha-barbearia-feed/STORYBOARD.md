---
format: 1080x1350
duration: 20s
message: "Do 'oi' ao horário marcado, sem você largar a máquina"
arc: Enxurrada → Virada → Trilha (entende, decide, marca, remarca) → Véspera → Oferta
audience: donos de barbearia em Manaus que atendem sozinhos
mode: collaborative
version: v1
---

# guara.bot: o caminho de uma mensagem (Reels/Stories, 9:16)

## Decisões

- **Mensagem:** do "oi" ao horário marcado, sem você largar a máquina.
- **Formato:** 1080x1920, ~20,5 s, sem narração, música + sons de notificação. Texto grande, legível no mudo.
- **Zona segura do Reels:** nada importante nos 250 px de cima nem nos 380 px de baixo (interface do Instagram e do botão do anúncio).
- **Fio condutor:** a **linha verde da trilha**. Ela nasce da primeira mensagem, desce por todas as cenas puxando a câmera e termina no horário marcado. É a mesma linha da trilha da landing.
- **Direção única:** a câmera sempre DESCE pela trilha (o conteúdo sobe). Cortes no tempo da música.
- **Marca:** fundo verde floresta #123B26 com caixas creme #FDF9F0; verde #2E7D32 para o que marca; vermelho guaraná #D5382F para "passa para você" e para a oferta; grafite #17231B no texto das caixas. Outfit 700 nos títulos, Geist 500 no resto (fontes locais).
- **Mascote:** poses oficiais do guara.bot, sem recolorir nem recortar: 01 acenando, 03 pensando, 05 confirmando, 12 apontando.
- **Proibido:** brilho neon, texto com degradê, número de resultado, depoimento, nome de cliente, logo do Google, pagamento automático, "de manhã"/"uma vez só" no lembrete. Grafia sempre "guara.bot". Zero travessão.
- **Dois erros de movimento a evitar:** "slideshow" (cada cena um cartão novo, sem a linha ligando) e "protetor de tela" (movimento que não diz nada).
- **Quadro parado de propósito:** a oferta final fica 1,5 s imóvel.

## Locked

- Plano e esboços v1 aprovados pelo dono em 2026-10-06 ("aprovado, pode animar"). Layout, textos e poses de cada cena estão travados; o build veste e anima, não redesenha.

## Frame 1 — Enxurrada

- scene: Celular no centro, notificações chovendo de todos os lados sobre a barbearia desfocada
- duration: 3s
- poster: 2.5s
- transition_in: cut
- status: animated
- src: compositions/01-enxurrada.html
- blueprint: overwhelm-surround
- audio: ping a cada bolha (0,3 s, 0,7 s, 1,0 s, 1,3 s, 1,6 s), acelerando
- voiceover: onscreen

Foto da barbearia (recorte do criativo v10) escurecida e desfocada no fundo. Um celular no centro. As bolhas de WhatsApp CAEM de cima e dos lados, uma por batida, empilhando e cobrindo a tela: "Tem horário sábado?", "Quanto é a barba?", "Amanhã dá?", "Tá aberto hoje?", "Ainda tem vaga?". Texto grande no terço de cima, em dois golpes: "Você no meio do corte." e, no segundo tempo, "O WhatsApp não para." Por quê: o gancho em linguagem do dono, a dor dele em 3 s.

## Frame 2 — Virada

- scene: O guara.bot entra de baixo, empurra as bolhas para fora e para no centro acenando
- duration: 2s
- poster: 1.4s
- transition_in: cut
- status: animated
- src: compositions/02-virada.html
- blueprint: ticker-takeover
- audio: whoosh na entrada + impact-bass no assentar
- voiceover: onscreen

O guara.bot (pose 01, acenando) SOBE de baixo e EMPURRA as bolhas para as bordas, como uma colisão, não um fade. Assenta grande no centro. Texto: "Deixa com o guara.bot." Da base dele nasce a linha verde da trilha, que puxa a câmera para baixo. Por quê: a virada; o produto entra como resposta à dor.

## Frame 3 — Entende e decide

- scene: A linha desce até a caixa "O guara.bot entende o pedido" e chega na pergunta "É assunto da barbearia?" com duas saídas laterais
- duration: 3s
- poster: 2.5s
- transition_in: push-up
- status: animated
- src: compositions/03-decide.html
- blueprint: camera-journey
- audio: click-soft em cada caixa que acende; pop na saída vermelha
- voiceover: onscreen

A câmera acompanha a linha DESENHANDO para baixo. Caixa 1, creme: "O cliente manda mensagem", com uma bolha "Tem horário sábado?" dentro. Caixa 2: o guara.bot pensando (pose 03) + "Entende o pedido". Caixa 3, a pergunta, em destaque: "É assunto da barbearia?". Duas saídas DISPARAM para os lados ao mesmo tempo: à esquerda, uma bolha de propaganda ("Promoção imperdível!") desliza para uma caixa cinza tracejada "Fica quieto"; à direita, "Quero falar com o barbeiro" vai para a caixa vermelha "Passa para você". Por quê: mostra que ele não responde tudo às cegas; ele decide.

## Frame 4 — Marca de verdade

- scene: A agenda do dia, horários ocupados apagados e livres acendendo em verde; o guara.bot toca no 10h30 e o carimbo "Marcado" bate
- duration: 4.5s
- poster: 3.8s
- transition_in: push-up
- status: animated
- src: compositions/04-marca.html
- blueprint: cursor-ui-demo
- audio: pop em cada horário livre que acende; chime no carimbo
- voiceover: onscreen

A linha entra pelo topo no ramo "Quer marcar". Uma agenda de sábado ocupa a tela: 8h, 9h, 10h30, 11h, 14h, 15h. Os ocupados ficam cinza riscados; os livres (9h, 10h30, 14h) ACENDEM em verde, um por batida. Texto: "Olha a agenda de verdade." e depois "Oferece só horário livre." A mão do guara.bot toca o 10h30; um carimbo verde "Marcado" SLAMS no horário. Embaixo, três selos surgem em sequência: "agenda", "Google Agenda", "e-mail para você" (ícones genéricos, sem logo). Por quê: a prova central; ele marca em horário real, sem choque.

## Frame 5 — Remarca, cancela, responde

- scene: Três cortes rápidos: preço e endereço respondidos, horário arrastado de sábado para segunda, cancelamento que te avisa
- duration: 2.5s
- poster: 1.2s
- transition_in: whip-up
- status: animated
- src: compositions/05-ramos.html
- blueprint: kinetic-type-beats
- audio: whoosh-short em cada corte
- voiceover: onscreen

Três quadros secos no tempo da música, ~0,8 s cada, a linha verde atravessando os três. (a) "Quanto é o corte?" e a resposta já embaixo, com "Responde na hora." (b) Um horário "sáb 10h30" ARRASTADO para "seg 16h", com "Remarca." (c) Um horário riscado e um sino com "Cancelou? Te avisa." Por quê: cobre o resto da trilha em ritmo, sem pesar.

## Frame 6 — Véspera e a trilha inteira

- scene: Caixa tracejada do lembrete com o guara.bot confirmando; a câmera se afasta e revela a trilha completa acesa
- duration: 2.5s
- poster: 2.2s
- transition_in: push-up
- status: animated
- src: compositions/06-vespera.html
- blueprint: zoom-out-workspace-reveal
- audio: sparkle no lembrete + riser no afastamento
- voiceover: onscreen

A linha chega na última caixa, tracejada: guara.bot confirmando (pose 05) + "Na véspera, ele lembra o cliente." Então UM afastamento contínuo revela a trilha inteira, todas as caixas acesas e a linha verde ligando tudo, igual à da landing. Texto sobre ela: "Do 'oi' ao horário marcado." Por quê: o valor fechado numa imagem só.

## Frame 7 — Oferta

- scene: Fundo vermelho guaraná, guara.bot apontando, "15 dias grátis, sem cartão." parado
- duration: 3s
- poster: 2.5s
- transition_in: sdf-iris
- status: animated
- src: compositions/07-oferta.html
- blueprint: titlecard-reveal
- audio: impact-bass na entrada, depois só a música
- voiceover: onscreen

Íris abre do ponto final da linha. Fundo vermelho guaraná. O guara.bot apontando (pose 12) à esquerda; à direita, empilhado e grande: "15 dias grátis," / "sem cartão." Embaixo, menor: "guara.bot · assistente de IA no WhatsApp para barbearias de Manaus". Um movimento de entrada e 1,5 s parado. Sem link e sem botão escrito. Por quê: a oferta, que transforma o interesse em mensagem pelo botão do anúncio.
