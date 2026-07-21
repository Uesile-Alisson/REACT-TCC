import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  abrirValvulaProcesso,
  executarPrechecagem,
  fecharValvulaProcesso,
  getPrechecagem,
  listarValvulasProcesso,
  validarAcoplamentoTanque,
  validarValvulaProcesso,
} from '../services/processos.service';
import type {
  ProcessoPrecheckCorrectiveAction,
  ProcessoPrecheckItem,
  ProcessoPrecheckResponse,
  ProcessoValvulaAcaoResponse,
  ProcessoValvulaResumo,
} from '../types';
import { getAuthErrorMessage } from '../utils/authErrors';
import { useRealtime } from './useRealtime';

type PrecheckAction =
  | 'refresh'
  | 'execute'
  | `tank-${number}`
  | `corrective-${string}-${number}`
  | `valve-open-${number}`
  | `valve-close-${number}`;

export type SensorCorrectiveContext = {
  idSensor: number;
  action: ProcessoPrecheckCorrectiveAction;
};

type ResourceReference = {
  id: number;
  label: string;
  status?: string;
  message?: string;
};

type UseProcessPrecheckResult = {
  precheck: ProcessoPrecheckResponse | null;
  valves: ProcessoValvulaResumo[];
  tanks: ResourceReference[];
  sensors: ResourceReference[];
  valveTestResults: Record<number, ProcessoValvulaAcaoResponse>;
  sensorCorrectiveContext: SensorCorrectiveContext | null;
  isLoading: boolean;
  loadingAction: PrecheckAction | null;
  error: string | null;
  feedback: string | null;
  socketFeedback: string | null;
  setPrecheckFromBackend: (precheck: ProcessoPrecheckResponse) => void;
  clearFeedback: () => void;
  refreshPrecheck: () => Promise<void>;
  executePrecheck: () => Promise<void>;
  validateTankCoupling: (idTanque: number) => Promise<void>;
  runCorrectiveAction: (item: ProcessoPrecheckItem) => Promise<void>;
  closeSensorCorrectiveFlow: () => void;
  reexecuteAfterSensorMutation: () => Promise<void>;
  openValve: (idValvula: number) => Promise<void>;
  closeValve: (idValvula: number) => Promise<void>;
};

function normalizePrecheck(response: ProcessoPrecheckResponse): ProcessoPrecheckResponse {
  return {
    ...response,
    itens: Array.isArray(response.itens) ? response.itens : [],
    grupos: Array.isArray(response.grupos) ? response.grupos : [],
    falhas_bloqueantes: Array.isArray(response.falhas_bloqueantes) ? response.falhas_bloqueantes : [],
    avisos: Array.isArray(response.avisos) ? response.avisos : [],
    recomendacoes: Array.isArray(response.recomendacoes) ? response.recomendacoes : [],
  };
}

