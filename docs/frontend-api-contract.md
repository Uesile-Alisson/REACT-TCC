# Contrato de API para o Frontend - TSEA

## 1. Base URL e prefixo global

- Backend localizado em `../api`.
- Stack real: NestJS, Prisma, PostgreSQL, JWT, Socket.IO, MQTT, MongoDB/GridFS opcional, pdfmake e exceljs.
- Porta padrao: `process.env.PORT ?? 3000`.
- Prefixo global confirmado em `api/src/main.ts`: `/api`.
- Swagger confirmado em `/docs`.
- CORS confirmado para `http://localhost:5173` e `http://127.0.0.1:5173`.
- ValidationPipe global: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.

Regra final de URL:

```txt
API_BASE_URL + controllerPath + routePath
Exemplo: http://localhost:3000/api/auth/signin
```

Para o frontend, a base recomendada continua:

```txt
VITE_API_URL=http://localhost:3000/api
```

## 2. Autenticacao

### Como enviar JWT

Todas as rotas protegidas usam JWT via header:

```http
Authorization: Bearer <access_token>
```

### Rotas publicas

| Metodo | Rota | DTO | Observacoes |
|---|---|---|---|
| POST | `/auth/signin` | `SignInDTO` | Login por `login` e `senha`; retorna JWT. |
| POST | `/auth/forgot-password` | `ForgotPasswordDTO` | Recebe `login`, nao e-mail. Admin e bloqueado no service. |
| POST | `/auth/reset-password` | `ResetPasswordDTO` | Recebe token de reset e nova senha. |

### Rotas protegidas

| Metodo | Rota | Guard | DTO | Observacoes |
|---|---|---|---|---|
| POST | `/auth/first-access` | `JwtAuthGuard` | `FirstAcessDTO` | Troca senha do usuario autenticado em primeiro acesso. |

## 3. Matriz geral de permissoes

| Area | OPERADOR | TECNICO | ADMINISTRADOR |
|---|---|---|---|
| Auth signin/reset | Publico conforme rota | Publico conforme rota | Signin e reset; forgot-password bloqueado para admin no service |
| Users | Sem acesso | Listar/buscar | Criar, listar, buscar, atualizar, alterar role, remover |
| MQTT status | Visualiza status | Visualiza e executa comandos tecnicos | Controle completo, incluindo config e disconnect |
| Processos | Lista, detalhe, dashboard, parada emergencia | Opera ciclo completo | Opera ciclo completo |
| Alarmes | Lista e consulta | Lista, consulta e resolve | Lista, consulta e resolve |
| Historico | Consulta | Consulta | Consulta |
| Relatorios | Lista, detalhe e preview | Lista, gera, preview e download | Lista, gera, preview e download |

## 4. Auth

### Rotas

| Metodo | Path completo | Auth | Roles | Params | Query | Body | Response |
|---|---|---|---|---|---|---|---|
| POST | `/api/auth/signin` | Nao | Publico | - | - | `SignInDTO` | `{ access_token, usuario }` |
| POST | `/api/auth/first-access` | Sim | Usuario autenticado | - | - | `FirstAcessDTO` | `{ message }` |
| POST | `/api/auth/forgot-password` | Nao | Publico | - | - | `ForgotPasswordDTO` | `{ message, resetToken? }` |
| POST | `/api/auth/reset-password` | Nao | Publico | - | - | `ResetPasswordDTO` | `{ message }` |

### DTOs

- `SignInDTO`: `login: string`, `senha: string`.
- `FirstAcessDTO`: `senhaNova: string`, `confirmarSenha: string`; minimo 6, 1 maiuscula, 1 numero, 1 caractere especial.
- `ForgotPasswordDTO`: `login: string`.
- `ResetPasswordDTO`: `token: string`, `senhaNova: string`, `confirmarSenha: string`; mesma regra de senha.

### Responses

`signin` retorna `usuario`, nao `user`, no backend atual:

```ts
{
  access_token: string;
  usuario: {
    id_usuario: number;
    nome: string;
    login: string;
    email: string;
    nivel_acesso: object;
    primeiro_acesso: boolean;
  };
}
```

### Erros

- `401`: login invalido, senha invalida, usuario inexistente, token invalido.
- `400`: senhas diferentes ou DTO invalido.
- `forgot-password`: para usuario inexistente retorna mensagem neutra; para admin lança `UnauthorizedException`.

