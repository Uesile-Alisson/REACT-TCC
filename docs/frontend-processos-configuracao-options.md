# Processos - Selecao de Tanque e Sensor

## Objetivo

Remover digitacao manual de IDs no modal de criacao/configuracao de processo.

## Tanques

Fonte real:

- `GET /api/configuracoes/tanques`

No frontend, o service usa `/configuracoes/tanques`, pois a instancia Axios ja possui base URL com `/api`.

Campos usados para label:

- `nome`
- `volume`
- `unidade_volume`
- `vacuo_padrao`
- `status_tanque`

O modal lista tanques ativos com `status_tanque=ATIVO&limit=100`.

## Sensores

Fonte real:

- `GET /api/configuracoes/tanques/:id_tanque/sensores`

No frontend, o service usa `/configuracoes/tanques/:id_tanque/sensores`, pois a instancia Axios ja possui base URL com `/api`.

Parametros enviados:

- `status_sensor=ATIVO`
- `tipo_sensor=VACUO`
- `order_by=nome`
- `order_direction=asc`

Campos usados para label:

- `id_sensor`
- `label`
- `modelo`
- `unidade_medida`
- `status_sensor`

O frontend mantem uma filtragem defensiva local para exibir somente sensores com `tipo_sensor=VACUO` e `status_sensor=ATIVO`.
Sensores de acoplamento ou mangueira nao entram no select e nao sao enviados no payload de processo.

## Fluxo do Modal

1. Abrir modal.
2. Carregar tanques reais.
3. Selecionar tanque.
4. Carregar sensores de vacuo ativos pelo endpoint real do tanque selecionado.
5. Selecionar o sensor de vacuo.
6. Enviar o payload real com `tanques[].sensores[].id_sensor`.

## Bloqueios

- Nenhum dado simulado foi criado.
- Nenhum backend, seed, Prisma, MQTT ou ESP32 foi alterado.
