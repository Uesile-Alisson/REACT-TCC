# Integracao Frontend - Configuracoes

## Rotas Consumidas

### Sistema

- `GET /api/configuracoes/sistema`
- `PATCH /api/configuracoes/sistema`

### Tanques

- `GET /api/configuracoes/tanques`
- `GET /api/configuracoes/tanques/:id_tanque`
- `POST /api/configuracoes/tanques`
- `PATCH /api/configuracoes/tanques/:id_tanque`
- `PATCH /api/configuracoes/tanques/:id_tanque/ativar`
- `PATCH /api/configuracoes/tanques/:id_tanque/desativar`

### Bombas

- `GET /api/configuracoes/bombas`
- `GET /api/configuracoes/bombas/:id_bomba`
- `POST /api/configuracoes/bombas`
- `PATCH /api/configuracoes/bombas/:id_bomba`
- `PATCH /api/configuracoes/bombas/:id_bomba/ativar`
- `PATCH /api/configuracoes/bombas/:id_bomba/desativar`

## Permissoes

- `OPERADOR`: sem acesso a Sistema, Tanques e Bombas.
- `TECNICO`: acesso e manutencao de Sistema, Tanques e Bombas.
- `ADMINISTRADOR`: acesso e manutencao de Sistema, Tanques e Bombas.

## Estados

As telas usam estados locais para:

- `loading`;
- `empty`;
- `error`;
- `saving` ou `actionLoading`;
- `success`;
- confirmacao antes de ativar/desativar.

## Observacao Sobre Seed

Configuracoes do Sistema pode retornar `404` enquanto a configuracao inicial ainda nao existir no banco.
Esse caso deve ser tratado como seed pendente da API, sem dados locais e sem transformar a tela em leitura permanente.

## Escopo Excluido

Esta integracao nao altera backend, Prisma, seeds, MQTT, ESP32, comandos fisicos, Processos, Alarmes, Historico ou Relatorios.
