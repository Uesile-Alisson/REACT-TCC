import type {
  MqttHardwareConfigResponse,
  UpdateMqttConfigRequest,
  UpdateMqttCredentialsRequest,
} from './mqtt-hardware.types';

export type MqttConfigFormState = {
  broker_url: string;
  porta: string;
  usuario_mqtt: string;
  senha_mqtt: string;
  topico_leituras: string;
  topico_comandos: string;
  topico_status: string;
  topico_alarmes: string;
  topico_heartbeat: string;
  topico_acoplamentos: string;
  topico_configuracoes: string;
  topico_acks: string;
  reconexao_automatica: boolean;
  timeout_comunicacao: string;
  ativo: boolean;
};

export type MqttConfigFormErrors = Partial<Record<keyof MqttConfigFormState, string>>;

export type MqttHardwarePermissions = {
  canViewMqttHardwareConfig: boolean;
  canEditMqttHardwareConfig: boolean;
  canRestartCommunication: boolean;
  canSyncHardware: boolean;
  canTestConnection: boolean;
  canReconnect: boolean;
  canDisconnect: boolean;
  canSendGlobalCommands: boolean;
  canEmergencyStop: boolean;
};

export type MqttHardwareAction =
  | 'restartCommunication'
  | 'syncHardware'
  | 'testConnection'
  | 'reconnect'
  | 'disconnect'
  | 'turnOffAllPumps'
  | 'openAllValves'
  | 'closeAllValves'
  | 'emergencyStop';

export type MqttHardwareActionFeedback = {
  type: MqttHardwareAction;
  message: string;
};

export type MqttConfigFormPayloadResult = {
  configPayload: UpdateMqttConfigRequest | null;
  credentialsPayload: UpdateMqttCredentialsRequest | null;
};

export type MqttConfigFormSnapshot = {
  config: MqttHardwareConfigResponse | null;
  formState: MqttConfigFormState;
};
