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
    vacuo_alvo: toOptionalNumber(form.vacuo_alvo),
    tanques: [
      {
        id_tanque: Number(form.id_tanque),
        vacuo_alvo: toOptionalNumber(form.vacuo_alvo_tanque),
        sensores: [
          {
            id_sensor: Number(form.id_sensor),
            observacoes: form.observacoes_sensor.trim() || undefined,
          },
        ],
      },
    ],
  };
}

export function useProcessActions(onDone: () => Promise<void>): UseProcessActionsResult {
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
        setActionError(getAuthErrorMessage(error));
      } finally {
        setActionLoading(null);
      }
    },
    [onDone],
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
