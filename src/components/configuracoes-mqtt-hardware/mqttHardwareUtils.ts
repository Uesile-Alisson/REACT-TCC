import type {
  HardwareStatusPayload,
  HeartbeatPayload,
  SensorAcoplamentoPayload,
  SensorReadingPayload,
} from '../../services/realtime';
import type { MqttConnectionStatus, MqttHardwareStatusResponse } from '../../types';

export function formatDateTime(value?: string | null): string {
  if (!value) {
    return 'Indisponivel';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value));
}

export function formatBoolean(value?: boolean | null): string {
  if (value === true) {
    return 'Online';
  }

  if (value === false) {
    return 'Offline';
  }

  return 'Indisponivel';
}

export function getMqttStatusLabel(status?: string | null): string {
  if (!status) {
    return 'Indisponivel';
  }

  const labels: Record<MqttConnectionStatus, string> = {
    CONNECTED: 'Conectado',
    DISCONNECTED: 'Desconectado',
    CONNECTING: 'Conectando',
    ERROR: 'Erro',
    CONECTADO: 'Conectado',
    DESCONECTADO: 'Desconectado',
    RECONECTANDO: 'Reconectando',
    FALHA: 'Falha',
  };

  return labels[status as MqttConnectionStatus] ?? status;
}

export function getStatusTone(status?: string | null): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'CONNECTED' || status === 'CONECTADO') {
    return 'success';
  }

  if (status === 'CONNECTING' || status === 'RECONECTANDO') {
    return 'warning';
  }

  if (status === 'ERROR' || status === 'FALHA') {
    return 'danger';
  }

  return 'neutral';
}

export function getHardwareEsp32Online(
  httpStatus: MqttHardwareStatusResponse | null,
  realtimeStatus: HardwareStatusPayload | null,
  heartbeat: HeartbeatPayload | null,
): boolean | null {
  return (
    heartbeat?.esp32_online ??
    realtimeStatus?.esp32_online ??
    httpStatus?.esp32_online ??
    httpStatus?.hardware?.esp32Online ??
    null
  );
}

export function getSensorLabel(reading: SensorReadingPayload | null): string {
  if (!reading?.id_sensor) {
    return 'Indisponivel';
  }

  return `Sensor #${reading.id_sensor}`;
}

export function getAcoplamentoLabel(acoplamento: SensorAcoplamentoPayload | null): string {
  return acoplamento?.status_acoplamento ?? 'Indisponivel';
}
