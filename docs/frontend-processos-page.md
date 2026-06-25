# Tela de Processos - TSEA Frontend

## 1. Resumo da fase

A Fase Front 9 implementou a tela dedicada `/processos`, substituindo o placeholder por uma interface operacional integrada aos services HTTP reais.

A tela concentra processo ativo, listagem, detalhe, criacao/configuracao inicial e acoes operacionais permitidas pelo contrato existente.

## 2. Rota

- Rota: `/processos`.
- Perfis permitidos pela rota visual: `OPERADOR`, `TECNICO`, `ADMINISTRADOR`.
- O backend continua sendo a fonte final de permissao.

## 3. Dados consumidos

| Bloco | Service/Hook | Endpoint/evento | Observacoes |
|---|---|---|---|
| Processo ativo | `getActiveProcesso` | `GET /processos/ativo` | Fonte inicial do painel ativo. |
| Listagem | `listProcessos` | `GET /processos` | Usa `page`, `limit`, `busca` e `status_processo`. |
| Detalhe | `getProcessoById` | `GET /processos/:id` | Carregado ao selecionar linha. |
| Leituras | `getProcessoReadings` | `GET /leituras-eventos/processos/:id/leituras` | Exibe lista simples. |
| Eventos | `getProcessoEvents` | `GET /leituras-eventos/processos/:id/eventos` | Exibe lista simples. |
| Criacao | `createProcesso` | `POST /processos` | Usa DTO real com tanque e sensor informados por ID. |
| Iniciar | `startProcesso` | `POST /processos/:id/iniciar` | HTTP real. |
| Pausar | `pauseProcesso` | `POST /processos/:id/pausar` | HTTP real. |
| Retomar | `resumeProcesso` | `POST /processos/:id/retomar` | HTTP real. |
| Finalizar | `finishProcesso` | `POST /processos/:id/finalizar` | Pede confirmacao. |
| Interromper | `interruptProcesso` | `POST /processos/:id/interromper` | Pede confirmacao. |
| Parada emergencia | `emergencyStopProcesso` | `POST /processos/:id/parada-emergencia` | Pede confirmacao. |
| Realtime leitura | `useSensorReadingsRealtime` | `sensor:reading` | Atualiza ultima leitura. |
| Realtime hardware | `useMqttHardwareRealtime` | status/heartbeat | Exibe MQTT/ESP32. |
| Realtime acoplamento | `useAcoplamentoRealtime` | `sensor-acoplamento:updated` | Exibe acoplamento. |

## 4. Componentes criados

| Componente | Responsabilidade |
|---|---|
| `ActiveProcessPanel` | Painel em destaque do processo ativo ou estado vazio. |
| `ProcessListTable` | Tabela responsiva de processos com paginacao. |
| `ProcessDetailPanel` | Detalhe com leituras e eventos recentes. |
| `ProcessActionsBar` | Botoes operacionais por status/perfil. |
| `ProcessStatusBadge` | Badge textual/colorido para status. |
| `ProcessMetricsCards` | Metricas principais de processo e hardware. |
| `NewProcessModal` | Formulario simples de configuracao inicial. |
| `ConfirmProcessActionModal` | Confirmacao para acoes operacionais. |

## 5. Processo ativo

- Detectado por `GET /processos/ativo`.
- Status considerados ativos: `EM_EXECUCAO` e `PAUSADO`.
- Dados exibidos: nome/id, status, inicio, vacuo alvo, ultima leitura, tanques/sensores quando o payload trouxer, ESP32 e acoplamento.
- Limitacao: detalhes profundos dependem dos campos retornados pela API.

## 6. Criacao/configuracao de processo

Implementada via `createProcesso`.

Campos:

- nome opcional;
- tempo maximo;
- vacuo alvo geral opcional;
- ID do tanque;
- vacuo alvo do tanque opcional;
- ID do sensor;
- observacoes do sensor opcionais.

Validacoes basicas:

- tempo maximo positivo;
- ID de tanque positivo;
- ID de sensor positivo;
- valores de vacuo positivos quando informados.

Limitacao: ainda nao existe endpoint/tela para carregar opcoes de tanques e sensores; por isso os IDs sao informados manualmente.

## 7. Acoes operacionais

| Acao | Service | Status visuais | Confirmacao | Observacoes |
|---|---|---|---|---|
| Iniciar | `startProcesso` | `CONFIGURADO` | Simples | Tecnico/Admin. |
| Pausar | `pauseProcesso` | `EM_EXECUCAO` | Simples | Tecnico/Admin. |
| Retomar | `resumeProcesso` | `PAUSADO` | Simples | Tecnico/Admin. |
| Finalizar | `finishProcesso` | `EM_EXECUCAO`, `PAUSADO` | Sim | Tecnico/Admin. |
| Interromper | `interruptProcesso` | `EM_EXECUCAO`, `PAUSADO` | Sim | Tecnico/Admin. |
| Parada emergencia | `emergencyStopProcesso` | `EM_EXECUCAO`, `PAUSADO` | Sim | Todos os perfis visualmente. |

Nao existe endpoint real de cancelar processo no service atual; acao ficou oculta.

## 8. Listagem e detalhe

- Filtros: busca e status, usando query real.
- Paginacao: `page` e `limit`.
- Detalhe: carregado ao selecionar um processo.
- Metricas: vacuo alvo, ultima leitura, datas, tanques/sensores quando disponiveis.
- Sem grafico complexo e sem biblioteca nova.

## 9. Realtime

Hooks usados:

- `useSensorReadingsRealtime`;
- `useMqttHardwareRealtime`;
- `useAcoplamentoRealtime`.

Fallback:

- a tela funciona por HTTP mesmo sem evento realtime.

Pendencia:

- eventos dedicados de lifecycle do namespace de processos ainda nao foram consumidos nesta tela.

## 10. Estados visuais

- Loading inicial.
- Erro de carregamento.
- Empty state sem processo ativo.
- Empty state sem processos na tabela.
- Loading de detalhe.
- Erro de detalhe.
- Loading de acao.
- Sucesso/erro de acao.

## 11. Permissoes visuais

| Perfil | Acoes visiveis |
|---|---|
| OPERADOR | Visualizar, detalhe e parada emergencia quando houver processo ativo. |
| TECNICO | Criar, iniciar, pausar, retomar, finalizar, interromper e visualizar. |
| ADMINISTRADOR | Criar, iniciar, pausar, retomar, finalizar, interromper e visualizar. |

## 12. O que NAO foi implementado nesta fase

- Fluxo de oleo.
- Fluxo de vazao, nivel ou volume.
- Tela completa de Alarmes.
- Historico completo.
- Relatorios.
- Acao de cancelar processo, porque endpoint nao existe no service atual.
- MQTT direto.
- ESP32 direto.
- CSV.

## 13. Pendencias para Fase Front 10

- Criar tela dedicada de Alarmes.
- Listagem com filtros.
- Detalhe do alarme.
- Resolver alarme.
- Destaque de criticos.
- Popup/tempo real, se a base estiver pronta.
- Avaliar consumo de eventos de lifecycle de processos em fase futura.

## 14. Documentacao ausente no workspace

Os arquivos abaixo foram citados no comando, mas nao existem no workspace atual:

- `docs/frontend-context.md`;
- `docs/frontend-integration-plan.md`.
