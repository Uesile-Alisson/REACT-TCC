import { DatabaseBackup, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBackups } from '../../../hooks/useBackups';
import type { BackupType } from '../../../types';
import { BackupGenerateModal } from '../BackupGenerateModal';
import { BackupRestoreModal } from '../BackupRestoreModal';
import styles from './BackupQuickActions.module.scss';

type BackupQuickActionsProps = {
  title: string;
  description: string;
  generateType: BackupType;
  restoreTypes: BackupType[];
  canUseBackups: boolean;
  restoreTitle: string;
  postRestoreMessage?: string;
};

export function BackupQuickActions({
  title,
  description,
  generateType,
  restoreTypes,
  canUseBackups,
  restoreTitle,
  postRestoreMessage,
}: BackupQuickActionsProps) {
  const {
    backups,
    isLoading,
    actionLoading,
    feedback,
    refresh,
    clearFeedback,
    generateBackup,
    restoreSelectedBackup,
  } = useBackups({ autoLoad: false, allowedTypes: restoreTypes });
  const [generateModalType, setGenerateModalType] = useState<BackupType | null>(null);
  const [isRestoreOpen, setIsRestoreOpen] = useState<boolean>(false);
  const [lastSuccessfulOperation, setLastSuccessfulOperation] = useState<'create' | 'restore' | null>(null);

  useEffect(() => {
    if (isRestoreOpen) {
      queueMicrotask(() => void refresh());
    }
  }, [isRestoreOpen, refresh]);

  async function handleGenerate(type: BackupType, observacao: string): Promise<boolean> {
    const success = await generateBackup({
      tipo_backup: type,
      origem_backup: 'MANUAL',
      observacao: observacao || undefined,
    });

    if (success) {
      setLastSuccessfulOperation('create');
    }

    return success;
  }

  async function handleRestore(
    id: number,
    payload: Parameters<typeof restoreSelectedBackup>[1],
  ): Promise<boolean> {
    const success = await restoreSelectedBackup(id, payload);

    if (success) {
      setLastSuccessfulOperation('restore');
    }

    return success;
  }

  return (
    <section className={styles.panel}>
      <header>
        <div>
          <p>Backup</p>
          <h2>{title}</h2>
          <span>{description}</span>
        </div>
      </header>

      {!canUseBackups ? (
        <div className={styles.warning}>Apenas administradores podem gerar/restaurar backups.</div>
      ) : null}

      {feedback ? (
        <div className={feedback.type === 'success' ? styles.success : styles.error} role={feedback.type === 'success' ? 'status' : 'alert'}>
          <strong>{feedback.message}</strong>
          {postRestoreMessage && feedback.type === 'success' && lastSuccessfulOperation === 'restore' ? (
            <span>{postRestoreMessage}</span>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setLastSuccessfulOperation(null);
              clearFeedback();
            }}
          >
            Dispensar
          </button>
        </div>
      ) : null}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => setGenerateModalType(generateType)}
          disabled={!canUseBackups || actionLoading === 'create'}
        >
          <DatabaseBackup size={16} aria-hidden="true" />
          {actionLoading === 'create' ? 'Gerando backup...' : 'Gerar backup'}
        </button>
        <button
          type="button"
          onClick={() => setIsRestoreOpen(true)}
          disabled={!canUseBackups || actionLoading === 'restore'}
        >
          <RotateCcw size={16} aria-hidden="true" />
          {actionLoading === 'restore' ? 'Restaurando backup...' : 'Restaurar backup'}
        </button>
      </div>

      <BackupGenerateModal
        type={generateModalType}
        isLoading={actionLoading === 'create'}
        onClose={() => setGenerateModalType(null)}
        onConfirm={handleGenerate}
      />

      <BackupRestoreModal
        isOpen={isRestoreOpen}
        title={restoreTitle}
        backups={backups}
        allowedTypes={restoreTypes}
        isLoading={isLoading || actionLoading === 'restore'}
        onClose={() => setIsRestoreOpen(false)}
        onRefresh={refresh}
        onConfirm={handleRestore}
      />
    </section>
  );
}
