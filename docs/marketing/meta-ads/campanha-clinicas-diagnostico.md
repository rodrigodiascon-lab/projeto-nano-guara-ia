# Campanha de clínicas: diagnóstico pelo WhatsApp

Criado em 16/10/2026, a partir do estudo [`analise-referencias-tolki-2026-10-16.md`](analise-referencias-tolki-2026-10-16.md). Funil escolhido pelo dono: o anúncio leva ao WhatsApp, a pessoa responde 4 perguntas e recebe a conta do próprio consultório. Por enquanto quem responde no WhatsApp é o Rodrigo, com as mensagens prontas abaixo.

## Rota principal: site (decisão de 16/10/2026)

Depois de ver que nenhum dos 84 anúncios da Tolki leva direto ao WhatsApp, o dono escolheu o site como rota principal. Motivos: quem preenche o formulário espera ser chamado (dá para responder de manhã), a campanha otimiza por lead do pixel (sinal mais forte que conversa iniciada) e a landing já tem a calculadora.

- **Vídeos versão site:** os mesmos 5, com a frase final trocada para "Coloque os números do seu consultório e veja a conta.", igual à calculadora da landing. Arquivos com sufixo `-site` em `videos/guara-bot-diagnostico-clinicas/renders/` e `videos/guara-bot-conversa-clinicas/renders/`.
- **No Meta:** conjunto "Manaus | Consultórios | Landing clínicas | Vídeos diagnóstico" (`120250583235540113`), **pausado**, dentro da campanha "NG | guara.bot | Consultórios | Site | Manaus" (`120250508582710113`). Mesma configuração do conjunto da landing que está no ar: lead do pixel, só Manaus, 25 a 65 anos. Anúncios VD01 a VD05, destino `/guarabot/clinicas`, botão "Saiba mais", `utm_content` vd01 a vd05.
- **Texto:** o gancho de cada vídeo e o corpo comum, com o fim trocado para "Toque em Saiba mais, coloque os números do seu consultório e veja a conta de quanto pode estar ficando sem resposta. Sem compromisso."
- **Para ligar:** ativar o conjunto. A campanha divide o orçamento entre os conjuntos, então o total continua R$ 100 por dia, agora repartido com os 15 anúncios da landing.
- **Leads do formulário:** quando a pessoa pede "Quero que me chamem", o Rodrigo chama no WhatsApp e pode usar o roteiro abaixo, abrindo com a resposta rápida **/site**:

> Oi, {nome}! Aqui é o Rodrigo, da nanoguará.ia. Você pediu para a gente chamar pelo site. Posso te fazer 4 perguntas rápidas e te mandar a conta do seu consultório?

A campanha do WhatsApp (abaixo) fica pausada como teste para quando o guara.bot atender o número da nanoguará.

## No Meta (criado pausado em 16/10/2026)

- Campanha: NG | guara.bot | Consultórios | WhatsApp | Manaus (`120250582748990113`), conversas no WhatsApp, R$ 30 por dia na campanha, **pausada**.
- Conjunto: Manaus | Consultórios | Conversas WhatsApp (`120250582749710113`): só Manaus, 25 a 65 anos, Advantage+, posicionamentos Advantage+.
- Anúncios: AD01 (`120250582767280113`), AD02 (`120250582767840113`), AD03 (`120250582768130113`), AD04 (`120250582768470113`), AD05 (`120250582769100113`). Cada um com vídeo 4:5 no Feed e 9:16 em Stories e Reels.
- Prévias conferidas: Feed do Facebook (AD01) e Stories do Instagram (AD05), com a Página nanoguara.ia e o botão de WhatsApp.
- Registro técnico: `meus-produtos/nanoguara/captacao/campanhas/` (campanhas.yaml, preview e payload de 2026-10-16).
- **Limite de gasto da conta:** R$ 1.100, com R$ 821,85 já gastos em 16/10. A campanha do site a R$ 100 por dia chega ao limite em poucos dias; quando chegar, todos os anúncios da conta param. Ajustar o limite no Gerenciador se for o caso.

## Os vídeos

Todos 1080x1920, H.264 com som, sem música, sem narração. O conteúdo foi descido 40 px para caber também no recorte 4:5 do Feed.

