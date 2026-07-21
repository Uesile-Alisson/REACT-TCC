import { Activity, CircleStop, Power, RefreshCw, RotateCcw, Wifi, WifiOff } from 'lucide-react';
import type { MqttHardwareAction, MqttHardwareActionFeedback, MqttHardwarePermissions } from '../../../types';
import styles from './HardwareActionsPanel.module.scss';

type HardwareActionsPanelProps = {
  permissions: MqttHardwarePermissions;
  actionLoading: MqttHardwareAction | null;
  actionError: string | null;
  actionSuccess: MqttHardwareActionFeedback | null;
  onRestartCommunication: () => void;
  onSyncHardware: () => void;
  onTestConnection: () => void;
  onReconnect: () => void;
  onDisconnect: () => void;
  onTurnOffAllPumps: () => void;
  onOpenAllValves: () => void;
  onCloseAllValves: () => void;
  onEmergencyStop: () => void;
  onClearFeedback: () => void;
};

export function HardwareActionsPanel({
  permissions,
  actionLoading,
  actionError,
  actionSuccess,
  onRestartCommunication,
  onSyncHardware,
  onTestConnection,
  onReconnect,
  onDisconnect,
  onTurnOffAllPumps,
  onOpenAllValves,
  onCloseAllValves,
  onEmergencyStop,
  onClearFeedback,
}: HardwareActionsPanelProps) {
  return (
    <section className={styles.panel}>
      <header>
        <p>Acoes do backend</p>
        <h2>Comunicacao com hardware</h2>
      </header>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={onTestConnection}
          disabled={!permissions.canTestConnection || Boolean(actionLoading)}
        >
          <Activity size={16} aria-hidden="true" />
          {actionLoading === 'testConnection' ? 'Testando' : 'Testar conexao'}
        </button>
        <button
          type="button"
          onClick={onReconnect}
          disabled={!permissions.canReconnect || Boolean(actionLoading)}
        >
          <Wifi size={16} aria-hidden="true" />
          {actionLoading === 'reconnect' ? 'Reconectando' : 'Reconectar MQTT'}
        </button>
        <button
          type="button"
          onClick={onDisconnect}
          disabled={!permissions.canDisconnect || Boolean(actionLoading)}
          title={!permissions.canDisconnect ? 'Somente administradores podem desconectar o MQTT.' : undefined}
        >
          <WifiOff size={16} aria-hidden="true" />
          {actionLoading === 'disconnect' ? 'Desconectando' : 'Desconectar MQTT'}
        </button>
        <button
          type="button"
          onClick={onRestartCommunication}
          disabled={!permissions.canRestartCommunication || Boolean(actionLoading)}
        >
          <RotateCcw size={16} aria-hidden="true" />
          {actionLoading === 'restartCommunication' ? 'Reiniciando' : 'Reiniciar comunicacao'}
        </button>
        <button
          type="button"
          onClick={onSyncHardware}
          disabled={!permissions.canSyncHardware || Boolean(actionLoading)}
        >
          <RefreshCw size={16} aria-hidden="true" />
          {actionLoading === 'syncHardware' ? 'Sincronizando' : 'Sincronizar hardware'}
        </button>
        <button
          type="button"
          onClick={onTurnOffAllPumps}
          disabled={!permissions.canSendGlobalCommands || Boolean(actionLoading)}
        >
          <Power size={16} aria-hidden="true" />
          {actionLoading === 'turnOffAllPumps' ? 'Desligando' : 'Desligar bombas'}
        </button>
        <button
          type="button"
          onClick={onOpenAllValves}
          disabled={!permissions.canSendGlobalCommands || Boolean(actionLoading)}
        >
          <RotateCcw size={16} aria-hidden="true" />
          {actionLoading === 'openAllValves' ? 'Abrindo' : 'Abrir valvulas'}
        </button>
        <button
          type="button"
          onClick={onCloseAllValves}
          disabled={!permissions.canSendGlobalCommands || Boolean(actionLoading)}
        >
          <CircleStop size={16} aria-hidden="true" />
          {actionLoading === 'closeAllValves' ? 'Fechando' : 'Fechar valvulas'}
        </button>
        <button
          type="button"
          className={styles.emergency}
          onClick={onEmergencyStop}
          disabled={!permissions.canEmergencyStop || Boolean(actionLoading)}
        >
          <CircleStop size={16} aria-hidden="true" />
          {actionLoading === 'emergencyStop' ? 'Enviando parada' : 'Parada de emergencia'}
        </button>
      </div>

      <p className={styles.safetyNote}>
        Comandos globais exigem confirmacao e so sao considerados concluidos quando a API recebe o
        ACK previsto. A parada de emergencia e inicialmente apenas aceita para processamento.
      </p>

      {actionError ? (
        <section className={styles.errorState} role="alert">
          <strong>Comando nao concluido.</strong>
          <span>{actionError}</span>
          <button type="button" onClick={onClearFeedback}>
            Dispensar
          </button>
        </section>
      ) : null}

      {actionSuccess ? (
        <section className={styles.successState} role="status">
          <strong>{actionSuccess.message}</strong>
          <button type="button" onClick={onClearFeedback}>
            Dispensar
          </button>
        </section>
      ) : null}
    </section>
  );
}
