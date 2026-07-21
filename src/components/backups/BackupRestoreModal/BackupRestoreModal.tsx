import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { BackupListItem, BackupType, RestoreBackupRequest } from '../../../types';
import {
  formatBackupBytes,
  formatBackupDate,
  getBackupStatusLabel,
  getBackupTypeLabel,
  getBackupUserLabel,
  getShortHash,
} from '../backupUtils';
import styles from './BackupRestoreModal.module.scss';

type BackupRestoreModalProps = {
  isOpen: boolean;
  title: string;
  backups: BackupListItem[];
  allowedTypes: BackupType[];
  isLoading: boolean;
  initialSelectedId?: number;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onConfirm: (id: number, payload: RestoreBackupRequest) => Promise<boolean>;
};

export function BackupRestoreModal({
  isOpen,
  title,
  backups,
  allowedTypes,
  isLoading,
  initialSelectedId,
  onClose,
  onRefresh,
  onConfirm,
}: BackupRestoreModalProps) {
  const [selectedId, setSelectedId] = useState<string>('');
  const [motivo, setMotivo] = useState<string>('');
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const availableBackups = useMemo(
    () => backups.filter((backup) => allowedTypes.includes(backup.tipo_backup)),
    [allowedTypes, backups],
  );
  const effectiveSelectedId = selectedId || (isOpen && initialSelectedId ? String(initialSelectedId) : '');
  const selectedBackup = availableBackups.find((backup) => backup.id_backup === Number(effectiveSelectedId)) ?? null;
  const restoresMqttConfiguration =
    selectedBackup?.tipo_backup === 'MQTT' || selectedBackup?.tipo_backup === 'COMPLETO';

  if (!isOpen) {
    return null;
  }

  function resetState(): void {
    setSelectedId('');
    setMotivo('');
    setConfirmed(false);
    setLocalError(null);
  }

  function handleClose(): void {
    resetState();
    onClose();
  }

  async function handleConfirm(): Promise<void> {
    if (!selectedBackup) {
      setLocalError('Selecione um backup para restaurar.');
      return;
    }

    if (!confirmed) {
      setLocalError('Confirme que entende o impacto da restauracao.');
      return;
    }

    const payload: RestoreBackupRequest = {
      confirmar_restauracao: true,
      motivo: motivo.trim() || undefined,
    };
    const success = await onConfirm(selectedBackup.id_backup, payload);

    if (success) {
      resetState();
      onClose();
    }
  }

  return (
    <motion.div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-restore-title"
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
            <p>Restauracao controlada</p>
            <h2 id="backup-restore-title">{title}</h2>
          </div>
          <button type="button" onClick={() => void onRefresh()} disabled={isLoading}>
            {isLoading ? 'Carregando backups...' : 'Atualizar lista'}
          </button>
        </header>

        <label>
          Backup disponivel
          <select value={effectiveSelectedId} onChange={(event) => setSelectedId(event.target.value)}>
            <option value="">Selecione um backup</option>
            {availableBackups.map((backup) => (
              <option key={backup.id_backup} value={backup.id_backup}>
                #{backup.id_backup} - {getBackupTypeLabel(backup.tipo_backup)} - {backup.nome_arquivo}
              </option>
            ))}
          </select>
        </label>

        {selectedBackup ? (
          <dl className={styles.details}>
            <div>
              <dt>Tipo</dt>
              <dd>{getBackupTypeLabel(selectedBackup.tipo_backup)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{getBackupStatusLabel(selectedBackup.status_backup)}</dd>
            </div>
            <div>
              <dt>Criado em</dt>
              <dd>{formatBackupDate(selectedBackup.criado_em)}</dd>
            </div>
            <div>
              <dt>Criado por</dt>
              <dd>{getBackupUserLabel(selectedBackup.usuario_criacao)}</dd>
            </div>
            <div>
              <dt>Restaurado em</dt>
              <dd>{formatBackupDate(selectedBackup.restaurado_em)}</dd>
            </div>
            <div>
              <dt>Restaurado por</dt>
              <dd>{getBackupUserLabel(selectedBackup.usuario_restauracao)}</dd>
            </div>
            <div>
              <dt>Tamanho</dt>
              <dd>{formatBackupBytes(selectedBackup.tamanho_bytes)}</dd>
            </div>
            <div>
              <dt>Hash</dt>
              <dd>{getShortHash(selectedBackup.hash_arquivo)}</dd>
            </div>
          </dl>
        ) : (
          <div className={styles.empty}>Nenhum backup selecionado.</div>
        )}

        <section className={styles.warning}>
          Restaurar altera configuracoes atuais. Processos, relatorios, alarmes e historico nao sao
          restaurados.
          {restoresMqttConfiguration
            ? ' Credenciais MQTT nao fazem parte do backup; configure-as novamente pela rota segura e teste a conexao depois da restauracao.'
            : null}
        </section>

        <label>
          Motivo
          <textarea value={motivo} onChange={(event) => setMotivo(event.target.value)} />
        </label>

        <label className={styles.confirmation}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          />
          Confirmo que desejo restaurar este backup.
        </label>

        {localError ? <span className={styles.error}>{localError}</span> : null}

        <footer>
          <button type="button" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </button>
          <button type="button" onClick={() => void handleConfirm()} disabled={isLoading}>
            {isLoading ? 'Restaurando backup...' : 'Restaurar backup'}
          </button>
        </footer>
      </motion.section>
    </motion.div>
  );
}
