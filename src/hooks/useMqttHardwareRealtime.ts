import { useCallback, useEffect, useState } from 'react';
import { getMqttHardwareStatus } from '../services/mqtt-hardware.service';
import type { MqttHardwareStatusResponse } from '../types';
import { useRealtime } from './useRealtime';

type UseMqttHardwareRealtimeOptions = {
  includeHttpStatus?: boolean;
  refreshIntervalMs?: number;
};

const DEFAULT_HTTP_STATUS_REFRESH_MS = 5000;

function getStatusErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Nao foi possivel carregar o status MQTT/Hardware.';
}

export function useMqttHardwareRealtime(options: UseMqttHardwareRealtimeOptions = {}) {
  const {
    includeHttpStatus = false,
    refreshIntervalMs = DEFAULT_HTTP_STATUS_REFRESH_MS,
  } = options;
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
  const [httpStatus, setHttpStatus] = useState<MqttHardwareStatusResponse | null>(null);
  const [httpStatusError, setHttpStatusError] = useState<string | null>(null);

  const refreshHttpStatus = useCallback(async (): Promise<void> => {
    if (!includeHttpStatus) {
      return;
    }

    try {
      const nextStatus = await getMqttHardwareStatus();

      setHttpStatus(nextStatus);
      setHttpStatusError(null);
    } catch (error: unknown) {
      setHttpStatus(null);
      setHttpStatusError(getStatusErrorMessage(error));
    }
  }, [includeHttpStatus]);

  useEffect(() => {
    if (!includeHttpStatus) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      void refreshHttpStatus();
    }, 0);
    const intervalId = window.setInterval(() => {
      void refreshHttpStatus();
    }, refreshIntervalMs);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [includeHttpStatus, refreshHttpStatus, refreshIntervalMs]);

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
    httpStatus,
    httpStatusError,
    refreshHttpStatus,
  };
}
