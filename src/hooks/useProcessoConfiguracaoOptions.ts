import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizeApiError } from '../api/api-error';
import { listSensoresVacuoByTanque } from '../services/configuracoes-sensores.service';
import { listTanquesConfiguracao } from '../services/configuracoes-tanques.service';
import type {
  ProcessoSensorOption,
  ProcessoTanqueOption,
  SensorProcessoOption,
  TanqueConfigResponse,
} from '../types';

type UseProcessoConfiguracaoOptionsResult = {
  tanqueOptions: ProcessoTanqueOption[];
  sensorOptions: ProcessoSensorOption[];
  loadingTanques: boolean;
  loadingSensores: boolean;
  errorTanques: string | null;
  errorSensores: string | null;
  selectedTanqueId: number | null;
  setSelectedTanqueId: (id_tanque: number | null) => void;
  reloadTanques: () => Promise<void>;
  loadSensoresForTanque: (id_tanque: number) => Promise<void>;
};

function getOptionsErrorMessage(error: unknown): string {
  const apiError = normalizeApiError(error);

  if (apiError.statusCode === 401) {
    return 'Sessao expirada. Entre novamente para carregar as opcoes.';
  }

  if (apiError.statusCode === 403) {
    return 'Seu perfil nao possui permissao para consultar tanques.';
  }

  if (apiError.statusCode && apiError.statusCode >= 500) {
    return 'Erro interno da API ao carregar tanques.';
  }

  return apiError.message || 'Nao foi possivel carregar tanques configurados.';
}

function getSensorOptionsErrorMessage(error: unknown): string {
  const apiError = normalizeApiError(error);

  if (apiError.statusCode === 401) {
    return 'Sessao expirada. Entre novamente para carregar os sensores.';
  }

  if (apiError.statusCode === 403) {
    return 'Seu perfil nao possui permissao para consultar sensores.';
  }

  if (apiError.statusCode === 404) {
    return 'Tanque nao encontrado para consulta de sensores.';
  }

  if (apiError.statusCode && apiError.statusCode >= 500) {
    return 'Erro interno da API ao carregar sensores de vacuo.';
  }

  return apiError.message || 'Nao foi possivel carregar sensores de vacuo.';
}

function buildTanqueOption(tanque: TanqueConfigResponse): ProcessoTanqueOption {
  return {
    id_tanque: tanque.id_tanque,
    label: `${tanque.nome} - ${tanque.volume.toLocaleString('pt-BR')} ${tanque.unidade_volume}`,
    description: `Vacuo padrao ${tanque.vacuo_padrao.toLocaleString('pt-BR')} / ${tanque.status_tanque}`,
    status_tanque: tanque.status_tanque,
  };
}

function isVacuumSensor(sensor: SensorProcessoOption): boolean {
  return sensor.tipo_sensor === 'VACUO' && sensor.status_sensor === 'ATIVO';
}

function buildSensorOption(sensor: SensorProcessoOption): ProcessoSensorOption {
  const descriptionParts = [sensor.modelo, sensor.unidade_medida, sensor.status_sensor].filter(
    (part): part is string => typeof part === 'string' && part.trim().length > 0,
  );

  return {
    id_sensor: sensor.id_sensor,
    label: sensor.label,
    description: descriptionParts.join(' / '),
    status_sensor: sensor.status_sensor,
  };
}

export function useProcessoConfiguracaoOptions(
  enabled: boolean,
): UseProcessoConfiguracaoOptionsResult {
  const [tanques, setTanques] = useState<TanqueConfigResponse[]>([]);
  const [sensorOptions, setSensorOptions] = useState<ProcessoSensorOption[]>([]);
  const [loadingTanques, setLoadingTanques] = useState<boolean>(false);
  const [loadingSensores, setLoadingSensores] = useState<boolean>(false);
  const [errorTanques, setErrorTanques] = useState<string | null>(null);
  const [errorSensores, setErrorSensores] = useState<string | null>(null);
  const [selectedTanqueId, setSelectedTanqueIdState] = useState<number | null>(null);

  const setSelectedTanqueId = useCallback((id_tanque: number | null): void => {
    setSelectedTanqueIdState(id_tanque);

    if (id_tanque === null) {
      setSensorOptions([]);
      setErrorSensores(null);
    }
  }, []);

  const reloadTanques = useCallback(async (): Promise<void> => {
    setLoadingTanques(true);
    setErrorTanques(null);

    try {
      const response = await listTanquesConfiguracao({
        page: 1,
        limit: 100,
        status_tanque: 'ATIVO',
        order_by: 'nome',
        order_direction: 'asc',
      });

      setTanques(response.data);
    } catch (error) {
      setTanques([]);
      setErrorTanques(getOptionsErrorMessage(error));
    } finally {
      setLoadingTanques(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    queueMicrotask(() => void reloadTanques());
  }, [enabled, reloadTanques]);

  const loadSensoresForTanque = useCallback(async (id_tanque: number): Promise<void> => {
    setLoadingSensores(true);
    setErrorSensores(null);
    setSensorOptions([]);

    try {
      const response = await listSensoresVacuoByTanque(id_tanque);
      setSensorOptions(response.filter(isVacuumSensor).map(buildSensorOption));
    } catch (error) {
      setErrorSensores(getSensorOptionsErrorMessage(error));
    } finally {
      setLoadingSensores(false);
    }
  }, []);

  const tanqueOptions = useMemo(
    () => tanques.map((tanque) => buildTanqueOption(tanque)),
    [tanques],
  );

  return {
    tanqueOptions,
    sensorOptions,
    loadingTanques,
    loadingSensores,
    errorTanques,
    errorSensores,
    selectedTanqueId,
    setSelectedTanqueId,
    reloadTanques,
    loadSensoresForTanque,
  };
}
