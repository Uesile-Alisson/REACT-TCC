import type { StatusProcesso } from '../../types';

export type ProcessTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

export function formatProcessDate(value?: string | null): string {
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

export function formatProcessNumber(value?: number | null, suffix?: string): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'Nao informado';
  }

  return `${value.toLocaleString('pt-BR')}${suffix ? ` ${suffix}` : ''}`;
}

export function getProcessStatusLabel(status?: StatusProcesso | string | null): string {
  const labels: Record<StatusProcesso, string> = {
    CONFIGURADO: 'Configurado',
    EM_EXECUCAO: 'Em execucao',
    PAUSADO: 'Pausado',
    CONCLUIDO: 'Concluido',
    INTERROMPIDO: 'Interrompido',
    FALHA: 'Falha',
  };

  return typeof status === 'string' && status in labels
    ? labels[status as StatusProcesso]
    : 'Nao informado';
}

export function getProcessTone(status?: StatusProcesso | string | null): ProcessTone {
  if (status === 'EM_EXECUCAO') {
    return 'success';
  }

  if (status === 'CONFIGURADO' || status === 'PAUSADO') {
    return 'warning';
  }

  if (status === 'CONCLUIDO') {
    return 'info';
  }

  if (status === 'INTERROMPIDO' || status === 'FALHA') {
    return 'danger';
  }

  return 'neutral';
}

export function countRelation(source: Record<string, unknown>, key: string): number | null {
  const value = source[key];

  return Array.isArray(value) ? value.length : null;
}

export function getUnknownNumber(source: Record<string, unknown>, key: string): number | null {
  const value = source[key];

  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
