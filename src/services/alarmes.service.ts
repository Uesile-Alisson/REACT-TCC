import { api } from '../api/axios';
import { ApiError } from '../api/api-error';
import type {
  AcknowledgeAlarmeRequest,
  AlarmeDashboardResponse,
  AlarmeListResponse,
  AlarmeResponse,
  AlarmAcknowledgement,
  ListAlarmesQuery,
  ResolveAlarmeRequest,
  ResolveAlarmeResponse,
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

export async function getActiveAlarms(query?: ListAlarmesQuery): Promise<AlarmeListResponse> {
  return listActiveAlarmes(query);
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

export async function getAlarmById(id: number): Promise<AlarmeResponse> {
  return getAlarmeById(id);
}

export async function acknowledgeAlarm(
  id: number,
  payload: AcknowledgeAlarmeRequest = {},
): Promise<AlarmAcknowledgement> {
  const { data } = await api.post<AlarmAcknowledgement>(`/alarmes/${id}/reconhecer`, payload);

  return data;
}

export async function resolveAlarme(
  id: number,
  payload: ResolveAlarmeRequest,
): Promise<ResolveAlarmeResponse> {
  const { data } = await api.patch<ResolveAlarmeResponse>(`/alarmes/${id}/resolver`, payload);

  return data;
}

export async function resolveAlarm(
  id: number,
  payload: ResolveAlarmeRequest = {},
): Promise<ResolveAlarmeResponse> {
  return resolveAlarme(id, payload);
}

export function getAlarmeActionErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.statusCode === 409) {
    return error.message || 'A API recusou a acao porque o alarme ainda depende de normalizacao tecnica.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Nao foi possivel concluir a acao do alarme.';
}

export const alarmesService = {
  listAlarmes,
  getAlarmesDashboard,
  listActiveAlarmes,
  getActiveAlarms,
  listCriticalAlarmes,
  listAlarmesByProcesso,
  listActiveAlarmesByProcesso,
  listCriticalAlarmesByProcesso,
  getAlarmeById,
  getAlarmById,
  acknowledgeAlarm,
  resolveAlarme,
  resolveAlarm,
};
