import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { normalizeApiError } from '../api/api-error';
import {
  ativarTanqueConfiguracao,
  createTanqueConfiguracao,
  desativarTanqueConfiguracao,
  getTanqueConfiguracaoById,
  listTanquesConfiguracao,
  updateTanqueConfiguracao,
} from '../services/configuracoes-tanques.service';
import type {
  CreateTanqueConfiguracaoDto,
  QueryTanquesConfiguracao,
  TanqueConfigResponse,
  TanquesPageState,
  TanquesSummary,
  UpdateTanqueConfiguracaoDto,
} from '../types';

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

const DEFAULT_FILTERS: QueryTanquesConfiguracao = {
  page: 1,
  limit: 20,
  order_by: 'nome',
  order_direction: 'asc',
};

type UseTanquesPageResult = TanquesPageState & {
  summary: TanquesSummary;
  filters: QueryTanquesConfiguracao;
  loadTanques: (query?: QueryTanquesConfiguracao) => Promise<void>;
  selectTanque: (id_tanque: number | null) => Promise<void>;
  createTanque: (payload: CreateTanqueConfiguracaoDto) => Promise<boolean>;
  updateTanque: (id_tanque: number, payload: UpdateTanqueConfiguracaoDto) => Promise<boolean>;
  ativarTanque: (id_tanque: number) => Promise<boolean>;
  desativarTanque: (id_tanque: number) => Promise<boolean>;
  clearMessages: () => void;
};

function getConfiguracoesErrorMessage(error: unknown): string {
  const apiError = normalizeApiError(error);

  if (apiError.statusCode === 400) {
    return apiError.message || 'Dados invalidos para a configuracao do tanque.';
  }

  if (apiError.statusCode === 401) {
    return 'Sessao expirada. Entre novamente para continuar.';
  }

  if (apiError.statusCode === 403) {
    return 'Seu perfil nao possui permissao para manter tanques.';
  }

  if (apiError.statusCode === 404) {
    return apiError.message || 'Tanque nao encontrado.';
  }

  if (apiError.statusCode && apiError.statusCode >= 500) {
    return 'Erro interno da API ao processar tanques.';
  }

  return apiError.message || 'Nao foi possivel comunicar com a API de tanques.';
}

function normalizeTotalPages(page: number, limit: number, total: number, totalPages?: number): number {
  if (totalPages && totalPages > 0) {
    return totalPages;
  }

  return Math.max(1, Math.ceil(total / limit), page);
}

export function useTanquesPage(): UseTanquesPageResult {
  const [tanques, setTanques] = useState<TanqueConfigResponse[]>([]);
  const [selectedTanque, setSelectedTanque] = useState<TanqueConfigResponse | null>(null);
  const [filters, setFilters] = useState<QueryTanquesConfiguracao>(DEFAULT_FILTERS);
  const filtersRef = useRef<QueryTanquesConfiguracao>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const summary = useMemo<TanquesSummary>(
    () => ({
      total: pagination.total,
      ativos: tanques.filter((tanque) => tanque.status_tanque === 'ATIVO').length,
      indisponiveis: tanques.filter((tanque) => tanque.status_tanque !== 'ATIVO').length,
      volumeConfigurado: tanques.reduce((total, tanque) => total + tanque.volume, 0),
    }),
    [pagination.total, tanques],
  );

  const loadTanques = useCallback(async (query?: QueryTanquesConfiguracao): Promise<void> => {
    const nextFilters = { ...filtersRef.current, ...query };

    setIsLoading(true);
    setError(null);

    try {
      const response = await listTanquesConfiguracao(nextFilters);
      const page = response.meta.page;
      const limit = response.meta.limit;
      const total = response.meta.total;

      filtersRef.current = nextFilters;
      setTanques(response.data);
      setFilters(nextFilters);
      setPagination({
        page,
        limit,
        total,
        totalPages: normalizeTotalPages(page, limit, total, response.meta.totalPages ?? response.meta.total_pages),
      });
      setSelectedTanque((current) =>
        current ? response.data.find((tanque) => tanque.id_tanque === current.id_tanque) ?? null : null,
      );
    } catch (loadError) {
      setError(getConfiguracoesErrorMessage(loadError));
      setTanques([]);
      setSelectedTanque(null);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void loadTanques());
  }, [loadTanques]);

  const selectTanque = useCallback(async (id_tanque: number | null): Promise<void> => {
    if (!id_tanque) {
      setSelectedTanque(null);
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const tanque = await getTanqueConfiguracaoById(id_tanque);
      setSelectedTanque(tanque);
    } catch (selectError) {
      setError(getConfiguracoesErrorMessage(selectError));
      setSelectedTanque(null);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const createTanque = useCallback(async (payload: CreateTanqueConfiguracaoDto): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const created = await createTanqueConfiguracao(payload);
      setSelectedTanque(created);
      setSuccessMessage('Tanque criado com sucesso.');
      await loadTanques({ page: 1 });
      return true;
    } catch (createError) {
      setError(getConfiguracoesErrorMessage(createError));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [loadTanques]);

  const updateTanque = useCallback(
    async (id_tanque: number, payload: UpdateTanqueConfiguracaoDto): Promise<boolean> => {
      if (Object.keys(payload).length === 0) {
        setError('Altere pelo menos um campo antes de salvar.');
        return false;
      }

      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const updated = await updateTanqueConfiguracao(id_tanque, payload);
        setSelectedTanque(updated);
        setSuccessMessage('Tanque atualizado com sucesso.');
        await loadTanques();
        return true;
      } catch (updateError) {
        setError(getConfiguracoesErrorMessage(updateError));
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [loadTanques],
  );

  const ativarTanque = useCallback(async (id_tanque: number): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await ativarTanqueConfiguracao(id_tanque);
      setSelectedTanque(updated);
      setSuccessMessage('Tanque ativado com sucesso.');
      await loadTanques();
      return true;
    } catch (actionError) {
      setError(getConfiguracoesErrorMessage(actionError));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [loadTanques]);

  const desativarTanque = useCallback(async (id_tanque: number): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await desativarTanqueConfiguracao(id_tanque);
      setSelectedTanque(updated);
      setSuccessMessage('Tanque desativado com sucesso.');
      await loadTanques();
      return true;
    } catch (actionError) {
      setError(getConfiguracoesErrorMessage(actionError));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [loadTanques]);

  const clearMessages = useCallback((): void => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  return {
    tanques,
    selectedTanque,
    endpointState: 'available',
    isLoading,
    actionLoading,
    error,
    successMessage,
    pagination,
    summary,
    filters,
    loadTanques,
    selectTanque,
    createTanque,
    updateTanque,
    ativarTanque,
    desativarTanque,
    clearMessages,
  };
}
