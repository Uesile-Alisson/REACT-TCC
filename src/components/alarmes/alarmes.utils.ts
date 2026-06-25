import type { SeveridadeAlarme, StatusAlarme } from '../../types';

export type AlarmeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

export function formatAlarmeDate(value?: string | null): string {
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

export function getSeverityLabel(severity?: SeveridadeAlarme | string | null): string {
  const labels: Record<SeveridadeAlarme, string> = {
    INFO: 'Info',
    MEDIO: 'Medio',
    CRITICO: 'Critico',
  };

  return severity && severity in labels ? labels[severity as SeveridadeAlarme] : 'Sem severidade';
}

export function getSeverityTone(severity?: SeveridadeAlarme | string | null): AlarmeTone {
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

export function getStatusLabel(status?: StatusAlarme | string | null): string {
  const labels: Record<StatusAlarme, string> = {
    ATIVO: 'Ativo',
    RESOLVIDO: 'Resolvido',
  };

  return status && status in labels ? labels[status as StatusAlarme] : 'Sem status';
}

export function getStatusTone(status?: StatusAlarme | string | null): AlarmeTone {
  if (status === 'ATIVO') {
    return 'danger';
  }

  if (status === 'RESOLVIDO') {
    return 'success';
  }

  return 'neutral';
}

export function getUnknownString(source: Record<string, unknown>, key: string): string {
  const value = source[key];

  return typeof value === 'string' && value.trim() ? value : 'Nao informado';
}

export function getUnknownNumber(source: Record<string, unknown>, key: string): string {
  const value = source[key];

  return typeof value === 'number' && Number.isFinite(value) ? String(value) : 'Nao informado';
}
