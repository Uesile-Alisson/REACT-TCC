import type { DateString, Id, PaginatedResponse, QueryParams, SortDirection } from './common.types';
import type { AlarmeResponse } from './alarmes.types';
import type { ProcessoEventResponse } from './processos.types';
import type { RelatorioResponse } from './relatorios.types';

export type ListHistoricoProcessosQuery = QueryParams & {
  page?: number;
  limit?: number;
  busca?: string;
  data_inicio?: DateString;
  data_fim?: DateString;
  status_processo?: string;
  order_by?: string;
  order_direction?: SortDirection;
};

export type HistoricoDashboardQuery = QueryParams & {
  data_inicio?: DateString;
  data_fim?: DateString;
};

export type HistoricoProcessoResponse = {
  id_processo: Id;
  nome_processo?: string;
  status_processo?: string;
  iniciado_em?: DateString;
  finalizado_em?: DateString;
  [key: string]: unknown;
};

export type HistoricoProcessoListResponse =
  | PaginatedResponse<HistoricoProcessoResponse>
  | HistoricoProcessoResponse[];

export type HistoricoDashboardResponse = {
  processos?: Record<string, unknown>;
  alarmes?: Record<string, unknown>;
  relatorios?: Record<string, unknown>;
  [key: string]: unknown;
};

export type HistoricoTanqueSummary = {
  id_tanque?: Id;
  nome_tanque?: string;
  metrics?: Record<string, unknown>;
  [key: string]: unknown;
};

export type HistoricoProcessoAlarmesQuery = QueryParams & {
  page?: number;
  limit?: number;
  severidade?: string;
  status_alarme?: string;
};

export type HistoricoProcessoEventosQuery = QueryParams & {
  page?: number;
  limit?: number;
  tipo_evento?: string;
};

export type HistoricoVacuoChartQuery = QueryParams & {
  data_inicio?: DateString;
  data_fim?: DateString;
  intervalo?: string;
};

export type HistoricoVacuoChartResponse = {
  series?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type HistoricoTanqueComparisonResponse = {
  tanques?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type HistoricoAlarmesResponse = PaginatedResponse<AlarmeResponse> | AlarmeResponse[];

export type HistoricoEventosResponse =
  | PaginatedResponse<ProcessoEventResponse>
  | ProcessoEventResponse[];

export type HistoricoRelatoriosResponse = RelatorioResponse[];
