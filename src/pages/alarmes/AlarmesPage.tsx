import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { AlarmeDetailPanel } from '../../components/alarmes/AlarmeDetailPanel';
import { AlarmeFilters } from '../../components/alarmes/AlarmeFilters';
import { AlarmeListTable } from '../../components/alarmes/AlarmeListTable';
import { AlarmeRealtimeToast } from '../../components/alarmes/AlarmeRealtimeToast';
import { AlarmeSummaryCards } from '../../components/alarmes/AlarmeSummaryCards';
import { ResolverAlarmeModal } from '../../components/alarmes/ResolverAlarmeModal';
import { useAlarmePermissions } from '../../hooks/useAlarmePermissions';
import { useAlarmesPage } from '../../hooks/useAlarmesPage';
import { useAlarmesRealtime } from '../../hooks/useAlarmesRealtime';
import { useResolverAlarme } from '../../hooks/useResolverAlarme';
import type { AlarmeResponse, AlarmCreatedPayload } from '../../types';
import styles from './AlarmesPage.module.scss';

export function AlarmesPage() {
  const {
    data,
    filters,
    isLoading,
    isDetailLoading,
    error,
    partialErrors,
    setFilters,
    setPage,
    refresh,
    selectAlarme,
  } = useAlarmesPage();
  const permissions = useAlarmePermissions();
  const { lastAlarm } = useAlarmesRealtime();
  const {
    isResolving,
    resolveError,
    resolveSuccess,
    clearResolveFeedback,
    resolverAlarme,
  } = useResolverAlarme(refresh);
  const [resolveTarget, setResolveTarget] = useState<AlarmeResponse | null>(null);
  const [dismissedRealtimeId, setDismissedRealtimeId] = useState<number | 'realtime' | null>(null);

  const realtimeId = lastAlarm?.id_alarme ?? 'realtime';
  const visibleRealtimeAlarm: AlarmCreatedPayload | null =
    lastAlarm && dismissedRealtimeId !== realtimeId ? lastAlarm : null;

  async function handleResolve(idAlarme: number, observacao: string): Promise<void> {
    const resolved = await resolverAlarme(idAlarme, observacao);

    if (resolved) {
      setResolveTarget(null);
      await selectAlarme(idAlarme);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>TSEA / Monitoramento</p>
          <h1>Alarmes</h1>
          <p>Acompanhe, filtre e resolva alarmes operacionais do sistema TSEA.</p>
        </div>

        <button type="button" onClick={() => void refresh()} disabled={isLoading}>
          <RefreshCw size={16} aria-hidden="true" />
          {isLoading ? 'Atualizando' : 'Atualizar'}
        </button>
      </header>

      <AlarmeRealtimeToast
        alarm={visibleRealtimeAlarm}
        onClose={() => setDismissedRealtimeId(realtimeId)}
      />

      {error ? (
        <section className={styles.errorState} role="alert">
          <strong>Nao foi possivel carregar os alarmes.</strong>
          <span>{error}</span>
        </section>
      ) : null}

      {partialErrors.summary && !error ? (
        <section className={styles.warningState} role="status">
          <strong>Resumo indisponivel.</strong>
          <span>{partialErrors.summary}</span>
        </section>
      ) : null}

      {resolveError ? (
        <section className={styles.errorState} role="alert">
          <strong>Alarme nao resolvido.</strong>
          <span>{resolveError}</span>
          <button type="button" onClick={clearResolveFeedback}>
            Dispensar
          </button>
        </section>
      ) : null}

      {resolveSuccess ? (
        <section className={styles.successState} role="status">
          <strong>{resolveSuccess}</strong>
          <button type="button" onClick={clearResolveFeedback}>
            Dispensar
          </button>
        </section>
      ) : null}

      <AlarmeSummaryCards summary={data.summary} alarmes={data.alarmes} />

      <AlarmeFilters filters={filters} onChange={setFilters} />

      <section className={styles.contentGrid}>
        <AlarmeListTable
          alarmes={data.alarmes}
          total={data.total}
          page={data.page}
          limit={data.limit}
          isLoading={isLoading}
          selectedId={data.selectedAlarme?.id_alarme}
          permissions={permissions}
          onSelect={(idAlarme) => void selectAlarme(idAlarme)}
          onResolve={setResolveTarget}
          onPageChange={setPage}
        />

        <AlarmeDetailPanel
          alarme={data.selectedAlarme}
          isLoading={isDetailLoading}
          error={partialErrors.detail}
          permissions={permissions}
          onResolve={setResolveTarget}
        />
      </section>

      {partialErrors.list && !error ? (
        <section className={styles.warningState} role="status">
          <strong>Listagem indisponivel.</strong>
          <span>{partialErrors.list}</span>
        </section>
      ) : null}

      <ResolverAlarmeModal
        alarme={resolveTarget}
        isResolving={isResolving}
        onClose={() => setResolveTarget(null)}
        onConfirm={handleResolve}
      />
    </main>
  );
}
