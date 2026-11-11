---
name: guara.bot clínicas · nanoguará.ia
colors:
  fundo: "#123B26"
  fundo-profundo: "#0D2C1C"
  creme: "#FDF9F0"
  papel-chat: "#EFE9DF"
  verde: "#2E7D32"
  verde-claro: "#8FD19A"
  verde-selo: "#1E4A30"
  texto-selo: "#EDF3EE"
  guarana: "#D5382F"
  guarana-claro: "#FF8A7A"
  guarana-fundo: "#3A1714"
  grafite: "#17231B"
  texto-secundario: "#55655B"
  cinza-ocupado: "#7C837E"
  chat-cliente: "#FFFFFF"
  chat-bot: "#DFF3D8"
typography:
  display: { family: "Outfit", weight: 700, file: "assets/outfit-700.woff2", tracking: "-2px" }
  texto: { family: "Geist", weight: 500, file: "assets/geist-500.woff2" }
  tamanhos: { gancho: "120-300px", titulo: "88-110px", linha: "54-70px", bolha: "40-46px", rotulo: "26-36px" }
spacing:
  margem-lateral: "70-84px"
  zona-segura-9x16: "y 250 a 1540"
components:
  rotulo-publico: "pílula creme, texto grafite Geist 500, ponto verde; diz para quem é o anúncio no primeiro segundo"
  celular: "moldura #0D2C1C raio 64px, cabeçalho verde #2E7D32 com 'Seu consultório' e hora, fundo do chat #EFE9DF"
  bolha: "paciente branca à esquerda; guara.bot #DFF3D8 à direita; hora pequena #7C837E; perda com borda #D5382F"
  cartao-conta: "creme #FDF9F0, raio 48px, linhas grafite, resultado em #D5382F"
  selo: "pílula #1E4A30 com borda #2E7D32 e check verde-claro; selo de 'vai para a equipe' em #3A1714 com borda #D5382F"
  carimbo: "branco, borda 7px #2E7D32, girado -10 graus, bate com power4.in"
---

# guara.bot · anúncio do diagnóstico para clínicas

## Overview

Vídeo de anúncio do guara.bot para donos de consultório e clínica em Manaus. Mesma identidade dos vídeos de anúncio da nanoguará.ia (derivada de `videos/guara-bot-trilha-barbearia/frame.md`, aprovada pelo dono em 2026-10-06): fundo verde floresta, caixas creme, um único acento de alerta em vermelho guaraná. O mascote é o fruto do guaraná (nunca um pássaro) e aparece só com as poses oficiais.

## The Frame

- Fundo sempre verde floresta com 1 ou 2 brilhos radiais suaves de verde e um toque de guaraná no canto oposto. Nada de degradê linear em tela cheia.
- A chamada final troca para fundo vermelho guaraná, aberto por íris de baixo para cima.
- O mascote só entra quando o produto entra (cena 4). Gancho, espera e conta ficam sem ele: a virada é ele chegando.

## Composition Rules

- **Público no primeiro segundo:** rótulo "Consultório em Manaus" no topo durante o gancho.
- **Transição padrão:** saída `y -280, blur 18px, 0,28 s power2.in`; entrada `y 280→0, blur 18→0, 0,42 s power3.out`.
- **Texto:** frases curtas, grandes, legíveis no mudo. Títulos em dois golpes (segunda linha em acento).
- **Exemplos rotulados:** toda conversa e toda conta leva o rótulo "exemplo" ou "conta de exemplo".
- **Quadro final parado** por ~1,5 s com a chamada.

## Do's and Don'ts

- Faça: conteúdo só com o que o produto faz de verdade, igual à landing `/guarabot/clinicas` (responde valor e convênio, mostra só horário livre, marca, lembra na véspera, passa saúde para a equipe).
- Faça: números só os 3 com fonte (62% Opinion Box 2025, 1 em 3 clínicas Doctoralia/Feegow 2025, 59% Opinion Box 2025) e a conta de exemplo da landing (2 × R$ 150 × 22 = R$ 6.600).
- Não faça: número de resultado do produto, depoimento, nome de cliente, nome de pessoa, logo do Google ou do WhatsApp, prazo, urgência, escassez.
- Não faça: neon, brilho em botão, texto com degradê, travessão, emoji.
- Não escreva link nem botão no vídeo: o CTA é o botão do anúncio.
- Não prometa resposta imediata do número da nanoguará: o diagnóstico é feito pela equipe.
