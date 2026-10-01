# Meta Ads — aprendizados da conta

Registro do que já foi observado na conta de anúncios, para não repetir erro nem refazer
diagnóstico. Levantado em 2026-08-11 pela API do Meta.

## Conta e estrutura

- **Conta de anúncios:** `act_1678023370148935` ("Lucrec.ia PUBLI"), moeda BRL, ativa.
  É a conta da Lucréc.ia, não da nanoguará. As duas marcas convivem na mesma conta.
- **Página usada nos anúncios antigos:** `1272983785891547`. Conferido em 2026-09-29: é a Página **nanoguara.ia**, única do portfólio Lucrec.IA. O token de sistema tem apenas
  `ads_management`, `ads_read` e `public_profile`, então `list.mjs pages` volta vazio e a
  página não pode ser lida pela API. Isso **não** impede publicar: a página funciona como
  `promoted_object.page_id` porque a permissão de anúncios basta para isso.
- **Instagram vinculado nos criativos:** `17841414315265034`.

## Campanha "PrimeiroADS" (120248986324540113)

Criada em 20/07/2026, objetivo `OUTCOME_LEADS`, destino **WhatsApp**, orçamento R$ 30/dia
no ad set "Claude fez" (`120248986324550113`).

**Resultado acumulado até 11/08/2026:**

| Métrica | Valor |
|---|---|
| Investido | R$ 38,61 |
| Impressões | 2.373 |
| Alcance | 1.933 |
| Cliques | 25 (CTR 1,05%, CPC R$ 1,54) |
| Conversas iniciadas no WhatsApp | 4 |
| Custo por conversa | ~R$ 9,65 |

### Leitura

O custo por conversa é bom para B2B. O problema é **volume**: com R$ 30/dia disponíveis desde
20/07, a campanha gastou R$ 38,61 no total. Ela praticamente não entrega.

**Causa provável — público restrito demais.** O ad set empilha, além de Manaus e 25-65 anos:

- `behaviors`: Small business owners, Facebook Page admins
- `industries`: Healthcare and Medical Services, Business Decision Makers
- `work_employers`: Consultório Odontológico (dois IDs)
- `work_positions`: Cirurgião Dentista Implantodontista

Segmentar por empregador e cargo em uma cidade só reduz o público a poucas centenas de pessoas.
É o anti-padrão de restringir sem motivo real de negócio: o leilão fica sem espaço e o
orçamento não é gasto. Com 4 conversas no período, o conjunto também está muito longe do
volume necessário para sair da fase de aprendizado.

**Correção para a próxima campanha:** manter Manaus + 25-65 + Advantage+ e tratar os sinais de
saúde e pequeno empresário como sugestão, nunca como filtro rígido. Não usar `work_employers`
nem `work_positions`.

## Marca

Os anúncios ativos em 11/08/2026 são da **Lucréc.ia**, não da nanoguará. A copy diz
"A Lucréc.ia é uma assistente de IA...". Ao subir campanha da nanoguará, conferir se a página
de origem é a da nanoguará, senão o anúncio fala de uma marca e é assinado por outra.

## Limitação da skill `meta-ads-uploader`

A skill publica anúncios de **link para site**: monta `link_data.link` a partir de `websiteUrl`
e `call_to_action: { type: ctaType }`.

Um anúncio de clique para WhatsApp precisa de mais que isso, como se vê no criativo que já
funciona na conta:

```json
"call_to_action": {
  "type": "WHATSAPP_MESSAGE",
  "value": { "app_destination": "WHATSAPP" }
},
"page_welcome_message": "{...}"
```

A skill não gera `value.app_destination` nem `page_welcome_message`. Para campanha de WhatsApp,
criar o criativo direto na Graph API copiando a estrutura do criativo `1585425789620498`, em vez
de usar `upload.mjs`. A skill também **não cria campanha nem ad set**, só publica anúncios dentro
de estrutura que já existe.
