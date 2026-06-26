# Integracao em Tempo Real - TSEA Frontend

## 1. Resumo da fase

A Fase Front 4 foi analisada e parcialmente preparada, mas a integracao real Socket.IO nao foi concluida porque `socket.io-client` nao esta instalado no projeto. Conforme regra da fase, nao foi feita instalacao automatica e nao foi criada alternativa com WebSocket manual.

Foram criadas constantes e tipagens TypeScript para os namespaces e eventos reais documentados, sem abrir conexao e sem registrar listeners ativos.

## 2. Namespace Socket.IO utilizado

Namespaces reais confirmados por documentacao:

| Namespace | Uso |
|---|---|
| `mqtt-hardware` | Status MQTT, ESP32, leituras, alarmes e acoplamento. |
| `processos` | Lifecycle, status, metricas e dashboard de processos. |
| `alarmes` | Resolucao, dashboard e notificacoes de alarmes. |

## 3. Eventos integrados

Nenhum evento foi integrado em runtime porque `socket.io-client` esta ausente.

Eventos reais mapeados em constantes:

| Evento | Payload | Onde e consumido | Observacoes |
|---|---|---|---|
| `socket:connected` | `SocketConnectedPayload` | Pendente | Namespace `mqtt-hardware`. |
| `mqtt:connection-status` | `MqttConnectionStatusPayload` | Pendente | Status do broker MQTT. |
| `mqtt:error` | `MqttErrorPayload` | Pendente | Erro tecnico do MQTT. |
| `hardware:state` | `HardwareStatePayload` | Pendente | Estado geral do hardware. |
| `sensor:reading` | `SensorReadingPayload` | Pendente | Leitura de vacuo em tempo real. |
| `hardware:status` | `HardwareStatusPayload` | Pendente | ESP32, bombas, valvulas e processo. |
| `hardware:heartbeat` | `HeartbeatPayload` | Pendente | Saude do ESP32. |
| `alarm:created` | `AlarmCreatedPayload` | Pendente | Novo alarme. |
| `sensor-acoplamento:updated` | `SensorAcoplamentoPayload` | Pendente | Status de acoplamento. |
| `process:*` | `ProcessLifecyclePayload` | Pendente | Eventos de lifecycle/status do processo. |
| `alarm:*` | `AlarmRealtimePayload` | Pendente | Eventos do namespace `alarmes`. |

## 4. Autenticacao do socket

Pendente. A regra recomendada para proxima fase tecnica e usar JWT via `auth: { token }`, caso o backend aceite. Nao foi colocado token em query string e nenhum token foi logado.

## 5. Estado global de realtime

Pendente. Nao foi criado `RealtimeProvider` ativo para evitar conexao falsa ou dependencia inexistente.

Estrutura preparada:

- `src/services/realtime/socket-events.ts`
- `src/services/realtime/socket.types.ts`
- `src/services/realtime/index.ts`
- `src/types/realtime.types.ts`

## 6. Paginas integradas

| Pagina | Eventos consumidos | Comportamento |
|---|---|---|
| Dashboard | Nenhum em runtime | Continua usando HTTP como fonte inicial via `useDashboardData`. |
| Processos | Nenhum | Pagina dedicada ainda nao existe. |
| Detalhe de processo | Nenhum | Pagina dedicada ainda nao existe. |
| Alarmes | Nenhum | Pagina dedicada ainda nao existe. |
| Configuracoes/hardware | Nenhum | Pagina dedicada ainda nao existe. |

## 7. Alarmes em tempo real

Nao integrado em runtime. Evento real `alarm:created` foi mapeado para uso futuro. Popup/notificacao global nao foi criado porque a dependencia Socket.IO esta ausente e nao existe estrutura previa de notificacao global.

## 8. Status MQTT/ESP32

Nao integrado via socket. Dashboard continua com fallback HTTP por `GET /mqtt-hardware/status`.

## 9. Leituras de sensor

