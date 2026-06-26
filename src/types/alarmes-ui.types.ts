import type { AlarmeDashboardResponse, AlarmeResponse } from './alarmes.types';
import type { SeveridadeAlarme, StatusAlarme } from './common.types';

export type AlarmesFiltersState = {
  busca: string;
  severidade: SeveridadeAlarme | '';
  status_alarme: StatusAlarme | '';
  id_processo: string;
  data_inicio: string;
  data_fim: string;
  apenas_criticos: boolean;
};

export type AlarmesPageData = {
  alarmes: AlarmeResponse[];
  selectedAlarme: AlarmeResponse | null;
  summary: AlarmeDashboardResponse | null;
  total: number;
  page: number;
  limit: number;
};

export type AlarmesPartialErrors = {
  list?: string;
  summary?: string;
  detail?: string;
};

export type AlarmesPermissions = {
  canViewAlarmes: boolean;
  canViewAlarmeDetails: boolean;
  canResolveAlarme: (status: StatusAlarme) => boolean;
  canGenerateAlarmeReport: boolean;
};
