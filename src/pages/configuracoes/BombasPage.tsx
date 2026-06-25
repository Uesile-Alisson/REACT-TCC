import { RefreshCw } from 'lucide-react';
import { BombaDetailPanel } from '../../components/bombas/BombaDetailPanel';
import { BombasListTable } from '../../components/bombas/BombasListTable';
import { BombasSummaryCards } from '../../components/bombas/BombasSummaryCards';
import { useBombasPage } from '../../hooks/useBombasPage';
import { useTanquesBombasPermissions } from '../../hooks/useTanquesBombasPermissions';
import styles from './BombasPage.module.scss';

export function BombasPage() {
  const permissions = useTanquesBombasPermissions();
  const {
    bombas,
    selectedBomba,
    endpointState,
    isLoading,
    error,
    summary,
    selectBomba,
    refresh,
  } = useBombasPage();

  const endpointMissing = endpointState === 'missing';

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
            Consulte a configuracao tecnica de bombas sem acionar hardware diretamente e acompanhe
            a disponibilidade da integracao HTTP dedicada.
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
          <strong>Bombas em modo leitura.</strong>
          <span>{error}</span>
        </section>
      ) : null}

      <section className={styles.readOnlyState} role="status">
        <strong>Acoes de cadastro indisponiveis.</strong>
        <span>
          Criacao, edicao e exclusao permanecem bloqueadas ate existir contrato HTTP documentado
          para Bombas. Esta tela nao aciona hardware.
        </span>
      </section>

      <BombasSummaryCards summary={summary} />

      <section className={styles.contentGrid}>
        <BombasListTable
          bombas={bombas}
          selectedBombaId={selectedBomba?.id_bomba}
          isLoading={isLoading}
          endpointMissing={endpointMissing}
          onSelect={selectBomba}
        />
        <BombaDetailPanel bomba={selectedBomba} endpointMissing={endpointMissing} />
      </section>
    </main>
  );
}
