# Mapa de Services HTTP - Frontend TSEA

## Base HTTP

- Cliente central: `src/api/axios.ts`.
- Base URL: `VITE_API_BASE_URL`, depois `VITE_API_URL`, com fallback para `http://localhost:3000/api`.
- Timeout global: `15000ms`.
- Headers padrao: `Accept: application/json` e `Content-Type: application/json`.
- JWT: enviado automaticamente como `Authorization: Bearer <access_token>`.
- Storage do token: `src/api/token-storage.ts`, chave `access_token`.
- Erros: normalizados por `src/api/api-error.ts`.
- Query params: serializados por `src/api/query-string.ts`, ignorando apenas `undefined` e `null`.
- Arquivos Blob: helper em `src/api/file-response.ts`.

## Auth Service

Arquivo: `src/services/auth.service.ts`

| Metodo | Endpoint | Observacao |
|---|---|---|
| `signIn` | `POST /auth/signin` | Normaliza `usuario` do backend para `user` no front e salva token. |
| `firstAccess` | `POST /auth/first-access` | Envia `senhaNova` e `confirmarSenha`; rota protegida. |
| `forgotPassword` | `POST /auth/forgot-password` | Envia `login`, nao e-mail. |
| `resetPassword` | `POST /auth/reset-password` | Envia `token`, `senhaNova` e `confirmarSenha`. |

## Users Service

Arquivo: `src/services/users.service.ts`

| Metodo | Endpoint |
|---|---|
| `createUser` | `POST /user` |
| `listUsers` | `GET /user` |
| `getUserById` | `GET /user/:id` |
| `updateUser` | `PATCH /user/:id` |
| `updateUserRole` | `PATCH /user/:id/role` |
| `deleteUser` | `DELETE /user/:id` |

## Processos Service

Arquivo: `src/services/processos.service.ts`

| Metodo | Endpoint |
|---|---|
| `createProcesso` | `POST /processos` |
| `listProcessos` | `GET /processos` |
| `getActiveProcesso` | `GET /processos/ativo` |
| `getProcessoById` | `GET /processos/:id` |
| `getProcessoDashboard` | `GET /processos/:id/dashboard` |
| `updateProcessoConfig` | `PATCH /processos/:id/config` |
| `startProcesso` | `POST /processos/:id/iniciar` |
| `pauseProcesso` | `POST /processos/:id/pausar` |
| `resumeProcesso` | `POST /processos/:id/retomar` |
| `finishProcesso` | `POST /processos/:id/finalizar` |
| `interruptProcesso` | `POST /processos/:id/interromper` |
| `emergencyStopProcesso` | `POST /processos/:id/parada-emergencia` |
| `getProcessoReadings` | `GET /leituras-eventos/processos/:id_processo/leituras` |
| `getProcessoEvents` | `GET /leituras-eventos/processos/:id_processo/eventos` |

## Alarmes Service

Arquivo: `src/services/alarmes.service.ts`

| Metodo | Endpoint |
|---|---|
| `listAlarmes` | `GET /alarmes` |
| `getAlarmesDashboard` | `GET /alarmes/dashboard` |
| `listActiveAlarmes` | `GET /alarmes/ativos` |
| `listCriticalAlarmes` | `GET /alarmes/criticos` |
| `listAlarmesByProcesso` | `GET /alarmes/processo/:id_processo` |
| `listActiveAlarmesByProcesso` | `GET /alarmes/processo/:id_processo/ativos` |
| `listCriticalAlarmesByProcesso` | `GET /alarmes/processo/:id_processo/criticos` |
| `getAlarmeById` | `GET /alarmes/:id` |
| `resolveAlarme` | `PATCH /alarmes/:id/resolver` |

## Historico Service

Arquivo: `src/services/historico.service.ts`

| Metodo | Endpoint |
|---|---|
| `listHistoricoProcessos` | `GET /historico/processos` |
| `getHistoricoDashboard` | `GET /historico/dashboard` |
| `getHistoricoProcessoById` | `GET /historico/processos/:id_processo` |
| `listHistoricoTanques` | `GET /historico/processos/:id_processo/tanques` |
| `listHistoricoAlarmes` | `GET /historico/processos/:id_processo/alarmes` |
| `listHistoricoEventos` | `GET /historico/processos/:id_processo/eventos` |
| `listHistoricoRelatorios` | `GET /historico/processos/:id_processo/relatorios` |
| `getHistoricoVacuoChart` | `GET /historico/processos/:id_processo/grafico-vacuo` |
| `getHistoricoProcessoDashboard` | `GET /historico/processos/:id_processo/dashboard` |
| `getHistoricoTanquesComparison` | `GET /historico/processos/:id_processo/comparativo-tanques` |

## Relatorios Service

Arquivo: `src/services/relatorios.service.ts`

| Metodo | Endpoint | Observacao |
|---|---|---|
| `listRelatorios` | `GET /relatorios` | Lista/detalhes paginaveis conforme contrato. |
| `generateProcessReport` | `POST /relatorios/processos/:id_processo` | Gera PDF e/ou XLSX. |
| `generateAlarmReport` | `POST /relatorios/alarmes/:id_alarme` | Gera PDF. |
| `previewRelatorio` | `GET /relatorios/:id_relatorio/preview` | Retorna `Blob` com filename quando header existir. |
| `downloadRelatorio` | `GET /relatorios/:id_relatorio/download` | Retorna `Blob` com filename quando header existir. |
| `getRelatorioById` | `GET /relatorios/:id_relatorio` | Detalhe do relatorio. |

## MQTT/Hardware Service

Arquivo: `src/services/mqtt-hardware.service.ts`

| Metodo | Endpoint |
|---|---|
| `getMqttHardwareStatus` | `GET /mqtt-hardware/status` |
| `getMqttHardwareConfig` | `GET /mqtt-hardware/config` |
| `updateMqttHardwareConfig` | `PATCH /mqtt-hardware/config` |
| `testMqttConnection` | `POST /mqtt-hardware/commands/test` |
| `reconnectMqtt` | `POST /mqtt-hardware/commands/reconnect` |
| `disconnectMqtt` | `POST /mqtt-hardware/commands/disconnect` |
| `syncHardware` | `POST /mqtt-hardware/commands/sincronizar-hardware` |
| `restartCommunication` | `POST /mqtt-hardware/commands/reiniciar-comunicacao` |
| `emergencyStopHardware` | `POST /mqtt-hardware/commands/parada-emergencia` |
| `turnOffAllPumps` | `POST /mqtt-hardware/commands/desligar-todas-bombas` |
| `openAllValves` | `POST /mqtt-hardware/commands/abrir-todas-valvulas` |
| `closeAllValves` | `POST /mqtt-hardware/commands/fechar-todas-valvulas` |

## Pontos Fora Desta Fase

- Socket.IO ainda nao foi implementado.
- Nenhuma tela, componente visual, SCSS, rota, hook ou contexto foi alterado nesta fase.
- Nenhuma regra de permissao visual foi criada.
- Nenhum download/preview de arquivo foi conectado em UI.
- Nenhum endpoint inexistente foi criado no front.

## Observacoes da Execucao

- Os arquivos `docs/frontend-context.md` e `docs/frontend-integration-plan.md`, citados no comando da fase, nao existem no workspace atual.
- A implementacao foi baseada nos documentos disponiveis: `docs/frontend-api-contract.md` e `docs/frontend-route-matrix.md`.
