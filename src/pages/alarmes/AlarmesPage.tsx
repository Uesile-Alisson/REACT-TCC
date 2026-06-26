import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RealDataChartPanel } from '../../components/charts/RealDataChartPanel';
import { AlarmeDetailPanel } from '../../components/alarmes/AlarmeDetailPanel';
import { AlarmeFilters } from '../../components/alarmes/AlarmeFilters';
import { AlarmeListTable } from '../../components/alarmes/AlarmeListTable';
import { AlarmeRealtimeToast } from '../../components/alarmes/AlarmeRealtimeToast';
import { AlarmeSummaryCards } from '../../components/alarmes/AlarmeSummaryCards';
import { ResolverAlarmeModal } from '../../components/alarmes/ResolverAlarmeModal';
import { useAlarmePermissions } from '../../hooks/useAlarmePermissions';
import { useAlarmesPage } from '../../hooks/useAlarmesPage';
import { useAlarmesRealtime } from '../../hooks/useAlarmesRealtime';
import { useGerarRelatorioAlarme } from '../../hooks/useGerarRelatorioAlarme';
import { useResolverAlarme } from '../../hooks/useResolverAlarme';
import type { AlarmeResponse, AlarmCreatedPayload } from '../../types';
import { countBy, formatShortDate } from '../../utils/chartData';
import styles from './AlarmesPage.module.scss';

const MEDIUM_REALARM_MS = 10000;
const CRITICAL_REALARM_MS = 5000;

type RealtimeAlarmKey = string;
type RealtimeAlarmTimers = Map<RealtimeAlarmKey, ReturnType<typeof setTimeout>>;

