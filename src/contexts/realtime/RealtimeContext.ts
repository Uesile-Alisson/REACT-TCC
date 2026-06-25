import { createContext } from 'react';
import type {
  AlarmCreatedPayload,
  HardwareStatePayload,
  HardwareStatusPayload,
  HeartbeatPayload,
  MqttConnectionStatusPayload,
  MqttErrorPayload,
  SensorAcoplamentoPayload,
  SensorReadingPayload,
} from '../../services/realtime';

export type RealtimeContextData = {
  isConnected: boolean;
  isConnecting: boolean;
  lastError: string | null;
  mqttConnectionStatus: MqttConnectionStatusPayload | null;
  mqttError: MqttErrorPayload | null;
  hardwareState: HardwareStatePayload | null;
  hardwareStatus: HardwareStatusPayload | null;
  esp32Online: boolean | null;
  lastHeartbeat: HeartbeatPayload | null;
  lastSensorReading: SensorReadingPayload | null;
  lastAlarm: AlarmCreatedPayload | null;
  lastAcoplamento: SensorAcoplamentoPayload | null;
  eventsCount: number;
  connect: () => void;
  disconnect: () => void;
};

export const RealtimeContext = createContext<RealtimeContextData | undefined>(undefined);