## 5. Usuarios

Controller: `@Controller('user')`, protegido por `JwtAuthGuard` e `RolesGuard`.

| Metodo | Rota | Auth | Roles | DTO | Response |
|---|---|---|---|---|---|
| POST | `/api/user` | Sim | ADMINISTRADOR | `CreateUserDTO` | Usuario criado |
| GET | `/api/user` | Sim | ADMINISTRADOR, TECNICO | - | Lista usuarios |
| GET | `/api/user/:id` | Sim | ADMINISTRADOR, TECNICO | - | Usuario |
| PATCH | `/api/user/:id` | Sim | ADMINISTRADOR | `UpdateUserDTO` | Usuario atualizado |
| PATCH | `/api/user/:id/role` | Sim | ADMINISTRADOR | `UpdateUserRolesDTO` | Nivel atualizado |
| DELETE | `/api/user/:id` | Sim | ADMINISTRADOR | - | Remocao/desativacao conforme service |

DTOs:

- `CreateUserDTO`: `nome`, `login`, `email`, `id_nivel_acesso`.
- `UpdateUserDTO`: `nome?`, `login?`, `email?`.
- `UpdateUserRolesDTO`: `id_nivel_acesso`.

Observacao: confirmar no service/mappers se `senha_hash` nunca sai em response antes de expor usuarios no front.

## 6. MQTT/Hardware

Controller: `@Controller('mqtt-hardware')`, protegido por `JwtAuthGuard` e `RolesGuard`.

### Rotas HTTP

| Metodo | Rota | Roles | Body | Efeito |
|---|---|---|---|---|
| GET | `/api/mqtt-hardware/status` | ADMINISTRADOR, TECNICO, OPERADOR | - | Consulta MQTT/hardware. |
| GET | `/api/mqtt-hardware/config` | ADMINISTRADOR, TECNICO | - | Consulta config sem dados sensiveis. |
| PATCH | `/api/mqtt-hardware/config` | ADMINISTRADOR | `UpdateMqttConfigDTO` | Atualiza config MQTT. |
| POST | `/api/mqtt-hardware/commands/test` | ADMINISTRADOR, TECNICO | - | Testa conexao. |
| POST | `/api/mqtt-hardware/commands/reconnect` | ADMINISTRADOR, TECNICO | - | Reconecta broker. |
| POST | `/api/mqtt-hardware/commands/disconnect` | ADMINISTRADOR | - | Desconecta broker. |
| POST | `/api/mqtt-hardware/commands/sincronizar-hardware` | ADMINISTRADOR, TECNICO | `MqttCommandRequestDto?` | Publica comando. |
| POST | `/api/mqtt-hardware/commands/reiniciar-comunicacao` | ADMINISTRADOR, TECNICO | `MqttCommandRequestDto?` | Publica comando. |
| POST | `/api/mqtt-hardware/commands/parada-emergencia` | ADMINISTRADOR, TECNICO, OPERADOR | `MqttCommandRequestDto?` | Parada emergencia via MQTT. |
| POST | `/api/mqtt-hardware/commands/desligar-todas-bombas` | ADMINISTRADOR, TECNICO | `MqttCommandRequestDto?` | Desliga bombas. |
| POST | `/api/mqtt-hardware/commands/abrir-todas-valvulas` | ADMINISTRADOR, TECNICO | `MqttCommandRequestDto?` | Abre valvulas. |
| POST | `/api/mqtt-hardware/commands/fechar-todas-valvulas` | ADMINISTRADOR, TECNICO | `MqttCommandRequestDto?` | Fecha valvulas. |

### Eventos Socket.IO

Namespace real: `mqtt-hardware`.

| Evento | Payload confirmado | Uso esperado |
|---|---|---|
| `socket:connected` | `{ message, socketId, conectado_em }` | Confirmar conexao socket. |
| `mqtt:connection-status` | `status_conexao`, `error`, `enviado_em` | Indicador MQTT. |
| `mqtt:error` | `error`, `enviado_em` | Feedback de falha MQTT. |
| `hardware:state` | `HardwareState` + `enviado_em` | Estado geral hardware. |
| `sensor:reading` | `id_leitura_sensor`, `valor_vacuo`, ids de processo/tanque/sensor, datas | Grafico/telemetria em tempo real. |
| `hardware:status` | status ESP32, bombas, valvulas, processo, mensagem | Painel operacional. |
| `hardware:heartbeat` | `esp32_online`, uptime/firmware/datas, ids operacionais | Saude do ESP32. |
| `alarm:created` | dados completos do alarme | Popups e lista de alarmes. |
| `sensor-acoplamento:updated` | sensor/tanque/processo, `status_acoplamento` | Estado de mangueira/acoplamento. |

