import { motion } from 'framer-motion';
import { Eye, RotateCcw } from 'lucide-react';
import type { BackupListItem } from '../../../types';
import {
  formatBackupBytes,
  formatBackupDate,
  getBackupStatusLabel,
  getBackupStatusTone,
  getBackupTypeLabel,
  getBackupUserLabel,
  getShortHash,
} from '../backupUtils';
import styles from './BackupListTable.module.scss';

type BackupListTableProps = {
  backups: BackupListItem[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  canRestore: boolean;
  onDetail: (id: number) => void;
  onRestore: (backup: BackupListItem) => void;
  onPageChange: (page: number) => void;
};

export function BackupListTable({
  backups,
  total,
  page,
  limit,
  isLoading,
  canRestore,
  onDetail,
  onRestore,
  onPageChange,
}: BackupListTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section className={styles.panel}>
      <header>
        <div>
          <p>Repositorio</p>
          <h2>Backups registrados</h2>
        </div>
        <span>{isLoading ? 'Carregando backups...' : `${total} registros`}</span>
      </header>

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Arquivo</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Criado em</th>
              <th>Criado por</th>
              <th>Restaurado em</th>
              <th>Restaurado por</th>
              <th>Tamanho</th>
              <th>Storage</th>
              <th>Hash</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {backups.map((backup, index) => (
              <motion.tr
                key={backup.id_backup}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.025, duration: 0.18 }}
                whileHover={{ backgroundColor: 'rgba(83, 197, 255, 0.075)' }}
              >
                <td>#{backup.id_backup}</td>
                <td>{backup.nome_arquivo}</td>
                <td>{getBackupTypeLabel(backup.tipo_backup)}</td>
                <td>
                  <span className={`${styles.badge} ${styles[getBackupStatusTone(backup.status_backup)]}`}>
                    {getBackupStatusLabel(backup.status_backup)}
                  </span>
                </td>
                <td>{formatBackupDate(backup.criado_em)}</td>
                <td>{getBackupUserLabel(backup.usuario_criacao)}</td>
                <td>{formatBackupDate(backup.restaurado_em)}</td>
                <td>{getBackupUserLabel(backup.usuario_restauracao)}</td>
                <td>{formatBackupBytes(backup.tamanho_bytes)}</td>
                <td>{backup.storage_provider ?? 'Nao informado'}</td>
                <td>{getShortHash(backup.hash_arquivo)}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      onClick={() => onDetail(backup.id_backup)}
                      aria-label={`Ver detalhes do backup ${backup.id_backup}`}
                    >
                      <Eye size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRestore(backup)}
                      disabled={!canRestore}
                      aria-label={`Restaurar backup ${backup.id_backup}`}
                    >
                      <RotateCcw size={15} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {backups.length === 0 ? (
        <div className={styles.emptyState}>
          <strong>{isLoading ? 'Carregando backups...' : 'Nenhum backup encontrado.'}</strong>
          <span>Ajuste os filtros ou gere um backup manual.</span>
        </div>
      ) : null}

      <footer>
        <span>
          Pagina {page} de {totalPages}
        </span>
        <div>
          <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || isLoading}>
            Anterior
          </button>
          <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages || isLoading}>
            Proxima
          </button>
        </div>
      </footer>
    </section>
  );
}
