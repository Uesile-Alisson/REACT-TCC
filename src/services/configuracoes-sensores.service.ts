import { api } from '../api/axios';
import type {
  SensoresProcessoListResponse,
  SensorProcessoOption,
} from '../types';

const TANQUES_CONFIGURACAO_ENDPOINT = '/configuracoes/tanques';

export async function listSensoresVacuoByTanque(
  id_tanque: number,
): Promise<SensorProcessoOption[]> {
  const { data } = await api.get<SensoresProcessoListResponse>(
    `${TANQUES_CONFIGURACAO_ENDPOINT}/${id_tanque}/sensores`,
    {
      params: {
        status_sensor: 'ATIVO',
        tipo_sensor: 'VACUO',
        order_by: 'nome',
        order_direction: 'asc',
      },
    },
  );

  return data.data;
}
