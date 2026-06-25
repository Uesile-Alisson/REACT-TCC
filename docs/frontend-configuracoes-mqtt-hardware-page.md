# Tela de Configuracoes MQTT/Hardware - TSEA Frontend

## 1. Resumo da fase

A Fase Front 14 substituiu o placeholder de `/configuracoes/mqtt-hardware` por uma tela dedicada para configuracao MQTT e monitoramento do hardware. A tela usa os services HTTP reais existentes e os hooks realtime ja ativos no projeto, sem conectar MQTT/ESP32 diretamente pelo frontend.

## 2. Rota

- `/configuracoes/mqtt-hardware`
- Perfis permitidos: `TECNICO`, `ADMINISTRADOR`
- `OPERADOR` nao acessa pelo menu e e bloqueado pelo `RoleGuard`.

## 3. Dados consumidos

| Bloco | Service/Hook | Endpoint/evento | Observacoes |
|---|---|---|---|
| Configuracao MQTT ativa | `getMqttHardwareConfig` | `GET /mqtt-hardware/config` | Retorna configuracao sanitizada, sem senha/hash. |
| Status MQTT/Hardware | `getMqttHardwareStatus` | `GET /mqtt-hardware/status` | Fonte inicial HTTP. |
| Salvar configuracao | `updateMqttHardwareConfig` | `PATCH /mqtt-hardware/config` | Backend restringe a `ADMINISTRADOR`. |
| Reiniciar comunicacao | `restartCommunication` | `POST /mqtt-hardware/commands/reiniciar-comunicacao` | Acionado somente por botao e confirmacao. |
| Sincronizar hardware | `syncHardware` | `POST /mqtt-hardware/commands/sincronizar-hardware` | Acionado somente por botao e confirmacao. |
| Realtime MQTT | `useMqttHardwareRealtime` | `mqtt:connection-status`, `mqtt:error`, `hardware:status`, `hardware:heartbeat` | Atualizacao incremental. |
| Realtime leitura | `useSensorReadingsRealtime` | `sensor:reading` | Ultima leitura de vacuo. |
| Realtime acoplamento | `useAcoplamentoRealtime` | `sensor-acoplamento:updated` | Ultimo status de acoplamento. |

## 4. Componentes criados

| Componente | Responsabilidade |
|---|---|
| `MqttStatusCard` | Exibe status MQTT, broker, porta e estado realtime. |
| `Esp32StatusCard` | Exibe online/offline, heartbeat, firmware e uptime. |
| `HardwareReadingsCard` | Exibe sensor principal, ultima leitura e acoplamento. |
| `MqttConfigForm` | Exibe/edita configuracao MQTT conforme permissao. |
| `MqttTopicsPanel` | Lista topicos configurados. |
| `HardwareActionsPanel` | Executa reiniciar comunicacao e sincronizar hardware. |

## 5. Campos de configuracao MQTT

| Campo | Editavel | Validacao | Observacoes |
|---|---|---|---|
| `broker_url` | ADMINISTRADOR | Obrigatorio, trim | Enviado no payload. |
| `porta` | ADMINISTRADOR | Inteiro entre 1 e 65535 | Enviado no payload. |
| `usuario_mqtt` | ADMINISTRADOR | Trim | Enviado apenas como string opcional. |
| `senha_mqtt` | ADMINISTRADOR | Enviada somente se preenchida | Nao e retornada nem exibida em texto puro. |
| `topico_leituras` | ADMINISTRADOR | Obrigatorio, sem espacos, nao apenas `/` | Enviado no payload. |
| `topico_comandos` | ADMINISTRADOR | Obrigatorio, sem espacos, nao apenas `/` | Enviado no payload. |
| `topico_status` | ADMINISTRADOR | Obrigatorio, sem espacos, nao apenas `/` | Enviado no payload. |
| `topico_alarmes` | ADMINISTRADOR | Obrigatorio, sem espacos, nao apenas `/` | Enviado no payload. |
| `topico_heartbeat` | ADMINISTRADOR | Obrigatorio, sem espacos, nao apenas `/` | Enviado no payload. |
| `topico_acoplamentos` | ADMINISTRADOR | Obrigatorio, sem espacos, nao apenas `/` | Enviado no payload. |
| `reconexao_automatica` | ADMINISTRADOR | Boolean | Enviado no payload. |
| `timeout_comunicacao` | ADMINISTRADOR | Inteiro minimo 1000 ms | Enviado no payload. |
| `ativo` | ADMINISTRADOR | Boolean | Enviado no payload. |

