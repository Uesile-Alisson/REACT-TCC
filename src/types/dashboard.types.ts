import type { AlarmeDashboardResponse, AlarmeResponse } from './alarmes.types';
import type { HistoricoDashboardResponse, HistoricoProcessoResponse } from './historico.types';
import type { MqttHardwareStatusResponse } from './mqtt-hardware.types';
import type { ProcessoResponse } from './processos.types';

export type DashboardPartialErrors = {
  activeProcess?: string;
  lastProcess?: string;
  alarms?: string;
  history?: string;
  hardware?: string;
  reports?: string;
};

export type DashboardData = {
  activeProcess: ProcessoResponse | null;
  lastProcess: HistoricoProcessoResponse | null;
  recentAlarms: AlarmeResponse[];
  alarmsSummary: AlarmeDashboardResponse | null;
  historySummary: HistoricoDashboardResponse | null;
  hardwareStatus: MqttHardwareStatusResponse | null;
  reportsCount: number | null;
  updatedAt: string | null;
};

export type DashboardLoadState = {
  data: DashboardData;
  error: string | null;
  partialErrors: DashboardPartialErrors;
  isLoading: boolean;
  refresh: () => Promise<void>;
};
