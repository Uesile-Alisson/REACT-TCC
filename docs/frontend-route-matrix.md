# Matriz de Rotas Frontend x API - TSEA

Base dev: `http://localhost:3000/api`

| Modulo | Tela | Acao | Metodo | Rota | Auth | Roles | Params | Query | Body | Response | Observacoes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Auth | Login | Entrar | POST | `/auth/signin` | Nao | Publico | - | - | `SignInDTO` | `{ access_token, usuario }` | Usa `login` e `senha`. |
| Auth | Primeiro acesso | Definir senha | POST | `/auth/first-access` | Sim | Autenticado | - | - | `FirstAcessDTO` | `{ message }` | Exige Bearer token. |
| Auth | Esqueci senha | Solicitar reset | POST | `/auth/forgot-password` | Nao | Publico | - | - | `ForgotPasswordDTO` | `{ message, resetToken? }` | Recebe `login`, nao e-mail. |
| Auth | Redefinir senha | Redefinir | POST | `/auth/reset-password` | Nao | Publico | - | - | `ResetPasswordDTO` | `{ message }` | Token no body. |
| Users | Usuarios | Criar | POST | `/user` | Sim | ADMINISTRADOR | - | - | `CreateUserDTO` | Usuario | Criacao administrativa. |
| Users | Usuarios | Listar | GET | `/user` | Sim | ADMINISTRADOR, TECNICO | - | - | - | Lista | Confirmar ocultacao de `senha_hash`. |
| Users | Usuarios | Detalhar | GET | `/user/:id` | Sim | ADMINISTRADOR, TECNICO | `id` | - | - | Usuario | - |
| Users | Usuarios | Atualizar | PATCH | `/user/:id` | Sim | ADMINISTRADOR | `id` | - | `UpdateUserDTO` | Usuario | - |
| Users | Usuarios | Alterar role | PATCH | `/user/:id/role` | Sim | ADMINISTRADOR | `id` | - | `UpdateUserRolesDTO` | Usuario | - |
| Users | Usuarios | Remover | DELETE | `/user/:id` | Sim | ADMINISTRADOR | `id` | - | - | Resultado | Verificar se remove/desativa. |
| MQTT/Hardware | Dashboard/Status | Status geral | GET | `/mqtt-hardware/status` | Sim | Todos | - | - | - | Status MQTT/hardware | - |
| MQTT/Hardware | Configuracoes | Ver config | GET | `/mqtt-hardware/config` | Sim | ADMINISTRADOR, TECNICO | - | - | - | Config | Sem dados sensiveis. |
| MQTT/Hardware | Configuracoes | Atualizar config | PATCH | `/mqtt-hardware/config` | Sim | ADMINISTRADOR | - | - | `UpdateMqttConfigDTO` | Config atualizada | - |
| MQTT/Hardware | Hardware | Testar MQTT | POST | `/mqtt-hardware/commands/test` | Sim | ADMINISTRADOR, TECNICO | - | - | - | Resultado | Efeito colateral: conecta se necessario. |
| MQTT/Hardware | Hardware | Reconectar | POST | `/mqtt-hardware/commands/reconnect` | Sim | ADMINISTRADOR, TECNICO | - | - | - | Resultado | - |
| MQTT/Hardware | Hardware | Desconectar | POST | `/mqtt-hardware/commands/disconnect` | Sim | ADMINISTRADOR | - | - | - | Resultado | - |
| MQTT/Hardware | Hardware | Sincronizar | POST | `/mqtt-hardware/commands/sincronizar-hardware` | Sim | ADMINISTRADOR, TECNICO | - | - | `MqttCommandRequestDto?` | Resultado | Publica MQTT. |
| MQTT/Hardware | Hardware | Reiniciar comunicacao | POST | `/mqtt-hardware/commands/reiniciar-comunicacao` | Sim | ADMINISTRADOR, TECNICO | - | - | `MqttCommandRequestDto?` | Resultado | Publica MQTT. |
| MQTT/Hardware | Emergencia | Parada emergencia | POST | `/mqtt-hardware/commands/parada-emergencia` | Sim | Todos | - | - | `MqttCommandRequestDto?` | Resultado | Publica MQTT com QoS. |
| MQTT/Hardware | Hardware | Desligar bombas | POST | `/mqtt-hardware/commands/desligar-todas-bombas` | Sim | ADMINISTRADOR, TECNICO | - | - | `MqttCommandRequestDto?` | Resultado | - |
| MQTT/Hardware | Hardware | Abrir valvulas | POST | `/mqtt-hardware/commands/abrir-todas-valvulas` | Sim | ADMINISTRADOR, TECNICO | - | - | `MqttCommandRequestDto?` | Resultado | - |
| MQTT/Hardware | Hardware | Fechar valvulas | POST | `/mqtt-hardware/commands/fechar-todas-valvulas` | Sim | ADMINISTRADOR, TECNICO | - | - | `MqttCommandRequestDto?` | Resultado | - |
| Processos | Processos | Criar | POST | `/processos` | Sim | TECNICO, ADMINISTRADOR | - | - | `CreateProcessoDTO` | Processo | MVP vacuo. |
| Processos | Processos | Listar | GET | `/processos` | Sim | Todos | - | `ListProcessosQueryDTO` | - | Lista | Paginado. |
| Processos | Dashboard | Ativo | GET | `/processos/ativo` | Sim | Todos | - | - | - | Processo ativo | - |
| Processos | Detalhe processo | Detalhar | GET | `/processos/:id` | Sim | Todos | `id` | - | - | Detalhe | - |
| Processos | Detalhe processo | Dashboard | GET | `/processos/:id/dashboard` | Sim | Todos | `id` | - | - | Dashboard | - |
| Processos | Configurar processo | Atualizar config | PATCH | `/processos/:id/config` | Sim | TECNICO, ADMINISTRADOR | `id` | - | `UpdateProcessoConfigDTO` | Resultado | - |
| Processos | Operacao | Iniciar | POST | `/processos/:id/iniciar` | Sim | TECNICO, ADMINISTRADOR | `id` | - | - | Resultado | Backend valida pre-condicoes. |
| Processos | Operacao | Pausar | POST | `/processos/:id/pausar` | Sim | TECNICO, ADMINISTRADOR | `id` | - | - | Resultado | - |
| Processos | Operacao | Retomar | POST | `/processos/:id/retomar` | Sim | TECNICO, ADMINISTRADOR | `id` | - | - | Resultado | - |
| Processos | Operacao | Finalizar | POST | `/processos/:id/finalizar` | Sim | TECNICO, ADMINISTRADOR | `id` | - | `FinalizarProcessoDTO` | Resultado | - |
| Processos | Operacao | Interromper | POST | `/processos/:id/interromper` | Sim | TECNICO, ADMINISTRADOR | `id` | - | `InterromperProcessoDTO` | Resultado | - |
| Processos | Operacao | Parada emergencia | POST | `/processos/:id/parada-emergencia` | Sim | Todos | `id` | - | `ParadaEmergenciaProcessoDTO` | Resultado | Permitido ao operador. |
| Alarmes | Alarmes | Listar | GET | `/alarmes` | Sim | Todos | - | `ListAlarmesQueryDto` | - | Lista | - |
| Alarmes | Dashboard | Dashboard | GET | `/alarmes/dashboard` | Sim | Todos | - | `ListAlarmesQueryDto` | - | Dashboard | - |
| Alarmes | Alarmes | Ativos | GET | `/alarmes/ativos` | Sim | Todos | - | `ListAlarmesQueryDto` | - | Lista | - |
| Alarmes | Alarmes | Criticos | GET | `/alarmes/criticos` | Sim | Todos | - | `ListAlarmesQueryDto` | - | Lista | - |
| Alarmes | Processo | Por processo | GET | `/alarmes/processo/:id_processo` | Sim | Todos | `id_processo` | `ListAlarmesQueryDto` | - | Lista | - |
| Alarmes | Processo | Ativos por processo | GET | `/alarmes/processo/:id_processo/ativos` | Sim | Todos | `id_processo` | `ListAlarmesQueryDto` | - | Lista | - |
| Alarmes | Processo | Criticos por processo | GET | `/alarmes/processo/:id_processo/criticos` | Sim | Todos | `id_processo` | `ListAlarmesQueryDto` | - | Lista | - |
| Alarmes | Detalhe alarme | Detalhar | GET | `/alarmes/:id` | Sim | Todos | `id` | - | - | Detalhe | - |
| Alarmes | Detalhe alarme | Resolver | PATCH | `/alarmes/:id/resolver` | Sim | TECNICO, ADMINISTRADOR | `id` | - | `ResolveAlarmeDto` | Resultado | Usuario nao cria alarme manualmente. |
| Leituras/Eventos | Leituras | Listar leituras | GET | `/leituras-eventos/leituras` | Sim | Todos | - | `ListLeiturasQueryDto` | - | Lista | Vacuo. |
| Leituras/Eventos | Dashboard | Dashboard leituras | GET | `/leituras-eventos/leituras/dashboard` | Sim | Todos | - | `ListLeiturasQueryDto` | - | Dashboard | - |
| Leituras/Eventos | Leituras | Detalhar leitura | GET | `/leituras-eventos/leituras/:id` | Sim | Todos | `id` | - | - | Leitura | - |
| Leituras/Eventos | Eventos | Listar eventos | GET | `/leituras-eventos/eventos` | Sim | Todos | - | `ListEventosQueryDto` | - | Lista | - |
| Leituras/Eventos | Eventos | Detalhar evento | GET | `/leituras-eventos/eventos/:id` | Sim | Todos | `id` | - | - | Evento | - |
| Leituras/Eventos | Processo | Leituras processo | GET | `/leituras-eventos/processos/:id_processo/leituras` | Sim | Todos | `id_processo` | `ListLeiturasQueryDto` | - | Lista | - |
| Leituras/Eventos | Processo | Eventos processo | GET | `/leituras-eventos/processos/:id_processo/eventos` | Sim | Todos | `id_processo` | `ListEventosQueryDto` | - | Lista | - |
| Leituras/Eventos | Processo | Timeline | GET | `/leituras-eventos/processos/:id_processo/timeline` | Sim | Todos | `id_processo` | `ProcessoTimelineQueryDto` | - | Timeline | - |
| Leituras/Eventos | Processo | Grafico vacuo | GET | `/leituras-eventos/processos/:id_processo/grafico-vacuo` | Sim | Todos | `id_processo` | `GraficoVacuoQueryDto` | - | Serie | - |
| Leituras/Eventos | Processo | Resumo operacional | GET | `/leituras-eventos/processos/:id_processo/resumo-operacional` | Sim | Todos | `id_processo` | - | - | Resumo | - |
| Leituras/Eventos | Sensor | Leituras vinculo | GET | `/leituras-eventos/processo-tanque-sensor/:id_processo_tanque_sensor/leituras` | Sim | Todos | `id_processo_tanque_sensor` | `ListLeiturasQueryDto` | - | Lista | - |
| Leituras/Eventos | Sensor | Grafico vinculo | GET | `/leituras-eventos/processo-tanque-sensor/:id_processo_tanque_sensor/grafico-vacuo` | Sim | Todos | `id_processo_tanque_sensor` | `GraficoVacuoQueryDto` | - | Serie | - |
| Historico | Historico | Listar processos | GET | `/historico/processos` | Sim | Todos | - | `ListHistoricoProcessosQueryDto` | - | `HistoricoProcessoListResponse` | Historico de processos finalizados/interrompidos/falha. |
| Historico | Historico | Dashboard | GET | `/historico/dashboard` | Sim | Todos | - | `HistoricoDashboardQueryDto` | - | `HistoricoDashboardResponse` | - |
| Historico | Detalhe historico | Detalhar processo | GET | `/historico/processos/:id_processo` | Sim | Todos | `id_processo` | - | - | `HistoricoProcessoDetails` | - |
| Historico | Detalhe historico | Tanques | GET | `/historico/processos/:id_processo/tanques` | Sim | Todos | `id_processo` | - | - | `HistoricoTanqueSummary[]` | - |
| Historico | Detalhe historico | Alarmes | GET | `/historico/processos/:id_processo/alarmes` | Sim | Todos | `id_processo` | `HistoricoProcessoAlarmesQueryDto` | - | `{ data, meta }` | - |
| Historico | Detalhe historico | Eventos | GET | `/historico/processos/:id_processo/eventos` | Sim | Todos | `id_processo` | `HistoricoProcessoEventosQueryDto` | - | `{ data, meta }` | - |
| Historico | Detalhe historico | Relatorios | GET | `/historico/processos/:id_processo/relatorios` | Sim | Todos | `id_processo` | - | - | Metadados | Nao gera relatorio. |
| Historico | Detalhe historico | Grafico vacuo | GET | `/historico/processos/:id_processo/grafico-vacuo` | Sim | Todos | `id_processo` | `HistoricoGraficoVacuoQueryDto` | - | Serie | - |
| Historico | Detalhe historico | Dashboard processo | GET | `/historico/processos/:id_processo/dashboard` | Sim | Todos | `id_processo` | - | - | Dashboard | - |
| Historico | Detalhe historico | Comparativo tanques | GET | `/historico/processos/:id_processo/comparativo-tanques` | Sim | Todos | `id_processo` | - | - | Comparativo | Nao transformar em fluxo operacional. |
| Relatorios | Relatorios | Listar | GET | `/relatorios` | Sim | Todos | - | `ListRelatoriosQueryDto` | - | `RelatorioListResponse` | Operador pode listar. |
| Relatorios | Relatorios | Gerar processo | POST | `/relatorios/processos/:id_processo` | Sim | TECNICO, ADMINISTRADOR | `id_processo` | - | `GenerateProcessReportDto` | `RelatorioGenerationResult` | PDF/XLSX; sem CSV. |
| Relatorios | Relatorios | Gerar alarme | POST | `/relatorios/alarmes/:id_alarme` | Sim | TECNICO, ADMINISTRADOR | `id_alarme` | - | `GenerateAlarmReportDto` | `SingleRelatorioGenerationResult` | PDF apenas. |
| Relatorios | Relatorios | Preview | GET | `/relatorios/:id_relatorio/preview` | Sim | Todos | `id_relatorio` | - | - | Blob PDF | `Content-Disposition: inline`. |
| Relatorios | Relatorios | Download | GET | `/relatorios/:id_relatorio/download` | Sim | TECNICO, ADMINISTRADOR | `id_relatorio` | - | - | Blob PDF/XLSX | `Content-Disposition: attachment`. |
| Relatorios | Relatorios | Detalhar | GET | `/relatorios/:id_relatorio` | Sim | Todos | `id_relatorio` | - | - | `RelatorioResponse` | - |

