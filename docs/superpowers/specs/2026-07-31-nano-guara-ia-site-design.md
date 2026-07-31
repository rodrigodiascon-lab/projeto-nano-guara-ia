# Spec — Site institucional nanoguará.ia

Data: 2026-07-31 · Fase 1 (Brainstorm) da /planejar · Status: aguardando revisão do usuário

## Problema e público

Profissionais liberais (médicos, dentistas, advogados, psicólogos, consultores, arquitetos) perdem clientes e receita porque não conseguem responder WhatsApp em tempo, confirmar agenda e fazer follow-up enquanto atendem. A **nanoguará.ia** é uma agência de IA que resolve isso — e o site é sua vitrine e máquina de captação de leads.

- **Público nº 1:** profissionais liberais (decisor = o próprio profissional).
- **Carro-chefe:** Assistente Virtual (atendimento, agendamento, follow-up, pós-vendas).
- **Serviços secundários:** automação comercial, criação de sites, SEO e GEO, registro de marcas, consultoria LGPD, web app para representante comercial.
- **Marca:** logo pronto (guaraná + circuito; verde/vermelho/preto/creme), slogan "Inteligência que gera resultados". Imagens em `docs/brand/` (pendente salvar).
- **Prova social:** nenhuma por enquanto — a credibilidade vem da demonstração ao vivo. Proibido inventar métricas ou clientes.

## Referência estrutural

Estrutura clonada/adaptada de **https://www.carecode.ai/pt** (escolha do usuário) — estrutura sim, cores não. Mapa completo em `docs/referencia-carecode-estrutura.md`. Padrões herdados: H1 de resultado, narrativa de cenário com horário, CTAs pareados (produto + comercial), bullets de capacidade, tagline de fechamento espelhada.

## Formato e fluxos

**One-page** (landing longa, PT-BR), com âncoras de navegação. Fluxo do visitante:

1. Chega (tráfego direto, Instagram, indicação) → herói com dor + resultado
2. Vê o assistente funcionando (mockup animado no herói; demo interativa na seção 5)
3. Converte por um de 3 caminhos: **WhatsApp (CTA primário)** · conversa com o assistente demo · formulário curto
4. Lead cai no WhatsApp da agência / notificação de formulário

## Estrutura aprovada (9 seções)

| # | Seção | Conteúdo |
|---|-------|----------|
| 1 | Navbar | Logo + âncoras (Assistente · Serviços · Como funciona · Contato) + CTA "Chamar no WhatsApp" |
| 2 | Herói | Eyebrow "Atendimento com IA · WhatsApp 24/7" · H1 de resultado · narrativa concreta ("São 22h e um paciente quer marcar horário...") · CTAs WhatsApp (primário) + "Ver a IA funcionando" · mockup de chat WhatsApp animado |
| 3 | Pra quem é | Faixa com as profissões atendidas (substitui carrossel de logos da referência) |
| 4 | Dores → o que muda | 3-4 cards antes/depois (demora na resposta → segundos; agenda furada → confirmação automática; pós-venda esquecido → follow-up automático). Sem métricas inventadas |
| 5 | Assistente Virtual (deep-dive) | Demo interativa do assistente no site + bullets de capacidade + transferência para humano |
| 6 | Demais serviços | Grade de 6 cards (Automação comercial · Sites · SEO/GEO · Registro de marcas · LGPD · Web app Rep. Comercial), 1 frase de valor + CTA cada |
| 7 | Como funciona | 3 passos: diagnóstico → implantação → acompanhamento |
| 8 | CTA final + formulário | Formulário curto (nome, profissão, WhatsApp, maior dor) + botão WhatsApp + tagline "Cuide dos seus clientes. A nanoguará.ia cuida do resto." |
| 9 | Footer | Contatos, links, Política de Privacidade/LGPD exemplar (a agência vende consultoria LGPD) |

## MVP vs futuro

**MVP:** as 9 seções acima, responsivo, com os 3 mecanismos de captação e demo do assistente.
**v2 (fora do MVP):** blog/conteúdos, páginas dedicadas por serviço (SEO), seção de cases (quando existirem), na mídia, versão multi-idioma.

## Componentes principais (visão de unidades)

- **Página estática one-page** — conteúdo e layout; sem estado.
- **Chat demo do assistente** — widget interativo; conversa limitada ao contexto da agência; degrada graciosamente (se indisponível, CTA WhatsApp assume). Interface: campo de mensagem → resposta da IA; backend definido na Fase 3.
- **Formulário de leads** — 4 campos + anti-spam; entrega o lead à agência (mecanismo de notificação/persistência definido na Fase 3); consentimento LGPD explícito.
- **Botões WhatsApp** — links `wa.me` com mensagem pré-preenchida por seção de origem (rastreio simples de qual CTA converteu).

## Critérios de sucesso

- Visitante entende em 5 segundos o que a agência faz e pra quem.
- Cada seção tem um caminho de conversão a um clique.
- Demo do assistente responde de forma útil sobre os serviços da agência.
- Site exemplar em LGPD (consentimento, política de privacidade, sem trackers desnecessários).
- Performance de landing (carregamento rápido em 4G — meta objetiva definida na auditoria de web-perf).

## Erros e casos-limite

- Demo do assistente fora do ar → widget mostra fallback com botão WhatsApp.
- Formulário falha ao enviar → mensagem de erro + WhatsApp como alternativa.
- Visitante mobile (maioria esperada) → mockup de chat e demo funcionam em tela pequena.

## Fora de escopo desta spec

Stack e infra (Fase 3) · direção visual e telas (Fase 4) · conteúdo final de copy (rascunhos na Fase 4/5) · web app do Representante Comercial (segundo ciclo da /planejar).
