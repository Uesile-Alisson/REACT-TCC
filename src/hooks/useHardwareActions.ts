import { useCallback, useMemo, useState } from 'react';
import { restartCommunication, syncHardware } from '../services/mqtt-hardware.service';
import type { MqttHardwareAction, MqttHardwareActionFeedback } from '../types';
import { getAuthErrorMessage } from '../utils/authErrors';

type UseHardwareActionsResult = {
  actionLoading: MqttHardwareAction | null;
  actionError: string | null;
  actionSuccess: MqttHardwareActionFeedback | null;
  clearActionFeedback: () => void;
  handleRestartCommunication: () => Promise<boolean>;
  handleSyncHardware: () => Promise<boolean>;
};

function getCommandMessage(responseMessage?: string, fallback?: string): string {
  return responseMessage?.trim() || fallback || 'Comando enviado ao backend.';
}

export function useHardwareActions(): UseHardwareActionsResult {
  const [actionLoading, setActionLoading] = useState<MqttHardwareAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<MqttHardwareActionFeedback | null>(null);

  const clearActionFeedback = useCallback((): void => {
    setActionError(null);
    setActionSuccess(null);
  }, []);

  const handleRestartCommunication = useCallback(async (): Promise<boolean> => {
    const confirmed = window.confirm('Reiniciar a comunicacao do hardware pelo backend?');

    if (!confirmed) {
      return false;
    }

    setActionLoading('restartCommunication');
    setActionError(null);
    setActionSuccess(null);

    try {
      const response = await restartCommunication({
        motivo: 'Reinicio de comunicacao solicitado pela tela MQTT/Hardware.',
      });
      setActionSuccess({
        type: 'restartCommunication',
        message: getCommandMessage(response.message, 'Reinicio de comunicacao solicitado.'),
      });
      return true;
    } catch (error: unknown) {
      setActionError(getAuthErrorMessage(error));
      return false;
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleSyncHardware = useCallback(async (): Promise<boolean> => {
    const confirmed = window.confirm('Sincronizar o hardware com o estado do backend?');

    if (!confirmed) {
      return false;
    }

    setActionLoading('syncHardware');
    setActionError(null);
    setActionSuccess(null);

    try {
      const response = await syncHardware({
        motivo: 'Sincronizacao de hardware solicitada pela tela MQTT/Hardware.',
      });
      setActionSuccess({
        type: 'syncHardware',
        message: getCommandMessage(response.message, 'Sincronizacao de hardware solicitada.'),
      });
      return true;
    } catch (error: unknown) {
      setActionError(getAuthErrorMessage(error));
      return false;
    } finally {
      setActionLoading(null);
    }
  }, []);

  return useMemo(
    () => ({
      actionLoading,
      actionError,
      actionSuccess,
      clearActionFeedback,
      handleRestartCommunication,
      handleSyncHardware,
    }),
    [
      actionError,
      actionLoading,
      actionSuccess,
      clearActionFeedback,
      handleRestartCommunication,
      handleSyncHardware,
    ],
  );
}