Nao integrado via socket. Evento real `sensor:reading` foi mapeado e tipado para uso futuro.

## 10. Acoplamento de mangueira

Nao integrado via socket. Evento real `sensor-acoplamento:updated` foi mapeado e tipado para uso futuro.

## 11. Reconexao e cleanup

Pendente. Como nao ha `socket.io-client`, nao existe conexao ativa nem listeners a limpar. A proxima implementacao deve usar instancia unica, cleanup no unmount e desconexao no logout.

## 12. Eventos encontrados mas nao integrados

- `socket:connected`
- `mqtt:connection-status`
- `mqtt:error`
- `hardware:state`
- `sensor:reading`
- `hardware:status`
- `hardware:heartbeat`
- `alarm:created`
- `sensor-acoplamento:updated`
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
- `alarm:resolved`
- `alarm:dashboard-updated`
- `alarm:notification`

## 13. Eventos esperados mas nao encontrados

Nao houve busca direta no backend porque ele nao esta dentro do workspace gravavel/legivel atual desta sessao. Os eventos acima foram extraidos da documentacao existente em `docs/`.

## 14. Pendencias para Fase Front 5

- Preview PDF/XLSX.
- Download PDF/XLSX.
- Download XLSX.
- Blob na UI.
- `Content-Disposition` na interface.
- Permissoes de download.

## 15. Pendencias para Fase Front 6

- Polimento visual.
- Animacoes.
- Tratamento refinado de reconnect.
- Empty states melhores.
- Responsividade das telas operacionais futuras.
- Acessibilidade basica.

## Bloqueio historico da Fase 4

Na Fase 4 original, `socket.io-client` ainda nao estava instalado; por isso a integracao real Socket.IO nao foi concluida naquele momento. Esse bloqueio foi removido na Fase Front 4.1 com a instalacao autorizada do pacote.

## Fase Front 4.1 - Socket.IO runtime ativado

### 1. Dependencia instalada

- Pacote: `socket.io-client`.
- Versao instalada: `^4.8.3`.
- `package.json` e `package-lock.json` foram atualizados pelo `npm install socket.io-client`.

### 2. Client central

- Arquivo: `src/services/realtime/socket-client.ts`.
- URL base: `VITE_SOCKET_URL`, depois `VITE_API_BASE_URL`, depois `VITE_API_URL`, com fallback `http://localhost:3000`.
- Sufixo `/api` e removido para evitar usar a URL REST como origem Socket.IO.
- Namespace runtime inicial: `/mqtt-hardware`.
- `autoConnect: false`.
- Transportes: `websocket` e `polling`.
- Auth: token enviado via `auth: { token }` quando disponivel.
- O client reconecta quando o token muda.

### 3. Provider/Store

- Arquivo: `src/contexts/realtime/RealtimeProvider.tsx`.
- A aplicacao foi envolvida em `RealtimeProvider` dentro de `AuthProvider`.
- Conecta quando ha `accessToken` e usuario autenticado.
- Desconecta quando nao ha autenticacao ou no cleanup.
- Estado exposto:
  - `isConnected`;
  - `isConnecting`;
  - `lastError`;
  - `mqttConnectionStatus`;
  - `mqttError`;
  - `hardwareState`;
  - `hardwareStatus`;
  - `esp32Online`;
  - `lastHeartbeat`;
  - `lastSensorReading`;
  - `lastAlarm`;
  - `lastAcoplamento`;
  - `eventsCount`.

### 4. Hooks

- `useRealtime`: acesso ao contexto realtime completo.
- `useMqttHardwareRealtime`: status MQTT, hardware, ESP32, heartbeat e contagem de eventos.
- `useSensorReadingsRealtime`: ultima leitura de sensor.
- `useAlarmesRealtime`: ultimo alarme criado.
- `useAcoplamentoRealtime`: ultimo evento de acoplamento.

### 5. Eventos realmente integrados

