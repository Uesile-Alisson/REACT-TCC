import { Download, FileSpreadsheet, X } from 'lucide-react';
import styles from './RelatorioPreviewModal.module.scss';
import type { FormatoRelatorio } from '../../../types';

type RelatorioPreviewModalProps = {
  isOpen: boolean;
  previewUrl: string | null;
  filename: string | null;
  contentType: string | null;
  format?: FormatoRelatorio | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
};

export function RelatorioPreviewModal({
  isOpen,
  previewUrl,
  filename,
  contentType,
  format,
  isLoading,
  error,
  onClose,
}: RelatorioPreviewModalProps) {
  if (!isOpen) {
    return null;
  }

  const isXlsxPreview =
    format === 'XLSX' ||
    contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    filename?.toLowerCase().endsWith('.xlsx') === true;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="preview-title">
      <section className={styles.modal}>
        <header>
          <div>
            <p>{isXlsxPreview ? 'Preview XLSX' : 'Preview PDF'}</p>
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
          {previewUrl && !error && !isXlsxPreview ? (
            <iframe src={previewUrl} title={filename ?? 'Preview PDF'} />
          ) : null}
          {previewUrl && !error && isXlsxPreview ? (
            <section className={styles.xlsxPreview} aria-label="Preview XLSX">
              <FileSpreadsheet size={42} aria-hidden="true" />
              <div>
                <strong>Planilha XLSX pronta para abertura.</strong>
                <span>
                  O arquivo foi carregado pelo endpoint de preview. Navegadores nao renderizam XLSX
                  nativamente como PDF, entao use a acao abaixo para abrir ou salvar a planilha.
                </span>
              </div>
              <a href={previewUrl} download={filename ?? 'relatorio.xlsx'}>
                <Download size={16} aria-hidden="true" />
                Baixar XLSX
              </a>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}
