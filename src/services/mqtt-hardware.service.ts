import { api } from '../api/axios';
import type {
  MqttCommandRequest,
  MqttCommandResponse,
  MqttCredentialsUpdateResponse,
  MqttHardwareConfigResponse,
  MqttHardwareStatusResponse,
  UpdateMqttConfigRequest,
  UpdateMqttCredentialsRequest,
} from '../types/mqtt-hardware.types';

type MqttCommandPath =
  | 'test'
  | 'reconnect'
  | 'disconnect'
  | 'sincronizar-hardware'
  | 'reiniciar-comunicacao'
  | 'parada-emergencia'
  | 'desligar-todas-bombas'
  | 'abrir-todas-valvulas'
  | 'fechar-todas-valvulas';

async function sendMqttCommand(
  command: MqttCommandPath,
  payload?: MqttCommandRequest,
): Promise<MqttCommandResponse> {
  const { data } = await api.post<MqttCommandResponse>(
    `/mqtt-hardware/commands/${command}`,
    payload,
  );

  return data;
}

export async function getMqttHardwareStatus(): Promise<MqttHardwareStatusResponse> {
  const { data } = await api.get<MqttHardwareStatusResponse>('/mqtt-hardware/status');

  return data;
}

export async function getMqttHardwareConfig(): Promise<MqttHardwareConfigResponse> {
  const { data } = await api.get<MqttHardwareConfigResponse>('/mqtt-hardware/config');

  return data;
}

export async function updateMqttHardwareConfig(
  payload: UpdateMqttConfigRequest,
): Promise<MqttHardwareConfigResponse> {
  const { data } = await api.patch<MqttHardwareConfigResponse>(
    '/mqtt-hardware/config',
    payload,
  );

  return data;
}

export async function updateMqttHardwareCredentials(
  payload: UpdateMqttCredentialsRequest,
): Promise<MqttCredentialsUpdateResponse> {
  const { data } = await api.put<MqttCredentialsUpdateResponse>(
    '/mqtt-hardware/credentials',
    payload,
  );

  return data;
}

export function testMqttConnection(): Promise<MqttCommandResponse> {
  return sendMqttCommand('test');
}

export function reconnectMqtt(): Promise<MqttCommandResponse> {
  return sendMqttCommand('reconnect');
}

export function disconnectMqtt(): Promise<MqttCommandResponse> {
  return sendMqttCommand('disconnect');
}

export function syncHardware(payload?: MqttCommandRequest): Promise<MqttCommandResponse> {
  return sendMqttCommand('sincronizar-hardware', payload);
}

export function restartCommunication(payload?: MqttCommandRequest): Promise<MqttCommandResponse> {
  return sendMqttCommand('reiniciar-comunicacao', payload);
}

export function emergencyStopHardware(payload?: MqttCommandRequest): Promise<MqttCommandResponse> {
  return sendMqttCommand('parada-emergencia', payload);
}

export function turnOffAllPumps(payload?: MqttCommandRequest): Promise<MqttCommandResponse> {
  return sendMqttCommand('desligar-todas-bombas', payload);
}

export function openAllValves(payload?: MqttCommandRequest): Promise<MqttCommandResponse> {
  return sendMqttCommand('abrir-todas-valvulas', payload);
}

export function closeAllValves(payload?: MqttCommandRequest): Promise<MqttCommandResponse> {
  return sendMqttCommand('fechar-todas-valvulas', payload);
}

export const mqttHardwareService = {
  getMqttHardwareStatus,
  getMqttHardwareConfig,
  updateMqttHardwareConfig,
  updateMqttHardwareCredentials,
  testMqttConnection,
  reconnectMqtt,
  disconnectMqtt,
  syncHardware,
  restartCommunication,
  emergencyStopHardware,
  turnOffAllPumps,
  openAllValves,
  closeAllValves,
};
