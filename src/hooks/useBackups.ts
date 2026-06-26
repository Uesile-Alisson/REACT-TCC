import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizeApiError } from '../api/api-error';
import { createBackup, getBackupById, listBackups, restoreBackup } from '../services/backup.service';
import type {
  BackupActionFeedback,
  BackupDetail,
  BackupFiltersState,
  BackupListItem,
  BackupListResponse,
  BackupQuery,
  BackupStatus,
  BackupType,
  CreateBackupRequest,
  RestoreBackupRequest,
} from '../types';

type UseBackupsOptions = {
  autoLoad?: boolean;
  allowedTypes?: BackupType[];
};

type UseBackupsResult = {
  backups: BackupListItem[];
  selectedBackup: BackupDetail | null;
  total: number;
  page: number;
  limit: number;
  filters: BackupFiltersState;
  isLoading: boolean;
  actionLoading: 'create' | 'restore' | 'detail' | null;
  feedback: BackupActionFeedback;
  setFilters: (filters: BackupFiltersState) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  selectBackup: (id: number) => Promise<void>;
  clearSelectedBackup: () => void;
  clearFeedback: () => void;
  generateBackup: (payload: CreateBackupRequest) => Promise<boolean>;
  restoreSelectedBackup: (id: number, payload: RestoreBackupRequest) => Promise<boolean>;
};

export const BACKUP_TYPE_OPTIONS: Array<{ value: BackupType; label: string }> = [
  { value: 'SISTEMA', label: 'Sistema' },
  { value: 'MQTT', label: 'MQTT/Hardware' },
  { value: 'COMPLETO', label: 'Completo' },
];

export const BACKUP_STATUS_OPTIONS: Array<{ value: BackupStatus; label: string }> = [
  { value: 'GERADO', label: 'Gerado' },
  { value: 'RESTAURADO', label: 'Restaurado' },
  { value: 'FALHA_GERACAO', label: 'Falha na geracao' },
  { value: 'FALHA_RESTAURACAO', label: 'Falha na restauracao' },
  { value: 'INVALIDO', label: 'Invalido' },
];

export const initialBackupFilters: BackupFiltersState = {
  tipo_backup: '',
  status_backup: '',
  data_inicio: '',
  data_fim: '',
  busca: '',
};

const DEFAULT_LIMIT = 10;
const SENSITIVE_KEY_PATTERN = /senha|password|token|senha_mqtt_hash|nova_senha_mqtt/i;

function normalizeBackupListResponse(
  response: BackupListResponse,
  fallbackPage: number,
  fallbackLimit: number,
): { data: BackupListItem[]; total: number; page: number; limit: number } {
  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      page: fallbackPage,
      limit: fallbackLimit,
    };
  }

  return {
    data: response.data,
    total: response.meta.total,
    page: response.meta.page,
    limit: response.meta.limit,
  };
}

function getBackupErrorMessage(error: unknown, action: 'list' | 'create' | 'restore' | 'detail'): string {
  const apiError = normalizeApiError(error);

  if (apiError.statusCode === 400) {
    return apiError.message || 'Dados invalidos para backup.';
  }

  if (apiError.statusCode === 401 || apiError.statusCode === 403) {
    return 'Voce nao tem permissao para executar esta acao.';
  }

  if (apiError.statusCode === 404) {
    return 'Backup nao encontrado.';
  }

  if (apiError.statusCode && apiError.statusCode >= 500) {
    return 'Erro interno no modulo de backup. Verifique se migration/campos de backup estao aplicados.';
  }

  const fallbackMessages = {
    list: 'Nao foi possivel carregar backups.',
    create: 'Nao foi possivel gerar backup.',
    restore: 'Nao foi possivel restaurar backup.',
    detail: 'Nao foi possivel carregar detalhes do backup.',
  };

  return apiError.message || fallbackMessages[action];
}

function getBackupCreatedMessage(type: BackupType): string {
  const messages: Record<BackupType, string> = {
    SISTEMA: 'Backup do sistema gerado com sucesso.',
    MQTT: 'Backup MQTT/Hardware gerado com sucesso.',
    COMPLETO: 'Backup completo gerado com sucesso.',
  };

  return messages[type];
}

function shouldKeepBackup(backup: BackupListItem, filters: BackupFiltersState): boolean {
  const search = filters.busca.trim().toLowerCase();

  if (!search) {
    return true;
  }

  const userCreation = backup.usuario_criacao?.nome ?? backup.usuario_criacao?.login ?? '';
  const userRestore = backup.usuario_restauracao?.nome ?? backup.usuario_restauracao?.login ?? '';

  return [backup.nome_arquivo, userCreation, userRestore]
    .some((value) => value.toLowerCase().includes(search));
}

