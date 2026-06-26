import styles from '../../tanques/TanqueConfigModal/TanqueConfigModal.module.scss';

type ConfirmActionModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function ConfirmActionModal({
  isOpen,
  title,
  description,
  confirmLabel,
  isSubmitting,
  onClose,
  onConfirm,
}: ConfirmActionModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="confirm-action-title">
      <section className={styles.modal}>
        <header>
          <div>
            <p>Confirmacao</p>
            <h2 id="confirm-action-title">{title}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Fechar
          </button>
        </header>

        <p className={styles.note}>{description}</p>

        <footer>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="button" onClick={() => void onConfirm()} disabled={isSubmitting}>
            {isSubmitting ? 'Processando' : confirmLabel}
          </button>
        </footer>
      </section>
    </div>
  );
}
