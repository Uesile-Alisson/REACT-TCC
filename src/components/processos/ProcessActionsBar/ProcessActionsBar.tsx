import { AlertTriangle, CheckCircle2, Pause, Play, RotateCw, XOctagon } from 'lucide-react';
import type { ProcessoAction, ProcessoResponse, ProcessosPermissions } from '../../../types';
import styles from './ProcessActionsBar.module.scss';

type ProcessActionsBarProps = {
  process: ProcessoResponse;
  permissions: ProcessosPermissions;
  loadingAction: ProcessoAction | 'create' | null;
  startBlockedMessage?: string | null;
  variant?: 'default' | 'featured';
  onAction: (action: ProcessoAction, process: ProcessoResponse) => void;
};

export function ProcessActionsBar({
  process,
  permissions,
  loadingAction,
  startBlockedMessage,
  variant = 'default',
  onAction,
}: ProcessActionsBarProps) {
  const status = process.status_processo;
  const actionsClassName =
    variant === 'featured' ? `${styles.actions} ${styles.featured}` : styles.actions;

  return (
    <div className={actionsClassName} aria-label="Acoes do processo">
      {permissions.canStartProcess(status) ? (
        <button
          type="button"
          onClick={() => onAction('start', process)}
          disabled={Boolean(loadingAction) || Boolean(startBlockedMessage)}
          title={startBlockedMessage ?? undefined}
        >
          <Play size={15} aria-hidden="true" />
          {loadingAction === 'start' ? 'Iniciando' : 'Iniciar'}
        </button>
      ) : null}

      {permissions.canPauseProcess(status) ? (
        <button type="button" onClick={() => onAction('pause', process)} disabled={Boolean(loadingAction)}>
          <Pause size={15} aria-hidden="true" />
          {loadingAction === 'pause' ? 'Pausando' : 'Pausar'}
        </button>
      ) : null}

      {permissions.canResumeProcess(status) ? (
        <button type="button" onClick={() => onAction('resume', process)} disabled={Boolean(loadingAction)}>
          <RotateCw size={15} aria-hidden="true" />
          {loadingAction === 'resume' ? 'Retomando' : 'Retomar'}
        </button>
      ) : null}

      {permissions.canFinishProcess(status) ? (
        <button type="button" onClick={() => onAction('finish', process)} disabled={Boolean(loadingAction)}>
          <CheckCircle2 size={15} aria-hidden="true" />
          {loadingAction === 'finish' ? 'Solicitando' : 'Iniciar encerramento'}
        </button>
      ) : null}

      {permissions.canInterruptProcess(status) ? (
        <button type="button" onClick={() => onAction('interrupt', process)} disabled={Boolean(loadingAction)}>
          <XOctagon size={15} aria-hidden="true" />
          {loadingAction === 'interrupt' ? 'Interrompendo' : 'Interromper'}
        </button>
      ) : null}

      {permissions.canEmergencyStop(status) ? (
        <button
          className={styles.danger}
          type="button"
          onClick={() => onAction('emergency-stop', process)}
          disabled={Boolean(loadingAction)}
        >
          <AlertTriangle size={15} aria-hidden="true" />
          {loadingAction === 'emergency-stop' ? 'Registrando' : 'Parada emergencia'}
        </button>
      ) : null}
    </div>
  );
}
