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
  eventsCount: 0,
};

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { accessToken, isAuthenticated } = useAuth();
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
    if (!isAuthenticated || !accessToken) {
      disconnect();
      return;
    }

    setState((currentState) => ({
      ...currentState,
      isConnecting: !isRealtimeSocketConnected(),
      lastError: null,
    }));
    connectRealtime(accessToken);
  }, [accessToken, disconnect, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
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
      (payload: HardwareStatePayload) => updateRealtimePayload({ hardwareState: payload }),
    );
    const unsubscribeHardwareStatus = realtimeService.onHardwareStatus(
      (payload: HardwareStatusPayload) => updateRealtimePayload({
        hardwareStatus: payload,
        esp32Online: payload.esp32_online ?? null,
      }),
    );
    const unsubscribeHeartbeat = realtimeService.onHeartbeat(
      (payload: HeartbeatPayload) => updateRealtimePayload({
        lastHeartbeat: payload,
        esp32Online: payload.esp32_online ?? null,
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
      disconnectRealtime();
    };
  }, [accessToken, connect, disconnect, isAuthenticated, updateRealtimePayload]);

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
