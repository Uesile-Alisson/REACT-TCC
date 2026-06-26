import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { normalizeApiError } from '../api/api-error';
import {
  ativarBombaConfiguracao,
  createBombaConfiguracao,
  desativarBombaConfiguracao,
  getBombaConfiguracaoById,
  listBombasConfiguracao,
  updateBombaConfiguracao,
} from '../services/configuracoes-bombas.service';
import type {
  BombaConfigResponse,
  BombasPageState,
  BombasSummary,
  CreateBombaConfiguracaoDto,
  QueryBombasConfiguracao,
  UpdateBombaConfiguracaoDto,
} from '../types';

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

const DEFAULT_FILTERS: QueryBombasConfiguracao = {
  page: 1,
  limit: 20,
  order_by: 'nome',
  order_direction: 'asc',
};

type UseBombasPageResult = BombasPageState & {
  summary: BombasSummary;
  filters: QueryBombasConfiguracao;
  loadBombas: (query?: QueryBombasConfiguracao) => Promise<void>;
  selectBomba: (id_bomba: number | null) => Promise<void>;
  createBomba: (payload: CreateBombaConfiguracaoDto) => Promise<boolean>;
  updateBomba: (id_bomba: number, payload: UpdateBombaConfiguracaoDto) => Promise<boolean>;
  ativarBomba: (id_bomba: number) => Promise<boolean>;
  desativarBomba: (id_bomba: number) => Promise<boolean>;
  clearMessages: () => void;
};

function getConfiguracoesErrorMessage(error: unknown): string {
  const apiError = normalizeApiError(error);

  if (apiError.statusCode === 400) {
    return apiError.message || 'Dados invalidos para a configuracao da bomba.';
  }

  if (apiError.statusCode === 401) {
    return 'Sessao expirada. Entre novamente para continuar.';
  }

  if (apiError.statusCode === 403) {
    return 'Seu perfil nao possui permissao para manter bombas.';
  }

  if (apiError.statusCode === 404) {
    return apiError.message || 'Bomba nao encontrada.';
  }

  if (apiError.statusCode && apiError.statusCode >= 500) {
    return 'Erro interno da API ao processar bombas.';
  }

  return apiError.message || 'Nao foi possivel comunicar com a API de bombas.';
}

function normalizeTotalPages(page: number, limit: number, total: number, totalPages?: number): number {
  if (totalPages && totalPages > 0) {
    return totalPages;
  }

  return Math.max(1, Math.ceil(total / limit), page);
}

export function useBombasPage(): UseBombasPageResult {
  const [bombas, setBombas] = useState<BombaConfigResponse[]>([]);
  const [selectedBomba, setSelectedBomba] = useState<BombaConfigResponse | null>(null);
  const [filters, setFilters] = useState<QueryBombasConfiguracao>(DEFAULT_FILTERS);
  const filtersRef = useRef<QueryBombasConfiguracao>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const summary = useMemo<BombasSummary>(
    () => ({
      total: pagination.total,
      ativas: bombas.filter((bomba) => bomba.status_padrao === 'ATIVA').length,
      indisponiveis: bombas.filter((bomba) => bomba.status_padrao !== 'ATIVA').length,
      automaticas: bombas.filter(
        (bomba) => bomba.entrada_por_pressao || bomba.entrada_por_tempo,
      ).length,
    }),
    [bombas, pagination.total],
  );

  const loadBombas = useCallback(async (query?: QueryBombasConfiguracao): Promise<void> => {
    const nextFilters = { ...filtersRef.current, ...query };

    setIsLoading(true);
    setError(null);

    try {
      const response = await listBombasConfiguracao(nextFilters);
      const page = response.meta.page;
      const limit = response.meta.limit;
      const total = response.meta.total;

      filtersRef.current = nextFilters;
      setBombas(response.data);
      setFilters(nextFilters);
      setPagination({
        page,
        limit,
        total,
        totalPages: normalizeTotalPages(page, limit, total, response.meta.totalPages ?? response.meta.total_pages),
      });
      setSelectedBomba((current) =>
        current ? response.data.find((bomba) => bomba.id_bomba === current.id_bomba) ?? null : null,
      );
    } catch (loadError) {
      setError(getConfiguracoesErrorMessage(loadError));
      setBombas([]);
      setSelectedBomba(null);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void loadBombas());
  }, [loadBombas]);

  const selectBomba = useCallback(async (id_bomba: number | null): Promise<void> => {
    if (!id_bomba) {
      setSelectedBomba(null);
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const bomba = await getBombaConfiguracaoById(id_bomba);
      setSelectedBomba(bomba);
    } catch (selectError) {
      setError(getConfiguracoesErrorMessage(selectError));
      setSelectedBomba(null);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const createBomba = useCallback(async (payload: CreateBombaConfiguracaoDto): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const created = await createBombaConfiguracao(payload);
      setSelectedBomba(created);
      setSuccessMessage('Bomba criada com sucesso.');
      await loadBombas({ page: 1 });
      return true;
    } catch (createError) {
      setError(getConfiguracoesErrorMessage(createError));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [loadBombas]);

  const updateBomba = useCallback(
    async (id_bomba: number, payload: UpdateBombaConfiguracaoDto): Promise<boolean> => {
      if (Object.keys(payload).length === 0) {
        setError('Altere pelo menos um campo antes de salvar.');
        return false;
      }

      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const updated = await updateBombaConfiguracao(id_bomba, payload);
        setSelectedBomba(updated);
        setSuccessMessage('Bomba atualizada com sucesso.');
        await loadBombas();
        return true;
      } catch (updateError) {
        setError(getConfiguracoesErrorMessage(updateError));
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [loadBombas],
  );

  const ativarBomba = useCallback(async (id_bomba: number): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await ativarBombaConfiguracao(id_bomba);
      setSelectedBomba(updated);
      setSuccessMessage('Bomba ativada com sucesso.');
      await loadBombas();
      return true;
    } catch (actionError) {
      setError(getConfiguracoesErrorMessage(actionError));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [loadBombas]);

  const desativarBomba = useCallback(async (id_bomba: number): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await desativarBombaConfiguracao(id_bomba);
      setSelectedBomba(updated);
      setSuccessMessage('Bomba desativada com sucesso.');
      await loadBombas();
      return true;
    } catch (actionError) {
      setError(getConfiguracoesErrorMessage(actionError));
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [loadBombas]);

  const clearMessages = useCallback((): void => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  return {
    bombas,
    selectedBomba,
    endpointState: 'available',
    isLoading,
    actionLoading,
    error,
    successMessage,
    pagination,
    summary,
    filters,
    loadBombas,
    selectBomba,
    createBomba,
    updateBomba,
    ativarBomba,
    desativarBomba,
    clearMessages,
  };
}
