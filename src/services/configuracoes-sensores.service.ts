import { api } from '../api/axios';
import type {
  CalibrarSensorRequest,
  CreateSensorConfiguracaoDto,
  SensorConfiguracaoQuery,
  SensoresProcessoListResponse,
  SensoresConfiguracaoListResponse,
  SensorConfiguracaoResponse,
  SensorProcessoOption,
  UpdateSensorConfiguracaoRequest,
} from '../types';

const TANQUES_CONFIGURACAO_ENDPOINT = '/configuracoes/tanques';
const SENSORES_CONFIGURACAO_ENDPOINT = '/configuracoes/sensores';

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

export async function createSensorConfiguracao(
  payload: CreateSensorConfiguracaoDto,
): Promise<SensorConfiguracaoResponse> {
  const { data } = await api.post<SensorConfiguracaoResponse>(
    SENSORES_CONFIGURACAO_ENDPOINT,
    payload,
  );

  return data;
}

export async function listSensoresConfiguracao(
  query?: SensorConfiguracaoQuery,
): Promise<SensoresConfiguracaoListResponse> {
  const { data } = await api.get<SensoresConfiguracaoListResponse>(
    SENSORES_CONFIGURACAO_ENDPOINT,
    { params: query },
  );

  return data;
}

export async function getSensorConfiguracao(idSensor: number): Promise<SensorConfiguracaoResponse> {
  const { data } = await api.get<SensorConfiguracaoResponse>(
    `${SENSORES_CONFIGURACAO_ENDPOINT}/${idSensor}`,
  );

  return data;
}

export async function updateSensorConfiguracao(
  idSensor: number,
  payload: UpdateSensorConfiguracaoRequest,
): Promise<SensorConfiguracaoResponse> {
  const { data } = await api.patch<SensorConfiguracaoResponse>(
    `${SENSORES_CONFIGURACAO_ENDPOINT}/${idSensor}`,
    payload,
  );

  return data;
}

export async function startSensorCalibration(idSensor: number): Promise<SensorConfiguracaoResponse> {
  const { data } = await api.post<SensorConfiguracaoResponse>(
    `${SENSORES_CONFIGURACAO_ENDPOINT}/${idSensor}/calibracao/iniciar`,
  );

  return data;
}

export async function finishSensorCalibration(
  idSensor: number,
  payload: CalibrarSensorRequest,
): Promise<SensorConfiguracaoResponse> {
  const { data } = await api.post<SensorConfiguracaoResponse>(
    `${SENSORES_CONFIGURACAO_ENDPOINT}/${idSensor}/calibracao/finalizar`,
    payload,
  );

  return data;
}

export async function activateSensorConfiguracao(idSensor: number): Promise<SensorConfiguracaoResponse> {
  const { data } = await api.patch<SensorConfiguracaoResponse>(
    `${SENSORES_CONFIGURACAO_ENDPOINT}/${idSensor}/ativar`,
  );

  return data;
}

export async function deactivateSensorConfiguracao(idSensor: number): Promise<SensorConfiguracaoResponse> {
  const { data } = await api.patch<SensorConfiguracaoResponse>(
    `${SENSORES_CONFIGURACAO_ENDPOINT}/${idSensor}/desativar`,
  );

  return data;
}