| Evento | Namespace | Payload | Estado atualizado | Tela/Hook consumidor |
|---|---|---|---|---|
| `connect` | `/mqtt-hardware` | Sistema Socket.IO | `isConnected`, `isConnecting`, `lastError` | `useRealtime`, Dashboard |
| `disconnect` | `/mqtt-hardware` | Motivo de desconexao | `isConnected`, `isConnecting` | `useRealtime`, Dashboard |
| `connect_error` | `/mqtt-hardware` | `Error` | `lastError` | `useRealtime`, Dashboard |
| `mqtt:connection-status` | `/mqtt-hardware` | `MqttConnectionStatusPayload` | `mqttConnectionStatus`, `lastError`, `eventsCount` | `useMqttHardwareRealtime`, Dashboard |
| `mqtt:error` | `/mqtt-hardware` | `MqttErrorPayload` | `mqttError`, `lastError`, `eventsCount` | `useMqttHardwareRealtime` |
| `hardware:state` | `/mqtt-hardware` | `HardwareStatePayload` | `hardwareState`, `eventsCount` | `useMqttHardwareRealtime` |
| `hardware:status` | `/mqtt-hardware` | `HardwareStatusPayload` | `hardwareStatus`, `esp32Online`, `eventsCount` | `useMqttHardwareRealtime`, Dashboard |
| `hardware:heartbeat` | `/mqtt-hardware` | `HeartbeatPayload` | `lastHeartbeat`, `esp32Online`, `eventsCount` | `useMqttHardwareRealtime`, Dashboard |
| `sensor:reading` | `/mqtt-hardware` | `SensorReadingPayload` | `lastSensorReading`, `eventsCount` | `useSensorReadingsRealtime`, Dashboard |
| `alarm:created` | `/mqtt-hardware` | `AlarmCreatedPayload` | `lastAlarm`, `eventsCount` | `useAlarmesRealtime` |
| `sensor-acoplamento:updated` | `/mqtt-hardware` | `SensorAcoplamentoPayload` | `lastAcoplamento`, `eventsCount` | `useAcoplamentoRealtime` |

### 6. Eventos pendentes de confirmacao

| Evento | Motivo |
|---|---|
| Eventos do namespace `/processos` | Constantes existem, mas a conexao runtime inicial foi limitada ao namespace `/mqtt-hardware`; telas dedicadas ainda nao existem. |
| Eventos do namespace `/alarmes` | Constantes existem, mas a conexao runtime inicial foi limitada ao namespace `/mqtt-hardware`; pagina de Alarmes ainda nao existe. |
| `process:*` wildcard | Socket.IO client nao possui wildcard padrao sem pacote extra; cada evento deve ser ligado explicitamente quando a tela existir. |
| `alarm:*` wildcard | Socket.IO client nao possui wildcard padrao sem pacote extra; cada evento deve ser ligado explicitamente quando a tela existir. |

### 7. Integracao visual minima

- Dashboard exibe estado de conexao realtime.
- Dashboard exibe contagem de eventos recebidos.
- Dashboard combina estado inicial HTTP com atualizacoes Socket.IO para MQTT/ESP32.
- Dashboard mostra ultima leitura de vacuo recebida por socket.
- Nao foi criado menu lateral nem tela dedicada nova.

### 8. Cuidados

- Sem MQTT direto no frontend.
- Sem ESP32 direto no frontend.
- Sem WebSocket manual.
- Sem comandos emitidos via socket.
- Uma conexao central no namespace `/mqtt-hardware`.
- Listeners possuem cleanup no provider.
- Token nao e logado.

### 9. Pendencias futuras

- Criar layout/shell com menu lateral esquerdo.
- Criar paginas dedicadas de Dashboard, Processos, Alarmes, Historico, Relatorios, Configuracoes, MQTT/Hardware, Tanques, Bombas e Usuarios.
- Consumir os hooks realtime nas telas dedicadas.
- Confirmar eventos diretamente nos gateways do backend quando o backend estiver acessivel no workspace.
- Testar com backend real ligado.
- Testar com MQTT/ESP32 reais.
