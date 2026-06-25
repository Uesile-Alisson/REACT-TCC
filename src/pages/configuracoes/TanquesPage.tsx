import { RefreshCw } from 'lucide-react';
import { TanqueDetailPanel } from '../../components/tanques/TanqueDetailPanel';
import { TanquesListTable } from '../../components/tanques/TanquesListTable';
import { TanquesSummaryCards } from '../../components/tanques/TanquesSummaryCards';
import { useTanquesBombasPermissions } from '../../hooks/useTanquesBombasPermissions';
import { useTanquesPage } from '../../hooks/useTanquesPage';
import styles from './TanquesPage.module.scss';

export function TanquesPage() {
  const permissions = useTanquesBombasPermissions();
  const {
    tanques,
    selectedTanque,
    endpointState,
    isLoading,
    error,
    summary,
    selectTanque,
    refresh,
  } = useTanquesPage();

  const endpointMissing = endpointState === 'missing';

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
            Consulte a base tecnica de tanques previstos para processos de vacuo e acompanhe a
            disponibilidade da integracao HTTP dedicada.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button type="button" onClick={() => void refresh()} disabled={isLoading || endpointMissing}>
            <RefreshCw size={16} aria-hidden="true" />
            {endpointMissing ? 'Endpoint pendente' : isLoading ? 'Atualizando' : 'Atualizar'}
          </button>
        </div>
      </header>

      {error ? (
        <section className={styles.warningState} role="status">
          <strong>Tanques em modo leitura.</strong>
          <span>{error}</span>
        </section>
      ) : null}

      <section className={styles.readOnlyState} role="status">
        <strong>Acoes de cadastro indisponiveis.</strong>
        <span>
          Criacao, edicao e exclusao permanecem bloqueadas ate existir contrato HTTP documentado
          para Tanques.
        </span>
      </section>

      <TanquesSummaryCards summary={summary} />

      <section className={styles.contentGrid}>
        <TanquesListTable
          tanques={tanques}
          selectedTanqueId={selectedTanque?.id_tanque}
          isLoading={isLoading}
          endpointMissing={endpointMissing}
          onSelect={selectTanque}
        />
        <TanqueDetailPanel tanque={selectedTanque} endpointMissing={endpointMissing} />
      </section>
    </main>
  );
}
