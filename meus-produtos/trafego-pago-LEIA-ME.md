# meus-produtos

Aqui ficam os dados da captação paga da nanoguará.ia. Esta pasta já vem criada no pacote e deve continuar aqui, mesmo vazia.

Na primeira vez que rodar uma skill do pacote, ela cria `meus-produtos/nanoguara/captacao/` e grava o slug em `meus-produtos/.ativo`:

```
meus-produtos/
  .ativo                        o nome em uso (nanoguara)
  nanoguara/
    captacao/
      plano.yaml  conversoes.yaml  publicos.yaml
      campanhas/  relatorios/
      painel.html               o painel, que você abre no navegador
```

Nichos (clínicas, barbearias) são temas de campanha dentro de `nanoguara`, não pastas separadas.

Nada aqui contém nome de paciente ou lista de clientes finais. Em simulação, use `TESTE 1`, `TESTE 2`.
