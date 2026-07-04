import { useCallback, useEffect, useState } from 'react';
import {
  getAlarmeById,
  getAlarmesDashboard,
  listAlarmes,
} from '../services/alarmes.service';
import type {
  AlarmeListResponse,
  AlarmeResponse,
  AlarmesFiltersState,
  AlarmesPageData,
  AlarmesPartialErrors,
} from '../types';
import { getAuthErrorMessage } from '../utils/authErrors';

type UseAlarmesPageResult = {
  data: AlarmesPageData;
  filters: AlarmesFiltersState;
  isLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;
  partialErrors: AlarmesPartialErrors;
  setFilters: (filters: AlarmesFiltersState) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  selectAlarme: (idAlarme: number) => Promise<void>;
};

const PAGE_LIMIT = 10;

const initialFilters: AlarmesFiltersState = {
  busca: '',
  severidade: '',
  status_alarme: '',
  id_processo: '',
  data_inicio: '',
  data_fim: '',
  apenas_criticos: false,
};

const initialData: AlarmesPageData = {
  alarmes: [],
  selectedAlarme: null,
  summary: null,
  total: 0,
  page: 1,
  limit: PAGE_LIMIT,
};

function getListData(response: AlarmeListResponse): AlarmeResponse[] {
  return Array.isArray(response) ? response : response.data;
}

function getTotal(response: AlarmeListResponse): number {
  return Array.isArray(response) ? response.length : response.meta.total;
}

function parseOptionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export function useAlarmesPage(): UseAlarmesPageResult {
  const [data, setData] = useState<AlarmesPageData>(initialData);
  const [filters, setFiltersState] = useState<AlarmesFiltersState>(initialFilters);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [partialErrors, setPartialErrors] = useState<AlarmesPartialErrors>({});

  const loadData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setPartialErrors({});

    const query = {
      page: data.page,
      limit: PAGE_LIMIT,
      busca: filters.busca || undefined,
      severidade: filters.apenas_criticos ? 'CRITICO' : filters.severidade || undefined,
      status_alarme: filters.status_alarme || undefined,
      id_processo: parseOptionalNumber(filters.id_processo),
      ocorrido_de: filters.data_inicio || undefined,
      ocorrido_ate: filters.data_fim || undefined,
      apenas_criticos: filters.apenas_criticos || undefined,
      order_by: 'ocorrido_em',
      order_direction: 'desc',
    } as const;

    const [summaryResult, listResult] = await Promise.allSettled([
      getAlarmesDashboard(query),
      listAlarmes(query),
    ]);

    const nextErrors: AlarmesPartialErrors = {};
    const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
    const list = listResult.status === 'fulfilled' ? listResult.value : null;

    if (summaryResult.status === 'rejected') {
      nextErrors.summary = getAuthErrorMessage(summaryResult.reason);
    }

    if (listResult.status === 'rejected') {
      nextErrors.list = getAuthErrorMessage(listResult.reason);
    }

    setPartialErrors(nextErrors);
    setData((currentData) => ({
      ...currentData,
      summary,
      alarmes: list ? getListData(list) : [],
      total: list ? getTotal(list) : 0,
      limit: PAGE_LIMIT,
    }));

    if (!summary && !list) {
      setError('Nao foi possivel carregar os alarmes.');
    }

    setIsLoading(false);
  }, [
    data.page,
    filters.apenas_criticos,
    filters.busca,
    filters.data_fim,
    filters.data_inicio,
    filters.id_processo,
    filters.severidade,
    filters.status_alarme,
  ]);

  const selectAlarme = useCallback(async (idAlarme: number): Promise<void> => {
    setIsDetailLoading(true);
    setPartialErrors((currentErrors) => ({ ...currentErrors, detail: undefined }));

    try {
      const selectedAlarme = await getAlarmeById(idAlarme);

      setData((currentData) => ({ ...currentData, selectedAlarme }));
    } catch (detailError: unknown) {
      setPartialErrors((currentErrors) => ({
        ...currentErrors,
        detail: getAuthErrorMessage(detailError),
      }));
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const setFilters = useCallback((nextFilters: AlarmesFiltersState) => {
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
    partialErrors,
    setFilters,
    setPage,
    refresh: loadData,
    selectAlarme,
  };
}
