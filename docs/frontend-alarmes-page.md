# Tela de Alarmes - TSEA Frontend

## 1. Resumo da fase

A Fase Front 10 implementou a tela dedicada `/alarmes`, substituindo o placeholder por uma interface funcional para listagem, filtros, detalhe e resolucao de alarmes.

A tela usa services HTTP reais e consome o hook realtime existente para exibir aviso simples de novo alarme recebido.

## 2. Rota

- Rota: `/alarmes`.
- Perfis permitidos pela rota visual: `OPERADOR`, `TECNICO`, `ADMINISTRADOR`.
- O backend continua sendo a fonte final de permissao.

## 3. Dados consumidos

| Bloco | Service/Hook | Endpoint/evento | Observacoes |
|---|---|---|---|
| Listagem | `listAlarmes` | `GET /alarmes` | Usa filtros e paginacao reais. |
| Resumo | `getAlarmesDashboard` | `GET /alarmes/dashboard` | Se falhar, cards usam a lista atual como fallback parcial. |
| Detalhe | `getAlarmeById` | `GET /alarmes/:id` | Carregado ao selecionar alarme. |
| Resolver | `resolveAlarme` | `PATCH /alarmes/:id/resolver` | Envia `observacao` opcional. |
| Realtime | `useAlarmesRealtime` | `alarm:created` | Exibe toast simples de novo alarme. |

## 4. Componentes criados

| Componente | Responsabilidade |
|---|---|
| `AlarmeListTable` | Tabela de alarmes, acoes e paginacao. |
| `AlarmeFilters` | Filtros por busca, severidade, status, processo, periodo e criticos. |
| `AlarmeDetailPanel` | Painel de detalhe do alarme selecionado. |
| `AlarmeSeverityBadge` | Badge textual/colorido de severidade. |
| `AlarmeStatusBadge` | Badge textual/colorido de status. |
| `AlarmeSummaryCards` | Cards de total, ativos, criticos, medios/info e resolvidos. |
| `ResolverAlarmeModal` | Confirmacao e observacao para resolver alarme. |
| `AlarmeRealtimeToast` | Aviso simples para alarme recebido via realtime. |

## 5. Severidades e status

Enums usados:

- Severidade: `INFO`, `MEDIO`, `CRITICO`.
- Status: `ATIVO`, `RESOLVIDO`.

Mapeamento visual:

- `CRITICO`: vermelho e texto "Critico".
- `MEDIO`: amarelo/laranja e texto "Medio".
- `INFO`: azul e texto "Info".
- `ATIVO`: vermelho e texto "Ativo".
- `RESOLVIDO`: verde e texto "Resolvido".

Alarmes criticos ativos tambem recebem destaque na linha da tabela.

## 6. Filtros

Filtros implementados via query real:

- severidade;
- status;
- processo relacionado por ID;
- periodo inicial/final;
- busca textual;
- apenas criticos.

O filtro "Apenas criticos" envia `apenas_criticos` e tambem fixa severidade visualmente para evitar conflito na UI.

## 7. Listagem e detalhe

Listagem exibe:

- tipo/mensagem;
- severidade;
- status;
- origem;
- processo relacionado quando retornado;
- data de criacao;
- acoes de detalhe e resolver.

Detalhe exibe:

- id;
- severidade;
- status;
- mensagem;
- origem;
- processo;
- tanque;
- sensor;
- datas;
- responsavel quando retornado.

Nao exibe payload bruto ou stack trace.

## 8. Resolver alarme

Implementado via `resolveAlarme`.

- Pede confirmacao em modal.
- Envia payload `{ observacao?: string }`.
- Mostra loading durante a acao.
- Mostra erro amigavel em falha.
- Mostra sucesso quando a API confirma.
- Atualiza listagem/resumo/detalhe apos sucesso.

O botao so aparece para `TECNICO` e `ADMINISTRADOR` quando o alarme esta `ATIVO`, conforme matriz documentada. Se o backend permitir regra diferente, ele continua sendo a fonte final.

## 9. Realtime

Hook usado:

- `useAlarmesRealtime`.

Evento consumido:

- `alarm:created`.

Comportamento:

- exibe toast simples de novo alarme;
- permite fechar visualmente o aviso;
- nao marca como resolvido;
- nao chama API;
- nao remove da listagem.

Fallback:

- a tela permanece funcional via HTTP e botao Atualizar.

Pendencia:

- popup avancado persistente para criticos fica para fase futura.

## 10. Estados visuais

- Loading inicial.
- Erro global de carregamento.
- Erro parcial de resumo.
- Empty state de lista.
- Loading de detalhe.
- Erro de detalhe.
- Loading de resolver.
- Sucesso de resolver.
- Erro de resolver.

## 11. Permissoes visuais

| Perfil | Acoes visiveis |
|---|---|
| OPERADOR | Listar, filtrar e visualizar detalhe. |
| TECNICO | Listar, filtrar, visualizar detalhe e resolver alarmes ativos. |
| ADMINISTRADOR | Listar, filtrar, visualizar detalhe e resolver alarmes ativos. |

## 12. O que NAO foi implementado nesta fase

- Criar alarme manual.
- Editar alarme.
- Excluir alarme.
- Alterar severidade.
- Reabrir alarme.
- Silenciar alarme.
- Relatorio de alarme.
- CSV.
- Popup avancado de criticidade.
- Evento wildcard `alarm:*`.

## 13. Pendencias para Fase Front 11

- Criar tela dedicada de Historico.
- Listagem historica.
- Filtros historicos.
- Detalhe de processo historico.
- Metricas finais.
- Alarmes relacionados.
- Atalhos para relatorio, se permitido.

## 14. Documentacao ausente no workspace

Os arquivos abaixo foram citados no comando, mas nao existem no workspace atual:

- `docs/frontend-context.md`;
- `docs/frontend-integration-plan.md`.
