import { api } from '../api/axios';
import type {
  HistoricoAlarmesResponse,
  HistoricoDashboardQuery,
  HistoricoDashboardResponse,
  HistoricoEventosResponse,
  HistoricoProcessoAlarmesQuery,
  HistoricoProcessoEventosQuery,
  HistoricoProcessoListResponse,
  HistoricoProcessoResponse,
  HistoricoRelatoriosResponse,
  HistoricoTanqueComparisonResponse,
  HistoricoTanqueSummary,
  HistoricoVacuoChartQuery,
  HistoricoVacuoChartResponse,
  ListHistoricoProcessosQuery,
} from '../types/historico.types';

export async function listHistoricoProcessos(
  query?: ListHistoricoProcessosQuery,
): Promise<HistoricoProcessoListResponse> {
  const { data } = await api.get<HistoricoProcessoListResponse>('/historico/processos', {
    params: query,
  });

  return data;
}

export async function getHistoricoDashboard(
  query?: HistoricoDashboardQuery,
): Promise<HistoricoDashboardResponse> {
  const { data } = await api.get<HistoricoDashboardResponse>('/historico/dashboard', {
    params: query,
  });

  return data;
}

export async function getHistoricoProcessoById(
  idProcesso: number,
): Promise<HistoricoProcessoResponse> {
  const { data } = await api.get<HistoricoProcessoResponse>(
    `/historico/processos/${idProcesso}`,
  );

  return data;
}

export async function listHistoricoTanques(
  idProcesso: number,
): Promise<HistoricoTanqueSummary[]> {
  const { data } = await api.get<HistoricoTanqueSummary[]>(
    `/historico/processos/${idProcesso}/tanques`,
  );

  return data;
}

export async function listHistoricoAlarmes(
  idProcesso: number,
  query?: HistoricoProcessoAlarmesQuery,
): Promise<HistoricoAlarmesResponse> {
  const { data } = await api.get<HistoricoAlarmesResponse>(
    `/historico/processos/${idProcesso}/alarmes`,
    { params: query },
  );

  return data;
}

export async function listHistoricoEventos(
  idProcesso: number,
  query?: HistoricoProcessoEventosQuery,
): Promise<HistoricoEventosResponse> {
  const { data } = await api.get<HistoricoEventosResponse>(
    `/historico/processos/${idProcesso}/eventos`,
    { params: query },
  );

  return data;
}

export async function listHistoricoRelatorios(
  idProcesso: number,
): Promise<HistoricoRelatoriosResponse> {
  const { data } = await api.get<HistoricoRelatoriosResponse>(
    `/historico/processos/${idProcesso}/relatorios`,
  );

  return data;
}

export async function getHistoricoVacuoChart(
  idProcesso: number,
  query?: HistoricoVacuoChartQuery,
): Promise<HistoricoVacuoChartResponse> {
  const { data } = await api.get<HistoricoVacuoChartResponse>(
    `/historico/processos/${idProcesso}/grafico-vacuo`,
    { params: query },
  );

  return data;
}

export async function getHistoricoProcessoDashboard(
  idProcesso: number,
): Promise<HistoricoDashboardResponse> {
  const { data } = await api.get<HistoricoDashboardResponse>(
    `/historico/processos/${idProcesso}/dashboard`,
  );

  return data;
}

export async function getHistoricoTanquesComparison(
  idProcesso: number,
): Promise<HistoricoTanqueComparisonResponse> {
  const { data } = await api.get<HistoricoTanqueComparisonResponse>(
    `/historico/processos/${idProcesso}/comparativo-tanques`,
  );

  return data;
}

export const historicoService = {
  listHistoricoProcessos,
  getHistoricoDashboard,
  getHistoricoProcessoById,
  listHistoricoTanques,
  listHistoricoAlarmes,
  listHistoricoEventos,
  listHistoricoRelatorios,
  getHistoricoVacuoChart,
  getHistoricoProcessoDashboard,
  getHistoricoTanquesComparison,
};
