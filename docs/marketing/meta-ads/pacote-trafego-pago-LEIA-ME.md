# Pacote de tráfego pago da nanoguará.ia

Seis skills que conduzem os anúncios da **nanoguará.ia** no Meta Ads (Facebook e Instagram), com um só objetivo: **conversas iniciadas no WhatsApp** com o **guara.bot**, o recepcionista digital para clínicas, consultórios e barbearias.

Não há lançamento, aula, ingresso, carrinho nem plataforma de vendas. É captação contínua: você sobe campanha por nicho, mede o custo por conversa e ajusta.

O pacote é fechado: nenhuma skill aqui depende de comando que não esteja nesta pasta. Tudo o que é específico da nanoguará.ia (conta, Página, WhatsApp, regras de copy, lições da conta) está num arquivo só: `.claude/skills/trafego-pago-conexao/references/contexto-nanoguara.md`. Corrija lá e todas as skills passam a usar.

---

## Como instalar

Copie as duas pastas para dentro do projeto `~/projeto-nano-guara-ia`, preservando a estrutura:

```
.claude/skills/       ->  as 6 skills, que você chama digitando /trafego-pago-...
meus-produtos/        ->  a pasta onde as skills gravam o estado
```

Se o projeto já tiver essas pastas, é só somar os arquivos. Tudo o que o pacote coloca começa com `trafego-pago-`.

Se você instalou uma versão anterior do pacote (com `pago-*` ou com lançamento), apague o que ficou dela para não aparecer comando repetido.

---

## Ordem de uso

| Ordem | Comando | Quando |
|---|---|---|
| 1 | `/trafego-pago-conexao` | uma vez. Conecta a conta do Meta Ads |
| 2 | `/trafego-pago-planejamento` | antes de subir. Define meta de conversas, orçamento e custo por conversa alvo |
| 3 | `/trafego-pago-conversoes` | antes de subir. Confere o pixel do site e o evento de conversa |
| 4 | `/trafego-pago-publicos` | antes de subir. Define prospecção aberta e remarketing |
| 5 | `/trafego-pago-campanhas` | sobe as campanhas de conversa no WhatsApp |
| 6 | `/trafego-pago-dash` | a cada 48 a 72 horas depois de ligar, e semanal depois disso |

---

## Regras que valem em tudo

- **Nada gasta sem duas confirmações.** Criar exige o preview e a resposta `SIM`. Ligar exige o total por dia somado na sua frente e a palavra `ATIVAR`. Toda campanha nasce pausada.
- **Regras de copy** (nascidas de auditoria, ver o contexto): só os 3 números com fonte, nenhuma promessa de resultado, nenhuma prova social inventada, zero travessão em texto visível, CTA único "Chamar no WhatsApp".
- **A conta é compartilhada com a Lucréc.ia.** Todo preview confere que Página, Instagram e texto são da nanoguará.ia.
- **Público aberto por padrão:** Manaus, 25 a 65, Advantage+. Nada de cargo ou empregador como filtro.
- **LGPD:** nunca subir lista de pacientes ou clientes finais das clínicas.

---

## Onde ficam os arquivos

Tudo em `meus-produtos/nanoguara/captacao/`:

| Arquivo | Quem escreve |
|---|---|
| `plano.yaml` | planejamento |
| `conversoes.yaml` | conversoes |
| `publicos.yaml` | publicos |
| `campanhas/` | campanhas |
| `relatorios/` | dash |
| `painel.html` | planejamento e dash. É o único que você abre, no navegador |

---

## Seu token fica fora da conversa

O token permanente do Meta mora só no `.env`, na raiz do projeto, e quem escreve ele lá é você, no seu editor de texto. As skills nunca abrem esse arquivo: usam um script (`env_seguro.py`) que só responde se o token está presente e se o formato está certo. Se um dia o token aparecer na conversa ou num arquivo, revogue no Gerenciador de Negócios, em Usuários do sistema, e gere outro pela `/trafego-pago-conexao`.

O `.env` da nanoguará.ia já pode ter um token do Meta de outros usos. Antes de rodar, confira que ele está no `.gitignore`.

---

## Requisitos

- Conta de anúncios `act_1678023370148935` com acesso de administrador (conta compartilhada com a Lucréc.ia)
- Página e Instagram da nanoguará.ia
- WhatsApp de destino +55 92 8148-6875
- Pixel da Meta no site nanoguara.ia.br, que a `/trafego-pago-conversoes` ajuda a conferir
- Python 3 na máquina
