import { createContext } from 'react';
import type {
  AlarmCreatedPayload,
  HardwareStatePayload,
  HardwareStatusPayload,
  HeartbeatPayload,
  MqttConnectionStatusPayload,
  MqttErrorPayload,
  ProcessPrecheckResultPayload,
  ProcessAuxiliaryStateUpdatedPayload,
  ProcessDashboardUpdatedPayload,
  ProcessEmergencyStopPayload,
  ProcessGeneralClosureUpdatedPayload,
  ProcessStatusChangedPayload,
  ProcessTankClosureUpdatedPayload,
  ProcessTankUpdatedPayload,
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
  lastPrecheckResult: ProcessPrecheckResultPayload | null;
  lastProcessStatus: ProcessStatusChangedPayload | null;
  lastProcessEmergencyStop: ProcessEmergencyStopPayload | null;
  lastProcessDashboard: ProcessDashboardUpdatedPayload | null;
  lastProcessAuxiliaryState: ProcessAuxiliaryStateUpdatedPayload | null;
  lastProcessTank: ProcessTankUpdatedPayload | null;
  lastProcessTankClosure: ProcessTankClosureUpdatedPayload | null;
  lastProcessGeneralClosure: ProcessGeneralClosureUpdatedPayload | null;
  eventsCount: number;
  connect: () => void;
  disconnect: () => void;
};

export const RealtimeContext = createContext<RealtimeContextData | undefined>(undefined);
