import { DatabaseBackup, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BackupDetailModal } from '../../components/backups/BackupDetailModal';
import { BackupFilters } from '../../components/backups/BackupFilters';
import { BackupGenerateModal } from '../../components/backups/BackupGenerateModal';
import { BackupListTable } from '../../components/backups/BackupListTable';
import { BackupRestoreModal } from '../../components/backups/BackupRestoreModal';
import { BackupSummaryCards } from '../../components/backups/BackupSummaryCards';
import { RealDataChartPanel } from '../../components/charts/RealDataChartPanel';
import { useAuth } from '../../hooks/useAuth';
import { useBackups } from '../../hooks/useBackups';
import type { BackupListItem, BackupType } from '../../types';
import { countBy, formatShortDate } from '../../utils/chartData';
import styles from './BackupsPage.module.scss';

function getRestoreTypes(type: BackupType): BackupType[] {
  if (type === 'SISTEMA') {
    return ['SISTEMA'];
  }

  if (type === 'MQTT') {
    return ['MQTT'];
  }

  return ['COMPLETO'];
}

export function BackupsPage() {
  const { user } = useAuth();
  const canUseBackups = user?.nivel_acesso === 'ADMINISTRADOR';
  const {
    backups,
    selectedBackup,
    total,
    page,
    limit,
    filters,
    isLoading,
    actionLoading,
    feedback,
    setFilters,
    setPage,
    refresh,
    selectBackup,
    clearSelectedBackup,
    clearFeedback,
    generateBackup,
    restoreSelectedBackup,
  } = useBackups();
  const [generateType, setGenerateType] = useState<BackupType | null>(null);
  const [restoreBackupTarget, setRestoreBackupTarget] = useState<BackupListItem | null>(null);
  const typeChartData = useMemo(() => countBy(backups, (backup) => backup.tipo_backup), [backups]);
  const statusChartData = useMemo(() => countBy(backups, (backup) => backup.status_backup), [backups]);
  const originChartData = useMemo(() => countBy(backups, (backup) => backup.origem_backup), [backups]);
  const periodChartData = useMemo(
    () => countBy(backups, (backup) => formatShortDate(backup.criado_em)),
    [backups],
  );

  async function handleGenerate(type: BackupType, observacao: string): Promise<boolean> {
    return generateBackup({
      tipo_backup: type,
      origem_backup: 'MANUAL',
      observacao: observacao || undefined,
    });
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>TSEA / Governanca operacional</p>
          <h1>Backups</h1>
          <p>Gerencie snapshots de configuracoes do sistema e MQTT/Hardware sem expor dados sensiveis.</p>
        </div>

        <div className={styles.headerActions}>
          <button type="button" onClick={() => void refresh()} disabled={isLoading}>
            <RefreshCw size={16} aria-hidden="true" />
            {isLoading ? 'Atualizando' : 'Atualizar'}
          </button>
          <button type="button" onClick={() => setGenerateType('COMPLETO')} disabled={!canUseBackups}>
            <DatabaseBackup size={16} aria-hidden="true" />
            Gerar backup completo
          </button>
        </div>
      </header>

      {!canUseBackups ? (
        <section className={styles.warningState} role="status">
          <strong>Acesso administrativo necessario.</strong>
          <span>Apenas administradores podem gerar ou restaurar backups. A API continua sendo a fonte final de permissao.</span>
        </section>
      ) : null}

      {feedback ? (
        <section
          className={feedback.type === 'success' ? styles.successState : styles.errorState}
          role={feedback.type === 'success' ? 'status' : 'alert'}
        >
          <strong>{feedback.message}</strong>
          <button type="button" onClick={clearFeedback}>
            Dispensar
          </button>
        </section>
      ) : null}

      <section className={styles.quickActions} aria-label="Geracao rapida de backup">
        <button type="button" onClick={() => setGenerateType('SISTEMA')} disabled={!canUseBackups}>
          Gerar backup do sistema
        </button>
        <button type="button" onClick={() => setGenerateType('MQTT')} disabled={!canUseBackups}>
          Gerar backup MQTT/Hardware
        </button>
        <button type="button" onClick={() => setGenerateType('COMPLETO')} disabled={!canUseBackups}>
          Gerar backup completo
        </button>
      </section>

      <BackupSummaryCards backups={backups} total={total} />

      <section className={styles.chartGrid} aria-label="Graficos de backups">
        <RealDataChartPanel
          title="Backups por tipo"
          subtitle="Distribuicao SISTEMA, MQTT e COMPLETO da listagem carregada."
          data={typeChartData}
          variant="pie"
        />
        <RealDataChartPanel
          title="Backups por status"
          subtitle="Status operacional retornado pelo modulo de backup."
          data={statusChartData}
          variant="bar"
        />
        <RealDataChartPanel
          title="Backups por origem"
          subtitle="Origem manual, automatica ou de sistema."
          data={originChartData}
          variant="bar"
        />
        <RealDataChartPanel
          title="Backups por periodo"
          subtitle="Quantidade por data de criacao na lista carregada."
          data={periodChartData}
          variant="line"
        />
      </section>

      <BackupFilters filters={filters} onChange={setFilters} />

      <BackupListTable
        backups={backups}
        total={total}
        page={page}
        limit={limit}
        isLoading={isLoading}
        canRestore={canUseBackups}
        onDetail={(id) => void selectBackup(id)}
        onRestore={setRestoreBackupTarget}
        onPageChange={setPage}
      />

      <BackupGenerateModal
        type={generateType}
        isLoading={actionLoading === 'create'}
        onClose={() => setGenerateType(null)}
        onConfirm={handleGenerate}
      />

      <BackupRestoreModal
        isOpen={Boolean(restoreBackupTarget)}
        title="Restaurar backup"
        backups={restoreBackupTarget ? [restoreBackupTarget] : []}
        allowedTypes={restoreBackupTarget ? getRestoreTypes(restoreBackupTarget.tipo_backup) : ['SISTEMA']}
        isLoading={actionLoading === 'restore'}
        initialSelectedId={restoreBackupTarget?.id_backup}
        onClose={() => setRestoreBackupTarget(null)}
        onRefresh={refresh}
        onConfirm={restoreSelectedBackup}
      />

      <BackupDetailModal backup={selectedBackup} onClose={clearSelectedBackup} />
    </main>
  );
}
