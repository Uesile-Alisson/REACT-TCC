import { useState } from 'react';
import type { ProcessoAction, ProcessoActionState } from '../../../types';
import styles from './ConfirmProcessActionModal.module.scss';

type ConfirmProcessActionModalProps = {
  actionState: ProcessoActionState | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (action: ProcessoAction, idProcesso: number, reason: string) => Promise<void>;
};

function getActionLabel(action: ProcessoAction): string {
  const labels: Record<ProcessoAction, string> = {
    start: 'Iniciar processo',
    pause: 'Pausar processo',
    resume: 'Retomar processo',
    finish: 'Iniciar encerramento seguro',
    interrupt: 'Interromper processo',
    'emergency-stop': 'Parada de emergencia',
  };

  return labels[action];
}

function requiresReason(action: ProcessoAction): boolean {
  return action === 'finish' || action === 'interrupt' || action === 'emergency-stop';
}

function getActionNotice(action: ProcessoAction): string | null {
  if (action === 'finish') {
    return 'A confirmacao apenas inicia o encerramento geral seguro. O processo sera concluido depois que o backend confirmar o estado seguro do hardware.';
  }

  if (action === 'emergency-stop') {
    return 'A resposta HTTP 202 confirma o registro da solicitacao, nao a parada fisica. A confirmacao do latch e das saidas do controlador pode permanecer pendente.';
  }

  return null;
}

export function ConfirmProcessActionModal({
  actionState,
  isSubmitting,
  onCancel,
  onConfirm,
}: ConfirmProcessActionModalProps) {
  const [reason, setReason] = useState<string>('');

  if (!actionState) {
    return null;
  }

  const requireReason = requiresReason(actionState.type);
  const actionNotice = getActionNotice(actionState.type);
  const processName =
    actionState.process.nome_processo ?? `Processo #${actionState.process.id_processo}`;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="confirm-action-title">
      <section className={styles.modal}>
        <header>
          <p>Confirmacao operacional</p>
          <h2 id="confirm-action-title">{getActionLabel(actionState.type)}</h2>
        </header>

        <p>
          Confirme a acao para <strong>{processName}</strong>. O backend continua validando regras
          de permissao e pre-condicao.
        </p>

        {actionNotice ? <p role="status">{actionNotice}</p> : null}

        {requireReason ? (
          <label>
            Motivo/observacao
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} />
          </label>
        ) : null}

        <footer>
          <button type="button" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void onConfirm(actionState.type, actionState.process.id_processo, reason)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Executando' : 'Confirmar'}
          </button>
        </footer>
      </section>
    </div>
  );
}
