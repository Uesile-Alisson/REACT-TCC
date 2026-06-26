# Tela de Historico - TSEA Frontend

## 1. Resumo da fase

A Fase Front 11 implementou a tela dedicada `/historico`, substituindo o placeholder por uma interface funcional para consulta de processos encerrados.

A tela usa HTTP como fonte principal, conforme escopo, e nao cria operacoes de processo ativo.

## 2. Rota

- Rota: `/historico`.
- Perfis permitidos pela rota visual: `OPERADOR`, `TECNICO`, `ADMINISTRADOR`.
- O backend continua sendo a fonte final de permissao.

## 3. Dados consumidos

| Bloco | Service/Hook | Endpoint/evento | Observacoes |
|---|---|---|---|
| Listagem | `listHistoricoProcessos` | `GET /historico/processos` | Usa filtros e paginacao reais. |
| Resumo | `getHistoricoDashboard` | `GET /historico/dashboard` | Exibe disponibilidade e fallback pela lista local. |
| Detalhe | `getHistoricoProcessoById` | `GET /historico/processos/:id` | Carregado por selecao. |
| Tanques | `listHistoricoTanques` | `GET /historico/processos/:id/tanques` | Lista vinculada ao processo. |
| Alarmes | `listHistoricoAlarmes` | `GET /historico/processos/:id/alarmes` | Apenas consulta; nao resolve alarmes. |
| Eventos | `listHistoricoEventos` | `GET /historico/processos/:id/eventos` | Exibe eventos resumidos. |
| Relatorios vinculados | `listHistoricoRelatorios` | `GET /historico/processos/:id/relatorios` | Apenas contagem. |
| Geracao de relatorio | `generateProcessReport` | `POST /relatorios/processos/:id` | Gera PDF, sem preview/download nesta tela. |

## 4. Componentes criados

| Componente | Responsabilidade |
|---|---|
| `HistoricoFilters` | Filtros por busca, status, periodo e falha. |
| `HistoricoListTable` | Tabela historica com paginacao e acoes permitidas. |
| `HistoricoDetailPanel` | Detalhe do processo historico. |
| `HistoricoStatusBadge` | Badge visual de status final. |
| `HistoricoMetricsCards` | Cards de resumo historico. |
| `HistoricoAlarmesPanel` | Lista resumida de alarmes relacionados. |
| `HistoricoEventosPanel` | Lista resumida de eventos/logs relacionados. |
| `GerarRelatorioHistoricoModal` | Confirmacao de geracao de relatorio por processo. |

## 5. Listagem historica

Campos exibidos:

- id/nome;
- status final;
- inicio;
- fim;
- vacuo final;
- eficiencia;
- acoes de detalhe e relatorio.

Status historicos usados no filtro:

- `CONCLUIDO`;
- `INTERROMPIDO`;
- `FALHA`.

Paginacao:

- `page`;
- `limit`.

Limitacao: se a API retornar `EM_EXECUCAO`, a tela exibe com badge informativo, mas esse status nao e tratado como historico encerrado no filtro rapido.

## 6. Filtros

Filtros via API:

- status;
- periodo inicial/final;
- busca;
- apenas falha.

Filtro por usuario/responsavel e tanque nao foi implementado porque o contrato atual da query nao documenta esses parametros.

## 7. Detalhe historico

Dados exibidos:

- dados gerais;
- status final;
- inicio/fim;
- responsavel quando retornado;
- vacuo alvo;
- vacuo inicial/final/medio;
- eficiencia;
- tanques;
- alarmes relacionados;
- eventos/logs relacionados;
- quantidade de relatorios vinculados.

Nao ha edicao de historico nem exibicao de payload bruto.

## 8. Metricas finais

Origem:

- campos retornados pelo backend em `HistoricoProcessoResponse`;
- tanques retornados por `listHistoricoTanques`;
- contagens derivadas da lista atual para cards simples.

Metricas oficiais devem vir do backend. O frontend apenas exibe ou conta itens carregados localmente.

## 9. Geracao de relatorio pelo historico

Implementada porque existe service real `generateProcessReport`.

- Formato solicitado: `PDF`.
- Permissoes visuais: `TECNICO` e `ADMINISTRADOR`.
- `OPERADOR` nao ve a acao.
- Apos sucesso, a tela orienta o usuario a abrir `/relatorios`.
- Preview e download nao foram implementados aqui.

## 10. Exclusao do historico

Nao implementada.

Motivo:

- nao existe endpoint/service real de delete/excluir historico no contrato atual.
- nenhum botao de excluir foi exibido.

## 11. Estados visuais

- Loading inicial.
- Erro global de listagem/resumo.
- Erros parciais de detalhe, tanques, alarmes, eventos e relatorios.
- Empty state sem historico.
- Loading de detalhe.
- Loading de geracao de relatorio.
- Sucesso/erro de geracao de relatorio.

## 12. Permissoes visuais

| Perfil | Acoes visiveis |
|---|---|
| OPERADOR | Listar e visualizar detalhes. |
| TECNICO | Listar, visualizar detalhes e gerar relatorio. |
| ADMINISTRADOR | Listar, visualizar detalhes e gerar relatorio. |

Exclusao ficou oculta para todos por ausencia de contrato HTTP dedicado.

## 13. O que NAO foi implementado nesta fase

- Iniciar processo.
- Parar processo.
- Cancelar processo.
- Finalizar processo.
- Resolver alarme.
- Preview/download de relatorio.
- CSV.
- Fluxos de oleo, vazao, nivel ou volume.
- Edicao de historico.
- Exclusao de historico.

## 14. Pendencias para Fase Front 12

- Criar tela dedicada de Relatorios.
- Listagem completa.
- Filtros.
- Geracao de relatorio de processo/alarme.
- Preview PDF/XLSX na pagina de Relatorios.
- Download PDF/XLSX.
- Permissoes por perfil.
- Remover qualquer acao indevida como CSV, regenerar, editar ou excluir.

## 15. Documentacao ausente no workspace

Os arquivos abaixo foram citados no comando, mas nao existem no workspace atual:

- `docs/frontend-context.md`;
- `docs/frontend-integration-plan.md`.
