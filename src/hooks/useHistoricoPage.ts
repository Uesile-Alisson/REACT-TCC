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
  HistoricoProcessoResponse,
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

function getListData<TItem>(response: { data?: TItem[] } | TItem[] | null | undefined): TItem[] {
  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response?.data) ? response.data : [];
}

function getTotal(response: HistoricoProcessoListResponse | null | undefined): number {
  if (Array.isArray(response)) {
    return response.length;
  }

  return response?.meta?.total ?? getListData(response).length;
}

function getProcessoTimestamp(processo: HistoricoProcessoResponse): number {
  const rawTimestamp = processo.finalizado_em ?? processo.iniciado_em;

  if (!rawTimestamp) {
    return 0;
  }

  const timestamp = new Date(rawTimestamp).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function mergeHistoricoProcessos(
  responses: HistoricoProcessoListResponse[],
  page: number,
): { processos: HistoricoProcessoResponse[]; total: number } {
  const uniqueProcessos = new Map<number, HistoricoProcessoResponse>();
  const total = responses.reduce((currentTotal, response) => currentTotal + getTotal(response), 0);

  responses.flatMap(getListData<HistoricoProcessoResponse>).forEach((processo) => {
    uniqueProcessos.set(processo.id_processo, processo);
  });

  const start = (page - 1) * PAGE_LIMIT;
  const processos = Array.from(uniqueProcessos.values())
    .sort((current, next) => getProcessoTimestamp(next) - getProcessoTimestamp(current))
    .slice(start, start + PAGE_LIMIT);

  return { processos, total };
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
      limit: filters.apenas_falha ? PAGE_LIMIT * data.page : PAGE_LIMIT,
      busca: filters.busca || undefined,
      data_inicio: filters.data_inicio || undefined,
      data_fim: filters.data_fim || undefined,
      order_by: 'criado_em',
      order_direction: 'desc',
    } as const;

    try {
      const [summaryResult, listResult] = await Promise.allSettled([
        getHistoricoDashboard({ data_inicio: query.data_inicio, data_fim: query.data_fim }),
        filters.apenas_falha
          ? Promise.all([
              listHistoricoProcessos({ ...query, page: 1, status_processo: 'FALHA' }),
              listHistoricoProcessos({ ...query, page: 1, status_processo: 'INTERROMPIDO' }),
            ])
          : listHistoricoProcessos({
              ...query,
              status_processo: filters.status_processo || undefined,
            }),
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

      const historicoList =
        list && filters.apenas_falha
          ? mergeHistoricoProcessos(list as HistoricoProcessoListResponse[], data.page)
          : {
              processos: getListData(list as HistoricoProcessoListResponse | null),
              total: getTotal(list as HistoricoProcessoListResponse | null),
            };

      setPartialErrors(nextErrors);
      setData((currentData) => ({
        ...currentData,
        summary,
        processos: historicoList.processos,
        total: historicoList.total,
        limit: PAGE_LIMIT,
      }));

      if (!summary && !list) {
        setError('Nao foi possivel carregar o historico.');
      }
    } catch (loadError: unknown) {
      setError(getAuthErrorMessage(loadError));
      setPartialErrors({});
      setData((currentData) => ({
        ...currentData,
        summary: null,
        processos: [],
        total: 0,
        limit: PAGE_LIMIT,
      }));
    } finally {
      setIsLoading(false);
    }
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

    try {
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
    } catch (detailError: unknown) {
      setPartialErrors((currentErrors) => ({
        ...currentErrors,
        detail: getAuthErrorMessage(detailError),
      }));
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const setFilters = useCallback((nextFilters: HistoricoFiltersState) => {
    setFiltersState(nextFilters);
    setData((currentData) => ({ ...currentData, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setData((currentData) => ({ ...currentData, page }));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
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
