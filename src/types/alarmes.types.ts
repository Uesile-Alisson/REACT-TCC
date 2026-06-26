import type {
  DateString,
  Id,
  PaginatedResponse,
  QueryParams,
  SeveridadeAlarme,
  SortDirection,
  StatusAlarme,
} from './common.types';

export type AlarmesOrderBy = 'ocorrido_em' | 'severidade' | 'status_alarme' | 'tipo_alarme';

export type ListAlarmesQuery = QueryParams & {
  page?: number;
  limit?: number;
  severidade?: SeveridadeAlarme;
  status_alarme?: StatusAlarme;
  tipo_alarme?: string;
  origem_alarme?: string;
  id_processo?: Id;
  id_tanque?: Id;
  id_sensor?: Id;
  apenas_ativos?: boolean;
  apenas_criticos?: boolean;
  data_inicio?: DateString;
  data_fim?: DateString;
  busca?: string;
  order_by?: AlarmesOrderBy;
  order_direction?: SortDirection;
};

export type AlarmeResponse = {
  id_alarme: Id;
  severidade: SeveridadeAlarme;
  status_alarme: StatusAlarme;
  tipo_alarme?: string;
  origem_alarme?: string;
  mensagem?: string;
  criado_em?: DateString;
  resolvido_em?: DateString;
  [key: string]: unknown;
};

export type AlarmeListResponse = PaginatedResponse<AlarmeResponse> | AlarmeResponse[];

export type AlarmeDashboardResponse = {
  total?: number;
  ativos?: number;
  criticos?: number;
  por_severidade?: Record<string, number>;
  [key: string]: unknown;
};

export type ResolveAlarmeRequest = {
  observacao?: string;
};
