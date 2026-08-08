# Criativos full-funnel para clínicas

Campanha de venda do assistente de atendimento com IA da nanoguará.ia, separada em dois nichos: clínicas de estética e clínicas de fisioterapia.

## Entregáveis

Todos os arquivos finais usam o formato de feed retrato do Instagram, 1080×1350 px.

| Nicho | Topo | Meio | Fundo |
|---|---|---|---|
| Estética | [`outputs/estetica-topo.png`](outputs/estetica-topo.png) | [`outputs/estetica-meio.png`](outputs/estetica-meio.png) | [`outputs/estetica-fundo.png`](outputs/estetica-fundo.png) |
| Fisioterapia | [`outputs/fisio-topo.png`](outputs/fisio-topo.png) | [`outputs/fisio-meio.png`](outputs/fisio-meio.png) | [`outputs/fisio-fundo.png`](outputs/fisio-fundo.png) |

Visão conjunta: [`outputs/preview-grid.png`](outputs/preview-grid.png).

## Lógica do funil

| Estágio | Público | Papel da peça | CTA visual | Métrica principal |
|---|---|---|---|---|
| Topo | Público frio do nicho | Reconhecer o conflito entre atendimento presencial e WhatsApp | Veja como atender as duas | CTR e visitas qualificadas |
| Meio | Pessoas que interagiram ou visitaram o site | Demonstrar a conversa e remover o medo de automação genérica | Ver atendimento completo | Cliques para a demonstração |
| Fundo | Visitantes e pessoas que consumiram as peças anteriores | Apresentar a demonstração personalizada | Solicitar demonstração | Conversas e leads qualificados |

As campanhas de estética e fisioterapia devem ficar em conjuntos separados. Não misturar resultados durante o primeiro teste.

## Arquivos editáveis

- [`index.html`](index.html): fonte única dos seis layouts.
- [`legendas.md`](legendas.md): textos prontos para os anúncios.
- [`prompts.md`](prompts.md): prompts das duas fotografias geradas.
- `assets/`: fotografias-base, avatar e fontes locais.
- `outputs/`: PNGs finais.

Para abrir uma peça específica, use `?creative=` com um destes valores:

```text
estetica-topo
estetica-meio
estetica-fundo
fisio-topo
fisio-meio
fisio-fundo
```

## Plano de teste

1. Testar estética e fisioterapia em conjuntos diferentes.
2. Manter imagem, texto principal e público fixos no primeiro teste; variar apenas o hook.
3. Depois de identificar o hook vencedor, testar a composição fotográfica contra a composição demonstrativa.
4. Usar retargeting de engajamento e visitantes para meio e fundo.
5. Não avaliar topo apenas por vendas; acompanhar progressão até a demonstração.

Não usar depoimentos, resultados, urgência ou escassez sem evidência real.
