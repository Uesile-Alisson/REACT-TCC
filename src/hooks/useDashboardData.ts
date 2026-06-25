import { useCallback, useEffect, useState } from 'react';
import { getAlarmesDashboard, listAlarmes } from '../services/alarmes.service';
import { getHistoricoDashboard, listHistoricoProcessos } from '../services/historico.service';
import { getMqttHardwareStatus } from '../services/mqtt-hardware.service';
import { getActiveProcesso } from '../services/processos.service';
import { listRelatorios } from '../services/relatorios.service';
import type {
  DashboardData,
  DashboardLoadState,
  DashboardPartialErrors,
} from '../types/dashboard.types';
import type { HistoricoProcessoListResponse, HistoricoProcessoResponse } from '../types/historico.types';
import type { RelatorioListResponse } from '../types/relatorios.types';
import { getAuthErrorMessage } from '../utils/authErrors';

const initialData: DashboardData = {
  activeProcess: null,
  lastProcess: null,
  recentAlarms: [],
  alarmsSummary: null,
  historySummary: null,
  hardwareStatus: null,
  reportsCount: null,
  updatedAt: null,
};

function countRelatorios(response: RelatorioListResponse): number {
  if (Array.isArray(response)) {
    return response.length;
  }

  return response.meta.total;
}

function getListData<TItem>(response: { data: TItem[] } | TItem[]): TItem[] {
  return Array.isArray(response) ? response : response.data;
}

function getLastProcess(response: HistoricoProcessoListResponse): HistoricoProcessoResponse | null {
  const processes = getListData(response);

  return processes[0] ?? null;
}

function getSettledValue<TValue>(
  result: PromiseSettledResult<TValue>,
  key: keyof DashboardPartialErrors,
  partialErrors: DashboardPartialErrors,
): TValue | null {
  if (result.status === 'fulfilled') {
    return result.value;
  }

  partialErrors[key] = getAuthErrorMessage(result.reason);

  return null;
}

export function useDashboardData(): DashboardLoadState {
  const [data, setData] = useState<DashboardData>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [partialErrors, setPartialErrors] = useState<DashboardPartialErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadDashboardData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setPartialErrors({});

    const results = await Promise.allSettled([
      getActiveProcesso(),
      listHistoricoProcessos({
        limit: 1,
        order_by: 'finalizado_em',
        order_direction: 'desc',
      }),
      getAlarmesDashboard({ limit: 5 }),
      listAlarmes({ limit: 5, order_by: 'criado_em', order_direction: 'desc' }),
      getHistoricoDashboard(),
      getMqttHardwareStatus(),
      listRelatorios({ limit: 1 }),
    ]);

    const nextPartialErrors: DashboardPartialErrors = {};
    const activeProcess = getSettledValue(results[0], 'activeProcess', nextPartialErrors);
    const lastProcessResponse = getSettledValue(results[1], 'lastProcess', nextPartialErrors);
    const alarmsSummary = getSettledValue(results[2], 'alarms', nextPartialErrors);
    const recentAlarmsResponse = getSettledValue(results[3], 'alarms', nextPartialErrors);
    const historySummary = getSettledValue(results[4], 'history', nextPartialErrors);
    const hardwareStatus = getSettledValue(results[5], 'hardware', nextPartialErrors);
    const reports = getSettledValue(results[6], 'reports', nextPartialErrors);

    setPartialErrors(nextPartialErrors);
    setData({
      activeProcess,
      lastProcess: lastProcessResponse ? getLastProcess(lastProcessResponse) : null,
      recentAlarms: recentAlarmsResponse ? getListData(recentAlarmsResponse) : [],
      alarmsSummary,
      historySummary,
      hardwareStatus,
      reportsCount: reports ? countRelatorios(reports) : null,
      updatedAt: new Date().toISOString(),
    });

    const failedRequests = results.filter((result) => result.status === 'rejected').length;

    if (failedRequests === results.length) {
      setError('Nao foi possivel carregar os dados do dashboard.');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadDashboardData();
    });
  }, [loadDashboardData]);

  return {
    data,
    error,
    partialErrors,
    isLoading,
    refresh: loadDashboardData,
  };
}
