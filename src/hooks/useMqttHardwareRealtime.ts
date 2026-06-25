import { useRealtime } from './useRealtime';

export function useMqttHardwareRealtime() {
  const {
    isConnected,
    isConnecting,
    lastError,
    mqttConnectionStatus,
    mqttError,
    hardwareState,
    hardwareStatus,
    esp32Online,
    lastHeartbeat,
    eventsCount,
  } = useRealtime();

  return {
    isConnected,
    isConnecting,
    lastError,
    mqttConnectionStatus,
    mqttError,
    hardwareState,
    hardwareStatus,
    esp32Online,
    lastHeartbeat,
    eventsCount,
  };
}
