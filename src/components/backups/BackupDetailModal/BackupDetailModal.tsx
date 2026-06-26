import { motion } from 'framer-motion';
import type { BackupDetail } from '../../../types';
import {
  formatBackupBytes,
  formatBackupDate,
  getBackupStatusLabel,
  getBackupTypeLabel,
  getBackupUserLabel,
  getShortHash,
} from '../backupUtils';
import styles from './BackupDetailModal.module.scss';

type BackupDetailModalProps = {
  backup: BackupDetail | null;
  onClose: () => void;
};

function formatJson(value: unknown): string {
  if (value === undefined || value === null) {
    return 'Nao informado';
  }

  return JSON.stringify(value, null, 2);
}

export function BackupDetailModal({ backup, onClose }: BackupDetailModalProps) {
  if (!backup) {
    return null;
  }

  return (
    <motion.div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-detail-title"
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
          <div>
            <p>Detalhes do backup</p>
            <h2 id="backup-detail-title">{backup.nome_arquivo}</h2>
          </div>
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </header>

        <dl className={styles.metadata}>
          <div>
            <dt>ID</dt>
            <dd>{backup.id_backup}</dd>
          </div>
          <div>
            <dt>Tipo</dt>
            <dd>{getBackupTypeLabel(backup.tipo_backup)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{getBackupStatusLabel(backup.status_backup)}</dd>
          </div>
          <div>
            <dt>Origem</dt>
            <dd>{backup.origem_backup}</dd>
          </div>
          <div>
            <dt>Criado em</dt>
            <dd>{formatBackupDate(backup.criado_em)}</dd>
          </div>
          <div>
            <dt>Criado por</dt>
            <dd>{getBackupUserLabel(backup.usuario_criacao)}</dd>
          </div>
          <div>
            <dt>Restaurado em</dt>
            <dd>{formatBackupDate(backup.restaurado_em)}</dd>
          </div>
          <div>
            <dt>Restaurado por</dt>
            <dd>{getBackupUserLabel(backup.usuario_restauracao)}</dd>
          </div>
          <div>
            <dt>Tamanho</dt>
            <dd>{formatBackupBytes(backup.tamanho_bytes)}</dd>
          </div>
          <div>
            <dt>Storage</dt>
            <dd>{backup.storage_provider ?? 'Nao informado'}</dd>
          </div>
          <div>
            <dt>Content type</dt>
            <dd>{backup.content_type ?? 'Nao informado'}</dd>
          </div>
          <div>
            <dt>Hash</dt>
            <dd>{getShortHash(backup.hash_arquivo)}</dd>
          </div>
          <div>
            <dt>Erro</dt>
            <dd>{backup.erro ?? 'Nao informado'}</dd>
          </div>
        </dl>

        <section className={styles.preview}>
          <h3>Metadados</h3>
          <pre>{formatJson(backup.metadados)}</pre>
        </section>

        <section className={styles.preview}>
          <h3>Snapshot preview sanitizado</h3>
          <pre>{formatJson(backup.snapshot_preview)}</pre>
        </section>
      </motion.section>
    </motion.div>
  );
}
