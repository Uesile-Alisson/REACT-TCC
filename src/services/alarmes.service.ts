import { api } from '../api/axios';
import type {
  AlarmeDashboardResponse,
  AlarmeListResponse,
  AlarmeResponse,
  ListAlarmesQuery,
  ResolveAlarmeRequest,
} from '../types/alarmes.types';

export async function listAlarmes(query?: ListAlarmesQuery): Promise<AlarmeListResponse> {
  const { data } = await api.get<AlarmeListResponse>('/alarmes', { params: query });

  return data;
}

export async function getAlarmesDashboard(
  query?: ListAlarmesQuery,
): Promise<AlarmeDashboardResponse> {
  const { data } = await api.get<AlarmeDashboardResponse>('/alarmes/dashboard', {
    params: query,
  });

  return data;
}

export async function listActiveAlarmes(query?: ListAlarmesQuery): Promise<AlarmeListResponse> {
  const { data } = await api.get<AlarmeListResponse>('/alarmes/ativos', { params: query });

  return data;
}

export async function listCriticalAlarmes(query?: ListAlarmesQuery): Promise<AlarmeListResponse> {
  const { data } = await api.get<AlarmeListResponse>('/alarmes/criticos', { params: query });

  return data;
}

export async function listAlarmesByProcesso(
  idProcesso: number,
  query?: ListAlarmesQuery,
): Promise<AlarmeListResponse> {
  const { data } = await api.get<AlarmeListResponse>(`/alarmes/processo/${idProcesso}`, {
    params: query,
  });

  return data;
}

export async function listActiveAlarmesByProcesso(
  idProcesso: number,
  query?: ListAlarmesQuery,
): Promise<AlarmeListResponse> {
  const { data } = await api.get<AlarmeListResponse>(
    `/alarmes/processo/${idProcesso}/ativos`,
    { params: query },
  );

  return data;
}

export async function listCriticalAlarmesByProcesso(
  idProcesso: number,
  query?: ListAlarmesQuery,
): Promise<AlarmeListResponse> {
  const { data } = await api.get<AlarmeListResponse>(
    `/alarmes/processo/${idProcesso}/criticos`,
    { params: query },
  );

  return data;
}

export async function getAlarmeById(id: number): Promise<AlarmeResponse> {
  const { data } = await api.get<AlarmeResponse>(`/alarmes/${id}`);

  return data;
}

export async function resolveAlarme(
  id: number,
  payload: ResolveAlarmeRequest,
): Promise<AlarmeResponse> {
  const { data } = await api.patch<AlarmeResponse>(`/alarmes/${id}/resolver`, payload);

  return data;
}

export const alarmesService = {
  listAlarmes,
  getAlarmesDashboard,
  listActiveAlarmes,
  listCriticalAlarmes,
  listAlarmesByProcesso,
  listActiveAlarmesByProcesso,
  listCriticalAlarmesByProcesso,
  getAlarmeById,
  resolveAlarme,
};