| Anúncio | Arquivo | Duração | O que é |
|---|---|---|---|
| AD01 | `videos/guara-bot-diagnostico-clinicas/renders/guara-bot-clinicas-A1-2140.mp4` | 30,5 s | gancho "Sábado, 21h40. Quem responde?" |
| AD02 | `videos/guara-bot-diagnostico-clinicas/renders/guara-bot-clinicas-A2-demora.mp4` | 30,5 s | gancho "O paciente não reclama da demora. Ele marca em outro lugar." |
| AD03 | `videos/guara-bot-diagnostico-clinicas/renders/guara-bot-clinicas-A3-de-cabeca.mp4` | 30,5 s | gancho "Responda de cabeça" |
| AD04 | `videos/guara-bot-diagnostico-clinicas/renders/guara-bot-clinicas-A4-62.mp4` | 30,5 s | gancho "62%" (Opinion Box, 2025) |
| AD05 | `videos/guara-bot-conversa-clinicas/renders/guara-bot-clinicas-C1-conversa.mp4` | 24 s | a conversa de exemplo inteira, terminando na dúvida de saúde que vai para a equipe |

Os quatro primeiros são o mesmo vídeo com o gancho trocado (variável `gancho` do projeto). Para gerar outro gancho: acrescentar a versão em `index.html` e uma linha em `rows.json`, e renderizar em lote.

## Texto dos anúncios

Primeira linha de cada anúncio (o gancho, igual ao do vídeo):

- **AD01:** Sábado, 21h40. Um paciente pergunta o valor da limpeza. Quem responde?
- **AD02:** O paciente não reclama da demora. Ele marca em outro lugar.
- **AD03:** Responda de cabeça: quantos pacientes chamaram seu WhatsApp este mês? Quantos marcaram?
- **AD04:** 62% das pessoas desistem de comprar depois de uma experiência ruim no WhatsApp. (Opinion Box, 2025)
- **AD05:** Às 21h40, um paciente chama o consultório. Veja a conversa com o guara.bot, do primeiro oi ao horário marcado.

Corpo comum, embaixo do gancho:

> O guara.bot é o assistente de IA que atende o WhatsApp do seu consultório enquanto você está em consulta. Responde valor, endereço e convênio na hora, mostra só horário livre, marca a consulta e lembra o paciente na véspera. Dúvida de saúde vai direto para você ou para a sua equipe.
>
> Toque em Enviar mensagem, responda 4 perguntas rápidas e receba a conta de quanto o seu consultório pode estar deixando sem resposta. Sem compromisso.
>
> Consultórios e clínicas em Manaus.

**Título:** Seu WhatsApp responde às 21h40?
**Descrição:** Assistente de IA para consultórios de Manaus
**Botão:** Enviar mensagem (WhatsApp)

**Saudação** (aparece na janela do anúncio): "Olá! Que bom receber você. São 4 perguntas rápidas e no final você recebe a conta do seu consultório."

**Mensagem pronta** (o que a pessoa envia ao tocar no botão; cada anúncio tem a sua, para saber de onde veio a conversa):

| Anúncio | Mensagem pronta |
|---|---|
| AD01 | Oi! Vi o anúncio das 21h40 e quero a conta do meu consultório. |
| AD02 | Oi! Vi o anúncio sobre a demora e quero a conta do meu consultório. |
| AD03 | Oi! Vi o anúncio das perguntas de cabeça e quero a conta do meu consultório. |
| AD04 | Oi! Vi o anúncio dos 62% e quero a conta do meu consultório. |
| AD05 | Oi! Vi a conversa do guara.bot e quero a conta do meu consultório. |

## Antes de ativar

1. **Responder rápido.** O anúncio inteiro fala de paciente sem resposta; se a nanoguará demorar, ele se desmente. Configurar no WhatsApp Business as respostas rápidas abaixo e a mensagem de ausência, e só ativar em horário em que dá para responder.
2. **A campanha de clínicas para a landing está ativa** desde 15/10 à noite (conjunto `120250579675410113`, 15 anúncios). As duas disputam o mesmo público em Manaus. Opções: (a) pausar a da landing e ligar esta; (b) ligar esta com R$ 30 por dia ao lado da outra por 7 dias e comparar custo por conversa com custo por lead; (c) manter só a da landing por enquanto.
3. **Conferir as prévias** dos 5 anúncios no Gerenciador (Feed e Reels): botão de WhatsApp e mensagem pronta.
4. **Ativar** pedindo "ativa a campanha do diagnóstico". O total por dia aparece antes, e só liga com a palavra ATIVAR.

## Roteiro do diagnóstico (respostas rápidas do WhatsApp Business)

