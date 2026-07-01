import type { ProcessoPrecheckResponse, ProcessoPrecheckStatus, StatusProcesso } from '../../types';

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

export function formatProcessNumber(value?: number | string | null, suffix?: string): string {
  const numericValue = typeof value === 'string' ? Number(value) : value;

  if (typeof numericValue !== 'number' || !Number.isFinite(numericValue)) {
    return 'Nao informado';
  }

  return `${numericValue.toLocaleString('pt-BR')}${suffix ? ` ${suffix}` : ''}`;
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

  if (Array.isArray(value)) {
    return value.length;
  }

  const processTanks = source.processostanques;

  if (key === 'tanques' && Array.isArray(processTanks)) {
    return processTanks.length;
  }

  if (key === 'sensores' && Array.isArray(processTanks)) {
    return processTanks.reduce((total, processTank) => {
      if (typeof processTank !== 'object' || processTank === null || Array.isArray(processTank)) {
        return total;
      }

      const sensors = (processTank as Record<string, unknown>).processostanquessensores;

      return total + (Array.isArray(sensors) ? sensors.length : 0);
    }, 0);
  }

  return null;
}

export function getUnknownNumber(source: Record<string, unknown>, key: string): number | null {
  const value = source[key];

  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export type AcoplamentoStatusSummary = {
  label: string;
  tone: ProcessTone;
};

export function getAcoplamentoStatusSummary(
  precheck?: ProcessoPrecheckResponse | null,
): AcoplamentoStatusSummary {
  const acoplamentoItems = precheck?.itens.filter((item) => item.grupo === 'ACOPLAMENTO') ?? [];

  if (acoplamentoItems.length === 0) {
    return {
      label: 'Nao informado',
      tone: 'neutral',
    };
  }

  const statuses = acoplamentoItems.map((item) => item.status);

  if (statuses.some((status) => status === 'REPROVADO' || status === 'FALHA')) {
    return {
      label: 'Reprovado',
      tone: 'danger',
    };
  }

  if (statuses.every((status) => status === 'APROVADO')) {
    return {
      label: 'Acoplado',
      tone: 'success',
    };
  }

  if (statuses.some((status) => status === 'NAO_CONFIRMADO' || status === 'PENDENTE')) {
    return {
      label: 'Nao confirmado',
      tone: 'warning',
    };
  }

  if (statuses.every((status) => status === 'IGNORADO')) {
    return {
      label: 'Ignorado',
      tone: 'neutral',
    };
  }

  return {
    label: getPrecheckStatusLabel(statuses[0]),
    tone: 'neutral',
  };
}

function getPrecheckStatusLabel(status?: ProcessoPrecheckStatus | null): string {
  const labels: Record<ProcessoPrecheckStatus, string> = {
    APROVADO: 'Aprovado',
    REPROVADO: 'Reprovado',
    PENDENTE: 'Pendente',
    FALHA: 'Falha',
    NAO_SUPORTADO: 'Nao suportado',
    NAO_CONFIRMADO: 'Nao confirmado',
    IGNORADO: 'Ignorado',
  };

  return status ? labels[status] : 'Nao informado';
}
