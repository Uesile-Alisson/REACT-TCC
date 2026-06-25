import type {
  AlarmeResponse,
  HistoricoDashboardResponse,
  HistoricoProcessoResponse,
  HistoricoTanqueSummary,
  ProcessoEventResponse,
  RelatorioResponse,
} from './index';

export type HistoricoStatusFilter = '' | 'CONCLUIDO' | 'INTERROMPIDO' | 'FALHA';

export type HistoricoFiltersState = {
  busca: string;
  status_processo: HistoricoStatusFilter;
  data_inicio: string;
  data_fim: string;
  apenas_falha: boolean;
};

export type HistoricoDetailData = {
  processo: HistoricoProcessoResponse | null;
  tanques: HistoricoTanqueSummary[];
  alarmes: AlarmeResponse[];
  eventos: ProcessoEventResponse[];
  relatorios: RelatorioResponse[];
};

export type HistoricoPageData = {
  processos: HistoricoProcessoResponse[];
  summary: HistoricoDashboardResponse | null;
  detail: HistoricoDetailData;
  total: number;
  page: number;
  limit: number;
};

export type HistoricoPartialErrors = {
  list?: string;
  summary?: string;
  detail?: string;
  tanques?: string;
  alarmes?: string;
  eventos?: string;
  relatorios?: string;
};

export type HistoricoPermissions = {
  canViewHistorico: boolean;
  canViewHistoricoDetail: boolean;
  canGenerateHistoricoReport: boolean;
  canDeleteHistorico: boolean;
};