Cadastrar em Ferramentas comerciais, Respostas rápidas. O atalho fica à esquerda.

**/oi**
> Oi! Aqui é o Rodrigo, da nanoguará.ia. Que bom que você chamou. A conta leva 4 perguntas rápidas e no final eu te mando o resultado. Vamos lá?

**/p1**
> 1 de 4: qual é a especialidade do consultório e quantos profissionais atendem aí?

**/p2**
> 2 de 4: mais ou menos quantas mensagens de paciente chegam por dia no WhatsApp?

**/p3**
> 3 de 4: dessas, quantas ficam sem resposta ou só são respondidas no dia seguinte? Pense nas que chegam durante a consulta, à noite e no fim de semana.

**/p4**
> 4 de 4: qual o valor médio de uma consulta ou avaliação?

**/conta** (trocar os números pelos que a pessoa respondeu: resposta 3 × resposta 4 × 22)
> Pronto, a conta do seu consultório:
> {sem resposta por dia} mensagens × R$ {valor} × 22 dias de atendimento = R$ {total} por mês em consultas que podem estar ficando fora da agenda.
> É uma conta simples, com os números que você me passou. Não é promessa de resultado: é o tamanho do que vale a pena olhar.

**/presente**
> E um presente: 100 mensagens prontas de WhatsApp para consultório, para a sua recepção usar hoje mesmo: https://nanoguara.ia.br/bonus/100scripts

**/proposta**
> Quer ver como o guara.bot responderia essas mensagens no seu WhatsApp, com os seus horários e valores? Posso mandar a proposta por aqui ou passar no consultório, aqui em Manaus. O que fica melhor para você?

**Dúvidas comuns**

- **/robo:** Ele é um assistente de IA: conversa de forma natural, se apresenta como assistente virtual e passa para você ou para a sua equipe quando o paciente pede.
- **/saude:** Dúvida de saúde ele não responde. Sintoma, dúvida sobre tratamento ou urgência vão direto para você ou para a sua equipe.
- **/numero:** Não precisa trocar de número. Ele atende no WhatsApp que o consultório já usa, conectado por QR Code, como no WhatsApp Web.
- **/secretaria:** Ela continua essencial. O guara.bot tira dela as perguntas repetidas de valor e horário, e ela fica livre para quem está na sala de espera.
- **/valor:** O valor depende de quantos profissionais atendem e do que o consultório precisa. Me conta isso que eu te passo aqui na conversa.

**Mensagem de ausência** (fora do horário):
> Oi! Recebi sua mensagem. A conta do seu consultório é feita pela nossa equipe e eu respondo a partir das 8h. Se quiser adiantar: qual a especialidade do consultório e quantos profissionais atendem aí?

## Como medir

Cada anúncio tem a sua mensagem pronta, então a primeira mensagem de cada conversa diz de qual anúncio ela veio (a conexão do WhatsApp não traz essa origem sozinha). Anotar por anúncio: conversas, quem respondeu as 4 perguntas, quem pediu proposta, visitas marcadas. A Meta mostra o custo por conversa; o resto só a contagem no WhatsApp mostra.

Primeira leitura com 7 dias ou cerca de R$ 250 gastos: desligar o anúncio com o pior custo por conversa respondida e trocar por outro gancho do banco do estudo.

## Vídeo B: roteiro para o Rodrigo gravar

Formato do campeão da Tolki: a pessoa da empresa falando para a câmera, com a caixinha de pergunta do Instagram no topo.

- **Como gravar:** celular em pé, na altura dos olhos, luz de janela de frente, sem música. Começar falando no primeiro segundo, sem "oi, tudo bem". Gravar 3 vezes e mandar a melhor; a caixinha e a legenda eu coloco depois.
- **Caixinha no topo:** "Quanto custa deixar o paciente sem resposta?"
- **Fala (cerca de 25 s):**

> Dono de consultório em Manaus: quanto custa deixar o paciente sem resposta no WhatsApp? Dá para saber com uma conta simples. Quantas mensagens ficam sem resposta por dia, vezes o valor da consulta, vezes 22 dias. Na conta de exemplo, duas mensagens e uma consulta de 150 reais dão 6.600 reais por mês. Quer a conta do seu? Toca no botão e me chama no WhatsApp. São 4 perguntas.

Quando o vídeo B existir, ele entra numa segunda torre ou no lugar do anúncio com pior resultado (estrutura de até 5 anúncios por conjunto).
