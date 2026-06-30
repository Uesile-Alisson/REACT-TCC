import { MQTT_HARDWARE_EVENTS, PROCESSOS_EVENTS, SOCKET_SYSTEM_EVENTS } from './socket-events';
import { getRealtimeSocket, onRealtimeEvent } from './socket-client';
import type {
  AlarmCreatedPayload,
  HardwareStatePayload,
  HardwareStatusPayload,
  HeartbeatPayload,
  MqttConnectionStatusPayload,
  MqttErrorPayload,
  ProcessPrecheckResultPayload,
  RealtimeListener,
  SensorAcoplamentoPayload,
  SensorReadingPayload,
} from './socket.types';

export function onSocketConnect(listener: () => void): () => void {
  const socket = getRealtimeSocket();
  socket.on(SOCKET_SYSTEM_EVENTS.CONNECT, listener);

  return () => {
    socket.off(SOCKET_SYSTEM_EVENTS.CONNECT, listener);
  };
}

export function onSocketDisconnect(listener: (reason: string) => void): () => void {
  const socket = getRealtimeSocket();
  socket.on(SOCKET_SYSTEM_EVENTS.DISCONNECT, listener);

  return () => {
    socket.off(SOCKET_SYSTEM_EVENTS.DISCONNECT, listener);
  };
}

export function onSocketConnectError(listener: (error: Error) => void): () => void {
  const socket = getRealtimeSocket();
  socket.on(SOCKET_SYSTEM_EVENTS.CONNECT_ERROR, listener);

  return () => {
    socket.off(SOCKET_SYSTEM_EVENTS.CONNECT_ERROR, listener);
  };
}

export function onMqttConnectionStatus(
  listener: RealtimeListener<MqttConnectionStatusPayload>,
): () => void {
  return onRealtimeEvent(MQTT_HARDWARE_EVENTS.MQTT_CONNECTION_STATUS, listener);
}

export function onMqttError(listener: RealtimeListener<MqttErrorPayload>): () => void {
  return onRealtimeEvent(MQTT_HARDWARE_EVENTS.MQTT_ERROR, listener);
}

export function onHardwareState(listener: RealtimeListener<HardwareStatePayload>): () => void {
  return onRealtimeEvent(MQTT_HARDWARE_EVENTS.HARDWARE_STATE, listener);
}

export function onHardwareStatus(listener: RealtimeListener<HardwareStatusPayload>): () => void {
  return onRealtimeEvent(MQTT_HARDWARE_EVENTS.HARDWARE_STATUS, listener);
}

export function onHeartbeat(listener: RealtimeListener<HeartbeatPayload>): () => void {
  return onRealtimeEvent(MQTT_HARDWARE_EVENTS.HARDWARE_HEARTBEAT, listener);
}

export function onSensorReading(listener: RealtimeListener<SensorReadingPayload>): () => void {
  return onRealtimeEvent(MQTT_HARDWARE_EVENTS.SENSOR_READING, listener);
}

export function onAlarmCreated(listener: RealtimeListener<AlarmCreatedPayload>): () => void {
  return onRealtimeEvent(MQTT_HARDWARE_EVENTS.ALARM_CREATED, listener);
}

export function onSensorAcoplamentoUpdated(
  listener: RealtimeListener<SensorAcoplamentoPayload>,
): () => void {
  return onRealtimeEvent(MQTT_HARDWARE_EVENTS.SENSOR_ACOPLAMENTO_UPDATED, listener);
}

export function onProcessPrecheckResult(
  listener: RealtimeListener<ProcessPrecheckResultPayload>,
): () => void {
  return onRealtimeEvent(PROCESSOS_EVENTS.PRECHECK_RESULT, listener);
}

export const realtimeService = {
  onSocketConnect,
  onSocketDisconnect,
  onSocketConnectError,
  onMqttConnectionStatus,
  onMqttError,
  onHardwareState,
  onHardwareStatus,
  onHeartbeat,
  onSensorReading,
  onAlarmCreated,
  onSensorAcoplamentoUpdated,
  onProcessPrecheckResult,
};
