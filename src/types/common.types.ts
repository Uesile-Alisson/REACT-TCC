export type Id = number;

export type DateString = string;

export type NivelAcesso = 'OPERADOR' | 'TECNICO' | 'ADMINISTRADOR';

export type SortDirection = 'asc' | 'desc' | 'ASC' | 'DESC';

export type QueryParamPrimitive = string | number | boolean | Date;

export type QueryParamValue = QueryParamPrimitive | QueryParamPrimitive[] | null | undefined;

export type QueryParams = Record<string, QueryParamValue>;

export type ApiValidationError = {
  field?: string;
  message: string;
};

export type ApiErrorPayload = {
  message?: string | string[];
  statusCode?: number;
  error?: string;
  errors?: ApiValidationError[];
  code?: string;
  bloqueios_operacionais?: string[];
  id_processo?: number;
  status_processo?: string;
  status_partida?: string;
  status_encerramento_geral?: string;
  operacao?: string;
  etapa?: string;
  estagio?: string;
  expected_version?: number;
  current_version?: number;
  versao_esperada?: number;
  versao_atual?: number;
  expected_subsystem_version?: number;
  current_subsystem_version?: number;
  expected_tank_version?: number;
  current_tank_version?: number;
};

export type ApiMessageResponse = {
  message: string;
  resetToken?: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  total_pages?: number;
};

export type PaginatedResponse<TItem> = {
  data: TItem[];
  meta: PaginationMeta;
};

export type ApiFileResponse = {
  blob: Blob;
  filename?: string;
  contentType?: string;
  contentDisposition?: string;
  contentLength?: number;
};

export type StatusProcesso =
  | 'CONFIGURADO'
  | 'EM_EXECUCAO'
  | 'PAUSADO'
  | 'CONCLUIDO'
  | 'INTERROMPIDO'
  | 'FALHA';

export type SeveridadeAlarme = 'INFO' | 'MEDIO' | 'CRITICO';

export type StatusAlarme = 'ATIVO' | 'NORMALIZADO' | 'RESOLVIDO';

export type FormatoRelatorio = 'PDF' | 'XLSX';

export type TipoRelatorio = 'PROCESSO' | 'ALARME';
