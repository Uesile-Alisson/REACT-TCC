# Fase Front 15 - Telas dedicadas de Tanques e Bombas

## Escopo executado

Foram criadas telas dedicadas para:

- `/configuracoes/tanques`
- `/configuracoes/bombas`

As rotas ja existiam no front e permanecem protegidas para perfis tecnicos por `RoleGuard` com
`TECNICO` e `ADMINISTRADOR`.

## Resultado da revisao da API

A revisao do backend indicou modelos Prisma para `tanques`, `bombas` e `valvulas`, mas nao foram
encontrados controllers HTTP dedicados para cadastro ou manutencao direta de Tanques e Bombas.

Endpoints relacionados encontrados no contrato atual:

- historico de tanques dentro de processos;
- leituras/eventos;
- configuracoes e comandos de MQTT hardware.

Nenhum desses endpoints foi usado nesta fase, porque o escopo proibe acionar hardware diretamente,
misturar historico/processos e inventar contratos HTTP.

## Decisao tecnica

As telas foram implementadas em modo leitura/pendencia de endpoint:

- sem chamadas HTTP;
- sem services falsos;
- sem criar/editar/excluir registros;
- sem comandos MQTT, Socket.IO ou ESP32;
- sem fluxo de processos ativos;
- sem campos operacionais fora do cadastro tecnico confirmado.

## Tanques

Campos preparados conforme schema observado:

- `id_tanque`
- `nome`
- `volume`
- `unidade_volume`
- `vacuo_padrao`
- `status_tanque`
- `criado_em`
- `atualizado_em`

Componentes criados:

- `TanquesSummaryCards`
- `TanquesListTable`
- `TanqueDetailPanel`
- `TanqueStatusBadge`

Hooks e tipos:

- `useTanquesPage`
- `useTanquesBombasPermissions`
- `TanqueConfigResponse`
- `TanquesSummary`
- `TanquesPermissions`

## Bombas

Campos preparados conforme schema observado:

- `id_bomba`
- `id_configuracao_sistema`
- `id_usuario_alteracao`
- `nome`
- `tipo_bomba`
- `status_padrao`
- `entrada_por_pressao`
- `entrada_por_tempo`
- `encerramento_automatico`
- `criado_em`
- `atualizado_em`

Componentes criados:

- `BombasSummaryCards`
- `BombasListTable`
- `BombaDetailPanel`
- `BombaStatusBadge`

Hooks e tipos:

- `useBombasPage`
- `useTanquesBombasPermissions`
- `BombaConfigResponse`
- `BombasSummary`
- `BombasPermissions`

## Permissoes

As rotas continuam protegidas por perfil tecnico:

- `TECNICO`: pode visualizar;
- `ADMINISTRADOR`: pode visualizar;
- `OPERADOR`: nao acessa pelas rotas protegidas.

Criacao, edicao e exclusao permanecem desabilitadas porque a API nao possui endpoint HTTP dedicado
documentado para essas operacoes.

## Pendencias para liberar integracao real

Para ativar CRUD real no front, o backend precisa expor e documentar endpoints HTTP dedicados, por
exemplo:

- `GET /tanques`
- `GET /tanques/:id`
- `POST /tanques`
- `PATCH /tanques/:id`
- `DELETE /tanques/:id`
- `GET /bombas`
- `GET /bombas/:id`
- `POST /bombas`
- `PATCH /bombas/:id`
- `DELETE /bombas/:id`

Quando esses endpoints existirem, a proxima etapa recomendada e criar services tipados e substituir
o estado local dos hooks por chamadas HTTP centralizadas.
