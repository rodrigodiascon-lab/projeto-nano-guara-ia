# Proposta: anúncios de consultórios levando à landing /guarabot/clinicas

Data: 2026-10-15 (Manaus). Campanha 120250508582710113, R$ 100/dia, até 26/10. Pedido do dono: trocar o destino do quiz (/iaparaconsultorios) para a landing (/guarabot/clinicas). Estado: opção A escolhida pelo dono em 15/10. Site com ref do anúncio no ar (d3678cf8); conjunto e 15 anúncios criados PAUSADOS (criacao-consultorios-landing-2026-10-15.json).

## Fatos

- Quiz, 11 a 15/10: R$ 410, 2 leads reais (1 do público certo). Taxa de quem passa da 1ª pergunta caiu de 15% para cerca de 3% em 14 e 15/10.
- A landing de clínicas nunca recebeu anúncio. Ela tem botões "Chamar no WhatsApp" (ação principal) e um formulário "Prefere que a gente chame você?" (dispara o Lead do pixel, igual ao quiz).
- A landing de barbearias, mesmo modelo, recebeu 1.025 visitas pagas em outubro: nenhum formulário real e nenhum clique no WhatsApp medido.
- O clique no WhatsApp só é medido para quem aceita cookies. Hoje a conversa que chega pelo WhatsApp não diz de qual anúncio veio.

## Riscos de mandar tudo para a landing

1. Medição: a ação principal (WhatsApp) quase não aparece para a Meta. Otimizando por Lead, ela aprende só com o formulário, que é raro; otimizando por clique no WhatsApp, aprende com uma amostra pequena (só quem aceitou cookies).
2. Aprendizado e revisão: os 15 anúncios precisam de criativo novo (link novo), voltam para a revisão da Meta e o aprendizado recomeça. Faltam 11 dias de campanha.
3. Sem comparação: trocando tudo, não dá para saber se a landing é melhor que o quiz.

## Opções

**A. Tudo para a landing (o pedido).** Conjunto novo com os mesmos 15 criativos apontando para a landing, otimizando por Lead (formulário). O conjunto do quiz fica pausado. Volta ao quiz: reativar o conjunto antigo.

**B. Teste lado a lado (recomendada).** Conjunto novo da landing com gasto mínimo de R$ 40/dia; o conjunto do quiz segue com o restante (cerca de R$ 60/dia). Total igual, R$ 100/dia. Depois de 5 dias, compara custo por contato real (formulário + conversas no WhatsApp) e fica com o vencedor.

## Pré-requisito nas duas opções (site)

A mensagem pronta do WhatsApp na landing passa a levar o anúncio de origem, por exemplo "Oi, tenho um consultório e quero saber do guara.bot. (ref obj01)". Assim cada conversa no seu WhatsApp diz de qual anúncio veio, mesmo sem cookie. Mudança pequena no site, com testes e deploy.

## Passos (cada um com aprovação própria)

1. Site: referência do anúncio na mensagem do WhatsApp da landing.
2. Meta: criar o conjunto da landing e os 15 anúncios, tudo PAUSADO; conferir prévias.
3. Meta: ativar (A: e pausar o conjunto do quiz; B: só ativar, com o mínimo de R$ 40).
