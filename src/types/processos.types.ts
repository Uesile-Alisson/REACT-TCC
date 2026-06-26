import type {
  DateString,
  Id,
  PaginatedResponse,
  QueryParams,
  StatusProcesso,
} from './common.types';

export type CreateProcessoSensorRequest = {
  id_sensor: Id;
  observacoes?: string;
};

export type CreateProcessoTanqueRequest = {
  id_tanque: Id;
  vacuo_alvo?: number;
  sensores: CreateProcessoSensorRequest[];
};

export type CreateProcessoRequest = {
  nome_processo?: string;
  tempo_maximo: number;
  vacuo_alvo?: number;
  tanques: CreateProcessoTanqueRequest[];
};

export type UpdateProcessoConfigRequest = Partial<CreateProcessoRequest>;

export type ListProcessosQuery = QueryParams & {
  status_processo?: StatusProcesso;
  busca?: string;
  data_inicio?: DateString;
  data_fim?: DateString;
  page?: number;
  limit?: number;
};

export type ProcessoResponse = {
  id_processo: Id;
  nome_processo?: string;
  status_processo: StatusProcesso;
  tempo_maximo?: number;
  vacuo_alvo?: number;
  criado_em?: DateString;
  atualizado_em?: DateString;
  iniciado_em?: DateString;
  finalizado_em?: DateString;
  [key: string]: unknown;
};

export type ProcessoListResponse = PaginatedResponse<ProcessoResponse> | ProcessoResponse[];

export type ProcessoDashboardResponse = {
  id_processo: Id;
  status_processo?: StatusProcesso;
  metrics?: Record<string, unknown>;
  dashboard?: Record<string, unknown>;
  [key: string]: unknown;
};

export type FinalizarProcessoRequest = {
  observacao?: string;
};

export type InterromperProcessoRequest = {
  motivo: string;
  observacao?: string;
};

export type ParadaEmergenciaProcessoRequest = {
  motivo: string;
  detalhes?: string;
};

export type ProcessoReadingQuery = QueryParams & {
  data_inicio?: DateString;
  data_fim?: DateString;
  page?: number;
  limit?: number;
};

export type ProcessoReadingResponse = {
  id_leitura_sensor?: Id;
  id_processo?: Id;
  id_tanque?: Id;
  id_sensor?: Id;
  valor_vacuo?: number;
  registrado_em?: DateString;
  [key: string]: unknown;
};

export type ProcessoReadingListResponse =
  | PaginatedResponse<ProcessoReadingResponse>
  | ProcessoReadingResponse[];

export type ProcessoEventResponse = {
  id_evento?: Id;
  id_processo?: Id;
  tipo_evento?: string;
  descricao?: string;
  registrado_em?: DateString;
  [key: string]: unknown;
};

export type ProcessoEventListResponse =
  | PaginatedResponse<ProcessoEventResponse>
  | ProcessoEventResponse[];