## 7. Processos

Controller: `@Controller('processos')`, protegido por JWT e roles.

### Rotas

| Metodo | Rota | Roles | DTO/Query | Response |
|---|---|---|---|---|
| POST | `/api/processos` | TECNICO, ADMINISTRADOR | `CreateProcessoDTO` | Processo criado |
| GET | `/api/processos` | Todos | `ListProcessosQueryDTO` | Lista paginada |
| GET | `/api/processos/ativo` | Todos | - | Processo ativo |
| GET | `/api/processos/:id` | Todos | - | Detalhe |
| GET | `/api/processos/:id/dashboard` | Todos | - | Dashboard do processo |
| PATCH | `/api/processos/:id/config` | TECNICO, ADMINISTRADOR | `UpdateProcessoConfigDTO` | Config atualizada |
| POST | `/api/processos/:id/iniciar` | TECNICO, ADMINISTRADOR | - | Inicia |
| POST | `/api/processos/:id/pausar` | TECNICO, ADMINISTRADOR | - | Pausa |
| POST | `/api/processos/:id/retomar` | TECNICO, ADMINISTRADOR | - | Retoma |
| POST | `/api/processos/:id/finalizar` | TECNICO, ADMINISTRADOR | `FinalizarProcessoDTO` | Finaliza |
| POST | `/api/processos/:id/interromper` | TECNICO, ADMINISTRADOR | `InterromperProcessoDTO` | Interrompe |
| POST | `/api/processos/:id/parada-emergencia` | Todos | `ParadaEmergenciaProcessoDTO` | Parada emergencia |

### DTOs

- `CreateProcessoDTO`: `nome_processo?`, `tempo_maximo`, `vacuo_alvo?`, `tanques[]`.
- `CreateProcessoTanqueDTO`: `id_tanque`, `vacuo_alvo?`, `sensores[]`.
- `CreateProcessoSensorDTO`: `id_sensor`, `observacoes?`.
- `UpdateProcessoConfigDTO`: mesmos campos principais opcionais.
- `ListProcessosQueryDTO`: `status_processo?`, `busca?`, `data_inicio?`, `data_fim?`, `page?`, `limit?`.
- `FinalizarProcessoDTO`: `observacao?`.
- `InterromperProcessoDTO`: `motivo`, `observacao?`.
- `ParadaEmergenciaProcessoDTO`: `motivo`, `detalhes?`.

### Status

Enum real `statusprocesso`:

- `CONFIGURADO`
- `EM_EXECUCAO`
- `PAUSADO`
- `CONCLUIDO`
- `INTERROMPIDO`
- `FALHA`

### Eventos Socket.IO

Namespace real: `processos`.

Eventos:

- `process:socket-connected`
- `process:join`
- `process:leave`
- `process:joined`
- `process:left`
- `process:created`
- `process:started`
- `process:paused`
- `process:resumed`
- `process:finished`
- `process:interrupted`
- `process:emergency-stop`
- `process:failure`
- `process:config-updated`
- `process:metrics-updated`
- `process:dashboard-updated`
- `process:status-changed`
- `process:error`

Payloads confirmados incluem `id_processo`, `status_processo`, `message`, `metrics`, `dashboard`, `motivo`, `emitted_at`.

## 8. Alarmes

Controller: `@Controller('alarmes')`, protegido por JWT e roles.

### Rotas

| Metodo | Rota | Roles | Query/Body | Response |
|---|---|---|---|---|
| GET | `/api/alarmes` | Todos | `ListAlarmesQueryDto` | Lista |
| GET | `/api/alarmes/dashboard` | Todos | `ListAlarmesQueryDto` | Dashboard |
| GET | `/api/alarmes/ativos` | Todos | `ListAlarmesQueryDto` | Ativos |
| GET | `/api/alarmes/criticos` | Todos | `ListAlarmesQueryDto` | Criticos |
| GET | `/api/alarmes/processo/:id_processo` | Todos | `ListAlarmesQueryDto` | Por processo |
| GET | `/api/alarmes/processo/:id_processo/ativos` | Todos | `ListAlarmesQueryDto` | Ativos por processo |
| GET | `/api/alarmes/processo/:id_processo/criticos` | Todos | `ListAlarmesQueryDto` | Criticos por processo |
| GET | `/api/alarmes/:id` | Todos | - | Detalhe |
| PATCH | `/api/alarmes/:id/resolver` | TECNICO, ADMINISTRADOR | `ResolveAlarmeDto` | Alarme resolvido |