function getAlarmDate(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function getRealtimeAlarmKey(alarm: AlarmCreatedPayload): RealtimeAlarmKey {
  return String(alarm.id_alarme ?? 'realtime');
}

function isResolvedAlarm(alarm: Pick<AlarmCreatedPayload, 'status_alarme'>): boolean {
  return alarm.status_alarme === 'RESOLVIDO';
}

function isActiveAlarm(alarm: Pick<AlarmCreatedPayload, 'status_alarme'>): boolean {
  return alarm.status_alarme !== 'RESOLVIDO';
}

function getRealarmDelay(alarm: AlarmCreatedPayload): number | null {
  if (alarm.severidade === 'CRITICO') {
    return CRITICAL_REALARM_MS;
  }

  if (alarm.severidade === 'MEDIO') {
    return MEDIUM_REALARM_MS;
  }

  return null;
}

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
  const {
    generatingAlarmeReportId,
    alarmeReportError,
    alarmeReportSuccess,
    clearAlarmeReportFeedback,
    gerarRelatorioAlarme,
  } = useGerarRelatorioAlarme();
  const [resolveTarget, setResolveTarget] = useState<AlarmeResponse | null>(null);
  const [realtimeAlarms, setRealtimeAlarms] = useState<Record<RealtimeAlarmKey, AlarmCreatedPayload>>({});
  const [visibleRealtimeAlarmKey, setVisibleRealtimeAlarmKey] = useState<RealtimeAlarmKey | null>(null);
  const dismissedInfoIdsRef = useRef<Set<RealtimeAlarmKey>>(new Set());
  const realarmTimersRef = useRef<RealtimeAlarmTimers>(new Map());

  const clearRealarmTimer = useCallback((key: RealtimeAlarmKey): void => {
    const timer = realarmTimersRef.current.get(key);

    if (timer) {
      clearTimeout(timer);
      realarmTimersRef.current.delete(key);
    }
  }, []);

  const removeRealtimeAlarm = useCallback(
    (key: RealtimeAlarmKey): void => {
      clearRealarmTimer(key);
      setRealtimeAlarms((currentAlarms) => {
        if (!currentAlarms[key]) {
          return currentAlarms;
        }

        const nextAlarms = { ...currentAlarms };
        delete nextAlarms[key];

        return nextAlarms;
      });
      setVisibleRealtimeAlarmKey((currentKey) => (currentKey === key ? null : currentKey));
    },
    [clearRealarmTimer],
  );

  const scheduleRealtimeReappear = useCallback((alarm: AlarmCreatedPayload): void => {
    const key = getRealtimeAlarmKey(alarm);
    const delay = getRealarmDelay(alarm);

    if (!delay || realarmTimersRef.current.has(key)) {
      return;
    }

    const timer = setTimeout(() => {
      realarmTimersRef.current.delete(key);
      setRealtimeAlarms((currentAlarms) => {
        const currentAlarm = currentAlarms[key];

        if (!currentAlarm || isResolvedAlarm(currentAlarm)) {
          return currentAlarms;
        }

        setVisibleRealtimeAlarmKey(key);

        return currentAlarms;
      });
    }, delay);

    realarmTimersRef.current.set(key, timer);
  }, []);

  const visibleRealtimeAlarm: AlarmCreatedPayload | null = visibleRealtimeAlarmKey
    ? realtimeAlarms[visibleRealtimeAlarmKey] ?? null
    : null;
  const severityChartData = useMemo(
    () => [
      { name: 'Info', value: data.alarmes.filter((alarme) => alarme.severidade === 'INFO').length },
      { name: 'Medio', value: data.alarmes.filter((alarme) => alarme.severidade === 'MEDIO').length },
      { name: 'Critico', value: data.alarmes.filter((alarme) => alarme.severidade === 'CRITICO').length },
    ],
    [data.alarmes],
  );
  const statusChartData = useMemo(
    () => [
      { name: 'Ativo', value: data.alarmes.filter((alarme) => alarme.status_alarme === 'ATIVO').length },
      {
        name: 'Resolvido',
        value: data.alarmes.filter((alarme) => alarme.status_alarme === 'RESOLVIDO').length,
      },
    ],
    [data.alarmes],
  );
  const typeChartData = useMemo(
    () => countBy(data.alarmes, (alarme) => alarme.tipo_alarme),
    [data.alarmes],
  );
  const timelineChartData = useMemo(
    () =>
      countBy(data.alarmes, (alarme) =>
        formatShortDate(getAlarmDate(alarme.ocorrido_em) ?? getAlarmDate(alarme.criado_em)),
      ),
    [data.alarmes],
  );

  useEffect(() => {
    const activeTimers = realarmTimersRef.current;

    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  useEffect(() => {
    if (!lastAlarm) {
      return;
    }

    const key = getRealtimeAlarmKey(lastAlarm);

    if (isResolvedAlarm(lastAlarm)) {
      queueMicrotask(() => removeRealtimeAlarm(key));
      return;
    }

    if (lastAlarm.severidade === 'INFO' && dismissedInfoIdsRef.current.has(key)) {
      return;
    }

    queueMicrotask(() => {
      clearRealarmTimer(key);
      setRealtimeAlarms((currentAlarms) => ({
        ...currentAlarms,
        [key]: lastAlarm,
      }));
      setVisibleRealtimeAlarmKey(key);
    });
  }, [clearRealarmTimer, lastAlarm, removeRealtimeAlarm]);

  useEffect(() => {
    const resolvedIds = data.alarmes
      .filter((alarme) => alarme.status_alarme === 'RESOLVIDO')
      .map((alarme) => String(alarme.id_alarme));

    if (resolvedIds.length === 0) {
      return;
    }

    queueMicrotask(() => {
      resolvedIds.forEach(removeRealtimeAlarm);
    });
  }, [data.alarmes, removeRealtimeAlarm]);

  function handleCloseRealtimeAlarm(): void {
    if (!visibleRealtimeAlarm) {
      return;
    }

    const key = getRealtimeAlarmKey(visibleRealtimeAlarm);

    if (!isActiveAlarm(visibleRealtimeAlarm)) {
      removeRealtimeAlarm(key);
      return;
    }

    setVisibleRealtimeAlarmKey(null);

    if (visibleRealtimeAlarm.severidade === 'INFO') {
      dismissedInfoIdsRef.current.add(key);
      removeRealtimeAlarm(key);
      return;
    }

    scheduleRealtimeReappear(visibleRealtimeAlarm);
  }

  async function handleResolve(idAlarme: number, observacao: string): Promise<void> {
    const resolved = await resolverAlarme(idAlarme, observacao);

    if (resolved) {
      removeRealtimeAlarm(String(idAlarme));
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
        onClose={handleCloseRealtimeAlarm}
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

      {alarmeReportError ? (
        <section className={styles.errorState} role="alert">
          <strong>Relatorio nao gerado.</strong>
          <span>{alarmeReportError}</span>
          <button type="button" onClick={clearAlarmeReportFeedback}>
            Dispensar
          </button>
        </section>
      ) : null}

      {alarmeReportSuccess ? (
        <section className={styles.successState} role="status">
          <strong>{alarmeReportSuccess}</strong>
          <span>Abra a pagina Relatorios para visualizar ou baixar o arquivo gerado.</span>
          <button type="button" onClick={clearAlarmeReportFeedback}>
            Dispensar
          </button>
        </section>
      ) : null}

      <AlarmeSummaryCards summary={data.summary} alarmes={data.alarmes} />

      <section className={styles.chartGrid} aria-label="Graficos de alarmes">
        <RealDataChartPanel
          title="Alarmes por severidade"
          subtitle="Distribuicao INFO, MEDIO e CRITICO da listagem carregada."
          data={severityChartData}
          variant="pie"
          emptyMessage={isLoading ? 'Carregando alarmes para montar o grafico.' : 'Sem alarmes carregados.'}
        />
        <RealDataChartPanel
          title="Alarmes por status"
          subtitle="Comparativo entre alarmes ativos e resolvidos."
          data={statusChartData}
          variant="bar"
          emptyMessage={isLoading ? 'Carregando status dos alarmes.' : 'Sem status de alarme disponivel.'}
        />
        <RealDataChartPanel
          title="Alarmes por tipo"
          subtitle="Agrupamento pelo tipo_alarme retornado pela API."
          data={typeChartData}
          variant="bar"
          emptyMessage="Sem tipo de alarme suficiente para grafico."
        />
        <RealDataChartPanel
          title="Ocorrencias por periodo"
          subtitle="Agrupamento por data de ocorrencia ou criacao na lista atual."
          data={timelineChartData}
          variant="line"
          emptyMessage="Sem datas suficientes para montar a serie temporal."
        />
      </section>

      <AlarmeFilters filters={filters} onChange={setFilters} />

      <section className={styles.contentGrid}>
        <AlarmeListTable
          alarmes={data.alarmes}
          total={data.total}
          page={data.page}
          limit={data.limit}
          isLoading={isLoading}
          selectedId={data.selectedAlarme?.id_alarme}
          generatingReportId={generatingAlarmeReportId}
          permissions={permissions}
          onSelect={(idAlarme) => void selectAlarme(idAlarme)}
          onResolve={setResolveTarget}
          onGenerateReport={(alarme) => void gerarRelatorioAlarme(alarme.id_alarme)}
          onPageChange={setPage}
        />

        <AlarmeDetailPanel
          alarme={data.selectedAlarme}
          isLoading={isDetailLoading}
          error={partialErrors.detail}
          generatingReportId={generatingAlarmeReportId}
          permissions={permissions}
          onResolve={setResolveTarget}
          onGenerateReport={(alarme) => void gerarRelatorioAlarme(alarme.id_alarme)}
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
