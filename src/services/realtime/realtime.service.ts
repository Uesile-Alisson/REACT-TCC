import { ALARMES_EVENTS, MQTT_HARDWARE_EVENTS, PROCESSOS_EVENTS, SOCKET_SYSTEM_EVENTS } from './socket-events';
import {
  getRealtimeSocket,
  onAlarmesRealtimeEvent,
  onProcessosRealtimeEvent,
  onRealtimeEvent,
} from './socket-client';
import type {
  AlarmAcknowledgedPayload,
  AlarmCreatedPayload,
  AlarmNormalizedPayload,
  AlarmRecoveryAttemptPayload,
  AlarmResolvedPayload,
  AlarmUpdatedPayload,
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
  const unsubscribeMqttAlarmCreated = onRealtimeEvent(MQTT_HARDWARE_EVENTS.ALARM_CREATED, listener);
  const unsubscribeAlarmCreated = onAlarmesRealtimeEvent(ALARMES_EVENTS.CREATED, listener);

  return () => {
    unsubscribeMqttAlarmCreated();
    unsubscribeAlarmCreated();
  };
}

export function onAlarmUpdated(listener: RealtimeListener<AlarmUpdatedPayload>): () => void {
  return onAlarmesRealtimeEvent(ALARMES_EVENTS.UPDATED, listener);
}

export function onAlarmAcknowledged(listener: RealtimeListener<AlarmAcknowledgedPayload>): () => void {
  return onAlarmesRealtimeEvent(ALARMES_EVENTS.ACKNOWLEDGED, listener);
}

export function onAlarmNormalized(listener: RealtimeListener<AlarmNormalizedPayload>): () => void {
  return onAlarmesRealtimeEvent(ALARMES_EVENTS.NORMALIZED, listener);
}

export function onAlarmResolved(listener: RealtimeListener<AlarmResolvedPayload>): () => void {
  return onAlarmesRealtimeEvent(ALARMES_EVENTS.RESOLVED, listener);
}

export function onAlarmRecoveryAttempt(
  listener: RealtimeListener<AlarmRecoveryAttemptPayload>,
): () => void {
  return onAlarmesRealtimeEvent(ALARMES_EVENTS.RECOVERY_ATTEMPT, listener);
}

export function onSensorAcoplamentoUpdated(
  listener: RealtimeListener<SensorAcoplamentoPayload>,
): () => void {
  return onRealtimeEvent(MQTT_HARDWARE_EVENTS.SENSOR_ACOPLAMENTO_UPDATED, listener);
}

export function onProcessPrecheckResult(
  listener: RealtimeListener<ProcessPrecheckResultPayload>,
): () => void {
  return onProcessosRealtimeEvent(PROCESSOS_EVENTS.PRECHECK_RESULT, listener);
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
  onAlarmUpdated,
  onAlarmAcknowledged,
  onAlarmNormalized,
  onAlarmResolved,
  onAlarmRecoveryAttempt,
  onSensorAcoplamentoUpdated,
  onProcessPrecheckResult,
};
