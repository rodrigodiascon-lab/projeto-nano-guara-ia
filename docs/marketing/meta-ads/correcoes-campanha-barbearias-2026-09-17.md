# Correções propostas — campanha guara.bot | Barbearias

Preparado em 17/09/2026. Conta Lucrec.ia PUBLI (1678023370148935), perfil somente leitura
`meta-lucrecia-publi-1678023370148935-v1`. Nada abaixo foi executado.

## Estado real lido na API (17/09/2026)

Diverge do rascunho descrito em `campanha-barbearias-2026-09-17.md`. Vale este documento.

| Item | Rascunho anterior | Estado lido agora |
|---|---|---|
| Campanha 120250176391320113 | rascunho, switch desligado | **ACTIVE** |
| Conjunto 120250176391330113 | rascunho, R$ 15/dia, fim 24/09 | **ACTIVE**, orçamento **vitalício R$ 150**, fim 23/09 19:56 UTC |
| Anúncio 120250176391340113 | "Imagem \| Você cuida do corte" | "Imagem \| Cliente chamou \| guara.bot", **PENDING_REVIEW** |
| Destino | somente WhatsApp | **WhatsApp + Instagram Direct** |
| Criativo | 2 peças v3 recomendadas | apenas a peça 4:5 (creative 1474158794522903) |
| Gasto | — | R$ 0,00, sem impressões |

## Correção de análise anterior

Na primeira leitura eu apontei "posicionamentos restritos manualmente". **Retirado.** A lista
devolvida pela API (celular, Feed/Stories/Reels de Facebook e Instagram, status do WhatsApp)
é compatível com o conjunto elegível para destino de mensagem, e o registro da sessão anterior
diz que o modo era Advantage+. Não dá para distinguir os dois casos pela API; confirmar o
botão "Posicionamentos Advantage+" na interface. Nenhuma ação é proposta com base nisso.

## Divergência de limite financeiro

O perfil registra `daily_budget_brl: 15` e `campaign_cap_brl: 105`. O conjunto no ar tem
orçamento vitalício de R$ 150. Ou o limite aprovado mudou e o perfil está desatualizado, ou
o orçamento foi além do registrado. Precisa da decisão do responsável antes de qualquer
proposta financeira.

## Correções propostas

### C1 — Pausar o conjunto antes de tocar no criativo (R2)

- Objeto: conjunto 120250176391330113 (ACTIVE) e anúncio 120250176391340113 (PENDING_REVIEW).
- Motivo: associar criativo novo exige a entidade fora de entrega; e com R$ 0,00 gastos não há
  aprendizado a perder.
- Impacto: nenhuma entrega durante a janela de troca. Pausa não autoriza reativação.
- Reversão: reativação exige aprovação própria (C6).

### C2 — Subir a peça 9:16 para a biblioteca da conta (R2)

- Arquivo: `criativos/guara-bot-barbearia-instagram-story-reels-v3-dor-1080x1920.jpg`
- sha256: `cfda0609596f16812cca54618818e7ec1c214ec3a1262cb336d802ba39d4016e`
- 1080×1920, 607 KB. (Existe o PNG equivalente, 2,4 MB, sha256 `db26a40a…`; o JPG é mais leve.)
- Impacto: ativo disponível na biblioteca, sem associação, revisão, publicação ou gasto.
- Não autoriza criar criativo, anúncio, revisão nem ativação.

### C3 — Colocar a 9:16 no anúncio (R3)

Duas formas; escolher uma:

1. **Personalizar por posicionamento** no anúncio existente: 4:5 no Feed, 9:16 em Stories/Reels.
   Preferível, mantém um só anúncio. Se o conector não expuser esse campo, faço na interface
   com você.
2. **Segundo anúncio pausado** só com a 9:16. Funciona sempre, mas divide o aprendizado.

- Mantém inalterados: texto, título, botão Enviar mensagem, destino, público, orçamento.
- Não autoriza revisão nem ativação.

### C4 — Produzir vídeo vertical 6–10s (R1, local, sem aprovação)

- Sequência: pergunta do cliente chega, guara.bot responde, fecho "Conheça o guara.bot".
- Produzido localmente a partir das peças que já existem, sem serviço externo e sem música
  licenciada de terceiros.
- Depois de pronto, subir e associar seguem os gates C2 e C3.

### C5 — Decidir o destino (R3 se mudar)

Hoje o conjunto aceita WhatsApp **e** Instagram Direct. Se ninguém acompanha o Direct, parte
das conversas se perde. Manter como está também é uma decisão válida — precisa ser explícita.

### C6 — Reativar o conjunto depois da troca (R3)

- Só depois de conferir o preview nos dois formatos.
- Exige envelope próprio com orçamento, impacto máximo e janela.

### C7 — Pausar a campanha antiga "PrimeiroADS" (R2, separado)

- Campanha 120248986324540113, ACTIVE, texto assinado "Lucréc.ia" publicado pela Página
  nanoguara.ia. Duas marcas falando pela mesma Página.
- Envelope próprio; não entra em nenhuma aprovação acima.

## Ordem de execução sugerida

C1 → C2 → C3 → conferir preview → C6. C4 entra na rodada seguinte. C5 e C7 são independentes.
