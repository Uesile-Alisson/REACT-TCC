import { api } from '../api/axios';
import type {
  ConfiguracoesSistemaResponse,
  ConfiguracoesSistemaUpdateRequest,
} from '../types';

export async function getConfiguracoesSistema(): Promise<ConfiguracoesSistemaResponse> {
  const { data } = await api.get<ConfiguracoesSistemaResponse>('/configuracoes/sistema');

  return data;
}

export async function updateConfiguracoesSistema(
  payload: ConfiguracoesSistemaUpdateRequest,
): Promise<ConfiguracoesSistemaResponse> {
  const { data } = await api.patch<ConfiguracoesSistemaResponse>(
    '/configuracoes/sistema',
    payload,
  );

  return data;
}

export const configuracoesSistemaService = {
  getConfiguracoesSistema,
  updateConfiguracoesSistema,
};
