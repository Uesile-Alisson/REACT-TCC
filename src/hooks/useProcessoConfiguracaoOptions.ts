import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizeApiError } from '../api/api-error';
import { listSensoresVacuoByTanque } from '../services/configuracoes-sensores.service';
import { getConfiguracoesSistema } from '../services/configuracoes-sistema.service';
import { listTanquesConfiguracao } from '../services/configuracoes-tanques.service';
import { getMqttHardwareStatus } from '../services/mqtt-hardware.service';
import type {
  ProcessoSensorOption,
  ProcessoTanqueOption,
  SensorProcessoOption,
  TanqueConfigResponse,
  ValvulasPorTanque,
} from '../types';
import {
  groupValvulasByTanque,
  normalizeTanqueHardwareCode,
} from '../utils/hardwareValvulas';

type UseProcessoConfiguracaoOptionsResult = {
  tanqueOptions: ProcessoTanqueOption[];
  sensorOptions: ProcessoSensorOption[];
  sensorOptionsByTanque: Record<number, ProcessoSensorOption[]>;
  loadingTanques: boolean;
  loadingSensores: boolean;
  loadingHardware: boolean;
  loadingSystemConfig: boolean;
  loadingSensoresByTanque: Record<number, boolean>;
  errorTanques: string | null;
  errorSensores: string | null;
  errorHardware: string | null;
  errorSystemConfig: string | null;
  errorSensoresByTanque: Record<number, string | null>;
  valvulasByTanque: ValvulasPorTanque;
  maxTanksPerProcess: number | null;
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

function getHardwareOptionsErrorMessage(error: unknown): string {
  const apiError = normalizeApiError(error);

  if (apiError.statusCode === 401) {
    return 'Sessao expirada. Entre novamente para carregar o hardware vinculado.';
  }

  if (apiError.statusCode === 403) {
    return 'Seu perfil nao possui permissao para consultar o hardware vinculado.';
  }

  return apiError.message || 'Nao foi possivel carregar valvulas vinculadas ao hardware.';
}

function getSystemConfigErrorMessage(error: unknown): string {
  const apiError = normalizeApiError(error);
  return apiError.message || 'Nao foi possivel carregar o limite global de tanques.';
}

function buildTanqueOption(tanque: TanqueConfigResponse): ProcessoTanqueOption {
  const codigoHardware = normalizeTanqueHardwareCode(
    tanque.codigo_hardware ?? tanque.tanque_codigo_hardware ?? tanque.id_tanque,
  );

  return {
    id_tanque: tanque.id_tanque,
    label: `${tanque.nome} - ${tanque.volume.toLocaleString('pt-BR')} ${tanque.unidade_volume}`,
    description: `Vacuo padrao ${tanque.vacuo_padrao.toLocaleString('pt-BR')} / ${tanque.status_tanque}`,
    status_tanque: tanque.status_tanque,
    codigo_hardware: codigoHardware,
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
  const [sensorOptionsByTanque, setSensorOptionsByTanque] = useState<Record<number, ProcessoSensorOption[]>>({});
  const [loadingTanques, setLoadingTanques] = useState<boolean>(false);
  const [loadingSensores, setLoadingSensores] = useState<boolean>(false);
  const [loadingHardware, setLoadingHardware] = useState<boolean>(false);
  const [loadingSystemConfig, setLoadingSystemConfig] = useState<boolean>(false);
  const [loadingSensoresByTanque, setLoadingSensoresByTanque] = useState<Record<number, boolean>>({});
  const [errorTanques, setErrorTanques] = useState<string | null>(null);
  const [errorSensores, setErrorSensores] = useState<string | null>(null);
  const [errorHardware, setErrorHardware] = useState<string | null>(null);
  const [errorSystemConfig, setErrorSystemConfig] = useState<string | null>(null);
  const [maxTanksPerProcess, setMaxTanksPerProcess] = useState<number | null>(null);
  const [errorSensoresByTanque, setErrorSensoresByTanque] = useState<Record<number, string | null>>({});
  const [valvulasByTanque, setValvulasByTanque] = useState<ValvulasPorTanque>(() =>
    groupValvulasByTanque([]),
  );
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
    setLoadingHardware(true);
    setLoadingSystemConfig(true);
    setErrorTanques(null);
    setErrorHardware(null);
    setErrorSystemConfig(null);

    const [tanquesResult, hardwareResult, systemConfigResult] = await Promise.allSettled([
      listTanquesConfiguracao({
        page: 1,
        limit: 100,
        status_tanque: 'ATIVO',
        order_by: 'nome',
        order_direction: 'asc',
      }),
      getMqttHardwareStatus(),
      getConfiguracoesSistema(),
    ]);

    if (tanquesResult.status === 'fulfilled') {
      setTanques(tanquesResult.value.data);
    } else {
      setTanques([]);
      setErrorTanques(getOptionsErrorMessage(tanquesResult.reason));
    }

    if (hardwareResult.status === 'fulfilled') {
      setValvulasByTanque(groupValvulasByTanque(hardwareResult.value));
    } else {
      setValvulasByTanque(groupValvulasByTanque([]));
      setErrorHardware(getHardwareOptionsErrorMessage(hardwareResult.reason));
    }

    if (
      systemConfigResult.status === 'fulfilled' &&
      Number.isInteger(systemConfigResult.value.quantidade_maxima_tanques) &&
      systemConfigResult.value.quantidade_maxima_tanques > 0
    ) {
      setMaxTanksPerProcess(systemConfigResult.value.quantidade_maxima_tanques);
    } else {
      setMaxTanksPerProcess(null);
      setErrorSystemConfig(
        systemConfigResult.status === 'rejected'
          ? getSystemConfigErrorMessage(systemConfigResult.reason)
          : 'A API retornou uma quantidade maxima de tanques invalida.',
      );
    }

    setLoadingTanques(false);
    setLoadingHardware(false);
    setLoadingSystemConfig(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void reloadTanques();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [enabled, reloadTanques]);

  const loadSensoresForTanque = useCallback(async (id_tanque: number): Promise<void> => {
    setLoadingSensores(true);
    setErrorSensores(null);
    setSensorOptions([]);
    setLoadingSensoresByTanque((current) => ({ ...current, [id_tanque]: true }));
    setErrorSensoresByTanque((current) => ({ ...current, [id_tanque]: null }));

    try {
      const response = await listSensoresVacuoByTanque(id_tanque);
      const nextOptions = response.filter(isVacuumSensor).map(buildSensorOption);

      setSensorOptions(nextOptions);
      setSensorOptionsByTanque((current) => ({ ...current, [id_tanque]: nextOptions }));
    } catch (error) {
      const message = getSensorOptionsErrorMessage(error);

      setErrorSensores(message);
      setSensorOptionsByTanque((current) => ({ ...current, [id_tanque]: [] }));
      setErrorSensoresByTanque((current) => ({ ...current, [id_tanque]: message }));
    } finally {
      setLoadingSensores(false);
      setLoadingSensoresByTanque((current) => ({ ...current, [id_tanque]: false }));
    }
  }, []);

  const tanqueOptions = useMemo(
    () => tanques.map((tanque) => buildTanqueOption(tanque)),
    [tanques],
  );

  return {
    tanqueOptions,
    sensorOptions,
    sensorOptionsByTanque,
    loadingTanques,
    loadingSensores,
    loadingHardware,
    loadingSystemConfig,
    loadingSensoresByTanque,
    errorTanques,
    errorSensores,
    errorHardware,
    errorSystemConfig,
    errorSensoresByTanque,
    valvulasByTanque,
    maxTanksPerProcess,
    selectedTanqueId,
    setSelectedTanqueId,
    reloadTanques,
    loadSensoresForTanque,
  };
}
