import { motion } from 'framer-motion';
import { useState } from 'react';
import type { BackupType } from '../../../types';
import { getBackupTypeLabel } from '../backupUtils';
import styles from './BackupGenerateModal.module.scss';

type BackupGenerateModalProps = {
  type: BackupType | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (type: BackupType, observacao: string) => Promise<boolean>;
};

export function BackupGenerateModal({
  type,
  isLoading,
  onClose,
  onConfirm,
}: BackupGenerateModalProps) {
  const [observacao, setObservacao] = useState<string>('');

  if (!type) {
    return null;
  }

  const selectedType = type;

  function handleClose(): void {
    setObservacao('');
    onClose();
  }

  async function handleConfirm(): Promise<void> {
    const success = await onConfirm(selectedType, observacao.trim());

    if (success) {
      handleClose();
    }
  }

  return (
    <motion.div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-generate-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.section
        className={styles.modal}
        initial={{ opacity: 0, y: 18, scale: 0.97, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: 10, scale: 0.98, filter: 'blur(4px)' }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <header>
          <p>Backup manual</p>
          <h2 id="backup-generate-title">Gerar backup {getBackupTypeLabel(type)}</h2>
        </header>

        <p>
          A API vai criar um snapshot seguro das configuracoes selecionadas. Nenhuma senha MQTT sera enviada
          durante a geracao.
        </p>

        <label>
          Observacao
          <textarea value={observacao} onChange={(event) => setObservacao(event.target.value)} />
        </label>

        <footer>
          <button type="button" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </button>
          <button type="button" onClick={() => void handleConfirm()} disabled={isLoading}>
            {isLoading ? 'Gerando backup...' : 'Gerar backup'}
          </button>
        </footer>
      </motion.section>
    </motion.div>
  );
}
