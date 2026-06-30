import { api } from '../api/axios';
import type {
  CreateProcessoRequest,
  FinalizarProcessoRequest,
  InterromperProcessoRequest,
  ListProcessosQuery,
  ParadaEmergenciaProcessoRequest,
  ProcessoDashboardResponse,
  ProcessoEventListResponse,
  ProcessoListResponse,
  ProcessoPrecheckResponse,
  ProcessoReadingListResponse,
  ProcessoReadingQuery,
  ProcessoResponse,
  ProcessoValvulaAcaoResponse,
  ProcessoValvulaResumo,
  UpdateProcessoConfigRequest,
} from '../types/processos.types';

export async function createProcesso(payload: CreateProcessoRequest): Promise<ProcessoResponse> {
  const { data } = await api.post<ProcessoResponse>('/processos', payload);

  return data;
}

export async function listProcessos(query?: ListProcessosQuery): Promise<ProcessoListResponse> {
  const { data } = await api.get<ProcessoListResponse>('/processos', { params: query });

  return data;
}

export async function getActiveProcesso(): Promise<ProcessoResponse | null> {
  const { data } = await api.get<ProcessoResponse | null>('/processos/ativo');

  return data;
}

export async function getProcessoById(id: number): Promise<ProcessoResponse> {
  const { data } = await api.get<ProcessoResponse>(`/processos/${id}`);

  return data;
}

export async function getProcessoDashboard(id: number): Promise<ProcessoDashboardResponse> {
  const { data } = await api.get<ProcessoDashboardResponse>(`/processos/${id}/dashboard`);

  return data;
}

export async function updateProcessoConfig(
  id: number,
  payload: UpdateProcessoConfigRequest,
): Promise<ProcessoResponse> {
  const { data } = await api.patch<ProcessoResponse>(`/processos/${id}/config`, payload);

  return data;
}

export async function startProcesso(id: number): Promise<ProcessoResponse> {
  const { data } = await api.post<ProcessoResponse>(`/processos/${id}/iniciar`);

  return data;
}

export async function pauseProcesso(id: number): Promise<ProcessoResponse> {
  const { data } = await api.post<ProcessoResponse>(`/processos/${id}/pausar`);

  return data;
}

export async function resumeProcesso(id: number): Promise<ProcessoResponse> {
  const { data } = await api.post<ProcessoResponse>(`/processos/${id}/retomar`);

  return data;
}

export async function finishProcesso(
  id: number,
  payload: FinalizarProcessoRequest,
): Promise<ProcessoResponse> {
  const { data } = await api.post<ProcessoResponse>(`/processos/${id}/finalizar`, payload);

  return data;
}

export async function interruptProcesso(
  id: number,
  payload: InterromperProcessoRequest,
): Promise<ProcessoResponse> {
  const { data } = await api.post<ProcessoResponse>(`/processos/${id}/interromper`, payload);

  return data;
}

export async function emergencyStopProcesso(
  id: number,
  payload: ParadaEmergenciaProcessoRequest,
): Promise<ProcessoResponse> {
  const { data } = await api.post<ProcessoResponse>(
    `/processos/${id}/parada-emergencia`,
    payload,
  );

  return data;
}

export async function getProcessoReadings(
  idProcesso: number,
  query?: ProcessoReadingQuery,
): Promise<ProcessoReadingListResponse> {
  const { data } = await api.get<ProcessoReadingListResponse>(
    `/leituras-eventos/processos/${idProcesso}/leituras`,
    { params: query },
  );

  return data;
}

export async function getProcessoEvents(
  idProcesso: number,
): Promise<ProcessoEventListResponse> {
  const { data } = await api.get<ProcessoEventListResponse>(
    `/leituras-eventos/processos/${idProcesso}/eventos`,
  );

  return data;
}

export async function getPrechecagem(idProcesso: number): Promise<ProcessoPrecheckResponse> {
  const { data } = await api.get<ProcessoPrecheckResponse>(`/processos/${idProcesso}/prechecagem`);

  return data;
}

export async function executarPrechecagem(idProcesso: number): Promise<ProcessoPrecheckResponse> {
  const { data } = await api.post<ProcessoPrecheckResponse>(
    `/processos/${idProcesso}/prechecagem/executar`,
  );

  return data;
}

export async function validarAcoplamentoTanque(
  idProcesso: number,
  idTanque: number,
): Promise<ProcessoPrecheckResponse> {
  const { data } = await api.post<ProcessoPrecheckResponse>(
    `/processos/${idProcesso}/tanques/${idTanque}/acoplamento/validar`,
  );

  return data;
}

export async function validarSensorProcesso(
  idProcesso: number,
  idSensor: number,
): Promise<ProcessoPrecheckResponse> {
  const { data } = await api.post<ProcessoPrecheckResponse>(
    `/processos/${idProcesso}/sensores/${idSensor}/validar`,
  );

  return data;
}

export async function listarValvulasProcesso(
  idProcesso: number,
): Promise<ProcessoValvulaResumo[]> {
  const { data } = await api.get<ProcessoValvulaResumo[]>(`/processos/${idProcesso}/valvulas`);

  return data;
}

export async function validarValvulaProcesso(
  idProcesso: number,
  idValvula: number,
): Promise<ProcessoValvulaAcaoResponse> {
  const { data } = await api.post<ProcessoValvulaAcaoResponse>(
    `/processos/${idProcesso}/valvulas/${idValvula}/validar`,
  );

  return data;
}

export async function abrirValvulaProcesso(
  idProcesso: number,
  idValvula: number,
): Promise<ProcessoValvulaAcaoResponse> {
  const { data } = await api.post<ProcessoValvulaAcaoResponse>(
    `/processos/${idProcesso}/valvulas/${idValvula}/abrir`,
  );

  return data;
}

export async function fecharValvulaProcesso(
  idProcesso: number,
  idValvula: number,
): Promise<ProcessoValvulaAcaoResponse> {
  const { data } = await api.post<ProcessoValvulaAcaoResponse>(
    `/processos/${idProcesso}/valvulas/${idValvula}/fechar`,
  );

  return data;
}

export const processosService = {
  createProcesso,
  listProcessos,
  getActiveProcesso,
  getProcessoById,
  getProcessoDashboard,
  updateProcessoConfig,
  startProcesso,
  pauseProcesso,
  resumeProcesso,
  finishProcesso,
  interruptProcesso,
  emergencyStopProcesso,
  getProcessoReadings,
  getProcessoEvents,
  getPrechecagem,
  executarPrechecagem,
  validarAcoplamentoTanque,
  validarSensorProcesso,
  listarValvulasProcesso,
  validarValvulaProcesso,
  abrirValvulaProcesso,
  fecharValvulaProcesso,
};
