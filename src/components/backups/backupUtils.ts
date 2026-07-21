import type { BackupListItem, BackupStatus, BackupType } from '../../types';

export function getBackupTypeLabel(type?: BackupType | string | null): string {
  const labels: Record<BackupType, string> = {
    SISTEMA: 'Sistema',
    MQTT: 'MQTT/Hardware',
    COMPLETO: 'Completo',
  };

  return type && type in labels ? labels[type as BackupType] : 'Nao informado';
}

export function getBackupStatusLabel(status?: BackupStatus | string | null): string {
  const labels: Record<BackupStatus, string> = {
    GERADO: 'Gerado',
    RESTAURADO: 'Restaurado',
    FALHA_GERACAO: 'Falha na geracao',
    FALHA_RESTAURACAO: 'Falha na restauracao',
    INVALIDO: 'Invalido',
  };

  return status && status in labels ? labels[status as BackupStatus] : 'Nao informado';
}

export function getBackupStatusTone(status?: BackupStatus | string | null): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'GERADO' || status === 'RESTAURADO') {
    return 'success';
  }

  if (status === 'INVALIDO') {
    return 'warning';
  }

  if (status === 'FALHA_GERACAO' || status === 'FALHA_RESTAURACAO') {
    return 'danger';
  }

  return 'neutral';
}

export function formatBackupDate(value?: string | null): string {
  if (!value) {
    return 'Nao informado';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Data invalida';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function formatBackupBytes(value?: string | number | null): string {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;

  if (!Number.isFinite(parsed)) {
    return 'Nao informado';
  }

  return `${parsed.toLocaleString('pt-BR')} bytes`;
}

export function getBackupUserLabel(user?: BackupListItem['usuario_criacao']): string {
  if (!user) {
    return 'Nao informado';
  }

  return user.login ? `${user.nome} (${user.login})` : user.nome;
}

export function getShortHash(value?: string | null): string {
  if (!value) {
    return 'Nao informado';
  }

  return value.length > 16 ? `${value.slice(0, 12)}...${value.slice(-4)}` : value;
}
