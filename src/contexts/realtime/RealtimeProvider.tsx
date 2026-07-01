import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  connectRealtime,
  disconnectRealtime,
  isRealtimeSocketConnected,
  realtimeService,
  type AlarmCreatedPayload,
  type HardwareStatePayload,
  type HardwareStatusPayload,
  type HeartbeatPayload,
  type MqttConnectionStatusPayload,
  type MqttErrorPayload,
  type ProcessPrecheckResultPayload,
  type SensorAcoplamentoPayload,
} from '../../services/realtime';
import { RealtimeContext, type RealtimeContextData } from './RealtimeContext';

type RealtimeProviderProps = {
  children: ReactNode;
};

type RealtimeState = Omit<RealtimeContextData, 'connect' | 'disconnect'>;

const initialRealtimeState: RealtimeState = {
  isConnected: false,
  isConnecting: false,
  lastError: null,
  mqttConnectionStatus: null,
  mqttError: null,
  hardwareState: null,
  hardwareStatus: null,
  esp32Online: null,
  lastHeartbeat: null,
  lastSensorReading: null,
  lastAlarm: null,
  lastAcoplamento: null,
  lastPrecheckResult: null,
  eventsCount: 0,
};

function resolveEsp32Online(payload: unknown): boolean | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const data = payload as Record<string, unknown>;
  const value = data.esp32_online ?? data.esp32Online;

  return typeof value === 'boolean' ? value : null;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { accessToken, isAuthenticated, isLoading, user } = useAuth();
  const [state, setState] = useState<RealtimeState>(initialRealtimeState);

  const updateRealtimePayload = useCallback((partialState: Partial<RealtimeState>): void => {
    setState((currentState) => ({
      ...currentState,
      ...partialState,
      eventsCount: currentState.eventsCount + 1,
    }));
  }, []);

  const disconnect = useCallback((): void => {
    disconnectRealtime();
    setState(initialRealtimeState);
  }, []);

  const connect = useCallback((): void => {
    if (isLoading || !isAuthenticated || !accessToken || !user) {
      disconnect();
      return;
    }

    setState((currentState) => ({
      ...currentState,
      isConnecting: !isRealtimeSocketConnected(),
      lastError: null,
    }));
    connectRealtime(accessToken);
  }, [accessToken, disconnect, isAuthenticated, isLoading, user]);

  useEffect(() => {
    if (isLoading) {
      return undefined;
    }

    if (!isAuthenticated || !accessToken || !user) {
      queueMicrotask(disconnect);
      return undefined;
    }

    const unsubscribeConnect = realtimeService.onSocketConnect(() => {
      setState((currentState) => ({
        ...currentState,
        isConnected: true,
        isConnecting: false,
        lastError: null,
      }));
    });
    const unsubscribeDisconnect = realtimeService.onSocketDisconnect(() => {
      setState((currentState) => ({
        ...currentState,
        isConnected: false,
        isConnecting: false,
      }));
    });
    const unsubscribeConnectError = realtimeService.onSocketConnectError((error) => {
      setState((currentState) => ({
        ...currentState,
        isConnected: false,
        isConnecting: false,
        lastError: error.message || 'Nao foi possivel conectar ao realtime.',
      }));
    });

    const unsubscribeMqttStatus = realtimeService.onMqttConnectionStatus(
      (payload: MqttConnectionStatusPayload) => updateRealtimePayload({
        mqttConnectionStatus: payload,
        lastError: payload.error ?? null,
      }),
    );
    const unsubscribeMqttError = realtimeService.onMqttError(
      (payload: MqttErrorPayload) => updateRealtimePayload({
        mqttError: payload,
        lastError: payload.error ?? 'Erro MQTT recebido pelo backend.',
      }),
    );
    const unsubscribeHardwareState = realtimeService.onHardwareState(
      (payload: HardwareStatePayload) => updateRealtimePayload({
        hardwareState: payload,
        esp32Online: resolveEsp32Online(payload),
      }),
    );
    const unsubscribeHardwareStatus = realtimeService.onHardwareStatus(
      (payload: HardwareStatusPayload) => updateRealtimePayload({
        hardwareStatus: payload,
        esp32Online: resolveEsp32Online(payload),
      }),
    );
    const unsubscribeHeartbeat = realtimeService.onHeartbeat(
      (payload: HeartbeatPayload) => updateRealtimePayload({
        lastHeartbeat: payload,
        esp32Online: resolveEsp32Online(payload),
      }),
    );
    const unsubscribeSensorReading = realtimeService.onSensorReading(
      (payload) => updateRealtimePayload({ lastSensorReading: payload }),
    );
    const unsubscribeAlarmCreated = realtimeService.onAlarmCreated(
      (payload: AlarmCreatedPayload) => updateRealtimePayload({ lastAlarm: payload }),
    );
    const unsubscribeAcoplamento = realtimeService.onSensorAcoplamentoUpdated(
      (payload: SensorAcoplamentoPayload) => updateRealtimePayload({ lastAcoplamento: payload }),
    );
    const unsubscribePrecheck = realtimeService.onProcessPrecheckResult(
      (payload: ProcessPrecheckResultPayload) => updateRealtimePayload({ lastPrecheckResult: payload }),
    );

    queueMicrotask(connect);

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeConnectError();
      unsubscribeMqttStatus();
      unsubscribeMqttError();
      unsubscribeHardwareState();
      unsubscribeHardwareStatus();
      unsubscribeHeartbeat();
      unsubscribeSensorReading();
      unsubscribeAlarmCreated();
      unsubscribeAcoplamento();
      unsubscribePrecheck();
      disconnectRealtime();
    };
  }, [accessToken, connect, disconnect, isAuthenticated, isLoading, updateRealtimePayload, user]);

  const value = useMemo<RealtimeContextData>(
    () => ({
      ...state,
      connect,
      disconnect,
    }),
    [connect, disconnect, state],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
