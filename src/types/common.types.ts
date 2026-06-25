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

export type StatusAlarme = 'ATIVO' | 'RESOLVIDO';

export type FormatoRelatorio = 'PDF' | 'XLSX';

export type TipoRelatorio = 'PROCESSO' | 'ALARME';
