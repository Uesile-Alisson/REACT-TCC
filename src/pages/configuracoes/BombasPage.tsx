import { Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { RealDataChartPanel } from '../../components/charts/RealDataChartPanel';
import { ConfirmActionModal } from '../../components/configuracoes/ConfirmActionModal';
import { BombaDetailPanel } from '../../components/bombas/BombaDetailPanel';
import { BombaConfigModal } from '../../components/bombas/BombaConfigModal';
import { BombasListTable } from '../../components/bombas/BombasListTable';
import { BombasSummaryCards } from '../../components/bombas/BombasSummaryCards';
import { useBombasPage } from '../../hooks/useBombasPage';
import { useTanquesBombasPermissions } from '../../hooks/useTanquesBombasPermissions';
import type { BombaConfigResponse } from '../../types';
import { countBy } from '../../utils/chartData';
import styles from './BombasPage.module.scss';

export function BombasPage() {
  const permissions = useTanquesBombasPermissions();
  const [editingBomba, setEditingBomba] = useState<BombaConfigResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toggleTarget, setToggleTarget] = useState<BombaConfigResponse | null>(null);
  const {
    bombas,
    selectedBomba,
    isLoading,
    actionLoading,
    error,
    successMessage,
    summary,
    pagination,
    selectBomba,
    loadBombas,
    createBomba,
    updateBomba,
    ativarBomba,
    desativarBomba,
    clearMessages,
  } = useBombasPage();
  const bombasPorStatus = countBy(bombas, (bomba) => bomba.status_padrao);
  const bombasPorTipo = countBy(bombas, (bomba) => bomba.tipo_bomba);

  if (!permissions.canViewBombas) {
    return (
      <main className={styles.page}>
        <section className={styles.errorState} role="alert">
          <strong>Acesso negado.</strong>
          <span>Seu perfil nao possui permissao para visualizar bombas.</span>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>TSEA / Configuracao de acionamento</p>
          <h1>Bombas</h1>
          <p>
            Consulte e mantenha a configuracao tecnica de bombas sem acionar hardware diretamente.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={() => {
              setEditingBomba(null);
              setIsModalOpen(true);
              clearMessages();
            }}
            disabled={!permissions.canCreateBombas || isLoading || actionLoading}
          >
            <Plus size={16} aria-hidden="true" />
            Nova bomba
          </button>
          <button type="button" onClick={() => void loadBombas()} disabled={isLoading || actionLoading}>
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

      <BombasSummaryCards summary={summary} />

      <section className={styles.chartGrid} aria-label="Graficos de bombas">
        <RealDataChartPanel
          title="Bombas por status"
          subtitle="Distribuicao das bombas carregadas pela API."
          data={bombasPorStatus}
          variant="pie"
        />
        <RealDataChartPanel
          title="Bombas por tipo"
          subtitle="Agrupamento por tipo_bomba configurado no backend."
          data={bombasPorTipo}
          variant="bar"
        />
      </section>

      <section className={styles.paginationState} role="status">
        Pagina {pagination.page} de {pagination.totalPages} / {pagination.total} registros
      </section>

      <section className={styles.contentGrid}>
        <BombasListTable
          bombas={bombas}
          selectedBombaId={selectedBomba?.id_bomba}
          isLoading={isLoading}
          onSelect={(id) => void selectBomba(id)}
        />
        <BombaDetailPanel
          bomba={selectedBomba}
          canEdit={permissions.canEditBombas}
          canToggleActive={permissions.canActivateBombas || permissions.canDeactivateBombas}
          isSubmitting={actionLoading}
          onEdit={(bomba) => {
            setEditingBomba(bomba);
            setIsModalOpen(true);
            clearMessages();
          }}
          onToggleActive={(bomba) => {
            setToggleTarget(bomba);
            clearMessages();
          }}
        />
      </section>

      {isModalOpen ? (
        <BombaConfigModal
          key={editingBomba?.id_bomba ?? 'new-bomba'}
          bomba={editingBomba}
          isOpen={isModalOpen}
          isSubmitting={actionLoading}
          onClose={() => setIsModalOpen(false)}
          onCreate={createBomba}
          onUpdate={updateBomba}
        />
      ) : null}

      <ConfirmActionModal
        isOpen={Boolean(toggleTarget)}
        title={`${toggleTarget?.status_padrao === 'ATIVA' ? 'Desativar' : 'Ativar'} bomba`}
        description={`Confirme a alteracao cadastral da bomba ${toggleTarget?.nome ?? ''}. Nenhum comando fisico sera enviado.`}
        confirmLabel={toggleTarget?.status_padrao === 'ATIVA' ? 'Desativar' : 'Ativar'}
        isSubmitting={actionLoading}
        onClose={() => setToggleTarget(null)}
        onConfirm={async () => {
          if (!toggleTarget) {
            return;
          }

          const success = toggleTarget.status_padrao === 'ATIVA'
            ? await desativarBomba(toggleTarget.id_bomba)
            : await ativarBomba(toggleTarget.id_bomba);

          if (success) {
            setToggleTarget(null);
          }
        }}
      />
    </main>
  );
}
