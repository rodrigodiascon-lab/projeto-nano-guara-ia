# Ajustes no criativo "guara.bot" para Meta Ads

Revisão do criativo (imagem: robô guara.bot na recepção de um consultório, headline "SEU CONSULTÓRIO ATENDE 24H?") contra as boas práticas do Meta Blueprint (curso oficial Meta Ads), pra rodar tráfego pago no Instagram/Facebook Ads.

**Veredito geral:** apto pra subir, sem bloqueio de política visível. Dois ajustes de baixo esforço e alto impacto antes de publicar.

---

## 1. Formato — falta versão 9:16

- **Situação:** só existe em ~4:5 (retrato). Serve bem pro Feed, mas não tem versão pra Stories/Reels.
- **Por quê importa:** o padrão recomendado é manter todos os posicionamentos ativos (não restringir manualmente); sem uma versão 9:16, o corte automático da plataforma vai cortar o robô ou o botão de CTA nas laterais.
- **Peça pro ChatGPT:** gerar uma composição 9:16 (1080×1920) da mesma peça, reposicionando os elementos (headline, robô, bolhas de chat, botão CTA) pra caber sem cortes na proporção vertical — não é só esticar/cortar a imagem atual.

## 2. Densidade de texto — está poluído

- **Situação:** título (2 linhas) + subtítulo (4 linhas) + 3 badges ("ATENDIMENTO • TRIAGEM • AGENDAMENTO") + 3 bolhas de chat + botão CTA — muitos elementos competindo por atenção na mesma peça, especialmente em tela pequena.
- **Por quê importa:** criativo mobile-first pede uma mensagem central clara; excesso de texto reduz legibilidade rápida no feed (as pessoas rolam em ~1-2s).
- **Peça pro ChatGPT:** simplificar pra 1 mensagem central (a headline) + 1 prova visual só (por exemplo, manter apenas 1 bolha de chat, a de "Consulta agendada!", como prova do resultado) — mover o restante (badges, explicação) pra legenda do post/anúncio, não pra dentro da imagem.

## 3. Bolhas de chat verde + check — parecido com WhatsApp

- **Situação:** o estilo (bolhas verdes, ícone de check) lembra visualmente a interface do WhatsApp, mesmo sem usar o logo oficial.
- **Por quê importa:** baixo risco de política (a Meta restringe simulação de notificação/mensagem de sistema, não ilustração genérica de chat), mas ainda vale reduzir a ambiguidade.
- **Peça pro ChatGPT:** trocar a paleta das bolhas de chat pras cores da marca nanoguará.ia (verde `#2E7D32` / vermelho guaraná `#EF5A4C` / creme `#FDF9F0`) em vez do verde-WhatsApp padrão, mantendo o ícone de check mas num estilo mais "ilustrativo" e menos "screenshot de app".

## 4. Criativo Advantage+ — falta vídeo

- **Situação:** só existe 1 ativo, em imagem estática.
- **Por quê importa:** a automação de criativo da Meta (Advantage+) não cria formatos que não foram fornecidos — pra aproveitar o "poder dos três" (imagem + vídeo + vídeo vertical com som), precisa fornecer também um vídeo.
- **Ação:** não é ajuste de imagem — é pauta pra depois: gerar uma versão em vídeo curto (ex.: animação do robô + as mesmas bolhas de chat aparecendo em sequência) quando for escalar a campanha.

## 5. Sem bloqueio de política

- Não é categoria especial de anúncio (moradia/crédito/emprego).
- Não faz alegação de tratamento/resultado de saúde — fala de atendimento administrativo (agendamento, triagem), não de diagnóstico ou cura.
- Sem uso de logo/marca de terceiros (Meta, WhatsApp) — manter assim mesmo após o ajuste do item 3.

## 6. Lembrete de mensuração (não é sobre a imagem)

Antes de publicar, confirmar que o destino do CTA ("Quero automatizar") tem Pixel + API de Conversões implementados, caso leve pro site — se levar direto pro WhatsApp/Instagram, essa exigência não se aplica.

---

*Gerado a partir da skill `curso-meta-ads-texto` (Meta Blueprint) em 2026-09-11.*
