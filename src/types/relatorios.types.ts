import type {
  DateString,
  FormatoRelatorio,
  Id,
  PaginatedResponse,
  QueryParams,
  TipoRelatorio,
} from './common.types';

export type ListRelatoriosQuery = QueryParams & {
  page?: number;
  limit?: number;
  id_processo?: Id;
  id_alarme?: Id;
  tipo_relatorio?: TipoRelatorio;
  formato_relatorio?: FormatoRelatorio;
  data_inicio?: DateString;
  data_fim?: DateString;
};

export type GenerateProcessReportRequest = {
  formatos?: FormatoRelatorio[];
  observacao?: string;
};

export type GenerateAlarmReportRequest = {
  formato?: Extract<FormatoRelatorio, 'PDF'>;
  observacao?: string;
};

export type RelatorioResponse = {
  id_relatorio: Id;
  tipo_relatorio: TipoRelatorio;
  formato_relatorio: FormatoRelatorio;
  tipo?: TipoRelatorio;
  formato?: FormatoRelatorio;
  nome_arquivo?: string;
  content_type?: string;
  criado_em?: DateString;
  gerado_em?: DateString;
  preview_disponivel?: boolean;
  download_disponivel?: boolean;
  [key: string]: unknown;
};

export type RelatorioListResponse = PaginatedResponse<RelatorioResponse> | RelatorioResponse[];

export type RelatorioGenerationResult = RelatorioResponse | RelatorioResponse[];

export type SingleRelatorioGenerationResult = RelatorioResponse;
