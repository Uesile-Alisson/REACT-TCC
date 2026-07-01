import type { StatusProcesso } from '../../types';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

export function formatDateTime(value?: string | null): string {
  if (!value) {
    return 'Nao informado';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function formatNumber(value?: number | null, suffix?: string): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'Nao informado';
  }

  return `${value.toLocaleString('pt-BR')}${suffix ? ` ${suffix}` : ''}`;
}

export function formatBoolean(value?: boolean | null): string {
  if (value === true) {
    return 'Online';
  }

  if (value === false) {
    return 'Offline';
  }

  return 'Pendente';
}

export function getProcessStatusLabel(status?: string | null): string {
  const labels: Record<StatusProcesso, string> = {
    CONFIGURADO: 'Configurado',
    EM_EXECUCAO: 'Em execucao',
    PAUSADO: 'Pausado',
    CONCLUIDO: 'Concluido',
    INTERROMPIDO: 'Interrompido',
    FALHA: 'Falha',
  };

  return status && status in labels ? labels[status as StatusProcesso] : 'Nao informado';
}

export function getProcessStatusTone(status?: string | null): StatusTone {
  if (status === 'EM_EXECUCAO') {
    return 'success';
  }

  if (status === 'PAUSADO' || status === 'CONFIGURADO') {
    return 'warning';
  }

  if (status === 'FALHA' || status === 'INTERROMPIDO') {
    return 'danger';
  }

  if (status === 'CONCLUIDO') {
    return 'info';
  }

  return 'neutral';
}

export function getSeverityTone(severity?: string | null): StatusTone {
  if (severity === 'CRITICO') {
    return 'danger';
  }

  if (severity === 'MEDIO') {
    return 'warning';
  }

  if (severity === 'INFO') {
    return 'info';
  }

  return 'neutral';
}

export function getMqttTone(status?: string | null): StatusTone {
  const normalized = status?.toLowerCase() ?? '';

  if (
    normalized.includes('error') ||
    normalized.includes('falha') ||
    normalized.includes('disconnected') ||
    normalized.includes('desconectado')
  ) {
    return 'danger';
  }

  if (normalized.includes('connecting') || normalized.includes('conectando') || normalized.includes('reconectando')) {
    return 'warning';
  }

  if (normalized.includes('connected') || normalized === 'conectado') {
    return 'success';
  }

  return 'neutral';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getOptionalNumber(source: Record<string, unknown>, key: string): number | null {
  const value = source[key];

  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function countArrayField(source: Record<string, unknown>, key: string): number | null {
  const value = source[key];

  return Array.isArray(value) ? value.length : null;
}
