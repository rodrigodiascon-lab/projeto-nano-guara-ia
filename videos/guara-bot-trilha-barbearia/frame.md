---
name: guara.bot · nanoguará.ia
colors:
  fundo: "#123B26"
  fundo-profundo: "#0D2C1C"
  creme: "#FDF9F0"
  verde: "#2E7D32"
  verde-claro: "#8FD19A"
  guarana: "#D5382F"
  guarana-claro: "#FF8A7A"
  grafite: "#17231B"
  texto-secundario: "#55655B"
  cinza-ocupado: "#7C837E"
  chat-cliente: "#FFFFFF"
  chat-bot: "#DFF3D8"
typography:
  display: { family: "Outfit", weight: 700, file: "assets/outfit-700.woff2", tracking: "-2px" }
  texto: { family: "Geist", weight: 500, file: "assets/geist-500.woff2" }
  tamanhos: { titulo: "92-132px", caixa: "46-64px", bolha: "42-46px", rotulo: "30-40px" }
spacing:
  margem-lateral: "70-84px"
  zona-segura-9x16: "y 250 a 1540"
  zona-segura-4x5: "60px em cima e embaixo"
components:
  linha-da-trilha: "barra vertical 9px, #8FD19A, raio 9px, centrada em x=540; desenha para baixo (scaleY) e liga as cenas"
  caixa-da-trilha: "creme #FDF9F0, borda 5-6px grafite, raio 30-40px, Outfit 700"
  caixa-verde: "fundo #E8F3E6 ou #DFF3D8, borda #2E7D32 (o que marca ou entende)"
  caixa-vermelha: "fundo #3A1714, borda #D5382F, texto #FF8A7A (sai do automático e vai para a pessoa)"
  caixa-cinza: "borda tracejada #8FA396, sem fundo (ele não responde)"
  bolha: "WhatsApp: cliente branca com ponta embaixo à esquerda; bot #2E7D32 ou #DFF3D8"
  carimbo: "branco, borda 7px #2E7D32, girado -10 graus, bate com power4.in"
---

# guara.bot · identidade dos vídeos de anúncio

## Overview

Vídeos de anúncio do guara.bot, o assistente de IA no WhatsApp da nanoguará.ia. Fundo verde floresta, caixas creme, um único acento de ação em vermelho guaraná. O mascote é o fruto do guaraná (nunca um pássaro) e aparece com as poses oficiais.

## The Frame

- Fundo sempre verde floresta com 1 ou 2 brilhos radiais suaves de verde (e um toque de guaraná no canto oposto). Nada de degradê linear em tela cheia.
- Foto de barbearia só como fundo desfocado e escurecido, enquadrada sem o mascote.
- A oferta final troca para fundo vermelho guaraná, aberto por íris a partir do fim da linha da trilha.

## Composition Rules

- **Fio condutor:** a linha verde da trilha atravessa as cenas e puxa a câmera para baixo. Direção única: a câmera desce, o conteúdo sobe.
- **Transição padrão:** saída `y -280, blur 18px, 0,28 s power2.in` casada com entrada `y 280→0, blur 18→0, 0,42 s power3.out`.
- **Texto:** frases curtas, grandes, legíveis no mudo. Títulos em dois golpes (segunda linha em acento).
- **Mascote:** poses oficiais em `docs/marketing/brand/guara-bot/poses` (01 acenando, 03 pensando, 05 confirmando, 12 apontando). Não recolorir, não recortar. Grafia sempre "guara.bot", minúsculo.
- **Quadro final parado** por ~1,5 s com a oferta.

## Do's and Don'ts

- Faça: conteúdo só com o que o produto faz de verdade (conferir o prompt e o estado-atual da instalação antes de prometer).
- Faça: horários e mensagens marcados como exemplo de uso; nomes de pessoa nunca reais.
- Não faça: número de resultado, depoimento, nome de cliente, logo do Google, pagamento automático, prazo de lembrete ("de manhã", "uma vez só").
- Não faça: neon, brilho em botão, texto com degradê, travessão, emoji.
- Não escreva link nem botão no vídeo: o CTA é o botão do anúncio.
