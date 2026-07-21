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
    modo_operacao_auxiliar: form.modo_operacao_auxiliar,
    encerramento_automatico: form.encerramento_automatico,
    tanques: form.tanques.map((tanque) => ({
      id_tanque: Number(tanque.id_tanque),
      prioridade:
        form.modo_operacao_auxiliar !== 'MANUAL' && form.tanques.length > 1
          ? Number(tanque.prioridade)
          : undefined,
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
        const result = await createProcesso(buildCreatePayload(form));
        setActionSuccess(result.message);
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
          const result = await startProcesso(idProcesso);
          setActionSuccess(result.message);
        }

        if (action === 'pause') {
          const result = await pauseProcesso(idProcesso);
          setActionSuccess(result.message);
        }

        if (action === 'resume') {
          const result = await resumeProcesso(idProcesso);
          setActionSuccess(result.message);
        }

        if (action === 'finish') {
          const result = await finishProcesso(idProcesso, { observacao: reason || undefined });
          setActionSuccess(result.message);
        }

        if (action === 'interrupt') {
          const result = await interruptProcesso(idProcesso, {
            motivo: reason || 'Interrompido pela tela de Processos.',
          });
          setActionSuccess(result.message);
        }

        if (action === 'emergency-stop') {
          const result = await emergencyStopProcesso(idProcesso, {
            motivo: reason || 'Parada de emergencia solicitada pela tela de Processos.',
          });
          setActionSuccess(result.message);
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
