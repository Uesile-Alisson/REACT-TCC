import type { DateString } from './common.types';

export type MqttConnectionStatus =
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'ERROR'
  | 'CONECTADO'
  | 'DESCONECTADO'
  | 'RECONECTANDO'
  | 'FALHA';

export type MqttStatusSummary = {
  connected?: boolean;
  status_conexao?: MqttConnectionStatus | string;
  broker_url?: string;
  porta?: number;
  topico_comandos?: string;
  ultima_conexao?: DateString | null;
  ultima_sincronizacao?: DateString | null;
  ultima_falha?: string | null;
  ativo?: boolean;
};

export type MqttHardwareStatusResponse = {
  mqtt?: MqttStatusSummary;
  status_conexao?: MqttConnectionStatus | string;
  esp32_online?: boolean;
  hardware?: {
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
  consultado_em?: DateString;
  enviado_em?: DateString;
  [key: string]: unknown;
};

export type MqttHardwareConfigResponse = {
  id_mqtt_configuracao?: number;
  id_usuario_alteracao?: number | null;
  broker_url?: string;
  porta?: number;
  usuario_mqtt?: string | null;
  topico_leituras?: string;
  topico_comandos?: string;
  topico_status?: string;
  topico_alarmes?: string;
  topico_heartbeat?: string;
  topico_acoplamentos?: string;
  reconexao_automatica?: boolean;
  timeout_comunicacao?: number;
  status_conexao?: MqttConnectionStatus | string;
  ultima_conexao?: DateString | null;
  ultima_sincronizacao?: DateString | null;
  ultima_falha?: string | null;
  ativo?: boolean;
  criado_em?: DateString;
  atualizado_em?: DateString;
  [key: string]: unknown;
};

export type UpdateMqttConfigRequest = {
  broker_url?: string;
  porta?: number;
  usuario_mqtt?: string;
  senha_mqtt?: string;
  topico_leituras?: string;
  topico_comandos?: string;
  topico_status?: string;
  topico_alarmes?: string;
  topico_heartbeat?: string;
  topico_acoplamentos?: string;
  reconexao_automatica?: boolean;
  timeout_comunicacao?: number;
  ativo?: boolean;
};

export type MqttCommandRequest = {
  motivo?: string;
  qos?: number;
};

export type MqttCommandResponse = {
  message?: string;
  success?: boolean;
  status?: string;
  enviado_em?: DateString;
  executed_at?: DateString;
  error?: string | null;
  command?: Record<string, unknown>;
  [key: string]: unknown;
};
