import type { DateString } from './common.types';

export type TipoValvulaHardware = 'PRINCIPAL' | 'AUXILIAR' | 'OUTRA';

export type TanqueHardwareCodigo = `TANQUE_${number}`;

export type ValvulaHardware = {
  id_valvula?: number;
  id?: number;
  codigo_hardware: string;
  id_tanque?: number;
  tanque_codigo_hardware?: TanqueHardwareCodigo | string;
  id_bomba?: number;
  bomba_codigo_hardware?: string;
  tipo?: TipoValvulaHardware;
  aberta?: boolean;
  disponivel?: boolean;
  nome?: string;
  descricao?: string;
};

export type ValvulasAgrupadasTanque = {
  principal?: ValvulaHardware;
  auxiliar?: ValvulaHardware;
};

export type ValvulasPorTanque = Partial<Record<TanqueHardwareCodigo, ValvulasAgrupadasTanque>>;

export type TanqueHardwareComValvulas = {
  tanque: TanqueHardwareCodigo;
  valvulaPrincipal?: ValvulaHardware;
  valvulaAuxiliar?: ValvulaHardware;
};

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
  operacional?: boolean;
  configuracao_aplicada?: boolean;
  status_conexao?: MqttConnectionStatus | string;
  broker_url?: string;
  porta?: number;
  topico_comandos?: string;
  usuario_mqtt_configurado?: boolean;
  senha_mqtt_configurada?: boolean;
  credenciais_configuradas?: boolean;
  credenciais_verificadas?: boolean;
  credenciais_verificadas_em?: DateString | null;
  ultima_falha_credenciais?: string | null;
  ultima_conexao?: DateString | null;
  ultima_sincronizacao?: DateString | null;
  ultima_falha?: string | null;
  ativo?: boolean;
};

export type MqttHardwareStatusResponse = {
  mqtt?: MqttStatusSummary;
  status_conexao?: MqttConnectionStatus | string;
  esp32_online?: boolean;
  comunicacao_pronta_para_processos?: boolean;
  bloqueios_comunicacao_processos?: string[];
  valvulas?: ValvulaHardware[] | Record<string, unknown>;
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
    valvulas?: ValvulaHardware[] | Record<string, unknown>;
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
  usuario_mqtt_configurado?: boolean;
  senha_mqtt_configurada?: boolean;
  credenciais_configuradas?: boolean;
  credenciais_verificadas?: boolean;
  credenciais_verificadas_em?: DateString | null;
  ultima_falha_credenciais?: string | null;
  topico_leituras?: string;
  topico_comandos?: string;
  topico_status?: string;
  topico_alarmes?: string;
  topico_heartbeat?: string;
  topico_acoplamentos?: string;
  topico_configuracoes?: string;
  topico_acks?: string;
  reconexao_automatica?: boolean;
  timeout_comunicacao?: number;
  status_conexao?: MqttConnectionStatus | string;
  ultima_conexao?: DateString | null;
  ultima_sincronizacao?: DateString | null;
  ultima_falha?: string | null;
  ativo?: boolean;
  connected?: boolean;
  configuracao_aplicada?: boolean;
  criado_em?: DateString;
  atualizado_em?: DateString;
  [key: string]: unknown;
};

export type UpdateMqttConfigRequest = {
  broker_url?: string;
  porta?: number;
  topico_leituras?: string;
  topico_comandos?: string;
  topico_status?: string;
  topico_alarmes?: string;
  topico_heartbeat?: string;
  topico_acoplamentos?: string;
  topico_configuracoes?: string;
  topico_acks?: string;
  reconexao_automatica?: boolean;
  timeout_comunicacao?: number;
  ativo?: boolean;
};

export type UpdateMqttCredentialsRequest = {
  usuario_mqtt: string;
  senha_mqtt: string;
};

export type MqttCredentialsUpdateResponse = {
  credenciais_atualizadas: true;
  usuario_mqtt_configurado: boolean;
  senha_mqtt_configurada: boolean;
  credenciais_configuradas: boolean;
  credenciais_verificadas: boolean;
  credenciais_verificadas_em: DateString | null;
  ultima_falha_credenciais: string | null;
  connected: boolean;
  status_conexao: MqttConnectionStatus | string;
  mensagem: string;
  erro_conexao: string | null;
  atualizado_em: DateString;
};

export type MqttCommandRequest = {
  motivo?: string;
  qos?: 0 | 1 | 2;
  correlation_id?: string;
};

export type MqttCommandResponse = {
  message?: string;
  success?: boolean;
  status?: string;
  enviado_em?: DateString;
  executed_at?: DateString;
  error?: string | null;
  command?: Record<string, unknown>;
  connected?: boolean;
  checked_at?: DateString;
  emergency?: Record<string, unknown>;
  [key: string]: unknown;
};
