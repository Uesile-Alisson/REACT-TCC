import { RefreshCw, RotateCcw } from 'lucide-react';
import type { MqttHardwareAction, MqttHardwareActionFeedback, MqttHardwarePermissions } from '../../../types';
import styles from './HardwareActionsPanel.module.scss';

type HardwareActionsPanelProps = {
  permissions: MqttHardwarePermissions;
  actionLoading: MqttHardwareAction | null;
  actionError: string | null;
  actionSuccess: MqttHardwareActionFeedback | null;
  onRestartCommunication: () => void;
  onSyncHardware: () => void;
  onClearFeedback: () => void;
};

export function HardwareActionsPanel({
  permissions,
  actionLoading,
  actionError,
  actionSuccess,
  onRestartCommunication,
  onSyncHardware,
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
      </div>

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
