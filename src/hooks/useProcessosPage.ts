import { useCallback, useEffect, useState } from 'react';
import {
  getActiveProcesso,
  getProcessoById,
  getProcessoEvents,
  getProcessoReadings,
  listProcessos,
} from '../services/processos.service';
import type {
  ProcessoListResponse,
  ProcessoResponse,
  ProcessosFilters,
  ProcessosPageData,
} from '../types';
import { getAuthErrorMessage } from '../utils/authErrors';

type UseProcessosPageResult = {
  data: ProcessosPageData;
  filters: ProcessosFilters;
  isLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;
  detailError: string | null;
  setFilters: (filters: ProcessosFilters) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  selectProcess: (idProcesso: number) => Promise<void>;
};

const PAGE_LIMIT = 8;

const initialData: ProcessosPageData = {
  activeProcess: null,
  processes: [],
  selectedProcess: null,
  selectedReadings: [],
  selectedEvents: [],
  total: 0,
  page: 1,
  limit: PAGE_LIMIT,
};

function getListData<TItem>(response: { data: TItem[] } | TItem[]): TItem[] {
  return Array.isArray(response) ? response : response.data;
}

function getTotal(response: ProcessoListResponse): number {
  return Array.isArray(response) ? response.length : response.meta.total;
}

export function useProcessosPage(): UseProcessosPageResult {
  const [data, setData] = useState<ProcessosPageData>(initialData);
  const [filters, setFiltersState] = useState<ProcessosFilters>({ busca: '', status: '' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const [activeProcess, processesResponse] = await Promise.all([
        getActiveProcesso(),
        listProcessos({
          page: data.page,
          limit: PAGE_LIMIT,
          busca: filters.busca || undefined,
          status_processo: filters.status || undefined,
        }),
      ]);

      setData((currentData) => ({
        ...currentData,
        activeProcess,
        processes: getListData<ProcessoResponse>(processesResponse),
        total: getTotal(processesResponse),
        limit: PAGE_LIMIT,
      }));
    } catch (loadError: unknown) {
      setError(getAuthErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [data.page, filters.busca, filters.status]);

  const selectProcess = useCallback(async (idProcesso: number): Promise<void> => {
    setIsDetailLoading(true);
    setDetailError(null);

    try {
      const [selectedProcess, selectedReadings, selectedEvents] = await Promise.all([
        getProcessoById(idProcesso),
        getProcessoReadings(idProcesso, { limit: 8 }),
        getProcessoEvents(idProcesso),
      ]);

      setData((currentData) => ({
        ...currentData,
        selectedProcess,
        selectedReadings: getListData(selectedReadings),
        selectedEvents: getListData(selectedEvents).slice(0, 8),
      }));
    } catch (loadError: unknown) {
      setDetailError(getAuthErrorMessage(loadError));
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const setFilters = useCallback((nextFilters: ProcessosFilters) => {
    setFiltersState(nextFilters);
    setData((currentData) => ({ ...currentData, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setData((currentData) => ({ ...currentData, page }));
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
    });
  }, [loadData]);

  return {
    data,
    filters,
    isLoading,
    isDetailLoading,
    error,
    detailError,
    setFilters,
    setPage,
    refresh: loadData,
    selectProcess,
  };
}
