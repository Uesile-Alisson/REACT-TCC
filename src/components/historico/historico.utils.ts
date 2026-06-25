export type HistoricoTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

export function formatHistoricoDate(value?: string | null): string {
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

export function getStatusLabel(status?: string | null): string {
  const labels: Record<string, string> = {
    CONCLUIDO: 'Concluido',
    INTERROMPIDO: 'Interrompido',
    FALHA: 'Falha',
    CONFIGURADO: 'Configurado',
    EM_EXECUCAO: 'Em execucao',
    PAUSADO: 'Pausado',
  };

  return status && labels[status] ? labels[status] : 'Nao informado';
}

export function getStatusTone(status?: string | null): HistoricoTone {
  if (status === 'CONCLUIDO') {
    return 'success';
  }

  if (status === 'INTERROMPIDO') {
    return 'warning';
  }

  if (status === 'FALHA') {
    return 'danger';
  }

  if (status === 'EM_EXECUCAO' || status === 'PAUSADO') {
    return 'info';
  }

  return 'neutral';
}

export function getUnknownNumber(source: Record<string, unknown>, key: string): string {
  const value = source[key];

  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString('pt-BR')
    : 'Nao informado';
}

export function getUnknownString(source: Record<string, unknown>, key: string): string {
  const value = source[key];

  return typeof value === 'string' && value.trim() ? value : 'Nao informado';
}

export function countByStatus(items: Array<{ status_processo?: string }>, status: string): number {
  return items.filter((item) => item.status_processo === status).length;
}