## 6. Status de comunicacao

- MQTT: status HTTP inicial com override visual por realtime.
- ESP32: status HTTP/realtime/heartbeat.
- Heartbeat: evento `hardware:heartbeat`.
- Ultima leitura: evento `sensor:reading`.
- Acoplamento: evento `sensor-acoplamento:updated`.
- Erro de comunicacao: `mqtt:error` e `lastError` do provider realtime.

## 7. Formulario

- Carrega a configuracao ativa por service real.
- Mantem estado dirty.
- Permite restaurar valores carregados.
- Desabilita salvar se nada mudou.
- Desabilita salvar durante request.
- Exibe modo somente leitura para `TECNICO`.
- Campo de senha fica vazio com placeholder `Manter senha atual`.
- Senha so entra no payload se o usuario preencher novo valor.

## 8. Acoes de hardware/comunicacao

- Reiniciar comunicacao: `restartCommunication`, `POST /mqtt-hardware/commands/reiniciar-comunicacao`.
- Sincronizar hardware: `syncHardware`, `POST /mqtt-hardware/commands/sincronizar-hardware`.
- Ambas pedem confirmacao, exibem loading, sucesso/erro e atualizam status apos sucesso.

## 9. Realtime

Hooks usados:

- `useMqttHardwareRealtime`
- `useSensorReadingsRealtime`
- `useAcoplamentoRealtime`

Nao foi criada conexao socket na pagina. A pagina consome o `RealtimeProvider` existente. HTTP continua sendo fonte inicial e fallback.

## 10. Validacoes

Frontend:

- broker obrigatorio;
- porta 1 a 65535;
- timeout minimo 1000 ms;
- topicos obrigatorios;
- topicos sem espacos;
- topicos nao podem ser apenas `/`;
- evita duplicacao obvia de topicos.

Backend:

- continua validando DTO e permissoes finais.

## 11. Permissoes visuais

| Perfil | Visualizar | Editar | Reiniciar | Sincronizar |
|---|---|---|---|---|
| `OPERADOR` | Nao | Nao | Nao | Nao |
| `TECNICO` | Sim | Nao, porque backend restringe update a admin | Sim | Sim |
| `ADMINISTRADOR` | Sim | Sim | Sim | Sim |

## 12. Tratamento de erro

- `400`: dados invalidos.
- `401`: sessao expirada/nao autenticado.
- `403`: sem permissao para alterar configuracao.
- `404`: configuracao/status nao encontrado.
- `409`: conflito/regra de negocio.
- `500`: erro inesperado ao comunicar com servidor.
- Erro MQTT/backend: exibido como alerta tecnico sem stack trace.

## 13. O que NAO foi implementado nesta fase

- Configuracoes gerais do sistema.
- Tanques.
- Bombas.
- Usuarios.
- Conexao MQTT direta no front.
- Conexao ESP32 direta no front.
- WebSocket manual.
- Evento realtime inventado.
- QoS/retain como campo visual.
- CSV.
- Oleo/vazao/nivel/volume.

## 14. Pendencias para Fase Front 15

- Criar tela dedicada de Tanques.
- Criar tela dedicada de Bombas.
- Configuracoes fisicas/operacionais.
- Listagem.
- Edicao se API permitir.
- Permissoes tecnico/admin.
