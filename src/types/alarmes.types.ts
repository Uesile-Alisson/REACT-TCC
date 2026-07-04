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

export type AlarmStatus = StatusAlarme;

export type AlarmSeverity = SeveridadeAlarme;

export type AlarmResolutionReason =
  | 'NORMALIZADO_CONFIRMADO_PELO_USUARIO'
  | 'FECHAMENTO_POS_PROCESSO'
  | string;

export type AlarmeTipo =
  | 'SENSOR'
  | 'BOMBA'
  | 'MQTT'
  | 'ESP32'
  | 'PROCESSO'
  | 'SEGURANCA'
  | 'SISTEMA'
  | 'TANQUE'
  | 'FLUXO'
  | 'NIVEL'
  | 'VALVULA'
  | 'MANGUEIRA'
  | string;

export type AlarmeOrigem =
  | 'SENSOR'
  | 'ESP32'
  | 'MQTT'
  | 'BACKEND'
  | 'SISTEMA'
  | 'USUARIO'
  | string;

export type ListAlarmesQuery = QueryParams & {
  page?: number;
  limit?: number;
  severidade?: SeveridadeAlarme;
  status_alarme?: StatusAlarme;
  tipo_alarme?: string;
  origem_alarme?: string;
  id_processo?: Id;
  id_processo_tanque?: Id;
  id_processo_tanque_sensor?: Id;
  id_mqtt_mensagem?: Id;
  apenas_ativos?: boolean;
  apenas_criticos?: boolean;
  ocorrido_de?: DateString;
  ocorrido_ate?: DateString;
  busca?: string;
  order_by?: AlarmesOrderBy;
  order_direction?: SortDirection;
};

export type AlarmeProcessoRelacionado = {
  id_processo: Id;
  nome_processo: string | null;
  status_processo: string;
  fase_processo?: string | null;
  vacuo_alvo?: number | null;
  iniciado_em?: DateString | null;
  finalizado_em?: DateString | null;
};

export type AlarmeTanqueRelacionado = {
  id_processo_tanque: Id;
  id_tanque: Id;
  nome_tanque: string | null;
  status_tanque_processo?: string | null;
  vacuo_alvo?: number | null;
};

export type AlarmeSensorRelacionado = {
  id_processo_tanque_sensor: Id;
  id_sensor: Id;
  nome_sensor: string | null;
  modelo_sensor: string | null;
  unidade_medida: string | null;
  status_sensor: string | null;
};

export type AlarmeMqttMensagemRelacionada = {
  id_mqtt_mensagem: Id;
  topico: string;
  direcao: string;
  origem: string;
  criado_em: DateString;
};

export type AlarmeUsuarioResponsavel = {
  id_usuario: Id;
  nome: string;
};

export type AlarmeResponse = {
  id_alarme: Id;
  severidade: SeveridadeAlarme;
  status_alarme: StatusAlarme;
  titulo?: string;
  descricao?: string;
  tipo_alarme?: AlarmeTipo;
  origem_alarme?: AlarmeOrigem;
  mensagem?: string;
  valor_detectado?: number | null;
  unidade?: string | null;
  ocorrido_em?: DateString;
  criado_em?: DateString;
  normalizado_em?: DateString | null;
  resolvido_em?: DateString | null;
  motivo_resolucao?: AlarmResolutionReason | null;
  bloqueante?: boolean;
  requer_intervencao?: boolean;
  recuperacao_automatica?: boolean;
  tentativas_recuperacao?: number;
  ultima_tentativa_recuperacao_em?: DateString | null;
  ultima_validacao_em?: DateString | null;
  reconhecido?: boolean;
  ultimo_reconhecimento_em?: DateString | null;
  excluido_em?: DateString | null;
  id_processo?: Id | null;
  id_processo_tanque?: Id | null;
  id_processo_tanque_sensor?: Id | null;
  id_mqtt_mensagem?: Id | null;
  id_usuario_responsavel?: Id | null;
  processo?: AlarmeProcessoRelacionado | null;
  processo_tanque?: AlarmeTanqueRelacionado | null;
  processo_tanque_sensor?: AlarmeSensorRelacionado | null;
  mqtt_mensagem?: AlarmeMqttMensagemRelacionada | null;
  usuario_responsavel?: AlarmeUsuarioResponsavel | null;
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

export type AcknowledgeAlarmeRequest = {
  observacao?: string;
};

export type AlarmActionType =
  | 'ACKNOWLEDGED'
  | 'NORMALIZED'
  | 'RESOLVED'
  | 'RECOVERY_ATTEMPTED';

export type AlarmActionResponse = {
  success: boolean;
  id_alarme: Id;
  action: AlarmActionType;
  message: string;
  occurred_at: DateString;
};

export type ResolveAlarmeResponse = AlarmActionResponse & {
  status_alarme: 'RESOLVIDO';
  resolvido_em: DateString;
  id_usuario_responsavel: Id;
};

export type AlarmAcknowledgement = AlarmActionResponse & {
  status_alarme: StatusAlarme;
  reconhecido_em: DateString;
  id_usuario: Id;
};

export type AlarmRealtimeEventName =
  | 'alarm:created'
  | 'alarm:updated'
  | 'alarm:acknowledged'
  | 'alarm:normalized'
  | 'alarm:resolved'
  | 'alarm:recovery-attempt'
  | 'alarm:notification';

export type AlarmRealtimeEvent =
  | AlarmeResponse
  | AlarmAcknowledgement
  | ResolveAlarmeResponse
  | {
      id_alarme: Id;
      status_alarme?: StatusAlarme;
      normalizado_em?: DateString;
      attempted_at?: DateString;
      emitted_at?: DateString;
      message?: string;
    };
