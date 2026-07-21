import { useCallback, useEffect, useRef, useState } from 'react';
import { joinProcessRoom, realtimeService } from '../services/realtime';
import {
  acquireAuxiliaryPumpControl,
  acquireAuxiliaryValveControl,
  closeAuxiliaryValve,
  finalizeProcessoGeneralClosure,
  getProcessoAuxiliaryState,
  getProcessoDashboard,
  getProcessoGeneralClosure,
  openAuxiliaryValve,
  releaseAuxiliaryPumpControl,
  releaseAuxiliaryValveControl,
  startProcessoTankClosure,
  turnOffAuxiliaryPump,
  turnOnAuxiliaryPump,
} from '../services/processos.service';
import type {
  ProcessoAuxiliarState,
  ProcessoDashboardResponse,
  ProcessoGeneralClosureState,
} from '../types';
import { getAuthErrorMessage } from '../utils/authErrors';

const OPERATIONAL_REFRESH_INTERVAL_MS = 5_000;

export type ProcessOperationalAction =
  | 'assumir-bomba'
  | 'liberar-bomba'
  | 'ligar-bomba'
  | 'desligar-bomba'
  | `assumir-valvula-${number}`
  | `liberar-valvula-${number}`
  | `abrir-valvula-${number}`
  | `fechar-valvula-${number}`
  | `encerrar-tanque-${number}`
  | 'finalizar-encerramento';

type UseProcessOperationalStateResult = {
  dashboard: ProcessoDashboardResponse | null;
  generalClosure: ProcessoGeneralClosureState | null;
  auxiliaryState: ProcessoAuxiliarState | null;
  isLoading: boolean;
  actionLoading: ProcessOperationalAction | null;
  error: string | null;
  feedback: string | null;
  refresh: () => Promise<void>;
  clearFeedback: () => void;
  acquirePump: (reason: string, durationSeconds: number) => Promise<void>;
  releasePump: (reason: string) => Promise<void>;
  acquireValve: (idProcessoTanque: number, reason: string, durationSeconds: number) => Promise<void>;
  releaseValve: (idProcessoTanque: number, reason: string) => Promise<void>;
  turnOnPump: (idProcessoTanque: number, reason: string) => Promise<void>;
  turnOffPump: (reason: string) => Promise<void>;
  openValve: (idProcessoTanque: number, reason: string) => Promise<void>;
  closeValve: (idProcessoTanque: number, reason: string) => Promise<void>;
  startTankClosure: (idProcessoTanque: number, reason: string) => Promise<void>;
  finalizeGeneralClosure: (reason: string) => Promise<void>;
};

function createCorrelationId(action: string): string {
  const randomPart =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `front-${action}-${randomPart}`.slice(0, 160);
}

function normalizeReason(reason: string): string {
  const normalizedReason = reason.trim();

  return normalizedReason.length >= 3
    ? normalizedReason
    : 'Intervencao tecnica supervisionada pelo painel.';
}

