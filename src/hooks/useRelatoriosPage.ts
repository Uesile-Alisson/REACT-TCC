import { useCallback, useEffect, useMemo, useState } from 'react';
import { getRelatorioById, listRelatorios } from '../services/relatorios.service';
import type { ListRelatoriosQuery, RelatorioListResponse } from '../types';
import type { RelatoriosFiltersState, RelatoriosPageData } from '../types';
import { getAuthErrorMessage } from '../utils/authErrors';

type UseRelatoriosPageResult = {
  data: RelatoriosPageData;
  filters: RelatoriosFiltersState;
  isLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;
  detailError: string | null;
  setFilters: (filters: RelatoriosFiltersState) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  selectRelatorio: (idRelatorio: number) => Promise<void>;
};

const DEFAULT_LIMIT = 10;

const initialFilters: RelatoriosFiltersState = {
  tipo_relatorio: '',
  formato: '',
  id_processo: '',
  id_alarme: '',
  data_inicio: '',
  data_fim: '',
};

function normalizeRelatoriosResponse(
  response: RelatorioListResponse,
  fallbackPage: number,
  fallbackLimit: number,
): RelatoriosPageData {
  if (Array.isArray(response)) {
    return {
      relatorios: response,
      selectedRelatorio: null,
      total: response.length,
      page: fallbackPage,
      limit: fallbackLimit,
    };
  }

  return {
    relatorios: response.data,
    selectedRelatorio: null,
    total: response.meta.total,
    page: response.meta.page,
    limit: response.meta.limit,
  };
}

function parsePositiveNumber(value: string): number | undefined {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function buildQuery(
  filters: RelatoriosFiltersState,
  page: number,
  limit: number,
): ListRelatoriosQuery {
  return {
    page,
    limit,
    tipo_relatorio: filters.tipo_relatorio || undefined,
    formato_relatorio: filters.formato || undefined,
    id_processo: parsePositiveNumber(filters.id_processo),
    id_alarme: parsePositiveNumber(filters.id_alarme),
    data_inicio: filters.data_inicio || undefined,
    data_fim: filters.data_fim || undefined,
  };
}

export function useRelatoriosPage(): UseRelatoriosPageResult {
  const [filters, setFiltersState] = useState<RelatoriosFiltersState>(initialFilters);
  const [page, setPageState] = useState<number>(1);
  const [data, setData] = useState<RelatoriosPageData>({
    relatorios: [],
    selectedRelatorio: null,
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const query = useMemo(() => buildQuery(filters, page, DEFAULT_LIMIT), [filters, page]);

  const loadRelatorios = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listRelatorios(query);
      const normalized = normalizeRelatoriosResponse(response, page, DEFAULT_LIMIT);

      setData((currentData) => ({
        ...normalized,
        selectedRelatorio:
          normalized.relatorios.find(
            (relatorio) => relatorio.id_relatorio === currentData.selectedRelatorio?.id_relatorio,
          ) ?? normalized.relatorios[0] ?? null,
      }));
    } catch (loadError: unknown) {
      setError(getAuthErrorMessage(loadError));
      setData((currentData) => ({
        ...currentData,
        relatorios: [],
        total: 0,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [page, query]);

  const setFilters = useCallback((nextFilters: RelatoriosFiltersState): void => {
    setFiltersState(nextFilters);
    setPageState(1);
  }, []);

  const setPage = useCallback((nextPage: number): void => {
    setPageState(Math.max(1, nextPage));
  }, []);

  const selectRelatorio = useCallback(async (idRelatorio: number): Promise<void> => {
    setIsDetailLoading(true);
    setDetailError(null);

    try {
      const relatorio = await getRelatorioById(idRelatorio);

      setData((currentData) => ({
        ...currentData,
        selectedRelatorio: relatorio,
      }));
    } catch (selectError: unknown) {
      setDetailError(getAuthErrorMessage(selectError));
      setData((currentData) => ({
        ...currentData,
        selectedRelatorio:
          currentData.relatorios.find((relatorio) => relatorio.id_relatorio === idRelatorio) ??
          currentData.selectedRelatorio,
      }));
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadRelatorios();
    });
  }, [loadRelatorios]);

  return {
    data,
    filters,
    isLoading,
    isDetailLoading,
    error,
    detailError,
    setFilters,
    setPage,
    refresh: loadRelatorios,
    selectRelatorio,
  };
}