### DTOs

- `ListAlarmesQueryDto`: `page`, `limit`, `severidade`, `status_alarme`, `tipo_alarme`, `origem_alarme`, ids relacionados, `apenas_ativos`, `apenas_criticos`, datas, `busca`, `order_by`, `order_direction`.
- `ResolveAlarmeDto`: `observacao?`.

### Enums

- `severidadealarme`: `INFO`, `MEDIO`, `CRITICO`.
- `statusalarme`: `ATIVO`, `RESOLVIDO`.

### Eventos em tempo real

Namespace: `alarmes`.

- `alarm:socket-connected`
- `alarm:resolved`
- `alarm:dashboard-updated`
- `alarm:notification`

Payloads usam `ResolveAlarmeResult`, `AlarmeDashboard` e `AlarmeNotificationPayload`.

## 9. Historico

Controller: `@Controller('historico')`, protegido por JWT e roles `OPERADOR`, `TECNICO`, `ADMINISTRADOR`.

| Metodo | Rota | Query | Response |
|---|---|---|---|
| GET | `/api/historico/processos` | `ListHistoricoProcessosQueryDto` | `HistoricoProcessoListResponse` |
| GET | `/api/historico/dashboard` | `HistoricoDashboardQueryDto` | `HistoricoDashboardResponse` |
| GET | `/api/historico/processos/:id_processo` | - | `HistoricoProcessoDetails` |
| GET | `/api/historico/processos/:id_processo/tanques` | - | `HistoricoTanqueSummary[]` |
| GET | `/api/historico/processos/:id_processo/alarmes` | `HistoricoProcessoAlarmesQueryDto` | `{ data, meta }` |
| GET | `/api/historico/processos/:id_processo/eventos` | `HistoricoProcessoEventosQueryDto` | `{ data, meta }` |
| GET | `/api/historico/processos/:id_processo/relatorios` | - | `HistoricoRelatorioSummary[]` |
| GET | `/api/historico/processos/:id_processo/grafico-vacuo` | `HistoricoGraficoVacuoQueryDto` | `HistoricoVacuoChartResponse` |
| GET | `/api/historico/processos/:id_processo/dashboard` | - | `HistoricoDashboardResponse` |
| GET | `/api/historico/processos/:id_processo/comparativo-tanques` | - | `HistoricoTanqueComparisonResponse` |

Historico consulta metadados e analiticos. Geracao/download de relatorio pertence ao modulo Relatorios.

## 10. Relatorios

Controller: `@Controller('relatorios')`, protegido por JWT e roles.

### Rotas

| Metodo | Rota | Roles | Body/Query | Response |
|---|---|---|---|---|
| GET | `/api/relatorios` | Todos | `ListRelatoriosQueryDto` | `RelatorioListResponse` |
| POST | `/api/relatorios/processos/:id_processo` | TECNICO, ADMINISTRADOR | `GenerateProcessReportDto` | `RelatorioGenerationResult` |
| POST | `/api/relatorios/alarmes/:id_alarme` | TECNICO, ADMINISTRADOR | `GenerateAlarmReportDto` | `SingleRelatorioGenerationResult` |
| GET | `/api/relatorios/:id_relatorio/preview` | Todos | - | `StreamableFile` PDF |
| GET | `/api/relatorios/:id_relatorio/download` | TECNICO, ADMINISTRADOR | - | `StreamableFile` PDF/XLSX |
| GET | `/api/relatorios/:id_relatorio` | Todos | - | `RelatorioResponse` |

### Geracao

- Processo: `formatos?: formatorelatorio[]`, aceitando `PDF` e/ou `XLSX`; `observacao?`.
- Alarme: `formato?: PDF`; `observacao?`.
- CSV nao existe.

### Preview

- Preview e PDF-only.
- Retorna `StreamableFile`.
- Header `Content-Type` vem de `result.content_type`.
- Header `Content-Disposition` usa `inline; filename="..."`.

### Download