## Eventos Socket.IO para matriz de consumo

| Namespace | Evento | Tela consumidora prevista | Observacoes |
|---|---|---|---|
| `mqtt-hardware` | `mqtt:connection-status` | Dashboard, hardware/config | Status do broker. |
| `mqtt-hardware` | `mqtt:error` | Dashboard, hardware/config | Feedback tecnico. |
| `mqtt-hardware` | `hardware:state` | Dashboard operacional | Estado geral. |
| `mqtt-hardware` | `sensor:reading` | Processo em execucao, graficos | Leitura de vacuo em tempo real. |
| `mqtt-hardware` | `hardware:status` | Processo/hardware | ESP32, bombas e valvulas. |
| `mqtt-hardware` | `hardware:heartbeat` | Dashboard/hardware | Saude do ESP32. |
| `mqtt-hardware` | `alarm:created` | Alarmes, popups | Novo alarme. |
| `mqtt-hardware` | `sensor-acoplamento:updated` | Processo/hardware | Estado de mangueira. |
| `processos` | `process:created` a `process:status-changed` | Processos/detalhe/dashboard | Lifecycle e metricas. |
| `alarmes` | `alarm:resolved`, `alarm:dashboard-updated`, `alarm:notification` | Alarmes/dashboard/popups | Resolucao e notificacoes. |