export function useProcessOperationalState(
  idProcesso: number | null,
  enabled: boolean,
): UseProcessOperationalStateResult {
  const [dashboard, setDashboard] = useState<ProcessoDashboardResponse | null>(null);
  const [generalClosure, setGeneralClosure] = useState<ProcessoGeneralClosureState | null>(null);
  const [auxiliaryState, setAuxiliaryState] = useState<ProcessoAuxiliarState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<ProcessOperationalAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const requestSequence = useRef<number>(0);

  const loadSnapshot = useCallback(async (silent = false): Promise<void> => {
    if (!idProcesso || !enabled) {
      setDashboard(null);
      setGeneralClosure(null);
      setAuxiliaryState(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const sequence = ++requestSequence.current;

    if (!silent) {
      setIsLoading(true);
    }

    const [dashboardResult, closureResult, auxiliaryResult] = await Promise.allSettled([
      getProcessoDashboard(idProcesso),
      getProcessoGeneralClosure(idProcesso),
      getProcessoAuxiliaryState(idProcesso),
    ]);

    if (sequence !== requestSequence.current) {
      return;
    }

    const nextDashboard = dashboardResult.status === 'fulfilled' ? dashboardResult.value : null;
    const partialErrors = [
      dashboardResult.status === 'rejected'
        ? `Dashboard: ${getAuthErrorMessage(dashboardResult.reason)}`
        : null,
      closureResult.status === 'rejected'
        ? `Encerramento: ${getAuthErrorMessage(closureResult.reason)}`
        : null,
      auxiliaryResult.status === 'rejected'
        ? `Subsistema auxiliar: ${getAuthErrorMessage(auxiliaryResult.reason)}`
        : null,
    ].filter((message): message is string => Boolean(message));

    setDashboard(nextDashboard);
    setGeneralClosure(
      closureResult.status === 'fulfilled'
        ? closureResult.value
        : nextDashboard?.encerramento.geral ?? null,
    );
    setAuxiliaryState(
      auxiliaryResult.status === 'fulfilled'
        ? auxiliaryResult.value
        : nextDashboard?.subsistema_auxiliar ?? null,
    );
    setError(partialErrors.length > 0 ? partialErrors.join(' / ') : null);
    setIsLoading(false);
  }, [enabled, idProcesso]);

  useEffect(() => {
    const initialLoadId = window.setTimeout(() => {
      void loadSnapshot();
    }, 0);
    const intervalId = enabled && idProcesso
      ? window.setInterval(() => {
          void loadSnapshot(true);
        }, OPERATIONAL_REFRESH_INTERVAL_MS)
      : null;

    return () => {
      requestSequence.current += 1;
      window.clearTimeout(initialLoadId);

      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [enabled, idProcesso, loadSnapshot]);

  useEffect(() => {
    if (!enabled || !idProcesso) {
      return undefined;
    }

    const unsubscribeDashboard = realtimeService.onProcessDashboardUpdated((payload) => {
      if (payload.id_processo !== idProcesso) return;
      setDashboard(payload.dashboard);
      setGeneralClosure(payload.dashboard.encerramento.geral);
      setAuxiliaryState(payload.dashboard.subsistema_auxiliar);
      setError(null);
    });
    const unsubscribeAuxiliary = realtimeService.onProcessAuxiliaryStateUpdated((payload) => {
      if (payload.id_processo !== idProcesso) return;
      setAuxiliaryState((current) =>
        current && current.versao > payload.auxiliary_state.versao
          ? current
          : payload.auxiliary_state);
      setDashboard((current) =>
        current?.id_processo === idProcesso &&
        current.subsistema_auxiliar.versao <= payload.auxiliary_state.versao
          ? { ...current, subsistema_auxiliar: payload.auxiliary_state }
          : current);
    });
    const unsubscribeTank = realtimeService.onProcessTankUpdated((payload) => {
      if (payload.id_processo !== idProcesso) return;
      setDashboard((current) => {
        if (!current || current.id_processo !== idProcesso) return current;
        return {
          ...current,
          snapshot_at: payload.emitted_at,
          tanques: current.tanques.map((tank) => {
            if (tank.id_processo_tanque !== payload.id_processo_tanque) return tank;
            const hasReading = tank.leituras.some(
              (reading) => reading.id_leitura_sensor === payload.reading.id_leitura_sensor,
            );
            return {
              ...payload.tank,
              leituras: hasReading ? tank.leituras : [...tank.leituras, payload.reading],
            };
          }),
        };
      });
    });
    const unsubscribeTankClosure = realtimeService.onProcessTankClosureUpdated((payload) => {
      if (payload.id_processo !== idProcesso) return;
      setDashboard((current) => current?.id_processo === idProcesso
        ? {
            ...current,
            tanques: current.tanques.map((tank) =>
              tank.id_processo_tanque === payload.id_processo_tanque
                ? { ...tank, encerramento: payload.closure }
                : tank),
          }
        : current);
    });
    const unsubscribeGeneralClosure = realtimeService.onProcessGeneralClosureUpdated((payload) => {
      if (payload.id_processo !== idProcesso) return;
      setGeneralClosure(payload.closure);
      setDashboard((current) => current?.id_processo === idProcesso
        ? { ...current, encerramento: { ...current.encerramento, geral: payload.closure } }
        : current);
    });
    const unsubscribeEmergency = realtimeService.onProcessEmergencyStop((payload) => {
      if (payload.id_processo !== idProcesso) return;
      setDashboard((current) => current?.id_processo === idProcesso
        ? { ...current, parada_emergencia: payload.parada_emergencia }
        : current);
      setFeedback(payload.message);
    });
    const unsubscribeStatus = realtimeService.onProcessStatusChanged((payload) => {
      if (payload.id_processo !== idProcesso) return;
      setDashboard((current) => current?.id_processo === idProcesso
        ? { ...current, status_processo: payload.status_processo }
        : current);
    });
    const leaveProcessRoom = joinProcessRoom(idProcesso);

    return () => {
      leaveProcessRoom();
      unsubscribeDashboard();
      unsubscribeAuxiliary();
      unsubscribeTank();
      unsubscribeTankClosure();
      unsubscribeGeneralClosure();
      unsubscribeEmergency();
      unsubscribeStatus();
    };
  }, [enabled, idProcesso]);

  const runAction = useCallback(async (
    action: ProcessOperationalAction,
    operation: () => Promise<{ message: string }>,
  ): Promise<void> => {
    setActionLoading(action);
    setError(null);
    setFeedback(null);

    try {
      const result = await operation();
      setFeedback(result.message);
      await loadSnapshot(true);
    } catch (actionError: unknown) {
      setError(getAuthErrorMessage(actionError));
    } finally {
      setActionLoading(null);
    }
  }, [loadSnapshot]);

  const getAuxiliaryTank = useCallback((idProcessoTanque: number) => (
    auxiliaryState?.tanques.find((tank) => tank.id_processo_tanque === idProcessoTanque) ?? null
  ), [auxiliaryState]);

  const acquirePump = useCallback(async (reason: string, durationSeconds: number): Promise<void> => {
    if (!idProcesso || !auxiliaryState) {
      setError('Estado do subsistema auxiliar ainda nao esta disponivel.');
      return;
    }

    await runAction('assumir-bomba', () => acquireAuxiliaryPumpControl(idProcesso, {
      expected_version: auxiliaryState.versao,
      duration_seconds: durationSeconds,
      motivo: normalizeReason(reason),
    }));
  }, [auxiliaryState, idProcesso, runAction]);

  const releasePump = useCallback(async (reason: string): Promise<void> => {
    if (!idProcesso || !auxiliaryState) {
      setError('Estado do subsistema auxiliar ainda nao esta disponivel.');
      return;
    }

    await runAction('liberar-bomba', () => releaseAuxiliaryPumpControl(idProcesso, {
      expected_version: auxiliaryState.versao,
      motivo: normalizeReason(reason),
    }));
  }, [auxiliaryState, idProcesso, runAction]);

  const acquireValve = useCallback(async (
    idProcessoTanque: number,
    reason: string,
    durationSeconds: number,
  ): Promise<void> => {
    const tank = getAuxiliaryTank(idProcessoTanque);

    if (!idProcesso || !tank) {
      setError('Estado auxiliar do tanque ainda nao esta disponivel.');
      return;
    }

    await runAction(`assumir-valvula-${idProcessoTanque}`, () => acquireAuxiliaryValveControl(
      idProcesso,
      idProcessoTanque,
      {
        expected_version: tank.versao,
        duration_seconds: durationSeconds,
        motivo: normalizeReason(reason),
      },
    ));
  }, [getAuxiliaryTank, idProcesso, runAction]);

  const releaseValve = useCallback(async (
    idProcessoTanque: number,
    reason: string,
  ): Promise<void> => {
    const tank = getAuxiliaryTank(idProcessoTanque);

    if (!idProcesso || !tank) {
      setError('Estado auxiliar do tanque ainda nao esta disponivel.');
      return;
    }

    await runAction(`liberar-valvula-${idProcessoTanque}`, () => releaseAuxiliaryValveControl(
      idProcesso,
      idProcessoTanque,
      { expected_version: tank.versao, motivo: normalizeReason(reason) },
    ));
  }, [getAuxiliaryTank, idProcesso, runAction]);

  const turnOnPump = useCallback(async (
    idProcessoTanque: number,
    reason: string,
  ): Promise<void> => {
    const tank = getAuxiliaryTank(idProcessoTanque);

    if (!idProcesso || !auxiliaryState || !tank) {
      setError('Versoes do subsistema auxiliar ainda nao estao disponiveis.');
      return;
    }

    await runAction('ligar-bomba', () => turnOnAuxiliaryPump(idProcesso, idProcessoTanque, {
      expected_subsystem_version: auxiliaryState.versao,
      expected_tank_version: tank.versao,
      correlation_id: createCorrelationId('ligar-bomba'),
      motivo: normalizeReason(reason),
    }));
  }, [auxiliaryState, getAuxiliaryTank, idProcesso, runAction]);

  const turnOffPump = useCallback(async (reason: string): Promise<void> => {
    if (!idProcesso || !auxiliaryState) {
      setError('Versao do subsistema auxiliar ainda nao esta disponivel.');
      return;
    }

    await runAction('desligar-bomba', () => turnOffAuxiliaryPump(idProcesso, {
      expected_subsystem_version: auxiliaryState.versao,
      correlation_id: createCorrelationId('desligar-bomba'),
      motivo: normalizeReason(reason),
    }));
  }, [auxiliaryState, idProcesso, runAction]);

  const runValveCommand = useCallback(async (
    action: 'abrir' | 'fechar',
    idProcessoTanque: number,
    reason: string,
  ): Promise<void> => {
    const tank = getAuxiliaryTank(idProcessoTanque);

    if (!idProcesso || !auxiliaryState || !tank) {
      setError('Versoes do subsistema auxiliar ainda nao estao disponiveis.');
      return;
    }

    const payload = {
      expected_subsystem_version: auxiliaryState.versao,
      expected_tank_version: tank.versao,
      correlation_id: createCorrelationId(`${action}-valvula`),
      motivo: normalizeReason(reason),
    };

    await runAction(`${action}-valvula-${idProcessoTanque}`, () => (
      action === 'abrir'
        ? openAuxiliaryValve(idProcesso, idProcessoTanque, payload)
        : closeAuxiliaryValve(idProcesso, idProcessoTanque, payload)
    ));
  }, [auxiliaryState, getAuxiliaryTank, idProcesso, runAction]);

  const startTankClosure = useCallback(async (
    idProcessoTanque: number,
    reason: string,
  ): Promise<void> => {
    const tank = dashboard?.tanques.find((item) => item.id_processo_tanque === idProcessoTanque);

    if (!idProcesso || !tank) {
      setError('Estado de encerramento do tanque ainda nao esta disponivel.');
      return;
    }

    await runAction(`encerrar-tanque-${idProcessoTanque}`, () => startProcessoTankClosure(
      idProcesso,
      idProcessoTanque,
      {
        expected_version: tank.encerramento.versao,
        motivo: normalizeReason(reason),
      },
    ));
  }, [dashboard, idProcesso, runAction]);

  const finalizeGeneralClosure = useCallback(async (reason: string): Promise<void> => {
    if (!idProcesso || !generalClosure) {
      setError('Estado do encerramento geral ainda nao esta disponivel.');
      return;
    }

    await runAction('finalizar-encerramento', () => finalizeProcessoGeneralClosure(idProcesso, {
      expected_version: generalClosure.versao,
      motivo: normalizeReason(reason),
    }));
  }, [generalClosure, idProcesso, runAction]);

  const clearFeedback = useCallback(() => {
    setError(null);
    setFeedback(null);
  }, []);
  const refresh = useCallback(() => loadSnapshot(false), [loadSnapshot]);
  const currentDashboard = dashboard?.id_processo === idProcesso ? dashboard : null;
  const currentAuxiliaryState = auxiliaryState?.id_processo === idProcesso ? auxiliaryState : null;
  const currentGeneralClosure = currentDashboard || currentAuxiliaryState ? generalClosure : null;

  return {
    dashboard: currentDashboard,
    generalClosure: currentGeneralClosure,
    auxiliaryState: currentAuxiliaryState,
    isLoading,
    actionLoading,
    error,
    feedback,
    refresh,
    clearFeedback,
    acquirePump,
    releasePump,
    acquireValve,
    releaseValve,
    turnOnPump,
    turnOffPump,
    openValve: (idProcessoTanque, reason) => runValveCommand('abrir', idProcessoTanque, reason),
    closeValve: (idProcessoTanque, reason) => runValveCommand('fechar', idProcessoTanque, reason),
    startTankClosure,
    finalizeGeneralClosure,
  };
}
