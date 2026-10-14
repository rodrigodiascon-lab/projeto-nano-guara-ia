# Proposta: menos saída na 1ª tela do quiz de consultórios

Data: 2026-10-14 (Manaus). Página /iaparaconsultorios. Estado: aprovada pelo dono e no ar em 2026-10-14 ~01h20 (Manaus), versão e245c367. O dono confirmou que mostra a demo no WhatsApp.

## Diagnóstico

- A "etapa 1" do contador é registrada quando a página abre com a 1ª pergunta na tela. Não exige toque.
- 11 a 13/10, visitas vindas de anúncio: 126 viram a 1ª pergunta, 19 responderam (15%). Em 13/10: 52 viram, 10 responderam (19%).
- Quem responde a 1ª costuma ir até o fim: em 13/10, 10 responderam a 1ª, 5 chegaram ao contato e 2 enviaram.
- Ou seja: o problema não é a pergunta ser difícil (é um toque só, e avança sozinha). A pessoa chega, não entende por que responder e sai.
- A página não diz quantas perguntas são, quanto tempo leva nem o que a pessoa ganha no fim.

## Sugestão (mudança só de texto, sem mexer nos anúncios)

1. Acima da 1ª pergunta, uma linha de compromisso baixo:
   "6 perguntas rápidas · cerca de 30 segundos"
2. Uma linha dizendo o que acontece no fim (texto depende do que o dono confirmar que entrega):
   "No fim, você conversa com a gente no WhatsApp e vê como o guara.bot atenderia o seu consultório."
3. Pergunta 1 mais convidativa, mesmas opções:
   de "Qual o segmento da sua clínica?"
   para "Vamos começar: qual é a área do seu consultório?"
4. Contador "1 de 6" passa a mostrar "Pergunta 1 de 6" (deixa claro que é curto).

## O que não muda

Opções, ordem das perguntas, formulário final, pixel, aviso de cookies, anúncios e verba.

## Como medir

Comparar por dia a taxa etapa 2 / etapa 1 (só visitas de anúncio) antes (11 a 13/10: 15%) e depois. Com o volume atual (~50 visitas/dia), ler depois de 4 a 5 dias. Não é teste A/B: é antes e depois, então serve como sinal, não como prova.

## Risco

Baixo. Mudança de texto, reversível. Testes do site (vitest e Playwright) rodam antes do deploy.

## Como ficou no ar

- Desktop: linha de abertura acima da 1ª pergunta ("Poucas perguntas, menos de 1 minuto. No fim, você conversa com a gente no WhatsApp e vê como o guara.bot atenderia o seu consultório."), pergunta nova e contador "Pergunta 1 de 6".
- Celular: a linha de abertura não coube (empurrava as opções para baixo do aviso de cookies; o teste de layout pegou). No lugar, o subtítulo do topo ficou curto e leva a promessa: "O guara.bot atende e agenda no WhatsApp. Em menos de 1 minuto, você pede a demo." O texto "Assunto delicado ele passa para a sua equipe" segue só no desktop.
- Testes: 173 vitest e 68 Playwright passando antes do deploy.
