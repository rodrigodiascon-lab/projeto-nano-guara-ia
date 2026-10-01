# Campanhas e posts

Cada pasta representa uma campanha, um conjunto de peças ou uma frente de conteúdo. Este índice evita misturar briefing, fonte e arquivo renderizado.

## Inventário

| Pasta | Conteúdo principal |
|---|---|
| [`assistente-virtual-consultorios/`](assistente-virtual-consultorios/) | Campanha de Meta Ads do assistente virtual para consultórios |
| [`artrin-lixeira-new/`](artrin-lixeira-new/) | Criativo de produto Tramontina/Artrin para WhatsApp |
| [`copys-ted-nicholas/`](copys-ted-nicholas/) | Primeira versão das copys de Instagram |
| [`copys-ted-nicholas-v2/`](copys-ted-nicholas-v2/) | Segunda versão, carrosséis, feeds e geração de PDF |
| [`dentistas-agendamento/`](dentistas-agendamento/) | Série para dentistas sobre atendimento e agendamento |
| [`funil-clinicas/`](funil-clinicas/) | Peças de topo, meio e fundo de funil para clínicas |
| [`nutricionistas-agendamento/`](nutricionistas-agendamento/) | Série para nutricionistas sobre atendimento e agendamento |
| [`video/`](video/) | Clipes e listas de montagem de vídeos anteriores |

`engajamento-amazonas/` possui trabalho isolado em uma worktree. Confirme a branch antes de usar ou completar essa pasta na árvore principal.

## Estrutura recomendada por campanha

- `README.md` ou `BRIEF.md`: objetivo, público, formatos e estado da campanha.
- `index.html` ou arquivo equivalente: fonte visual editável.
- `assets/`: imagens, fontes e referências necessárias para renderizar.
- `outputs/`: PNG, JPG, PDF ou MP4 gerados.
- `prompts.md` e `legendas.md`: instruções de geração e texto publicado.

Os binários gerados dentro desta árvore são ignorados pelo Git. Preserve no repositório a receita necessária para regenerá-los: briefing, copy, HTML, scripts, listas de arquivos e instruções.
