import { api } from '../api/axios';
import type {
  CreateTanqueConfiguracaoDto,
  QueryTanquesConfiguracao,
  TanqueConfigResponse,
  TanquesConfiguracaoListResponse,
  UpdateTanqueConfiguracaoDto,
} from '../types';

const TANQUES_CONFIGURACAO_ENDPOINT = '/configuracoes/tanques';

export async function listTanquesConfiguracao(
  query?: QueryTanquesConfiguracao,
): Promise<TanquesConfiguracaoListResponse> {
  const { data } = await api.get<TanquesConfiguracaoListResponse>(
    TANQUES_CONFIGURACAO_ENDPOINT,
    { params: query },
  );

  return data;
}

export async function getTanqueConfiguracaoById(
  id_tanque: number,
): Promise<TanqueConfigResponse> {
  const { data } = await api.get<TanqueConfigResponse>(
    `${TANQUES_CONFIGURACAO_ENDPOINT}/${id_tanque}`,
  );

  return data;
}

export async function createTanqueConfiguracao(
  payload: CreateTanqueConfiguracaoDto,
): Promise<TanqueConfigResponse> {
  const { data } = await api.post<TanqueConfigResponse>(
    TANQUES_CONFIGURACAO_ENDPOINT,
    payload,
  );

  return data;
}

export async function updateTanqueConfiguracao(
  id_tanque: number,
  payload: UpdateTanqueConfiguracaoDto,
): Promise<TanqueConfigResponse> {
  const { data } = await api.patch<TanqueConfigResponse>(
    `${TANQUES_CONFIGURACAO_ENDPOINT}/${id_tanque}`,
    payload,
  );

  return data;
}

export async function ativarTanqueConfiguracao(
  id_tanque: number,
): Promise<TanqueConfigResponse> {
  const { data } = await api.patch<TanqueConfigResponse>(
    `${TANQUES_CONFIGURACAO_ENDPOINT}/${id_tanque}/ativar`,
  );

  return data;
}

export async function desativarTanqueConfiguracao(
  id_tanque: number,
): Promise<TanqueConfigResponse> {
  const { data } = await api.patch<TanqueConfigResponse>(
    `${TANQUES_CONFIGURACAO_ENDPOINT}/${id_tanque}/desativar`,
  );

  return data;
}
