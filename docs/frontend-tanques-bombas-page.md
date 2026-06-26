# Tanques e Bombas

As telas `/configuracoes/tanques` e `/configuracoes/bombas` foram integradas aos endpoints reais do modulo de Configuracoes da API.

## Rotas Consumidas

### Tanques

- `GET /api/configuracoes/tanques`
- `GET /api/configuracoes/tanques/:id_tanque`
- `POST /api/configuracoes/tanques`
- `PATCH /api/configuracoes/tanques/:id_tanque`
- `PATCH /api/configuracoes/tanques/:id_tanque/ativar`
- `PATCH /api/configuracoes/tanques/:id_tanque/desativar`

No frontend, os services usam rotas sem `/api`, porque a instancia Axios ja possui base URL com `/api`.

### Bombas

- `GET /api/configuracoes/bombas`
- `GET /api/configuracoes/bombas/:id_bomba`
- `POST /api/configuracoes/bombas`
- `PATCH /api/configuracoes/bombas/:id_bomba`
- `PATCH /api/configuracoes/bombas/:id_bomba/ativar`
- `PATCH /api/configuracoes/bombas/:id_bomba/desativar`

## Permissoes

- `OPERADOR`: nao acessa as rotas nem os itens de menu.
- `TECNICO`: lista, visualiza detalhe, cria, edita, ativa e desativa cadastros.
- `ADMINISTRADOR`: lista, visualiza detalhe, cria, edita, ativa e desativa cadastros.

O backend continua sendo a fonte final de permissao. O frontend apenas controla UX e exibe erros de API.

## Tanques

Campos integrados conforme DTO real:

- `nome`
- `volume`
- `unidade_volume`
- `vacuo_padrao`
- `status_tanque`

Estados implementados:

- carregamento inicial;
- lista vazia;
- erro global;
- carregamento de acao;
- mensagem de sucesso;
- detalhe por ID;
- criacao;
- edicao;
- confirmacao antes de ativar/desativar.

## Bombas

Campos integrados conforme DTO real:

- `nome`
- `tipo_bomba`
- `status_padrao`
- `entrada_por_pressao`
- `entrada_por_tempo`
- `encerramento_automatico`

Estados implementados:

- carregamento inicial;
- lista vazia;
- erro global;
- carregamento de acao;
- mensagem de sucesso;
- detalhe por ID;
- criacao;
- edicao;
- confirmacao antes de ativar/desativar.

## Limites de Escopo

Nao foi criado `DELETE`.
Nao foi criado comando de bomba ou valvula.
Nao houve integracao direta com MQTT ou ESP32.
Nao houve dados simulados, seed ou simulacao de sucesso.