function normalizeValves(response: ProcessoValvulaResumo[] | unknown): ProcessoValvulaResumo[] {
  return Array.isArray(response) ? response : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getCorrectiveResourceId(item: ProcessoPrecheckItem): number | null {
  const parsed = typeof item.id_recurso === 'number' ? item.id_recurso : Number(item.id_recurso);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isSensorCorrectiveAction(action: ProcessoPrecheckCorrectiveAction): boolean {
  return [
    'CALIBRAR_SENSOR',
    'CONTINUAR_CALIBRACAO_SENSOR',
    'LIBERAR_SENSOR',
    'ATIVAR_SENSOR',
    'AGUARDAR_TELEMETRIA_SENSOR',
    'DIAGNOSTICAR_SENSOR',
  ].includes(action.codigo);
}

function hasExpectedCorrectiveContract(
  idProcesso: number,
  idRecurso: number,
  action: ProcessoPrecheckCorrectiveAction,
): boolean {
  const sensorBase = `/configuracoes/sensores/${idRecurso}`;
  const contracts: Record<ProcessoPrecheckCorrectiveAction['codigo'], {
    method: ProcessoPrecheckCorrectiveAction['metodo'];
    endpoint: string | null;
  }> = {
    CALIBRAR_SENSOR: { method: 'POST', endpoint: `${sensorBase}/calibracao/iniciar` },
    CONTINUAR_CALIBRACAO_SENSOR: { method: 'POST', endpoint: `${sensorBase}/calibracao/finalizar` },
    LIBERAR_SENSOR: { method: 'PATCH', endpoint: `${sensorBase}/ativar` },
    ATIVAR_SENSOR: { method: 'PATCH', endpoint: `${sensorBase}/ativar` },
    AGUARDAR_TELEMETRIA_SENSOR: { method: 'GET', endpoint: sensorBase },
    DIAGNOSTICAR_SENSOR: { method: 'GET', endpoint: sensorBase },
    TESTAR_ESTADO_SEGURO_VALVULA: {
      method: 'POST',
      endpoint: `/processos/${idProcesso}/valvulas/${idRecurso}/validar`,
    },
    REVISAR_CONFIGURACAO_VALVULA: { method: null, endpoint: null },
  };
  const expected = contracts[action.codigo];

  return action.metodo === expected.method && action.endpoint === expected.endpoint;
}

function getNumericDetail(item: ProcessoPrecheckItem, keys: string[]): number | null {
  for (const key of keys) {
    if (key === 'id_recurso') {
      const value = item.id_recurso;
      const parsed = typeof value === 'number' ? value : Number(value);

      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }

    if (isRecord(item.detalhes)) {
      const value = item.detalhes[key];
      const parsed = typeof value === 'number' ? value : Number(value);

      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }

  return null;
}

function buildReferences(
  items: ProcessoPrecheckItem[],
  groups: string[],
  keys: string[],
): ResourceReference[] {
  const references = new Map<number, ResourceReference>();

  items
    .filter((item) => groups.includes(item.grupo))
    .forEach((item) => {
      const id = getNumericDetail(item, keys);

      if (!id || references.has(id)) {
        return;
      }

      references.set(id, {
        id,
        label: item.titulo || `${item.grupo} #${id}`,
        status: item.status,
        message: item.mensagem,
      });
    });

  return Array.from(references.values());
}

function buildReferencesWithFallback(
  items: ProcessoPrecheckItem[],
  preferredGroups: string[],
  fallbackGroups: string[],
  keys: string[],
): ResourceReference[] {
  const preferredReferences = buildReferences(items, preferredGroups, keys);

  if (preferredReferences.length > 0) {
    return preferredReferences;
  }

  return buildReferences(items, fallbackGroups, keys);
}

export function useProcessPrecheck(idProcesso?: number | null): UseProcessPrecheckResult {
  const { lastPrecheckResult } = useRealtime();
  const [precheck, setPrecheck] = useState<ProcessoPrecheckResponse | null>(null);
  const [valves, setValves] = useState<ProcessoValvulaResumo[]>([]);
  const [valveTestResults, setValveTestResults] = useState<Record<number, ProcessoValvulaAcaoResponse>>({});
  const [sensorCorrectiveContext, setSensorCorrectiveContext] = useState<SensorCorrectiveContext | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<PrecheckAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [socketFeedback, setSocketFeedback] = useState<string | null>(null);

  const loadValves = useCallback(async (): Promise<void> => {
    if (!idProcesso) {
      setValves([]);
      return;
    }

    const response = await listarValvulasProcesso(idProcesso);
    setValves(normalizeValves(response));
  }, [idProcesso]);

  const setPrecheckFromBackend = useCallback((nextPrecheck: ProcessoPrecheckResponse): void => {
    setPrecheck(normalizePrecheck(nextPrecheck));
    setError(null);
  }, []);

  const refreshPrecheck = useCallback(async (): Promise<void> => {
    if (!idProcesso) {
      return;
    }

    setLoadingAction('refresh');
    setError(null);

    try {
      const [nextPrecheck] = await Promise.all([getPrechecagem(idProcesso), loadValves()]);
      setPrecheck(normalizePrecheck(nextPrecheck));
      setFeedback('Estado da pre-checagem atualizado.');
    } catch (loadError: unknown) {
      setError(getAuthErrorMessage(loadError));
    } finally {
      setLoadingAction(null);
    }
  }, [idProcesso, loadValves]);

  const executePrecheck = useCallback(async (): Promise<void> => {
    if (!idProcesso) {
      return;
    }

    setLoadingAction('execute');
    setError(null);

    try {
      const [nextPrecheck] = await Promise.all([executarPrechecagem(idProcesso), loadValves()]);
      setPrecheck(normalizePrecheck(nextPrecheck));
      setFeedback('Pre-checagem operacional executada.');
    } catch (loadError: unknown) {
      setError(getAuthErrorMessage(loadError));
    } finally {
      setLoadingAction(null);
    }
  }, [idProcesso, loadValves]);

  const runAndRefresh = useCallback(
    async (action: PrecheckAction, request: () => Promise<unknown>, successMessage: string): Promise<void> => {
      if (!idProcesso) {
        return;
      }

      setLoadingAction(action);
      setError(null);

      try {
        const response = await request();

        if (isRecord(response) && 'itens' in response) {
          setPrecheck(normalizePrecheck(response as ProcessoPrecheckResponse));
        } else {
          const nextPrecheck = await getPrechecagem(idProcesso);
          setPrecheck(normalizePrecheck(nextPrecheck));
        }

        await loadValves();
        setFeedback(successMessage);
      } catch (actionError: unknown) {
        setError(getAuthErrorMessage(actionError));
      } finally {
        setLoadingAction(null);
      }
    },
    [idProcesso, loadValves],
  );

  const validateTankCoupling = useCallback(
    (idTanque: number) =>
      runAndRefresh(
        `tank-${idTanque}`,
        () => validarAcoplamentoTanque(idProcesso ?? 0, idTanque),
        `Validacao de acoplamento do tanque #${idTanque} concluida.`,
      ),
    [idProcesso, runAndRefresh],
  );

  const runCorrectiveAction = useCallback(async (item: ProcessoPrecheckItem): Promise<void> => {
    const action = item.acao_corretiva;
    const idRecurso = getCorrectiveResourceId(item);

    if (!idProcesso || !action || !idRecurso) {
      setError('A acao corretiva nao possui processo ou recurso valido.');
      return;
    }

    if (!action.disponivel) {
      setError(action.motivo_indisponibilidade ?? 'Acao corretiva indisponivel.');
      return;
    }

    if (!hasExpectedCorrectiveContract(idProcesso, idRecurso, action)) {
      setError('A API retornou um contrato de acao corretiva inesperado. A chamada foi bloqueada por seguranca.');
      return;
    }

    if (isSensorCorrectiveAction(action)) {
      setSensorCorrectiveContext({ idSensor: idRecurso, action });
      setError(null);

      if (
        action.reexecutar_prechecagem &&
        (action.codigo === 'DIAGNOSTICAR_SENSOR' || action.codigo === 'AGUARDAR_TELEMETRIA_SENSOR')
      ) {
        await executePrecheck();
      }
      return;
    }

    if (action.codigo !== 'TESTAR_ESTADO_SEGURO_VALVULA') {
      setError(action.motivo_indisponibilidade ?? 'Acao corretiva sem executor seguro no frontend.');
      return;
    }

    setLoadingAction(`corrective-${action.codigo}-${idRecurso}`);
    setError(null);
    setFeedback(null);

    try {
      const result = await validarValvulaProcesso(idProcesso, idRecurso);
      setValveTestResults((current) => ({ ...current, [idRecurso]: result }));
      const nextPrecheck = action.reexecutar_prechecagem
        ? await executarPrechecagem(idProcesso)
        : await getPrechecagem(idProcesso);
      setPrecheck(normalizePrecheck(nextPrecheck));
      await loadValves();
      setFeedback(
        `Teste seguro da valvula #${idRecurso}: ${result.status}. ${result.mensagem}`,
      );
    } catch (actionError: unknown) {
      setError(getAuthErrorMessage(actionError));
    } finally {
      setLoadingAction(null);
    }
  }, [executePrecheck, idProcesso, loadValves]);

  const closeSensorCorrectiveFlow = useCallback(() => {
    setSensorCorrectiveContext(null);
  }, []);

  const reexecuteAfterSensorMutation = useCallback(async (): Promise<void> => {
    await executePrecheck();
  }, [executePrecheck]);

  const openValve = useCallback(
    (idValvula: number) =>
      runAndRefresh(
        `valve-open-${idValvula}`,
        () => abrirValvulaProcesso(idProcesso ?? 0, idValvula),
        `Comando de abertura da valvula #${idValvula} enviado.`,
      ),
    [idProcesso, runAndRefresh],
  );

  const closeValve = useCallback(
    (idValvula: number) =>
      runAndRefresh(
        `valve-close-${idValvula}`,
        () => fecharValvulaProcesso(idProcesso ?? 0, idValvula),
        `Comando de fechamento da valvula #${idValvula} enviado.`,
      ),
    [idProcesso, runAndRefresh],
  );

  const clearFeedback = useCallback(() => {
    setError(null);
    setFeedback(null);
    setSocketFeedback(null);
  }, []);

  useEffect(() => {
    let isActive = true;
    let timeoutId: number | null = null;

    if (!idProcesso) {
      timeoutId = window.setTimeout(() => {
        if (!isActive) {
          return;
        }

        setPrecheck(null);
        setValves([]);
        setValveTestResults({});
        setSensorCorrectiveContext(null);
        setError(null);
        setIsLoading(false);
      }, 0);

      return () => {
        isActive = false;
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }
      };
    }

    timeoutId = window.setTimeout(() => {
      if (!isActive) {
        return;
      }

      setIsLoading(true);
      setError(null);
      setFeedback(null);
      setValveTestResults({});
      setSensorCorrectiveContext(null);

      void Promise.allSettled([getPrechecagem(idProcesso), listarValvulasProcesso(idProcesso)])
        .then(([precheckResult, valvesResult]) => {
          if (!isActive) {
            return;
          }

          if (precheckResult.status === 'fulfilled') {
            setPrecheck(normalizePrecheck(precheckResult.value));
          } else {
            setPrecheck(null);
            setError(getAuthErrorMessage(precheckResult.reason));
          }

          if (valvesResult.status === 'fulfilled') {
            setValves(normalizeValves(valvesResult.value));
          } else {
            setValves([]);
          }
        })
        .finally(() => {
          if (isActive) {
            setIsLoading(false);
          }
        });
    }, 0);

    return () => {
      isActive = false;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [idProcesso]);

  useEffect(() => {
    if (!idProcesso || !lastPrecheckResult || lastPrecheckResult.id_processo !== idProcesso) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPrecheck(normalizePrecheck(lastPrecheckResult));
      setSocketFeedback('Resultado de pre-checagem recebido via Socket.IO.');
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [idProcesso, lastPrecheckResult]);

  const tanks = useMemo(
    () =>
      buildReferencesWithFallback(
        precheck?.itens ?? [],
        ['ACOPLAMENTO'],
        ['TANQUES'],
        ['id_tanque', 'tanque_id', 'id_recurso'],
      ),
    [precheck],
  );
  const sensors = useMemo(
    () => buildReferences(precheck?.itens ?? [], ['SENSORES'], ['id_sensor', 'sensor_id', 'id_recurso']),
    [precheck],
  );

  return {
    precheck,
    valves,
    tanks,
    sensors,
    valveTestResults,
    sensorCorrectiveContext,
    isLoading,
    loadingAction,
    error,
    feedback,
    socketFeedback,
    setPrecheckFromBackend,
    clearFeedback,
    refreshPrecheck,
    executePrecheck,
    validateTankCoupling,
    runCorrectiveAction,
    closeSensorCorrectiveFlow,
    reexecuteAfterSensorMutation,
    openValve,
    closeValve,
  };
}
