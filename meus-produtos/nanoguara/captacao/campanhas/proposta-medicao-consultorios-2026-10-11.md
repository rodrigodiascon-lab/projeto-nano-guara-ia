# Proposta: medição do Lead da campanha de consultórios

Data: 2026-10-11, 14h40 (Manaus). Campanha 120250508582710113, pixel 1129265532898131, página /iaparaconsultorios.
Estado: opção A aprovada pelo dono e no ar em 2026-10-11 14h55 (deploy bdaa67a5). B e C não executadas.

## Diagnóstico (fatos de hoje)

| Fonte | Número | O que mede |
|---|---:|---|
| Meta, cliques no link | 30 | toques no anúncio que levam ao site |
| Meta, visualizações da página de destino | 2 | visitas que a Meta conseguiu ver |
| Pixel, PageView no dia (todas as páginas) | 10 | visitantes que tocaram em Aceitar |
| Site, etapa 1 do quiz (desde 9h28) | 19 | visitas reais ao quiz, sem depender de cookie |
| Leads de clientes | 0 | os 2 leads do banco são testes do dono |

- O pixel só liga depois do "Aceitar" no aviso de cookies (regra da LGPD já adotada no site).
- No iPhone, o aviso ocupa **200 de 664 px (30% da tela)** e esconde as opções do quiz abaixo de "Medicina". Quem não toca no aviso vê só uma opção da primeira pergunta.
- Consequência 1: a Meta recebe pouco ou nenhum sinal de visita e de Lead, e a otimização pelo Lead aprende no escuro.
- Consequência 2: o aviso provavelmente contribui para os 79% que saem na primeira tela do quiz.

## Opção A. Aviso de cookies compacto no celular (recomendada primeiro)

- No celular: aviso em uma faixa de no máximo ~100 px, texto curto ("Usamos o pixel da Meta para medir os anúncios. Saiba mais") e os dois botões, Recusar e Aceitar, com o mesmo peso visual.
- O aviso não cobre o card do quiz: o conteúdo ganha espaço embaixo para rolar acima dele.
- Desktop sem mudança de regra. Texto completo continua na política de privacidade, seção cookies.
- Base legal igual (consentimento, art. 7º, I). Recusar continua sem efeito na navegação.
- Esforço: baixo (CSS e texto do consentimento.js, testes de layout e de pixel).
- O que não promete: não garante mais aceites; só remove o obstáculo visual. Pode reduzir a saída na primeira tela.
- Como medir: comparar por dia PageView do pixel contra a etapa 1 do quiz (taxa de aceite) e a saída na etapa 1, antes e depois.

## Opção B. Lead pela API de Conversões, com autorização específica no quiz

- Na última etapa do quiz, uma caixa **opcional e desmarcada**: "Autorizo a nanoguará.ia a informar à Meta que concluí este questionário, para medir os anúncios."
- Só com a caixa marcada e o lead gravado (201), o servidor envia à Meta um evento Lead com: event_id (o mesmo do pixel, para não contar duas vezes), URL da página, fbc (do fbclid do anúncio), fbp se existir, IP e navegador.
- Sem nome, sem WhatsApp e sem respostas do quiz. Variante B2, com WhatsApp criptografado (hash) para a Meta casar melhor, exige texto de autorização mais explícito; não recomendada agora.
- Requisitos: token de acesso do conjunto de dados para o usuário do sistema nanoguara-ads (o dono gera no Gerenciador de Negócios e grava como segredo do Worker, sem passar pela conversa); atualização da política de privacidade; testes.
- Governança: pela skill gestor-meta-ads, mexer em CAPI e pixel é decisão e execução fora do gestor. Entra como projeto do site, com aprovação explícita do dono.
- Esforço: médio. Ganho: todo lead que autorizar chega à Meta mesmo sem cookie.

## Opção C. Otimizar por clique no link (não recomendada)

Não depende de pixel, mas a Meta passa a buscar quem clica, não quem preenche. Em barbearias, otimizar por visita trouxe 564 visitas e nenhum contato.

## Recomendação

1. Fazer **A** agora: corrige o obstáculo visual que afeta medição e conversão ao mesmo tempo, com risco baixo.
2. Ler terça: taxa de aceite (PageView/etapa 1) e saída na etapa 1 antes e depois.
3. Se a Meta continuar vendo menos da metade dos leads reais, fazer **B**.
