# Dashboard TSEA - Frontend

## 1. Resumo da fase

A Fase Front 8 implementou o Dashboard TSEA como tela inicial autenticada dentro do App Shell criado na fase anterior.

O dashboard deixou de ser um placeholder simples e passou a exibir visao geral do sistema com dados vindos de services HTTP reais e atualizacoes incrementais dos hooks realtime ja existentes.

## 2. Regra principal da tela inicial

Com processo ativo:

- exibe resumo geral do sistema;
- exibe card "Processo em andamento";
- exibe status MQTT/ESP32/hardware;
- exibe leitura recente, acoplamento e alarmes;
- nao exibe acoes de iniciar, pausar, retomar, finalizar ou interromper processo.

Sem processo ativo:

- exibe resumo geral do sistema;
- exibe card "Ultimo processo";
- exibe empty state quando historico nao retorna processo recente;
- mantem status MQTT/ESP32/hardware e alarmes recentes.

## 3. Dados consumidos

| Bloco | Service/Hook | Endpoint/evento | Observacoes |
|---|---|---|---|
| Processo ativo | `getActiveProcesso` | `GET /processos/ativo` | Fonte principal para detectar processo em andamento. |
| Ultimo processo | `listHistoricoProcessos` | `GET /historico/processos` | Usa `limit=1`, `order_by=finalizado_em`, `order_direction=desc`. |
| Alarmes resumo | `getAlarmesDashboard` | `GET /alarmes/dashboard` | Exibe totais, ativos e criticos quando disponiveis. |
| Alarmes recentes | `listAlarmes` | `GET /alarmes` | Usa `limit=5`, ordenando por `criado_em desc`. |
| Historico resumo | `getHistoricoDashboard` | `GET /historico/dashboard` | Exibe apenas disponibilidade de indicadores. |
| MQTT/Hardware | `getMqttHardwareStatus` | `GET /mqtt-hardware/status` | Fonte HTTP inicial. |
| Relatorios | `listRelatorios` | `GET /relatorios` | Apenas contagem simples; sem preview/download. |
| Realtime MQTT | `useMqttHardwareRealtime` | `mqtt:connection-status`, `hardware:status`, `hardware:heartbeat` | Atualiza comunicacao e ESP32. |
| Realtime leitura | `useSensorReadingsRealtime` | `sensor:reading` | Atualiza ultima leitura de vacuo. |
| Realtime alarmes | `useAlarmesRealtime` | `alarm:created` | Coloca ultimo alarme no painel. |
| Realtime acoplamento | `useAcoplamentoRealtime` | `sensor-acoplamento:updated` | Exibe ultimo estado de acoplamento. |

## 4. Componentes criados

| Componente | Responsabilidade |
|---|---|
| `SystemOverviewCards` | Resumo rapido: processo, alarmes, comunicacao e relatorios. |
| `ActiveProcessCard` | Exibe processo ativo sem acoes operacionais. |
| `LastProcessCard` | Exibe ultimo processo ou empty state. |
| `SystemStatusPanel` | Exibe MQTT, ESP32, ultima leitura, heartbeat e acoplamento. |
| `RecentAlarmsPanel` | Exibe resumo e lista de alarmes recentes. |
| `StatusBadge` | Badge visual reutilizavel por texto e tom. |

## 5. Processo ativo

Detectado por `GET /processos/ativo` via `getActiveProcesso`.

Status considerados ativos pelo contrato real:

- `EM_EXECUCAO`;
- `PAUSADO`.

O dashboard respeita o retorno da API. Se a API retornar um processo, ele e exibido como processo em andamento com nome/id, status, inicio, vacuo alvo, vacuo atual quando houver evento e quantidade de tanques quando o payload trouxer a lista.

Limitacao: detalhes profundos do processo e acoes operacionais ficam para a Fase Front 9.

## 6. Ultimo processo

Origem: `GET /historico/processos` via `listHistoricoProcessos`.

Consulta usada:

- `limit=1`;
- `order_by=finalizado_em`;
- `order_direction=desc`.

Se nao houver retorno, o dashboard mostra "Nenhum processo recente encontrado".

Limitacao: a ordenacao final depende do backend respeitar os parametros enviados.

## 7. Status geral do sistema

O card de comunicacao exibe:

- MQTT por HTTP e por realtime quando houver evento;
- ESP32 por HTTP e por realtime quando houver evento;
- heartbeat mais recente;
- ultima leitura de vacuo por realtime;
- ultimo acoplamento por realtime.

Nao ha conexao MQTT direta no frontend.

## 8. Alarmes recentes

Origem:

- resumo por `GET /alarmes/dashboard`;
- lista por `GET /alarmes`;
- ultimo alarme em tempo real por `alarm:created`.

O painel destaca criticidade por texto e cor, sem depender apenas da cor.

Limitacao: nao foi criada tela completa de Alarmes nem acao de resolver alarme.

## 9. Tempo real

Hooks usados:

- `useMqttHardwareRealtime`;
- `useSensorReadingsRealtime`;
- `useAlarmesRealtime`;
- `useAcoplamentoRealtime`.

Fallback:

- HTTP continua sendo a fonte inicial.
- Se realtime estiver offline, o dashboard permanece funcional com dados HTTP.

Pendencias:

- eventos dos namespaces dedicados de Processos e Alarmes ainda nao foram ligados a telas dedicadas.

## 10. Estados visuais

- Loading global inicial por skeleton simples.
- Error global se todas as chamadas principais falharem.
- Partial error por bloco quando endpoint especifico falha.
- Empty state para ultimo processo ausente.
- Empty state para alarmes recentes ausentes.

## 11. O que NAO foi implementado nesta fase

- Acoes operacionais de processo.
- Tela completa de Processos.
- Tela completa de Alarmes.
- Tela completa de Historico.
- Tela completa de Relatorios.
- Graficos avancados.
- Configuracoes.
- CSV.
- Fluxos de oleo, vazao, nivel ou volume.
- Download ou preview de relatorio no dashboard.
- Endpoint novo.
- Backend novo.

## 12. Pendencias para Fase Front 9

- Criar tela dedicada de Processos.
- Exibir processo ativo com acoes operacionais permitidas.
- Criar fluxo de iniciar novo processo.
- Criar fluxo de pausar, retomar, finalizar e interromper.
- Criar detalhe completo de processo.
- Aplicar validacoes visuais basicas.
- Integrar erros da API nas acoes operacionais.
- Testar com API real ligada.

## 13. Documentacao ausente no workspace

Os arquivos abaixo foram citados no comando, mas nao existem no workspace atual:

- `docs/frontend-context.md`;
- `docs/frontend-integration-plan.md`.

A implementacao foi baseada nos documentos existentes e no codigo real.
