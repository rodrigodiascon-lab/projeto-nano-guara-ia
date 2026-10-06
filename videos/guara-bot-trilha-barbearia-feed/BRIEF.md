---
workflow: general-video
flow: automation
storyboard: yes
message: "Do 'oi' ao horário marcado, sem você largar a máquina"
destination: meta-ads
aspect: 1080x1350
language: pt-BR
audience: donos de barbearia em Manaus que atendem sozinhos
length: 20s
angle: trilha de atendimento
---

## Intent

Vídeo de anúncio (Meta Ads, Reels e Stories) mostrando a trilha de atendimento do
guara.bot na barbearia: "O caminho de uma mensagem". Pedido do dono: "quero um vídeo
dessa trilha de atendimento, bem dinâmico" e "capricha nisso". Sem narração: só música
e sons de notificação, texto grande legível no mudo.

## Assets

- ../../site/public/brand/guara-bot/*.webp e ../../docs/marketing/brand/guara-bot/poses/*.png — poses oficiais do guara.bot (v3). Não recolorir, não recortar.
- ../../site/public/brand/guara-bot/barbearia-hero-1080.webp — cenário da barbearia (recorte sem texto do criativo v10).
- assets/musica.wav — música do catálogo HeyGen (bgm_002, 129 BPM), virada alinhada à entrada do guara.bot.

## Customizations

- Câmera percorre a trilha caixa por caixa (fluxograma inteiro não cabe legível em 9:16); afastamento final revela a trilha toda.
- Cortes no tempo da música; sons de notificação nas mensagens.

## Notes

- Conteúdo igual à trilha da landing /guarabot/barbearias: entra mensagem → guara.bot entende → é assunto da barbearia? (propaganda/conversa pessoal: fica quieto; pediu você ou ele não sabe: passa para você) → saber algo / marcar (agenda de verdade, só horário livre, confere e marca) / remarcar ou cancelar → lembrete na véspera.
- Fechamento: "15 dias grátis, sem cartão" + guara.bot apontando. Sem link e sem botão escrito (o CTA "Enviar mensagem" é do anúncio).
- Proibido: números de resultado, depoimentos, citar a Garcia Barbearia, pagamento automático, "de manhã"/"uma vez só" no lembrete.
- Grafia: sempre "guara.bot" minúsculo. Mascote é fruto do guaraná, não pássaro. Zero travessão e zero emoji no texto.
- Paleta e fontes da nanoguará: verde #2E7D32, guaraná #D5382F, creme #FDF9F0, grafite #17231B; Outfit 700 + Geist.

## Versão feed 4:5 (2026-10-06)

- Projeto novo copiado de ../guara-bot-trilha-barbearia (vertical 9:16, já aprovado e renderizado), a pedido do dono: "faz a versão 4:5 para o feed".
- Mesmo roteiro, cenas, música e sons; só o layout foi refeito para 1080x1350, com margem de 60 px em cima e embaixo.
- Fundo das cenas 1 e 2 usa assets/barbearia-esq.webp (só a metade da barbearia), porque no 4:5 o enquadramento mostrava o guara.bot antes da entrada dele.
