import { api } from '../api/axios';
import type {
  BombaConfigResponse,
  BombasConfiguracaoListResponse,
  CreateBombaConfiguracaoDto,
  QueryBombasConfiguracao,
  UpdateBombaConfiguracaoDto,
} from '../types';

const BOMBAS_CONFIGURACAO_ENDPOINT = '/configuracoes/bombas';

export async function listBombasConfiguracao(
  query?: QueryBombasConfiguracao,
): Promise<BombasConfiguracaoListResponse> {
  const { data } = await api.get<BombasConfiguracaoListResponse>(
    BOMBAS_CONFIGURACAO_ENDPOINT,
    { params: query },
  );

  return data;
}

export async function getBombaConfiguracaoById(
  id_bomba: number,
): Promise<BombaConfigResponse> {
  const { data } = await api.get<BombaConfigResponse>(
    `${BOMBAS_CONFIGURACAO_ENDPOINT}/${id_bomba}`,
  );

  return data;
}

export async function createBombaConfiguracao(
  payload: CreateBombaConfiguracaoDto,
): Promise<BombaConfigResponse> {
  const { data } = await api.post<BombaConfigResponse>(
    BOMBAS_CONFIGURACAO_ENDPOINT,
    payload,
  );

  return data;
}

export async function updateBombaConfiguracao(
  id_bomba: number,
  payload: UpdateBombaConfiguracaoDto,
): Promise<BombaConfigResponse> {
  const { data } = await api.patch<BombaConfigResponse>(
    `${BOMBAS_CONFIGURACAO_ENDPOINT}/${id_bomba}`,
    payload,
  );

  return data;
}

export async function ativarBombaConfiguracao(
  id_bomba: number,
): Promise<BombaConfigResponse> {
  const { data } = await api.patch<BombaConfigResponse>(
    `${BOMBAS_CONFIGURACAO_ENDPOINT}/${id_bomba}/ativar`,
  );

  return data;
}

export async function desativarBombaConfiguracao(
  id_bomba: number,
): Promise<BombaConfigResponse> {
  const { data } = await api.patch<BombaConfigResponse>(
    `${BOMBAS_CONFIGURACAO_ENDPOINT}/${id_bomba}/desativar`,
  );

  return data;
}
