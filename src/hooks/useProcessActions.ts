import { useCallback, useState } from 'react';
import {
  createProcesso,
  emergencyStopProcesso,
  finishProcesso,
  interruptProcesso,
  pauseProcesso,
  resumeProcesso,
  startProcesso,
} from '../services/processos.service';
import type { CreateProcessoRequest, ProcessoAction, ProcessoFormState } from '../types';
import type { ProcessoPrecheckResponse } from '../types/processos.types';
import { getAuthErrorMessage } from '../utils/authErrors';

type UseProcessActionsResult = {
  actionLoading: ProcessoAction | 'create' | null;
  actionError: string | null;
  actionSuccess: string | null;
  clearFeedback: () => void;
  createConfiguredProcess: (form: ProcessoFormState) => Promise<void>;
  runProcessAction: (
    action: ProcessoAction,
    idProcesso: number,
    reason?: string,
  ) => Promise<void>;
};

type UseProcessActionsOptions = {
  onPrecheckBlocked?: (precheck: ProcessoPrecheckResponse) => void;
};

function toOptionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildCreatePayload(form: ProcessoFormState): CreateProcessoRequest {
  return {
    nome_processo: form.nome_processo.trim() || undefined,
    tempo_maximo: Number(form.tempo_maximo),
    tanques: form.tanques.map((tanque) => ({
      id_tanque: Number(tanque.id_tanque),
      vacuo_alvo: toOptionalNumber(tanque.vacuo_alvo_tanque),
      sensores: [
        {
          id_sensor: Number(tanque.id_sensor),
          observacoes: tanque.observacoes_sensor.trim() || undefined,
        },
      ],
    })),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPrecheckResponse(value: unknown): value is ProcessoPrecheckResponse {
  return (
    isRecord(value) &&
    typeof value.id_processo === 'number' &&
    typeof value.aprovado === 'boolean' &&
    typeof value.bloqueado === 'boolean' &&
    Array.isArray(value.itens)
  );
}

function extractPrecheckFromError(error: unknown): ProcessoPrecheckResponse | null {
  if (!isRecord(error) || !isRecord(error.originalError)) {
    return null;
  }

  const response = error.originalError.response;

  if (!isRecord(response)) {
    return null;
  }

  const data = response.data;

  if (isPrecheckResponse(data)) {
    return data;
  }

  if (isRecord(data)) {
    const candidates = [data.prechecagem, data.precheck, data.checklist, data.resultado];
    const precheck = candidates.find(isPrecheckResponse);

    return precheck ?? null;
  }

  return null;
}

export function useProcessActions(
  onDone: () => Promise<void>,
  options?: UseProcessActionsOptions,
): UseProcessActionsResult {
  const onPrecheckBlocked = options?.onPrecheckBlocked;
  const [actionLoading, setActionLoading] = useState<ProcessoAction | 'create' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const clearFeedback = useCallback(() => {
    setActionError(null);
    setActionSuccess(null);
  }, []);

  const createConfiguredProcess = useCallback(
    async (form: ProcessoFormState): Promise<void> => {
      setActionLoading('create');
      setActionError(null);
      setActionSuccess(null);

      try {
        await createProcesso(buildCreatePayload(form));
        setActionSuccess('Processo configurado com sucesso.');
        await onDone();
      } catch (error: unknown) {
        setActionError(getAuthErrorMessage(error));
      } finally {
        setActionLoading(null);
      }
    },
    [onDone],
  );

  const runProcessAction = useCallback(
    async (action: ProcessoAction, idProcesso: number, reason?: string): Promise<void> => {
      setActionLoading(action);
      setActionError(null);
      setActionSuccess(null);

      try {
        if (action === 'start') {
          await startProcesso(idProcesso);
          setActionSuccess('Processo iniciado com sucesso.');
        }

        if (action === 'pause') {
          await pauseProcesso(idProcesso);
          setActionSuccess('Processo pausado com sucesso.');
        }

        if (action === 'resume') {
          await resumeProcesso(idProcesso);
          setActionSuccess('Processo retomado com sucesso.');
        }

        if (action === 'finish') {
          await finishProcesso(idProcesso, { observacao: reason || undefined });
          setActionSuccess('Processo finalizado com sucesso.');
        }

        if (action === 'interrupt') {
          await interruptProcesso(idProcesso, {
            motivo: reason || 'Interrompido pela tela de Processos.',
          });
          setActionSuccess('Processo interrompido com sucesso.');
        }

        if (action === 'emergency-stop') {
          await emergencyStopProcesso(idProcesso, {
            motivo: reason || 'Parada de emergencia solicitada pela tela de Processos.',
          });
          setActionSuccess('Parada de emergencia enviada com sucesso.');
        }

        await onDone();
      } catch (error: unknown) {
        const blockedPrecheck = action === 'start' ? extractPrecheckFromError(error) : null;

        if (blockedPrecheck) {
          onPrecheckBlocked?.(blockedPrecheck);
          setActionError('Backend bloqueou o inicio do processo. Revise a pre-checagem operacional.');
          return;
        }

        setActionError(getAuthErrorMessage(error));
      } finally {
        setActionLoading(null);
      }
    },
    [onDone, onPrecheckBlocked],
  );

  return {
    actionLoading,
    actionError,
    actionSuccess,
    clearFeedback,
    createConfiguredProcess,
    runProcessAction,
  };
}
