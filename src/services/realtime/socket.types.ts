import type {
  DateString,
  Id,
  SeveridadeAlarme,
  StatusAlarme,
  StatusProcesso,
  ValvulaHardware,
} from '../../types';
import type { ProcessoPrecheckResponse } from '../../types/processos.types';

export type RealtimeConnectionState = {
  isConnected: boolean;
  isConnecting: boolean;
  lastError: string | null;
};

export type RealtimeNamespace = 'mqtt-hardware' | 'processos' | 'alarmes';

export type RealtimeListener<TPayload> = (payload: TPayload) => void;

export type SocketConnectedPayload = {
  message?: string;
  socketId?: string;
  conectado_em?: DateString;
};

export type MqttConnectionStatusPayload = {
  status_conexao?: string;
  error?: string | null;
  enviado_em?: DateString;
};

export type MqttErrorPayload = {
  error?: string;
  enviado_em?: DateString;
};

export type HardwareStatePayload = {
  mqttConnected?: boolean;
  esp32Online?: boolean;
  lastHeartbeatAt?: DateString | null;
  lastStatusAt?: DateString | null;
  lastReadingAt?: DateString | null;
  currentStatus?: string | null;
  lastError?: string | null;
  updatedAt?: DateString;
  enviado_em?: DateString;
  [key: string]: unknown;
};

export type SensorReadingPayload = {
  id_leitura_sensor?: Id;
  id_processo?: Id;
  id_tanque?: Id;
  id_sensor?: Id;
  valor_vacuo?: number;
  registrado_em?: DateString;
  enviado_em?: DateString;
  [key: string]: unknown;
};

export type HardwareStatusPayload = {
  esp32_online?: boolean;
  bombas?: Record<string, unknown>;
  valvulas?: Record<string, unknown> | ValvulaHardware[];
  processo?: Record<string, unknown>;
  status?: string;
  mensagem?: string;
  enviado_em?: DateString;
};

export type HeartbeatPayload = {
  esp32_online?: boolean;
  uptime?: number;
  uptime_ms?: number | null;
  firmware?: string;
  firmware_version?: string | null;
  id_processo?: Id;
  enviado_em?: DateString;
  heartbeat_at?: DateString | null;
  lastHeartbeatAt?: DateString | null;
  [key: string]: unknown;
};

export type AlarmCreatedPayload = {
  id_alarme?: Id;
  id_processo?: Id;
  id_processo_tanque?: Id;
  id_processo_tanque_sensor?: Id;
  id_mqtt_mensagem?: Id;
  titulo?: string;
  title?: string;
  descricao?: string;
  description?: string;
  severidade?: SeveridadeAlarme;
  status_alarme?: StatusAlarme;
  tipo_alarme?: string;
  origem_alarme?: string;
  mensagem?: string;
  valor_detectado?: number | null;
  unidade?: string | null;
  normalizado_em?: DateString | null;
  resolvido_em?: DateString | null;
  bloqueante?: boolean;
  requer_intervencao?: boolean;
  recuperacao_automatica?: boolean;
  tentativas_recuperacao?: number;
  reconhecido?: boolean;
  ultimo_reconhecimento_em?: DateString | null;
  ocorrido_em?: DateString;
  enviado_em?: DateString;
  criado_em?: DateString;
  created_at?: DateString;
  [key: string]: unknown;
};

export type AlarmUpdatedPayload = {
  id_alarme: Id;
  status_alarme?: StatusAlarme;
  emitted_at?: DateString;
  message?: string;
  [key: string]: unknown;
};

export type AlarmAcknowledgedPayload = {
  success?: boolean;
  id_alarme: Id;
  action?: 'ACKNOWLEDGED';
  message?: string;
  occurred_at?: DateString;
  status_alarme?: StatusAlarme;
  reconhecido_em?: DateString;
  id_usuario?: Id;
  [key: string]: unknown;
};

export type AlarmNormalizedPayload = {
  id_alarme: Id;
  status_alarme?: 'NORMALIZADO';
  normalizado_em?: DateString;
  emitted_at?: DateString;
  [key: string]: unknown;
};

export type AlarmResolvedPayload = {
  success?: boolean;
  id_alarme: Id;
  action?: 'RESOLVED';
  message?: string;
  occurred_at?: DateString;
  status_alarme?: 'RESOLVIDO';
  resolvido_em?: DateString;
  id_usuario_responsavel?: Id;
  [key: string]: unknown;
};

export type AlarmRecoveryAttemptPayload = {
  id_alarme: Id;
  attempted_at?: DateString;
  emitted_at?: DateString;
  [key: string]: unknown;
};

export type SensorAcoplamentoPayload = {
  id_sensor?: Id;
  id_tanque?: Id;
  id_processo?: Id;
  status_acoplamento?: string;
  enviado_em?: DateString;
  [key: string]: unknown;
};

export type ProcessLifecyclePayload = {
  id_processo?: Id;
  status_processo?: StatusProcesso;
  message?: string;
  motivo?: string;
  emitted_at?: DateString;
  metrics?: Record<string, unknown>;
  dashboard?: Record<string, unknown>;
};

export type ProcessPrecheckResultPayload = ProcessoPrecheckResponse;

export type AlarmRealtimePayload = {
  id_alarme?: Id;
  id_processo?: Id;
  severidade?: SeveridadeAlarme;
  status_alarme?: StatusAlarme;
  message?: string;
  emitted_at?: DateString;
  dashboard?: Record<string, unknown>;
  notification?: Record<string, unknown>;
};