- Download e PDF/XLSX conforme arquivo gerado.
- Retorna `StreamableFile`.
- Header `Content-Disposition` usa `attachment; filename="..."`.
- Front deve usar `responseType: 'blob'`.

### Regras confirmadas

- Relatorios sao imutaveis no contrato HTTP atual.
- Nao existe rota de editar relatorio.
- Nao existe rota de regenerar relatorio.
- Nao existe rota de excluir relatorio.
- Operador pode listar, detalhar e preview.
- Operador nao pode gerar nem baixar.
- Tecnico/Admin podem gerar e baixar.

## 11. Eventos Socket.IO consolidados

| Namespace | Evento | Payload | Uso esperado |
|---|---|---|---|
| `mqtt-hardware` | `socket:connected` | message/socketId/data | Estado de conexao socket |
| `mqtt-hardware` | `mqtt:connection-status` | status/error/data | Status MQTT |
| `mqtt-hardware` | `mqtt:error` | error/data | Alerta tecnico |
| `mqtt-hardware` | `hardware:state` | `HardwareState` | Estado geral hardware |
| `mqtt-hardware` | `sensor:reading` | leitura de vacuo | Grafico/telemetria |
| `mqtt-hardware` | `hardware:status` | ESP32/bombas/valvulas/processo | Painel operacional |
| `mqtt-hardware` | `hardware:heartbeat` | heartbeat ESP32 | Saude do hardware |
| `mqtt-hardware` | `alarm:created` | alarme completo | Popup/lista alarmes |
| `mqtt-hardware` | `sensor-acoplamento:updated` | status acoplamento | Estado mangueira |
| `processos` | `process:*` | lifecycle/status/metricas/dashboard | Processo em tempo real |
| `alarmes` | `alarm:*` | resolucao/dashboard/notificacao | Popups e dashboards |

## 12. Padrao de erro da API

A API usa exceptions padrao do NestJS com `ValidationPipe`. Formato esperado:

```json
{
  "message": "mensagem ou lista de mensagens",
  "error": "Bad Request",
  "statusCode": 400
}
```

Nao foi identificado filtro global customizado com `timestamp`/`path`.

Erros comuns:

- `400`: DTO invalido, whitelist/forbidNonWhitelisted, senhas diferentes.
- `401`: JWT ausente/invalido, credenciais invalidas, regra de auth bloqueada.
- `403`: role insuficiente.
- `404`: entidade nao encontrada.
- `409`: conflito de regra de negocio, se service usar.
- `500`: falha interna.

## 13. Pendencias e inconsistencias encontradas

| Gravidade | Modulo | Item | Descricao | Sugestao |
|---|---|---|---|---|
| MEDIO | Auth | `FirstAcessDTO` | Nome possui typo em `Acess`; path de arquivo tambem usa `first-acess`. | Corrigir em fase backend propria ou manter adapter no front. |
| MEDIO | Auth | Response signin | Backend retorna `usuario`, enquanto front pode preferir `user`. | Normalizar no service do front. |
| MEDIO | Auth | `/me` | Nao existe rota de perfil atual. | Criar contrato futuro antes de hidratar usuario por token salvo. |
| BAIXO | MQTT | Socket CORS | Gateways usam `origin: '*'`; HTTP CORS e mais restrito. | Revisar politica antes de producao/Electron. |
| MEDIO | Socket.IO | Payloads | Alguns eventos usam interfaces, mas o front ainda nao tem types equivalentes. | Criar types na Fase Front 2/4. |
| BAIXO | Relatorios | Arquivo | Headers existem; front ainda precisa parser de filename. | Criar helper Blob/download. |
| BAIXO | Historico | Rotas de tanques/comparativos | Existem para analise historica, mas MVP front deve manter foco em vacuo. | Consumir apenas quando tela pedir, sem virar fluxo operacional de oleo/nivel. |

## 14. Ordem recomendada para integracao no React

1. Consolidar `api` client e tratamento de erros.
2. Ajustar Auth service para response real `usuario`.
3. Criar services por modulo: `processos`, `alarmes`, `historico`, `leituras-eventos`, `relatorios`, `mqtt-hardware`, `users`.
4. Criar types front baseados nos DTOs/interfaces reais.
5. Integrar primeiro Auth e Processos.
6. Integrar Alarmes e Historico.
7. Implementar Relatorios com Blob/File.
8. Implementar Socket.IO por namespace, com cleanup e reconexao.
