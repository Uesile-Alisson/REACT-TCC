import { useCallback, useMemo, useState } from 'react';
import {
  closeAllValves,
  disconnectMqtt,
  emergencyStopHardware,
  openAllValves,
  reconnectMqtt,
  restartCommunication,
  syncHardware,
  testMqttConnection,
  turnOffAllPumps,
} from '../services/mqtt-hardware.service';
import type {
  MqttCommandResponse,
  MqttHardwareAction,
  MqttHardwareActionFeedback,
} from '../types';
import { getAuthErrorMessage } from '../utils/authErrors';

type UseHardwareActionsResult = {
  actionLoading: MqttHardwareAction | null;
  actionError: string | null;
  actionSuccess: MqttHardwareActionFeedback | null;
  clearActionFeedback: () => void;
  handleRestartCommunication: () => Promise<boolean>;
  handleSyncHardware: () => Promise<boolean>;
  handleTestConnection: () => Promise<boolean>;
  handleReconnect: () => Promise<boolean>;
  handleDisconnect: () => Promise<boolean>;
  handleTurnOffAllPumps: () => Promise<boolean>;
  handleOpenAllValves: () => Promise<boolean>;
  handleCloseAllValves: () => Promise<boolean>;
  handleEmergencyStop: () => Promise<boolean>;
};

type CommandExecutor = () => Promise<MqttCommandResponse>;

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

  const executeAction = useCallback(async (
    type: MqttHardwareAction,
    execute: CommandExecutor,
    fallbackMessage: string,
    confirmation?: string,
  ): Promise<boolean> => {
    if (confirmation && !window.confirm(confirmation)) {
      return false;
    }

    setActionLoading(type);
    setActionError(null);
    setActionSuccess(null);

    try {
      const response = await execute();
      setActionSuccess({
        type,
        message: getCommandMessage(response.message, fallbackMessage),
      });
      return true;
    } catch (error: unknown) {
      setActionError(getAuthErrorMessage(error));
      return false;
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleRestartCommunication = useCallback(
    () => executeAction(
      'restartCommunication',
      () => restartCommunication({ motivo: 'Reinicio solicitado pela tela MQTT/Hardware.' }),
      'Reinicio de comunicacao confirmado pelo controlador.',
      'Reiniciar a comunicacao do hardware pelo backend?',
    ),
    [executeAction],
  );

  const handleSyncHardware = useCallback(
    () => executeAction(
      'syncHardware',
      () => syncHardware({ motivo: 'Sincronizacao solicitada pela tela MQTT/Hardware.' }),
      'Sincronizacao de hardware confirmada pelo controlador.',
      'Sincronizar o hardware com o estado seguro conhecido pelo backend?',
    ),
    [executeAction],
  );

  const handleTestConnection = useCallback(
    () => executeAction(
      'testConnection',
      testMqttConnection,
      'Teste de conexao MQTT concluido.',
    ),
    [executeAction],
  );

  const handleReconnect = useCallback(
    () => executeAction(
      'reconnect',
      reconnectMqtt,
      'Reconexao MQTT concluida.',
      'Solicitar uma nova conexao com o broker MQTT?',
    ),
    [executeAction],
  );

  const handleDisconnect = useCallback(
    () => executeAction(
      'disconnect',
      disconnectMqtt,
      'Desconexao MQTT concluida.',
      'Desconectar o backend do broker MQTT? Processos nao poderao iniciar enquanto a comunicacao estiver indisponivel.',
    ),
    [executeAction],
  );

  const handleTurnOffAllPumps = useCallback(
    () => executeAction(
      'turnOffAllPumps',
      () => turnOffAllPumps({ motivo: 'Desligamento global solicitado pela tela MQTT/Hardware.' }),
      'Comando de desligamento de todas as bombas confirmado.',
      'Desligar TODAS as bombas? O backend aguardara a confirmacao MQTT do controlador.',
    ),
    [executeAction],
  );

  const handleOpenAllValves = useCallback(
    () => executeAction(
      'openAllValves',
      () => openAllValves({ motivo: 'Abertura global solicitada pela tela MQTT/Hardware.' }),
      'Comando de abertura de todas as valvulas confirmado.',
      'ATENCAO: abrir TODAS as valvulas altera o caminho do vacuo. Confirma a operacao global?',
    ),
    [executeAction],
  );

  const handleCloseAllValves = useCallback(
    () => executeAction(
      'closeAllValves',
      () => closeAllValves({ motivo: 'Fechamento global solicitado pela tela MQTT/Hardware.' }),
      'Comando de fechamento de todas as valvulas confirmado.',
      'Fechar TODAS as valvulas? O backend aguardara a confirmacao MQTT do controlador.',
    ),
    [executeAction],
  );

  const handleEmergencyStop = useCallback(
    () => executeAction(
      'emergencyStop',
      () => emergencyStopHardware({ motivo: 'Parada de emergencia solicitada pela tela MQTT/Hardware.' }),
      'Parada de emergencia aceita para processamento; aguarde a confirmacao do hardware.',
      'PARADA DE EMERGENCIA: interromper imediatamente todos os atuadores? A resposta HTTP 202 confirma apenas a aceitacao do pedido, nao a parada fisica.',
    ),
    [executeAction],
  );

  return useMemo(
    () => ({
      actionLoading,
      actionError,
      actionSuccess,
      clearActionFeedback,
      handleRestartCommunication,
      handleSyncHardware,
      handleTestConnection,
      handleReconnect,
      handleDisconnect,
      handleTurnOffAllPumps,
      handleOpenAllValves,
      handleCloseAllValves,
      handleEmergencyStop,
    }),
    [
      actionError,
      actionLoading,
      actionSuccess,
      clearActionFeedback,
      handleCloseAllValves,
      handleDisconnect,
      handleEmergencyStop,
      handleOpenAllValves,
      handleReconnect,
      handleRestartCommunication,
      handleSyncHardware,
      handleTestConnection,
      handleTurnOffAllPumps,
    ],
  );
}
