import { createApiFileResponse } from '../api/file-response';
import { ApiError } from '../api/api-error';
import { api } from '../api/axios';
import type { ApiErrorPayload } from '../types';
import type { ApiFileResponse } from '../types/common.types';
import type {
  GenerateAlarmReportRequest,
  GenerateProcessReportRequest,
  ListRelatoriosQuery,
  RelatorioGenerationResult,
  RelatorioListResponse,
  RelatorioResponse,
  SingleRelatorioGenerationResult,
} from '../types/relatorios.types';

function getHeader(headers: Record<string, unknown>, key: string): string | undefined {
  const value = headers[key];

  return typeof value === 'string' ? value : undefined;
}

function getNumericHeader(headers: Record<string, unknown>, key: string): number | undefined {
  const value = headers[key];

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function isErrorContentType(contentType?: string): boolean {
  return Boolean(
    contentType?.includes('application/json') ||
      contentType?.includes('text/plain') ||
      contentType?.includes('text/html'),
  );
}

function getPayloadMessage(payload: ApiErrorPayload): string | null {
  if (!payload.message) {
    return null;
  }

  if (Array.isArray(payload.message)) {
    return payload.message[0] ?? null;
  }

  return payload.message;
}

async function assertFileBlob(blob: Blob, contentType?: string): Promise<void> {
  if (!isErrorContentType(contentType)) {
    return;
  }

  const text = await blob.text();

  try {
    const payload = JSON.parse(text) as ApiErrorPayload;
    throw new ApiError(getPayloadMessage(payload) ?? 'Nao foi possivel obter o arquivo.', payload.statusCode);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(text || 'Nao foi possivel obter o arquivo.');
  }
}

async function getRelatorioFile(path: string): Promise<ApiFileResponse> {
  const response = await api.get<Blob>(path, { responseType: 'blob' });
  const headers = response.headers as Record<string, unknown>;
  const contentType = getHeader(headers, 'content-type');

  await assertFileBlob(response.data, contentType);

  return createApiFileResponse(
    response.data,
    getHeader(headers, 'content-disposition'),
    contentType,
    getNumericHeader(headers, 'content-length'),
  );
}

export async function listRelatorios(query?: ListRelatoriosQuery): Promise<RelatorioListResponse> {
  const { data } = await api.get<RelatorioListResponse>('/relatorios', { params: query });

  return data;
}

export async function generateProcessReport(
  idProcesso: number,
  payload: GenerateProcessReportRequest,
): Promise<RelatorioGenerationResult> {
  const { data } = await api.post<RelatorioGenerationResult>(
    `/relatorios/processos/${idProcesso}`,
    payload,
  );

  return data;
}

export async function generateAlarmReport(
  idAlarme: number,
  payload: GenerateAlarmReportRequest,
): Promise<SingleRelatorioGenerationResult> {
  const { data } = await api.post<SingleRelatorioGenerationResult>(
    `/relatorios/alarmes/${idAlarme}`,
    payload,
  );

  return data;
}

export async function previewRelatorio(idRelatorio: number): Promise<ApiFileResponse> {
  return getRelatorioFile(`/relatorios/${idRelatorio}/preview`);
}

export async function downloadRelatorio(idRelatorio: number): Promise<ApiFileResponse> {
  return getRelatorioFile(`/relatorios/${idRelatorio}/download`);
}

export async function getRelatorioById(idRelatorio: number): Promise<RelatorioResponse> {
  const { data } = await api.get<RelatorioResponse>(`/relatorios/${idRelatorio}`);

  return data;
}

export const relatoriosService = {
  listRelatorios,
  generateProcessReport,
  generateAlarmReport,
  previewRelatorio,
  downloadRelatorio,
  getRelatorioById,
};
