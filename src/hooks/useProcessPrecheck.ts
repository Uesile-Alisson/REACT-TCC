import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  abrirValvulaProcesso,
  executarPrechecagem,
  fecharValvulaProcesso,
  getPrechecagem,
  listarValvulasProcesso,
  validarAcoplamentoTanque,
  validarSensorProcesso,
  validarValvulaProcesso,
} from '../services/processos.service';
import type {
  ProcessoPrecheckItem,
  ProcessoPrecheckResponse,
  ProcessoValvulaResumo,
} from '../types';
import { getAuthErrorMessage } from '../utils/authErrors';
import { useRealtime } from './useRealtime';

type PrecheckAction =
  | 'refresh'
  | 'execute'
  | `tank-${number}`
  | `sensor-${number}`
  | `valve-validate-${number}`
  | `valve-open-${number}`
  | `valve-close-${number}`;

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
  validateSensor: (idSensor: number) => Promise<void>;
  validateValve: (idValvula: number) => Promise<void>;
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

  const validateSensor = useCallback(
    (idSensor: number) =>
      runAndRefresh(
        `sensor-${idSensor}`,
        () => validarSensorProcesso(idProcesso ?? 0, idSensor),
        `Validacao do sensor #${idSensor} concluida.`,
      ),
    [idProcesso, runAndRefresh],
  );

  const validateValve = useCallback(
    (idValvula: number) =>
      runAndRefresh(
        `valve-validate-${idValvula}`,
        () => validarValvulaProcesso(idProcesso ?? 0, idValvula),
        `Validacao da valvula #${idValvula} concluida.`,
      ),
    [idProcesso, runAndRefresh],
  );

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

    if (!idProcesso) {
      queueMicrotask(() => {
        if (!isActive) {
          return;
        }

        setPrecheck(null);
        setValves([]);
        setError(null);
        setIsLoading(false);
      });

      return () => {
        isActive = false;
      };
    }

    queueMicrotask(() => {
      if (!isActive) {
        return;
      }

      setIsLoading(true);
      setError(null);

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
    });

    return () => {
      isActive = false;
    };
  }, [idProcesso]);

  useEffect(() => {
    if (!idProcesso || !lastPrecheckResult || lastPrecheckResult.id_processo !== idProcesso) {
      return;
    }

    queueMicrotask(() => {
      setPrecheck(normalizePrecheck(lastPrecheckResult));
      setSocketFeedback('Resultado de pre-checagem recebido via Socket.IO.');
    });
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
    validateSensor,
    validateValve,
    openValve,
    closeValve,
  };
}
