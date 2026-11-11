// Bônus /bonus/100scripts: os 100 scripts. Texto original da nanoguará.ia.
// Marcadores: {nome}, {servico}, {valor} e {da_clinica}/{na_clinica}/{a_clinica}
// vêm dos dados do visitante (o JS escolhe da/do, na/no, a/o pelo nome digitado);
// [entre colchetes] é o que a pessoa completa à mão antes de enviar.
// Regras de copy: sem promessa de resultado, sem pressão, sem preço de promoção,
// sem urgência inventada, sem travessão, sem emoji.
window.NG100 = {
  etapas: [
    { n: 1, nome: "Primeiro contato", desc: "Responder bem ao primeiro oi, de dia, de noite ou vindo de anúncio." },
    { n: 2, nome: "Reativar contatos", desc: "Voltar a falar com quem sumiu, sem pressão e sem cara de propaganda." },
    { n: 3, nome: "Entender o paciente", desc: "Perguntas simples para saber o que a pessoa precisa antes de propor algo." },
    { n: 4, nome: "Apresentar o atendimento", desc: "Explicar consulta, valor e preparo de forma clara e honesta." },
    { n: 5, nome: "Acompanhar", desc: "Retomar a conversa quando a pessoa leu e não respondeu." },
    { n: 6, nome: "Dúvidas e objeções", desc: "Responder preço, medo e hesitação com respeito." },
    { n: 7, nome: "Agendar", desc: "Marcar, confirmar e reduzir faltas." },
    { n: 8, nome: "Depois da consulta", desc: "Cuidar do retorno, pedir opinião e resolver faltas e remarcações." }
  ],
  situacoes: [
    { id: "preco", nome: "Perguntou o valor", desc: "A conversa começou com “quanto custa?” ou “qual o valor?”." },
    { id: "sumiu", nome: "Leu e não respondeu", desc: "Aparece como visualizada, mas a pessoa silenciou." },
    { id: "caro", nome: "Achou caro", desc: "Disse que o valor está alto ou que não cabe agora." },
    { id: "pensar", nome: "Disse que vai pensar", desc: "Respondeu “vou ver”, “depois eu falo” ou parecido." },
    { id: "familia", nome: "Precisa falar com a família", desc: "Quer conversar com o marido, a esposa, os pais ou outra pessoa." },
    { id: "desconto", nome: "Pediu desconto", desc: "Perguntou se faz por menos, se tem promoção ou abatimento." },
    { id: "faltou", nome: "Faltou à consulta", desc: "Não apareceu no horário marcado." },
    { id: "remarcar", nome: "Precisa remarcar", desc: "A pessoa, ou a clínica, não consegue manter o horário." }
  ],
  scripts: [
    // ---------------- Etapa 1: Primeiro contato (12) ----------------
    { e: 1, t: "Primeira resposta no horário de atendimento",
      q: "A pessoa manda só um oi ou um bom dia e mais nada.",
      o: "Mostra que há alguém de verdade do outro lado e devolve a conversa para quem escreveu.",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Que bom receber sua mensagem.

Me conta com suas palavras o que você está procurando, que eu te oriento direitinho.` },
    { e: 1, t: "Primeira resposta fora do horário",
      q: "A mensagem chegou à noite, no fim de semana ou em feriado.",
      o: "Combina quando a resposta vem, sem prometer o que a equipe não consegue cumprir.",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Recebi sua mensagem fora do nosso horário de atendimento.

No próximo dia de atendimento, a partir das [horário de abertura], eu respondo com calma. Se quiser adiantar, já me conta o que você precisa.` },
    { e: 1, t: "Veio pelo anúncio",
      q: "A pessoa escreve “vi o anúncio” ou envia o texto pronto do botão do anúncio.",
      o: "Em vez de repetir o anúncio, pergunta o que despertou o interesse e dirige a conversa.",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Que bom que você chamou.

Vi que você veio pelo nosso anúncio. O que chamou sua atenção nele? Assim eu explico só o que faz sentido para você.` },
    { e: 1, t: "Veio por indicação",
      q: "Alguém indicou a clínica e a própria pessoa cita quem foi. Só cite o nome se ela mencionou primeiro.",
      o: "Reconhece a indicação sem expor ninguém e abre espaço para a necessidade da pessoa.",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Fico feliz que [nome de quem indicou] tenha lembrado da gente.

Me conta o que você está precisando, que eu já te ajudo.` },
    { e: 1, t: "Perguntou só se tem horário",
      q: "A primeira mensagem é apenas “tem horário?” ou “tem vaga?”.",
      o: "Uma pergunta de contexto evita marcar o tipo errado de atendimento.",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Temos horários, sim.

É para {servico} ou para outro atendimento? Com isso eu te mostro as opções certas.` },
    { e: 1, t: "Perguntou o valor logo de cara", s: ["preco"],
      q: "A primeira mensagem é “quanto custa?” ou “qual o valor?”.",
      o: "Não foge da pergunta, mas pede um dado a mais para que o valor chegue com o contexto certo.",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Posso te informar, sim.

O valor muda conforme o que você precisa. Me diz: é para {servico}, para um retorno, ou você ainda está decidindo por onde começar?` },
    { e: 1, t: "Perguntou se atende convênio",
      q: "Antes de tudo, a pessoa quer saber se o plano dela é aceito.",
      o: "Responde direto e já deixa a porta aberta para o próximo passo, qualquer que seja a resposta.",
      m: `Oi, [nome do paciente]! Sobre convênios: [informe quais planos a clínica atende, ou diga que o atendimento é particular].

Se fizer sentido para você, explico como funciona o atendimento e vejo um horário. Pode ser?` },
    { e: 1, t: "Perguntou onde fica",
      q: "A pessoa pede o endereço ou como chegar.",
      o: "Entrega a informação completa de uma vez e já avança para o horário.",
      m: `Ficamos em [endereço completo], perto de [ponto de referência]. Mando a localização logo abaixo.

[Se houver estacionamento ou acesso facilitado, informe aqui.]

Quer que eu veja um horário para você?` },
    { e: 1, t: "Mandou um áudio longo",
      q: "A pessoa explica tudo em áudio e você não pode ouvir agora, ou prefere confirmar por escrito.",
      o: "Agradece, mostra respeito e confirma o essencial por texto para não entender nada errado.",
      m: `Oi, [nome do paciente]! Recebi seu áudio e agradeço por explicar com tantos detalhes.

Para eu não entender nada errado, me confirma por texto: o que você mais quer resolver neste momento?` },
    { e: 1, t: "Deixou o contato em um formulário",
      q: "A pessoa preencheu um formulário do site ou de um anúncio e é você quem inicia a conversa.",
      o: "Lembra de onde veio o contato e pede licença para a primeira pergunta.",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Você deixou seu contato com a gente e estou passando para ajudar.

Posso te fazer uma pergunta rápida sobre o que você procura?` },
    { e: 1, t: "Ligou e ninguém atendeu",
      q: "A pessoa ligou para a clínica, a chamada ficou sem resposta e você escreve primeiro.",
      o: "Assume o problema, pede desculpas curtas e oferece dois caminhos.",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Vi que você ligou e não conseguimos atender na hora. Desculpa por isso.

Prefere me explicar por aqui mesmo ou quer que eu ligue em um horário combinado?` },
    { e: 1, t: "Pediu para falar com o profissional",
      q: "Logo no começo, a pessoa pede para falar com o médico, dentista, psicólogo ou outro profissional.",
      o: "Explica o papel de cada um sem fazer a pessoa se sentir barrada.",
      m: `Oi, [nome do paciente]! Quem atende em consulta é [nome do profissional], que fica totalmente com o paciente durante o atendimento.

Eu cuido da agenda e das dúvidas por aqui. Me conta o que você precisa que eu encaminho ao profissional, se for o caso.` },

    // ---------------- Etapa 2: Reativar contatos (14) ----------------
    { e: 2, t: "Reativação simples, depois de meses",
      q: "Contato antigo que perguntou algo, ficou de voltar e nunca respondeu.",
      o: "Retoma sem cobrar. A pessoa responde quando quiser, sem se sentir devendo explicação.",
      u: "Conversa individual, uma pessoa por vez",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Faz um tempo que conversamos e eu lembrei de você.

Se ainda fizer sentido cuidar disso, é só me responder aqui que eu vejo um horário.` },
    { e: 2, t: "Quem não voltou para o retorno",
      q: "Paciente que fez a consulta e não retornou no prazo indicado pelo profissional.",
      o: "Parte de uma data concreta do histórico, o que dá motivo real para o contato.",
      u: "Conversa individual, uma pessoa por vez",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Olhando aqui, o seu retorno estava previsto para [mês]. Tudo bem com você?

Se quiser, eu já vejo um horário para fazermos esse acompanhamento.` },
    { e: 2, t: "Mensagem de cuidado, sem oferta",
      q: "Contato parado há bastante tempo e você quer reabrir a conversa de forma leve.",
      o: "Zero venda. Quando a abertura é só cuidado, a resposta costuma vir mais fácil depois.",
      u: "Conversa individual, uma pessoa por vez",
      m: `[nome do paciente], tudo bem? Aqui é {nome}, {da_clinica}. Estou passando só para saber como você está.

Se precisar de qualquer coisa por aqui, pode falar comigo.` },
    { e: 2, t: "Aviso de agenda aberta",
      q: "Abriram horários e você quer avisar quem já demonstrou interesse.",
      o: "Informação concreta e útil, sem escassez inventada. Só use se a agenda realmente abriu.",
      u: "Conversa individual, uma pessoa por vez",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Abriu agenda para [dias da semana] e lembrei de você, que tinha perguntado sobre {servico}.

Quer que eu reserve um horário?` },
    { e: 2, t: "Novidade no atendimento",
      q: "A clínica mudou de endereço, de horário ou passou a oferecer algo novo.",
      o: "Mudança real é um bom motivo para falar. Seja específico e curto.",
      u: "Conversa individual, uma pessoa por vez",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Passando para avisar uma novidade: [descreva a mudança em uma frase].

Se quiser saber como isso funciona na prática, me responde aqui.` },
    { e: 2, t: "Campanha de saúde do mês",
      q: "Mês de conscientização (como Outubro Rosa ou Novembro Azul) ligado à sua área.",
      o: "Conteúdo informativo geral, sem anunciar promoção, que é o formato mais seguro para o seu conselho.",
      u: "Conversa individual, uma pessoa por vez",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Neste mês falamos sobre [tema da campanha].

Uma orientação geral: [uma frase de informação confiável da sua área].

Se quiser conversar sobre o seu caso, estou por aqui.` },
    { e: 2, t: "Lembrete de acompanhamento anual",
      q: "Pacientes que costumam fazer uma avaliação por ano.",
      o: "O motivo é o calendário do próprio paciente, não uma oferta.",
      u: "Conversa individual, uma pessoa por vez",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Já faz cerca de um ano da sua última avaliação.

Quer que eu veja um horário para o seu acompanhamento deste ano?` },
    { e: 2, t: "Plano que ficou em aberto",
      q: "Você apresentou um plano de atendimento e a pessoa nunca respondeu.",
      o: "Pergunta se o plano ainda faz sentido e se algo mudou, em vez de insistir na proposta.",
      u: "Conversa individual, uma pessoa por vez",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Estou retomando os planos que ficaram em aberto e o seu é um deles.

Ainda faz sentido para você? Se algo mudou, me conta, que eu vejo o que dá para ajustar.` },
    { e: 2, t: "Quem disse que agora não era a hora",
      q: "A pessoa respondeu que não era o momento e você combinou de voltar a falar.",
      o: "Cumpre o que foi combinado e dá a opção de continuar esperando.",
      u: "Conversa individual, uma pessoa por vez",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Você tinha dito que não era o melhor momento e eu fiquei de voltar a falar depois.

Como estão as coisas por aí? Já dá para retomar, ou prefere que eu volte em outra data?` },
    { e: 2, t: "Aniversário do paciente",
      q: "Paciente cadastrado faz aniversário.",
      o: "Relacionamento puro. Sem venda, sem convite, só atenção.",
      u: "Conversa individual, uma pessoa por vez",
      m: `[nome do paciente], feliz aniversário! Desejo um ano com muita saúde e coisas boas.

Um abraço de toda a equipe {da_clinica}.` },
    { e: 2, t: "Atualização de cadastro",
      q: "Base antiga com telefone ou dados desatualizados.",
      o: "Pedir só o necessário e dizer para quê é uma boa prática de privacidade.",
      u: "Conversa individual, uma pessoa por vez",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Estamos atualizando nossos cadastros para falar só com quem quer ser lembrado.

Pode me confirmar seu nome completo e se este número continua sendo o melhor para falar com você? Agradeço!` },
    { e: 2, t: "Uma pergunta sincera sobre o que faltou",
      q: "A pessoa sumiu depois de conversar e você quer entender por quê.",
      o: "Convida à franqueza. A resposta vira informação para melhorar o atendimento.",
      u: "Conversa individual, uma pessoa por vez",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Uma pergunta rápida: o que te impediu de seguir com o atendimento da última vez?

Pode ser sincero, não tem resposta errada. Isso me ajuda a melhorar e a ajudar você melhor.` },
    { e: 2, t: "Nova forma de pagamento",
      q: "A clínica passou a aceitar um meio de pagamento que antes não aceitava.",
      o: "Fala com quem travou por causa do pagamento, sem mexer no valor.",
      u: "Conversa individual, uma pessoa por vez",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Uma informação que pode ajudar: agora aceitamos [nova forma de pagamento].

Se o pagamento era o que pesava, vale a gente conversar de novo. Quer que eu explique como fica?` },
    { e: 2, t: "Último recado de uma sequência",
      q: "Você já tentou algumas vezes e não houve resposta. Hora de encerrar com educação.",
      o: "Respeita a decisão da pessoa, deixa a porta aberta e preserva a imagem da clínica.",
      u: "Conversa individual, uma pessoa por vez",
      m: `Oi, [nome do paciente]! Aqui é {nome}, {da_clinica}. Não quero insistir, então este é o meu último recado por aqui.

Se um dia quiser retomar, é só escrever. Cuide-se!` },

    // ---------------- Etapa 3: Entender o paciente (10) ----------------
    { e: 3, t: "Descobrir o motivo da procura",
      q: "Começo da conversa de verdade, depois do cumprimento.",
      o: "Pergunta aberta e curta. Quem explica o motivo com as próprias palavras se envolve mais com a resposta.",
      m: `Para eu te indicar o melhor caminho, posso te fazer três perguntas rápidas?

A primeira: o que fez você procurar {a_clinica} agora?` },
    { e: 3, t: "Saber há quanto tempo",
      q: "A pessoa já contou o motivo e você precisa de contexto.",
      o: "O tempo da queixa ajuda o profissional a se preparar e mostra que você está escutando.",
      m: `Entendi, [nome do paciente]. Agradeço por me contar.

Há quanto tempo você convive com isso?` },
    { e: 3, t: "Perguntar se já fez algum tratamento",
      q: "Para saber o que já foi tentado, sem julgar.",
      o: "Evita repetir o que já falhou e mostra que cada caso é tratado de forma individual.",
      m: `Você já fez algum acompanhamento ou tratamento para isso antes? Se sim, pode me contar de forma resumida o que foi feito?

É só para o profissional chegar à consulta já sabendo do seu histórico.` },
    { e: 3, t: "Perguntar o que a pessoa espera",
      q: "Antes de propor a consulta.",
      o: "Entende a expectativa sem prometer nada. Anote a resposta para o profissional.",
      m: `Uma pergunta importante: o que seria um bom resultado para você depois do atendimento?

Não prometo resultado por mensagem, porque isso o profissional avalia em consulta. Mas saber o que você espera ajuda muito.` },
    { e: 3, t: "Entender a prioridade",
      q: "Para decidir se o horário pode esperar ou precisa ser logo.",
      o: "Deixa a pessoa dizer o grau de importância, em vez de você impor um ritmo.",
      m: `Isso está atrapalhando o seu dia a dia agora, ou dá para planejar com mais calma?

Pergunto para te oferecer o horário mais adequado.` },
    { e: 3, t: "Sinal de urgência: orientar sem diagnosticar",
      q: "A pessoa descreve dor forte, sangramento, falta de ar, desmaio ou algo que parece urgente.",
      o: "Segurança primeiro. A mensagem não avalia o caso, orienta a buscar atendimento adequado.",
      m: `[nome do paciente], pelo que você descreve, o mais seguro é procurar um atendimento de urgência agora. Eu não consigo avaliar o seu caso por mensagem.

Se for uma emergência, ligue para o SAMU no 192 ou vá ao pronto-atendimento mais próximo.

Quando estiver melhor, me chama, que eu cuido do seu retorno por aqui.` },
    { e: 3, t: "Crise emocional: acolher e encaminhar",
      q: "A pessoa fala em se machucar, em suicídio, em não querer mais viver ou em desespero. Avise o profissional responsável na mesma hora.",
      o: "Acolhe sem avaliar e aponta ajuda imediata. Quem recebe a mensagem não deve tentar resolver sozinho.",
      m: `[nome do paciente], agradeço por confiar isso a mim. Você não está sozinho(a).

Se estiver pensando em se machucar, ligue agora para o CVV no 188. É gratuito e funciona 24 horas. Em perigo imediato, ligue para o SAMU no 192 ou vá ao pronto-socorro mais próximo.

Posso avisar [nome do profissional] agora para entrar em contato com você?` },
    { e: 3, t: "Saber quem participa da decisão", s: ["familia"],
      q: "Antes de apresentar valores, quando o atendimento é para criança, idoso ou envolve a família.",
      o: "Descobrir cedo evita surpresas no fim da conversa.",
      m: `Esse atendimento é para você mesmo(a)? E a decisão é sua, ou você prefere incluir mais alguém na conversa, como família ou responsável?

Se quiser, preparo um resumo que você possa mostrar.` },
    { e: 3, t: "Particular ou convênio",
      q: "Quando ainda não ficou claro como será o atendimento.",
      o: "Uma pergunta objetiva que define o caminho, o valor e a documentação.",
      m: `Só para eu te orientar certo: você pretende fazer o atendimento de forma particular ou por convênio?

[Se for convênio, pergunte qual plano.]` },
    { e: 3, t: "Dias e horários que funcionam",
      q: "Antes de oferecer horários.",
      o: "Pergunta a restrição da pessoa em vez de listar a agenda inteira.",
      m: `Para eu achar um horário que realmente funcione para você: quais dias da semana e períodos (manhã, tarde ou noite) ficam melhores na sua rotina?` },
    { e: 3, t: "Resumir o que entendeu antes de propor",
      q: "Depois de conhecer o caso e antes de apresentar o atendimento.",
      o: "Devolver o resumo prova que você escutou e dá chance de corrigir algo.",
      m: `Deixa eu ver se entendi direito, [nome do paciente]:

[resuma em duas ou três linhas o que a pessoa contou]

Está certo? Se faltar alguma coisa, me avisa, que eu ajusto antes de te explicar o próximo passo.` },

    // ---------------- Etapa 4: Apresentar o atendimento (10) ----------------
    { e: 4, t: "Apresentar a primeira consulta",
      q: "Depois de entender a necessidade da pessoa.",
      o: "Liga o atendimento ao que a pessoa contou, em vez de descrever o serviço de forma genérica.",
      m: `Pelo que você me contou, o primeiro passo é uma consulta com [nome do profissional]. Nela, [descreva em uma frase o que acontece].

Dura cerca de [tempo]. Quer que eu veja um horário?` },
    { e: 4, t: "Informar o valor com o que está incluso", s: ["preco"],
      q: "A pessoa pediu o valor e você já sabe o que ela precisa.",
      o: "Valor sempre acompanhado do que ele cobre. Número solto parece mais caro.",
      m: `Para {servico}, o valor {na_clinica} é {valor}. Esse valor inclui [o que está incluso: tempo de consulta, retorno, avaliação, etc.].

Se tiver qualquer dúvida sobre o que entra, me pergunta.` },
    { e: 4, t: "Valor e formas de pagamento", s: ["preco"],
      q: "Depois de informar o valor, para tirar a dúvida seguinte antes que ela apareça.",
      o: "Antecipa a pergunta “e como eu pago?”.",
      m: `Sobre o pagamento: aceitamos [Pix, cartão em até x vezes, dinheiro, etc.]. [Se houver, diga quando o pagamento é feito: no agendamento ou no dia.]

Qual dessas formas é melhor para você?` },
    { e: 4, t: "Explicar como funciona, em três passos",
      q: "A pessoa nunca foi à clínica e não sabe o que esperar.",
      o: "Reduz a incerteza. Quem sabe o que vai acontecer tem menos motivo para adiar.",
      m: `Funciona assim:

1. Você escolhe o horário aqui comigo.
2. No dia, [o que acontece na chegada e na consulta].
3. Ao final, [o que a pessoa recebe ou combina: orientações, retorno, etc.].

Alguma parte você quer entender melhor?` },
    { e: 4, t: "Apresentar o profissional",
      q: "A pessoa quer saber quem vai atendê-la.",
      o: "Identificação profissional completa transmite segurança e é exigida pela maioria dos conselhos.",
      m: `Quem atende é [nome do profissional], [especialidade], [CRM/CRO/CRP/outro registro com número].

[Uma frase sobre a forma de atender, sem comparar com outros profissionais e sem prometer resultado.]` },
    { e: 4, t: "Duração e retornos",
      q: "A pessoa pergunta quanto tempo leva ou se vai precisar voltar.",
      o: "Honestidade sobre o que não dá para saber por mensagem gera mais confiança que uma promessa.",
      m: `A primeira consulta dura cerca de [tempo]. Se haverá retornos e quantos, só o profissional define depois de avaliar, e ele explica tudo na hora.

[Se existir uma regra de retorno da clínica, informe aqui.]` },
    { e: 4, t: "Orientar o preparo antes da consulta",
      q: "Depois de marcar, para a consulta render.",
      o: "Pedir o que trazer evita adiamentos e mostra organização.",
      m: `Para aproveitar melhor o atendimento, traga: [documento com foto, exames anteriores, lista de medicamentos, etc.].

[Se houver jejum ou outro preparo, explique aqui.]

Qualquer dúvida, é só chamar.` },
    { e: 4, t: "Apresentar um acompanhamento em etapas",
      q: "O atendimento é longo ou tem mais de uma fase.",
      o: "Divide o caminho em partes e deixa claro que a definição final é do profissional.",
      m: `O acompanhamento costuma ser feito em etapas. Na primeira, [descreva em uma frase]. As seguintes dependem da avaliação, e o profissional explica tudo em consulta.

Quer começar marcando a primeira etapa?` },
    { e: 4, t: "Responder “o que está incluso?”",
      q: "A pessoa pergunta o que exatamente ela leva pelo valor.",
      o: "Lista curta e concreta. Nada de adjetivos.",
      m: `Para {servico}, o valor inclui:

- [item 1]
- [item 2]
- [item 3]

[Se algo for cobrado à parte, diga com clareza o quê.]` },
    { e: 4, t: "Enviar o plano e os valores por escrito",
      q: "Depois de uma avaliação, quando o profissional definiu o plano.",
      o: "Registro escrito evita mal-entendido. Só informe prazo de validade se ele for real.",
      m: `Segue o plano conforme combinado na avaliação:

[itens e valores]

[Se houver prazo de validade real, informe e explique o motivo, como a tabela de um laboratório.]

Qualquer dúvida, estou aqui.` },

    // ---------------- Etapa 5: Acompanhar (14) ----------------
    { e: 5, t: "Acompanhamento no mesmo dia",
      q: "Algumas horas depois de enviar informações ou valores.",
      o: "Leve e curto. Não cobra resposta, só oferece ajuda.",
      m: `[nome do paciente], passando para ver se ficou alguma dúvida sobre o que te enviei. Estou por aqui.` },
    { e: 5, t: "Acompanhamento no dia seguinte",
      q: "A pessoa não respondeu depois de um dia.",
      o: "Dá tempo para pensar e volta com uma pergunta fácil de responder.",
      m: `Oi, [nome do paciente]! Conseguiu dar uma olhada no que te passei ontem?

Se ficou algum ponto confuso, me diz qual, que eu explico de outro jeito.` },
    { e: 5, t: "Acompanhamento com conteúdo útil",
      q: "Três ou quatro dias sem resposta.",
      o: "Voltar com algo que ajuda, e não com mais uma cobrança, mantém a conversa agradável.",
      m: `[nome do paciente], lembrei de você e separei um conteúdo curto que pode ajudar: [link ou resumo de um material seu].

Qualquer dúvida sobre o seu caso, é só falar comigo.` },
    { e: 5, t: "Leu e não respondeu", s: ["sumiu"],
      q: "A mensagem aparece como lida, mas ficou sem retorno por um ou dois dias.",
      o: "Dá uma saída simples: a pessoa pode dizer que ainda não é o momento, sem constrangimento.",
      m: `Oi, [nome do paciente]! Imagino que o dia esteja corrido por aí.

Se ainda não for o momento, sem problema nenhum, me avisa que eu paro de te escrever. Se for, é só me dizer “sim” que eu continuo daqui.` },
    { e: 5, t: "Nem aparece como lida", s: ["sumiu"],
      q: "A mensagem segue sem leitura depois de alguns dias.",
      o: "Troca o canal. Uma ligação curta ou uma mensagem diferente pode alcançar quem não abriu o WhatsApp.",
      u: "Ligação curta, seguida desta mensagem",
      m: `Oi, [nome do paciente]! Tentei falar com você por aqui e por telefone. Sou {nome}, {da_clinica}.

Quando puder, me responde com um “oi” para eu saber que chegou. Aí eu te explico o que combinamos.` },
    { e: 5, t: "Pergunta de sim ou não", s: ["sumiu"],
      q: "Segunda ou terceira tentativa sem resposta.",
      o: "Perguntas fechadas pedem um esforço mínimo. Quem não tem tempo de escrever ainda consegue responder.",
      m: `[nome do paciente], só uma pergunta rápida: ainda tem interesse em marcar o atendimento?

Pode responder com sim ou não, sem compromisso.` },
    { e: 5, t: "Oferecer dois horários",
      q: "A pessoa demonstrou interesse mas não decide o dia.",
      o: "Escolher entre duas opções é mais fácil que decidir em aberto.",
      m: `[nome do paciente], tenho [dia e hora] ou [dia e hora]. Algum dos dois funciona para você?

Se não, me diz o que ficaria melhor, que eu procuro.` },
    { e: 5, t: "Depois de uma semana de silêncio", s: ["sumiu"],
      q: "A conversa esfriou por cerca de sete dias.",
      o: "Reconhece o tempo que passou e retoma sem fingir que nada aconteceu.",
      m: `Oi, [nome do paciente]! Faz uma semana que conversamos e não quero deixar nada em aberto.

Se ainda estiver pensando, está tudo bem. Se tiver surgido alguma dúvida, me conta que eu respondo.` },
    { e: 5, t: "Enviar uma informação que responde a uma dúvida",
      q: "A pessoa levantou uma dúvida antes e você tem material que responde.",
      o: "Mostra que você guardou o que ela disse e resolve sem esperar nova pergunta.",
      m: `[nome do paciente], você tinha comentado sobre [dúvida que ela citou]. Encontrei isto que explica melhor: [link, texto ou áudio curto].

Ajudou? Se ficar algo no ar, eu detalho.` },
    { e: 5, t: "Retomar depois do “vou ver e te falo”", s: ["pensar"],
      q: "Alguns dias depois de a pessoa dizer que ia pensar.",
      o: "Cumpre o prazo que a própria pessoa deu e pergunta com leveza.",
      m: `Oi, [nome do paciente]! Você tinha dito que ia pensar e eu não quis deixar passar batido.

Teve tempo de decidir? Se ficou alguma dúvida que posso ajudar a resolver, é só falar.` },
    { e: 5, t: "Acompanhamento perto do prazo real",
      q: "O plano ou o horário reservado tem um prazo verdadeiro que está chegando.",
      o: "Só vale com prazo real. Prazo inventado destrói a confiança em toda a comunicação da clínica.",
      m: `[nome do paciente], só um aviso: o horário que reservei para você, [dia e hora], fica disponível até [prazo real]. Depois disso, preciso liberar para outras pessoas.

Quer confirmar?` },
    { e: 5, t: "Perguntar o que está faltando",
      q: "A pessoa quer, mas não avança, e você não sabe por quê.",
      o: "Em vez de adivinhar o obstáculo, pergunta qual é.",
      m: `[nome do paciente], posso te perguntar uma coisa? O que falta para você se sentir seguro(a) em marcar?

Pode ser horário, valor, localização ou algo que ainda não ficou claro. Me conta, que eu tento ajudar.` },
    { e: 5, t: "Acompanhamento por áudio",
      q: "A pessoa responde melhor por voz, ou a conversa está muito escrita.",
      o: "Voz transmite cuidado. Fale por até trinta segundos, sem ler.",
      u: "Áudio de até 30 segundos",
      m: `Roteiro do áudio: “Oi, [nome do paciente], é {nome}, {da_clinica}. Estou passando para saber se ficou alguma dúvida sobre o que conversamos. Se quiser, me responde aqui mesmo, por texto ou áudio. Fico à disposição.”` },
    { e: 5, t: "Encerrar o acompanhamento com gentileza", s: ["sumiu"],
      q: "Passaram-se várias tentativas sem retorno.",
      o: "Fechar o ciclo evita insistência e deixa uma última boa impressão.",
      m: `Oi, [nome do paciente]! Vou parar de te escrever para não incomodar. Se precisar {da_clinica} no futuro, é só me chamar por aqui.

Desejo tudo de bom para você.` },

    // ---------------- Etapa 6: Dúvidas e objeções (14) ----------------
    { e: 6, t: "Achou caro: perguntar com o que comparou", s: ["caro"],
      q: "A pessoa diz que o valor está alto.",
      o: "Entender a comparação evita responder uma objeção que não existe.",
      m: `Entendo, [nome do paciente], e agradeço por ser sincero(a).

Posso perguntar com o que você comparou? Às vezes o que está incluso é diferente, e eu quero que você decida com todas as informações.` },
    { e: 6, t: "Achou caro: mostrar o que está incluso", s: ["caro"],
      q: "Depois de saber que a pessoa comparou com outro valor.",
      o: "Mostra o que o valor cobre, sem criticar a concorrência.",
      m: `Faz sentido olhar com cuidado. No nosso valor de {valor} estão incluídos:

- [item 1]
- [item 2]
- [item 3]

Vale conferir se o outro lugar inclui tudo isso também, para a comparação ficar justa.` },
    { e: 6, t: "Achou caro: organizar o pagamento", s: ["caro", "desconto"],
      q: "O valor não cabe de uma vez, mas a pessoa ainda quer o atendimento.",
      o: "Muda o foco do preço para a forma de pagar.",
      m: `Entendo. Talvez o que pese seja pagar tudo de uma vez. Posso te passar as formas que temos: [parcelamento, divisão em etapas, outras].

Alguma delas ajuda no seu orçamento?` },
    { e: 6, t: "Pediu desconto: manter o valor com cuidado", s: ["desconto"],
      q: "A pessoa pergunta se o valor tem desconto.",
      o: "Mantém o valor de forma coerente para todos e oferece apoio na forma de pagamento.",
      m: `Entendo a pergunta, [nome do paciente]. Aqui, para {servico}, o valor é {valor} para todos os pacientes, porque reflete [o que está incluso].

O que consigo fazer é te ajudar com a forma de pagamento: [opções]. Isso ajuda?` },
    { e: 6, t: "Vou pensar: entender a dúvida", s: ["pensar"],
      q: "A pessoa responde que vai pensar, sem dizer o motivo.",
      o: "Respeita o tempo dela e abre um caminho fácil para falar o que está travando.",
      m: `Claro, [nome do paciente], é uma decisão importante e merece reflexão.

Só para eu ajudar no que for útil: o que você gostaria de pensar melhor? Se for algo que eu consiga esclarecer agora, melhor ainda.` },
    { e: 6, t: "Vou pensar: combinar um novo contato", s: ["pensar"],
      q: "A pessoa quer pensar e você quer manter a conversa viva sem pressionar.",
      o: "Combinar a data devolve o controle e dá licença para você voltar.",
      m: `Perfeito, fique à vontade. Posso voltar a falar com você na [dia combinado] para ver como ficou?

Se mudar de ideia antes, é só me chamar aqui.` },
    { e: 6, t: "Precisa falar com marido, esposa ou família", s: ["familia"],
      q: "A pessoa diz que precisa conversar com alguém antes de decidir.",
      o: "Apoia a decisão em vez de competir com ela, e já oferece ajuda prática.",
      m: `Faz todo sentido conversar com quem está junto nessa decisão.

Quer que eu te mande um resumo curto com o que conversamos, para você mostrar? Se preferir, posso explicar também para a outra pessoa, num horário combinado.` },
    { e: 6, t: "Resumo para mostrar à família", s: ["familia"],
      q: "Depois que a pessoa aceita receber um resumo.",
      o: "Um texto pronto e organizado é mais fácil de ser repassado do que uma conversa inteira.",
      m: `Segue o resumo para você compartilhar:

Atendimento: {servico}
Profissional: [nome do profissional]
Valor: {valor}
O que inclui: [itens]
Local: [endereço]
Horários possíveis: [dois ou três horários]

Qualquer pergunta que surgir, estou à disposição.` },
    { e: 6, t: "Receio ou medo do atendimento",
      q: "A pessoa diz que tem medo, vergonha ou insegurança.",
      o: "Acolhe primeiro. Não minimize o sentimento nem prometa que “não vai doer” ou que “vai dar certo”.",
      m: `[nome do paciente], agradeço por me contar. É muito comum sentir isso, e você não precisa dar conta sozinho(a).

Se quiser, [nome do profissional] conversa com você antes de qualquer coisa, no seu ritmo. Posso te explicar como costuma ser o primeiro atendimento?` },
    { e: 6, t: "Já tentei antes e não deu certo",
      q: "A pessoa conta uma experiência ruim com outro tratamento.",
      o: "Valida a experiência e não promete que o resultado será diferente.",
      m: `Sinto muito que a experiência anterior tenha sido assim, [nome do paciente]. Faz sentido você estar cauteloso(a).

Cada caso é avaliado individualmente, e o profissional vai querer entender o que foi feito antes. Quer começar por uma conversa de avaliação?` },
    { e: 6, t: "Não tenho tempo",
      q: "A pessoa diz que a rotina está corrida.",
      o: "Transforma “sem tempo” em uma questão de horário e duração, que se resolve.",
      m: `Entendo, a rotina é corrida mesmo. A consulta dura cerca de [tempo], e temos horários [no início da manhã, no horário de almoço, no fim do dia, etc.].

Algum desses encaixa na sua semana?` },
    { e: 6, t: "Vou procurar outro lugar",
      q: "A pessoa avisa que vai ver outras opções.",
      o: "Despedida elegante, sem pressão, que mantém a clínica como uma boa lembrança.",
      m: `Tudo bem, [nome do paciente]. É importante escolher onde você se sente bem atendido(a).

Se quiser tirar alguma dúvida para comparar, estou aqui. E, se decidir voltar, será bem-vindo(a).` },
    { e: 6, t: "Não sei se preciso",
      q: "A pessoa tem dúvida se o atendimento é necessário.",
      o: "Explica que a avaliação serve justamente para responder isso, sem criar medo.",
      m: `É uma dúvida comum, [nome do paciente]. Quem pode dizer se é necessário é o profissional, depois de avaliar. Por mensagem, eu não consigo e prefiro não opinar.

A consulta serve também para isso: para você sair com uma resposta clara. Quer ver um horário?` },

    // ---------------- Etapa 7: Agendar (10) ----------------
    { e: 7, t: "Propor dois horários para decidir",
      q: "A pessoa já quer marcar.",
      o: "Duas opções concretas aceleram a decisão.",
      m: `Ótimo, vamos marcar! Tenho [dia, hora] ou [dia, hora]. Qual você prefere?` },
    { e: 7, t: "Pedir os dados para o agendamento",
      q: "A pessoa escolheu o horário.",
      o: "Peça só o necessário e diga para que serve.",
      m: `Perfeito, [nome do paciente]. Para reservar, preciso do seu nome completo, [data de nascimento / CPF / outro dado necessário] e [convênio, se houver].

Uso apenas para o cadastro do atendimento.` },
    { e: 7, t: "Confirmar a consulta marcada",
      q: "Logo depois de fechar o horário.",
      o: "Um resumo com tudo de uma vez: dia, hora, local e profissional.",
      m: `Tudo certo, [nome do paciente]! Sua consulta está marcada:

Dia: [data]
Hora: [horário]
Profissional: [nome]
Local: [endereço completo]

Qualquer imprevisto, me avise por aqui. Até lá!` },
    { e: 7, t: "Orientações de chegada",
      q: "Um dia antes ou na mesma hora da confirmação.",
      o: "Diminui atrasos e dúvidas de última hora.",
      m: `Para amanhã, algumas dicas: [chegue com X minutos de antecedência / traga documento / estacionamento fica em ...].

Se tiver qualquer dificuldade para chegar, me chama.` },
    { e: 7, t: "Pedir confirmação na véspera",
      q: "Um dia antes da consulta.",
      o: "Pedir uma resposta curta reduz faltas e libera o horário a tempo, se a pessoa não puder ir.",
      m: `Oi, [nome do paciente]! Lembrando da sua consulta amanhã, [horário], com [nome do profissional].

Pode me confirmar com um “ok”? Se não conseguir ir, me avisa que eu remarco, e o horário fica livre para outra pessoa.` },
    { e: 7, t: "Lembrete no dia da consulta",
      q: "Na manhã da consulta, ou algumas horas antes.",
      o: "Curto e útil, com o endereço à mão.",
      m: `Bom dia, [nome do paciente]! Hoje às [horário] tem a sua consulta {na_clinica}. Endereço: [endereço]. Te esperamos!` },
    { e: 7, t: "Combinar sinal ou pagamento antecipado",
      q: "Use só se a clínica adota essa regra de forma fixa.",
      o: "Explica o motivo e o que acontece com o valor, com clareza e sem constrangimento.",
      m: `Para garantir o seu horário, trabalhamos com [valor ou percentual] antecipado, que é descontado do valor final da consulta.

O pagamento pode ser por [Pix / link]. Se precisar remarcar com [prazo] de antecedência, o valor é mantido para a nova data.` },
    { e: 7, t: "Regra de remarcação e cancelamento", s: ["remarcar"],
      q: "Ao confirmar o horário ou quando a pessoa pergunta como funciona.",
      o: "Regra dita antes é combinado. Regra dita depois vira discussão.",
      m: `Só para ficar combinado: se precisar remarcar ou cancelar, avise com pelo menos [prazo] de antecedência, por aqui mesmo. Assim abrimos o horário para outro paciente.

[Se houver cobrança por falta sem aviso, informe com clareza aqui.]` },
    { e: 7, t: "Marcar o retorno antes de a pessoa sair",
      q: "No final da consulta, ou logo depois dela.",
      o: "Retorno marcado na hora quase sempre acontece. Retorno “depois a gente vê” quase nunca.",
      m: `[nome do paciente], o profissional indicou o retorno para [prazo]. Já deixo marcado? Tenho [dia, hora] ou [dia, hora].` },
    { e: 7, t: "Quando a pessoa decide na hora",
      q: "No meio da conversa, a pessoa diz “quero marcar”.",
      o: "Aproveite o momento. Não volte a vender, avance para o horário.",
      m: `Combinado! Vamos deixar marcado agora. Tenho [dia, hora] ou [dia, hora]. Qual funciona melhor?` },

    // ---------------- Etapa 8: Depois da consulta (16) ----------------
    { e: 8, t: "Agradecer logo após o atendimento",
      q: "No mesmo dia da consulta.",
      o: "Gesto simples que mostra cuidado e abre espaço para dúvidas do pós-consulta.",
      m: `[nome do paciente], agradeço pela confiança de hoje. Se surgir qualquer dúvida sobre as orientações, é só me chamar por aqui.` },
    { e: 8, t: "Perguntar como foi a experiência",
      q: "Um dia depois do atendimento.",
      o: "Feedback privado ajuda a melhorar e evita que uma insatisfação vire reclamação pública.",
      m: `Oi, [nome do paciente]! Como foi a sua experiência {na_clinica}? Gostaria muito de saber se algo poderia ter sido melhor.

Pode responder com sinceridade. É só para a gente cuidar cada vez melhor.` },
    { e: 8, t: "Perguntar como a pessoa está",
      q: "Alguns dias após o atendimento, quando há acompanhamento combinado.",
      o: "Check-in humano, sem avaliar o quadro clínico por mensagem.",
      m: `Oi, [nome do paciente]! Como você está depois da consulta? Se tiver alguma dúvida sobre as orientações que recebeu, me conta.

Se algo parecer diferente do combinado, me avise, que eu levo ao profissional.` },
    { e: 8, t: "Reforçar as orientações combinadas",
      q: "No dia seguinte à consulta ou antes de uma etapa importante.",
      o: "Repetir por escrito o que foi combinado, sem acrescentar orientação clínica nova.",
      m: `[nome do paciente], reforçando o que ficou combinado na consulta:

[liste as orientações que o próprio profissional passou]

Qualquer dúvida, é só falar.` },
    { e: 8, t: "Pedir uma avaliação pública, com cuidado",
      q: "Paciente satisfeito, no momento certo. Antes, confira se o seu conselho permite esse pedido.",
      o: "Pedido simples, sem insistência e sem oferecer nada em troca.",
      m: `[nome do paciente], se você se sentiu bem atendido(a), sua opinião ajuda outras pessoas a nos encontrar: [link]. Fica à vontade, sem qualquer obrigação.

Agradeço de qualquer forma pela confiança.` },
    { e: 8, t: "Pedir indicação sem prometer vantagem",
      q: "Paciente que elogiou o atendimento por conta própria.",
      o: "Indicação sem brinde, sem desconto e sem pressão, por respeito às regras de publicidade em saúde.",
      m: `Fico muito feliz com o seu retorno, [nome do paciente]. Se conhecer alguém que possa precisar de um atendimento como o seu, pode passar o nosso contato, sem compromisso.

Agradeço de coração.` },
    { e: 8, t: "Lembrar do retorno combinado",
      q: "Perto da data em que o profissional indicou o retorno.",
      o: "O lembrete vem do cuidado clínico, não de uma tentativa de vender.",
      m: `Oi, [nome do paciente]! Está chegando o período do seu retorno, indicado pelo profissional para [prazo].

Quer que eu veja um horário?` },
    { e: 8, t: "Faltou: primeira mensagem", s: ["faltou"],
      q: "Poucas horas depois do horário marcado, quando a pessoa não apareceu e não avisou.",
      o: "Sem cobrança nem culpa. Primeiro cuidado, depois remarcação.",
      m: `Oi, [nome do paciente]! Senti sua falta hoje na consulta das [horário]. Está tudo bem com você?

Se quiser, eu vejo um novo horário.` },
    { e: 8, t: "Faltou: oferecer novo horário", s: ["faltou"],
      q: "No dia seguinte à falta, caso ainda não tenha havido resposta.",
      o: "Facilita a volta com uma opção concreta.",
      m: `[nome do paciente], imprevistos acontecem. Tenho [dia, hora] ou [dia, hora] para remarcarmos a sua consulta.

Qual funciona melhor?` },
    { e: 8, t: "A pessoa quer remarcar", s: ["remarcar"],
      q: "O paciente avisa que não consegue ir no horário marcado.",
      o: "Responde rápido e já traz novas datas, para a remarcação não virar cancelamento.",
      m: `Sem problema, [nome do paciente]. Agradeço por avisar.

Tenho [dia, hora] ou [dia, hora]. Algum desses serve? Se não, me diz o que fica melhor.` },
    { e: 8, t: "A clínica precisa remarcar", s: ["remarcar"],
      q: "Algo aconteceu do lado da clínica e a consulta não pode ser mantida.",
      o: "Assuma, peça desculpas, e já ofereça saídas. Quanto antes avisar, melhor.",
      m: `[nome do paciente], preciso te avisar que precisamos remarcar a sua consulta de [data] por [motivo curto]. Peço desculpas pelo transtorno.

Posso te oferecer [dia, hora] ou [dia, hora]. Se nenhum servir, encontramos outra data.` },
    { e: 8, t: "Resultado de exame: combinar a conversa certa",
      q: "A pessoa pergunta pelo resultado de um exame ou pede para enviá-lo por mensagem.",
      o: "Protege a privacidade e garante que a explicação seja feita pelo profissional.",
      m: `[nome do paciente], por privacidade e para você receber a explicação completa, os resultados são conversados com o profissional, [pessoalmente / em teleconsulta].

Posso marcar esse retorno para você? Tenho [dia, hora] ou [dia, hora].` },
    { e: 8, t: "Um ano de acompanhamento",
      q: "Paciente que está há cerca de um ano com a clínica.",
      o: "Reconhecimento genuíno fortalece a relação.",
      m: `[nome do paciente], hoje faz um ano que você começou o acompanhamento aqui {na_clinica}. Agradeço pela confiança e pela dedicação.

Seguimos juntos!` },
    { e: 8, t: "Reclamação ou insatisfação: primeira resposta",
      q: "O paciente escreve reclamando de algo.",
      o: "Escute sem se defender. Agradeça, assuma o canal e proponha uma conversa direta.",
      m: `[nome do paciente], agradeço por me contar, e sinto muito pela experiência. Quero entender melhor o que aconteceu.

Posso te ligar hoje ou prefere continuar por aqui? Vou tratar disso com atenção e levar à responsável pela clínica.` },
    { e: 8, t: "Aviso de recesso ou férias",
      q: "Antes de um período em que a clínica ou o profissional não atende.",
      o: "Evita ansiedade e mensagens sem resposta. Informe a data de volta e quem atende no intervalo.",
      m: `Oi, [nome do paciente]! Um aviso: {a_clinica} estará em recesso de [data] a [data], voltando a atender em [data].

[Em caso de urgência, informe o caminho: pronto-atendimento, plantão, etc.]

Se precisar marcar algo antes, me avise agora.` },
    { e: 8, t: "Despedida na alta ou no fim do acompanhamento",
      q: "O paciente recebeu alta ou encerrou o acompanhamento combinado.",
      o: "Um fecho com cuidado deixa a porta aberta para o futuro.",
      m: `[nome do paciente], foi um prazer cuidar de você. Seguimos à disposição sempre que precisar.

Um abraço de toda a equipe {da_clinica}.` }
  ]
};
