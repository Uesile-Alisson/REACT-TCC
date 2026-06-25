import { X } from 'lucide-react';
import styles from './RelatorioPreviewModal.module.scss';

type RelatorioPreviewModalProps = {
  isOpen: boolean;
  previewUrl: string | null;
  filename: string | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
};

export function RelatorioPreviewModal({
  isOpen,
  previewUrl,
  filename,
  isLoading,
  error,
  onClose,
}: RelatorioPreviewModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="preview-title">
      <section className={styles.modal}>
        <header>
          <div>
            <p>Preview PDF</p>
            <h2 id="preview-title">{filename ?? 'Relatorio'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar preview">
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className={styles.viewer}>
          {isLoading ? <span>Carregando preview...</span> : null}
          {error ? (
            <section className={styles.errorState} role="alert">
              <strong>Preview indisponivel.</strong>
              <span>{error}</span>
            </section>
          ) : null}
          {previewUrl && !error ? <iframe src={previewUrl} title={filename ?? 'Preview PDF'} /> : null}
        </div>
      </section>
    </div>
  );
}
