import { RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlarmeDetailPanel } from '../../components/alarmes/AlarmeDetailPanel';
import { AlarmeFilters } from '../../components/alarmes/AlarmeFilters';
import { AlarmeListTable } from '../../components/alarmes/AlarmeListTable';
import { AlarmeSummaryCards } from '../../components/alarmes/AlarmeSummaryCards';
import { ResolverAlarmeModal } from '../../components/alarmes/ResolverAlarmeModal';
import { RealDataChartPanel } from '../../components/charts/RealDataChartPanel';
import { useAlarmePermissions } from '../../hooks/useAlarmePermissions';
import { useAlarmesPage } from '../../hooks/useAlarmesPage';
import { useGerarRelatorioAlarme } from '../../hooks/useGerarRelatorioAlarme';
import { useResolverAlarme } from '../../hooks/useResolverAlarme';
import { acknowledgeAlarm, getAlarmeActionErrorMessage } from '../../services/alarmes.service';
import type { AlarmeResponse } from '../../types';
import { countBy, formatShortDate } from '../../utils/chartData';
import styles from './AlarmesPage.module.scss';

type AlarmesLocationState = {
  selectedAlarmeId?: number;
};

function getAlarmDate(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
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
  const location = useLocation();
  const permissions = useAlarmePermissions();
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
  const [acknowledgingId, setAcknowledgingId] = useState<number | null>(null);
  const [acknowledgeError, setAcknowledgeError] = useState<string | null>(null);
  const [acknowledgeSuccess, setAcknowledgeSuccess] = useState<string | null>(null);
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
        name: 'Normalizado',
        value: data.alarmes.filter((alarme) => alarme.status_alarme === 'NORMALIZADO').length,
      },
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
    const locationState = location.state as AlarmesLocationState | null;
    const selectedAlarmeId = locationState?.selectedAlarmeId;

    if (typeof selectedAlarmeId === 'number') {
      void selectAlarme(selectedAlarmeId);
    }
  }, [location.state, selectAlarme]);

  async function handleResolve(idAlarme: number, observacao: string): Promise<void> {
    const resolved = await resolverAlarme(idAlarme, observacao);

    if (resolved) {
      setResolveTarget(null);
      await selectAlarme(idAlarme);
    }
  }

  async function handleAcknowledge(alarme: AlarmeResponse): Promise<void> {
    setAcknowledgingId(alarme.id_alarme);
    setAcknowledgeError(null);
    setAcknowledgeSuccess(null);

    try {
      const result = await acknowledgeAlarm(alarme.id_alarme);
      setAcknowledgeSuccess(
        result.message || 'Reconhecimento registrado. O alarme continua ativo ate normalizacao tecnica.',
      );
      await refresh();
      await selectAlarme(alarme.id_alarme);
    } catch (error: unknown) {
      setAcknowledgeError(getAlarmeActionErrorMessage(error));
    } finally {
      setAcknowledgingId(null);
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

      {acknowledgeError ? (
        <section className={styles.errorState} role="alert">
          <strong>Reconhecimento nao registrado.</strong>
          <span>{acknowledgeError}</span>
          <button type="button" onClick={() => setAcknowledgeError(null)}>
            Dispensar
          </button>
        </section>
      ) : null}

      {acknowledgeSuccess ? (
        <section className={styles.successState} role="status">
          <strong>{acknowledgeSuccess}</strong>
          <button type="button" onClick={() => setAcknowledgeSuccess(null)}>
            Dispensar
          </button>
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
          acknowledgingId={acknowledgingId}
          permissions={permissions}
          onSelect={(idAlarme) => void selectAlarme(idAlarme)}
          onAcknowledge={(alarme) => void handleAcknowledge(alarme)}
          onResolve={setResolveTarget}
          onGenerateReport={(alarme) => void gerarRelatorioAlarme(alarme.id_alarme)}
          onPageChange={setPage}
        />

        <AlarmeDetailPanel
          alarme={data.selectedAlarme}
          isLoading={isDetailLoading}
          error={partialErrors.detail}
          generatingReportId={generatingAlarmeReportId}
          acknowledgingId={acknowledgingId}
          permissions={permissions}
          onAcknowledge={(alarme) => void handleAcknowledge(alarme)}
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
