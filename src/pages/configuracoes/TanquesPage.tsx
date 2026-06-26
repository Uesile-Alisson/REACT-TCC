import { Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { RealDataChartPanel } from '../../components/charts/RealDataChartPanel';
import { ConfirmActionModal } from '../../components/configuracoes/ConfirmActionModal';
import { TanqueDetailPanel } from '../../components/tanques/TanqueDetailPanel';
import { TanqueConfigModal } from '../../components/tanques/TanqueConfigModal';
import { TanquesListTable } from '../../components/tanques/TanquesListTable';
import { TanquesSummaryCards } from '../../components/tanques/TanquesSummaryCards';
import { useTanquesBombasPermissions } from '../../hooks/useTanquesBombasPermissions';
import { useTanquesPage } from '../../hooks/useTanquesPage';
import type { TanqueConfigResponse } from '../../types';
import { countBy } from '../../utils/chartData';
import styles from './TanquesPage.module.scss';

export function TanquesPage() {
  const permissions = useTanquesBombasPermissions();
  const [editingTanque, setEditingTanque] = useState<TanqueConfigResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toggleTarget, setToggleTarget] = useState<TanqueConfigResponse | null>(null);
  const {
    tanques,
    selectedTanque,
    isLoading,
    actionLoading,
    error,
    successMessage,
    summary,
    pagination,
    selectTanque,
    loadTanques,
    createTanque,
    updateTanque,
    ativarTanque,
    desativarTanque,
    clearMessages,
  } = useTanquesPage();
  const tanquesPorStatus = countBy(tanques, (tanque) => tanque.status_tanque);
  const vacuoPorTanque = tanques.map((tanque) => ({
    name: tanque.nome,
    value: tanque.vacuo_padrao,
  }));

  if (!permissions.canViewTanques) {
    return (
      <main className={styles.page}>
        <section className={styles.errorState} role="alert">
          <strong>Acesso negado.</strong>
          <span>Seu perfil nao possui permissao para visualizar tanques.</span>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>TSEA / Configuracao fisica</p>
          <h1>Tanques</h1>
          <p>
            Consulte e mantenha a base tecnica de tanques previstos para processos de vacuo.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={() => {
              setEditingTanque(null);
              setIsModalOpen(true);
              clearMessages();
            }}
            disabled={!permissions.canCreateTanques || isLoading || actionLoading}
          >
            <Plus size={16} aria-hidden="true" />
            Novo tanque
          </button>
          <button type="button" onClick={() => void loadTanques()} disabled={isLoading || actionLoading}>
            <RefreshCw size={16} aria-hidden="true" />
            {isLoading ? 'Atualizando' : 'Atualizar'}
          </button>
        </div>
      </header>

      {error ? (
        <section className={styles.errorState} role="alert">
          <strong>Falha na operacao.</strong>
          <span>{error}</span>
        </section>
      ) : null}

      {successMessage ? (
        <section className={styles.successState} role="status">
          <strong>Operacao concluida.</strong>
          <span>{successMessage}</span>
        </section>
      ) : null}

      <TanquesSummaryCards summary={summary} />

      <section className={styles.chartGrid} aria-label="Graficos de tanques">
        <RealDataChartPanel
          title="Tanques por status"
          subtitle="Distribuicao dos tanques carregados pela API."
          data={tanquesPorStatus}
          variant="pie"
        />
        <RealDataChartPanel
          title="Vacuo padrao por tanque"
          subtitle="Comparativo tecnico dos valores configurados."
          data={vacuoPorTanque}
          variant="bar"
        />
      </section>

      <section className={styles.paginationState} role="status">
        Pagina {pagination.page} de {pagination.totalPages} / {pagination.total} registros
      </section>

      <section className={styles.contentGrid}>
        <TanquesListTable
          tanques={tanques}
          selectedTanqueId={selectedTanque?.id_tanque}
          isLoading={isLoading}
          onSelect={(id) => void selectTanque(id)}
        />
        <TanqueDetailPanel
          tanque={selectedTanque}
          canEdit={permissions.canEditTanques}
          canToggleActive={permissions.canActivateTanques || permissions.canDeactivateTanques}
          isSubmitting={actionLoading}
          onEdit={(tanque) => {
            setEditingTanque(tanque);
            setIsModalOpen(true);
            clearMessages();
          }}
          onToggleActive={(tanque) => {
            setToggleTarget(tanque);
            clearMessages();
          }}
        />
      </section>

      {isModalOpen ? (
        <TanqueConfigModal
          key={editingTanque?.id_tanque ?? 'new-tanque'}
          tanque={editingTanque}
          isOpen={isModalOpen}
          isSubmitting={actionLoading}
          onClose={() => setIsModalOpen(false)}
          onCreate={createTanque}
          onUpdate={updateTanque}
        />
      ) : null}

      <ConfirmActionModal
        isOpen={Boolean(toggleTarget)}
        title={`${toggleTarget?.status_tanque === 'ATIVO' ? 'Desativar' : 'Ativar'} tanque`}
        description={`Confirme a alteracao cadastral do tanque ${toggleTarget?.nome ?? ''}. Nenhum comando fisico sera enviado.`}
        confirmLabel={toggleTarget?.status_tanque === 'ATIVO' ? 'Desativar' : 'Ativar'}
        isSubmitting={actionLoading}
        onClose={() => setToggleTarget(null)}
        onConfirm={async () => {
          if (!toggleTarget) {
            return;
          }

          const success = toggleTarget.status_tanque === 'ATIVO'
            ? await desativarTanque(toggleTarget.id_tanque)
            : await ativarTanque(toggleTarget.id_tanque);

          if (success) {
            setToggleTarget(null);
          }
        }}
      />
    </main>
  );
}
