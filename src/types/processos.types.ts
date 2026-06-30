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

export type ProcessoPrecheckStatus =
  | 'APROVADO'
  | 'REPROVADO'
  | 'PENDENTE'
  | 'FALHA'
  | 'NAO_SUPORTADO'
  | 'NAO_CONFIRMADO'
  | 'IGNORADO';

export type ProcessoPrecheckGrupo =
  | 'USUARIO'
  | 'PROCESSO'
  | 'TANQUES'
  | 'ACOPLAMENTO'
  | 'SENSORES'
  | 'VALVULAS'
  | 'BOMBAS'
  | 'MQTT'
  | 'ESP32'
  | 'SOCKET'
  | 'LOGS';

export type ProcessoPrecheckItem = {
  codigo?: string;
  titulo: string;
  grupo: ProcessoPrecheckGrupo;
  status: ProcessoPrecheckStatus;
  obrigatorio?: boolean;
  bloqueante?: boolean;
  mensagem?: string;
  evidencia?: string;
  detalhes?: Record<string, unknown> | string | null;
  id_recurso?: Id | string | null;
  tipo_recurso?: string | null;
  timestamp?: DateString | null;
};

export type ProcessoPrecheckFalha = {
  codigo?: string;
  titulo?: string;
  mensagem: string;
  grupo?: ProcessoPrecheckGrupo;
  id_recurso?: Id | string | null;
  bloqueante?: boolean;
};

export type ProcessoPrecheckAviso = {
  codigo?: string;
  titulo?: string;
  mensagem: string;
  grupo?: ProcessoPrecheckGrupo;
};

export type ProcessoPrecheckRecomendacao = {
  codigo?: string;
  titulo?: string;
  mensagem: string;
  grupo?: ProcessoPrecheckGrupo;
};

export type ProcessoPrecheckResponse = {
  id_processo: Id;
  status_geral: ProcessoPrecheckStatus;
  aprovado: boolean;
  bloqueado: boolean;
  executado_em?: DateString | null;
  validade_segundos?: number | null;
  grupos?: ProcessoPrecheckGrupo[];
  itens: ProcessoPrecheckItem[];
  falhas_bloqueantes?: ProcessoPrecheckFalha[];
  avisos?: ProcessoPrecheckAviso[];
  recomendacoes?: ProcessoPrecheckRecomendacao[];
};

export type ProcessoValvulaResumo = {
  id_valvula: Id;
  nome?: string;
  id_tanque?: Id | null;
  tanque?: unknown;
  id_bomba?: Id | null;
  bomba?: unknown;
  status_atual?: string | null;
  ultimo_acionamento?: DateString | null;
  pode_validar?: boolean;
  pode_abrir_fechar?: boolean;
  [key: string]: unknown;
};

export type ProcessoValvulaAcaoResponse = ProcessoPrecheckItem | {
  id_processo?: Id;
  id_valvula?: Id;
  status?: ProcessoPrecheckStatus;
  mensagem?: string;
  evidencia?: string;
  executado_em?: DateString;
  [key: string]: unknown;
};
