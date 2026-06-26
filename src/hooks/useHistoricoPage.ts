import { useCallback, useEffect, useState } from 'react';
import {
  getHistoricoDashboard,
  getHistoricoProcessoById,
  listHistoricoAlarmes,
  listHistoricoEventos,
  listHistoricoProcessos,
  listHistoricoRelatorios,
  listHistoricoTanques,
} from '../services/historico.service';
import type {
  AlarmeResponse,
  HistoricoDetailData,
  HistoricoFiltersState,
  HistoricoPageData,
  HistoricoPartialErrors,
  HistoricoProcessoListResponse,
  ProcessoEventResponse,
} from '../types';
import { getAuthErrorMessage } from '../utils/authErrors';

type UseHistoricoPageResult = {
  data: HistoricoPageData;
  filters: HistoricoFiltersState;
  isLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;
  partialErrors: HistoricoPartialErrors;
  setFilters: (filters: HistoricoFiltersState) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  selectProcesso: (idProcesso: number) => Promise<void>;
};

const PAGE_LIMIT = 10;

const initialFilters: HistoricoFiltersState = {
  busca: '',
  status_processo: '',
  data_inicio: '',
  data_fim: '',
  apenas_falha: false,
};

const initialDetail: HistoricoDetailData = {
  processo: null,
  tanques: [],
  alarmes: [],
  eventos: [],
  relatorios: [],
};

const initialData: HistoricoPageData = {
  processos: [],
  summary: null,
  detail: initialDetail,
  total: 0,
  page: 1,
  limit: PAGE_LIMIT,
};

function getListData<TItem>(response: { data: TItem[] } | TItem[]): TItem[] {
  return Array.isArray(response) ? response : response.data;
}

function getTotal(response: HistoricoProcessoListResponse): number {
  return Array.isArray(response) ? response.length : response.meta.total;
}

export function useHistoricoPage(): UseHistoricoPageResult {
  const [data, setData] = useState<HistoricoPageData>(initialData);
  const [filters, setFiltersState] = useState<HistoricoFiltersState>(initialFilters);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [partialErrors, setPartialErrors] = useState<HistoricoPartialErrors>({});

  const loadData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setPartialErrors({});

    const query = {
      page: data.page,
      limit: PAGE_LIMIT,
      busca: filters.busca || undefined,
      status_processo: filters.apenas_falha ? 'FALHA' : filters.status_processo || undefined,
      data_inicio: filters.data_inicio || undefined,
      data_fim: filters.data_fim || undefined,
      order_by: 'criado_em',
      order_direction: 'desc',
    } as const;

    const [summaryResult, listResult] = await Promise.allSettled([
      getHistoricoDashboard({ data_inicio: query.data_inicio, data_fim: query.data_fim }),
      listHistoricoProcessos(query),
    ]);

    const nextErrors: HistoricoPartialErrors = {};
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
      processos: list ? getListData(list) : [],
      total: list ? getTotal(list) : 0,
      limit: PAGE_LIMIT,
    }));

    if (!summary && !list) {
      setError('Nao foi possivel carregar o historico.');
    }

    setIsLoading(false);
  }, [
    data.page,
    filters.apenas_falha,
    filters.busca,
    filters.data_fim,
    filters.data_inicio,
    filters.status_processo,
  ]);

  const selectProcesso = useCallback(async (idProcesso: number): Promise<void> => {
    setIsDetailLoading(true);
    setPartialErrors((currentErrors) => ({ ...currentErrors, detail: undefined }));

    const [processoResult, tanquesResult, alarmesResult, eventosResult, relatoriosResult] =
      await Promise.allSettled([
        getHistoricoProcessoById(idProcesso),
        listHistoricoTanques(idProcesso),
        listHistoricoAlarmes(idProcesso, { limit: 8 }),
        listHistoricoEventos(idProcesso, { limit: 8 }),
        listHistoricoRelatorios(idProcesso),
      ]);

    const nextErrors: HistoricoPartialErrors = {};
    const processo = processoResult.status === 'fulfilled' ? processoResult.value : null;

    if (processoResult.status === 'rejected') {
      nextErrors.detail = getAuthErrorMessage(processoResult.reason);
    }

    if (tanquesResult.status === 'rejected') {
      nextErrors.tanques = getAuthErrorMessage(tanquesResult.reason);
    }

    if (alarmesResult.status === 'rejected') {
      nextErrors.alarmes = getAuthErrorMessage(alarmesResult.reason);
    }

    if (eventosResult.status === 'rejected') {
      nextErrors.eventos = getAuthErrorMessage(eventosResult.reason);
    }

    if (relatoriosResult.status === 'rejected') {
      nextErrors.relatorios = getAuthErrorMessage(relatoriosResult.reason);
    }

    setPartialErrors((currentErrors) => ({ ...currentErrors, ...nextErrors }));
    setData((currentData) => ({
      ...currentData,
      detail: {
        processo,
        tanques: tanquesResult.status === 'fulfilled' ? tanquesResult.value : [],
        alarmes:
          alarmesResult.status === 'fulfilled'
            ? getListData<AlarmeResponse>(alarmesResult.value)
            : [],
        eventos:
          eventosResult.status === 'fulfilled'
            ? getListData<ProcessoEventResponse>(eventosResult.value)
            : [],
        relatorios: relatoriosResult.status === 'fulfilled' ? relatoriosResult.value : [],
      },
    }));

    setIsDetailLoading(false);
  }, []);

  const setFilters = useCallback((nextFilters: HistoricoFiltersState) => {
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
    selectProcesso,
  };
}