export function sanitizeBackupPreview(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeBackupPreview(item));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (sanitized, [key, entryValue]) => {
        if (!SENSITIVE_KEY_PATTERN.test(key)) {
          sanitized[key] = sanitizeBackupPreview(entryValue);
        }

        return sanitized;
      },
      {},
    );
  }

  return value;
}

function buildQuery(
  filters: BackupFiltersState,
  page: number,
  limit: number,
  allowedTypes?: BackupType[],
): BackupQuery {
  return {
    page,
    limit,
    tipo_backup: filters.tipo_backup || (allowedTypes?.length === 1 ? allowedTypes[0] : undefined),
    status_backup: filters.status_backup || undefined,
    data_inicio: filters.data_inicio || undefined,
    data_fim: filters.data_fim || undefined,
  };
}

export function useBackups(options: UseBackupsOptions = {}): UseBackupsResult {
  const { autoLoad = true, allowedTypes } = options;
  const [backups, setBackups] = useState<BackupListItem[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<BackupDetail | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [page, setPageState] = useState<number>(1);
  const [limit, setLimit] = useState<number>(DEFAULT_LIMIT);
  const [filters, setFiltersState] = useState<BackupFiltersState>(initialBackupFilters);
  const [isLoading, setIsLoading] = useState<boolean>(autoLoad);
  const [actionLoading, setActionLoading] = useState<'create' | 'restore' | 'detail' | null>(null);
  const [feedback, setFeedback] = useState<BackupActionFeedback>(null);

  const query = useMemo(
    () => buildQuery(filters, page, DEFAULT_LIMIT, allowedTypes),
    [allowedTypes, filters, page],
  );

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await listBackups(query);
      const normalized = normalizeBackupListResponse(response, page, DEFAULT_LIMIT);
      const filteredByType = allowedTypes?.length
        ? normalized.data.filter((backup) => allowedTypes.includes(backup.tipo_backup))
        : normalized.data;
      const filtered = filteredByType.filter((backup) => shouldKeepBackup(backup, filters));

      setBackups(filtered);
      setTotal(filters.busca ? filtered.length : normalized.total);
      setPageState(normalized.page);
      setLimit(normalized.limit);
    } catch (error) {
      setBackups([]);
      setTotal(0);
      setFeedback({ type: 'error', message: getBackupErrorMessage(error, 'list') });
    } finally {
      setIsLoading(false);
    }
  }, [allowedTypes, filters, page, query]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    queueMicrotask(() => void refresh());
  }, [autoLoad, refresh]);

  const setFilters = useCallback((nextFilters: BackupFiltersState): void => {
    setFiltersState(nextFilters);
    setPageState(1);
  }, []);

  const setPage = useCallback((nextPage: number): void => {
    setPageState(Math.max(1, nextPage));
  }, []);

  const selectBackup = useCallback(async (id: number): Promise<void> => {
    setActionLoading('detail');
    setFeedback(null);

    try {
      const detail = await getBackupById(id);
      setSelectedBackup({
        ...detail,
        snapshot_preview: sanitizeBackupPreview(detail.snapshot_preview),
        metadados: sanitizeBackupPreview(detail.metadados),
      });
    } catch (error) {
      setFeedback({ type: 'error', message: getBackupErrorMessage(error, 'detail') });
    } finally {
      setActionLoading(null);
    }
  }, []);

  const generateBackup = useCallback(async (payload: CreateBackupRequest): Promise<boolean> => {
    setActionLoading('create');
    setFeedback(null);

    try {
      await createBackup(payload);
      setFeedback({ type: 'success', message: getBackupCreatedMessage(payload.tipo_backup) });
      await refresh();
      return true;
    } catch (error) {
      setFeedback({ type: 'error', message: getBackupErrorMessage(error, 'create') });
      return false;
    } finally {
      setActionLoading(null);
    }
  }, [refresh]);

  const restoreSelectedBackup = useCallback(
    async (id: number, payload: RestoreBackupRequest): Promise<boolean> => {
      setActionLoading('restore');
      setFeedback(null);

      try {
        await restoreBackup(id, payload);
        setFeedback({ type: 'success', message: 'Backup restaurado com sucesso.' });
        await refresh();
        return true;
      } catch (error) {
        setFeedback({ type: 'error', message: getBackupErrorMessage(error, 'restore') });
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [refresh],
  );

  const clearSelectedBackup = useCallback((): void => {
    setSelectedBackup(null);
  }, []);

  const clearFeedback = useCallback((): void => {
    setFeedback(null);
  }, []);

  return {
    backups,
    selectedBackup,
    total,
    page,
    limit,
    filters,
    isLoading,
    actionLoading,
    feedback,
    setFilters,
    setPage,
    refresh,
    selectBackup,
    clearSelectedBackup,
    clearFeedback,
    generateBackup,
    restoreSelectedBackup,
  };
}
