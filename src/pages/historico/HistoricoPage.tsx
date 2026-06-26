import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { GerarRelatorioHistoricoModal } from '../../components/historico/GerarRelatorioHistoricoModal';
import { HistoricoDetailPanel } from '../../components/historico/HistoricoDetailPanel';
import { HistoricoFilters } from '../../components/historico/HistoricoFilters';
import { HistoricoListTable } from '../../components/historico/HistoricoListTable';
import { HistoricoMetricsCards } from '../../components/historico/HistoricoMetricsCards';
import { RealDataChartPanel } from '../../components/charts/RealDataChartPanel';
import { useGerarRelatorioHistorico } from '../../hooks/useGerarRelatorioHistorico';
import { useHistoricoPage } from '../../hooks/useHistoricoPage';
import { useHistoricoPermissions } from '../../hooks/useHistoricoPermissions';
import type { HistoricoProcessoResponse } from '../../types';
import { countBy, formatShortDate } from '../../utils/chartData';
import styles from './HistoricoPage.module.scss';

export function HistoricoPage() {
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
    selectProcesso,
  } = useHistoricoPage();
  const permissions = useHistoricoPermissions();
  const {
    isGenerating,
    reportError,
    reportSuccess,
    clearReportFeedback,
    gerarRelatorio,
  } = useGerarRelatorioHistorico();
  const [reportTarget, setReportTarget] = useState<HistoricoProcessoResponse | null>(null);

  async function handleGenerateReport(idProcesso: number, observacao: string): Promise<void> {
    const success = await gerarRelatorio(idProcesso, observacao);

    if (success) {
      setReportTarget(null);
      await refresh();
      await selectProcesso(idProcesso);
    }
  }

  const processosPorStatus = countBy(data.processos, (processo) => processo.status_processo);
  const processosPorData = countBy(data.processos, (processo) =>
    formatShortDate(processo.finalizado_em ?? processo.iniciado_em),
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>TSEA / Consulta</p>
          <h1>Historico</h1>
          <p>Consulte processos encerrados, metricas finais e ocorrencias relacionadas.</p>
        </div>

        <button type="button" onClick={() => void refresh()} disabled={isLoading}>
          <RefreshCw size={16} aria-hidden="true" />
          {isLoading ? 'Atualizando' : 'Atualizar'}
        </button>
      </header>

      {error ? (
        <section className={styles.errorState} role="alert">
          <strong>Nao foi possivel carregar o historico.</strong>
          <span>{error}</span>
        </section>
      ) : null}

      {partialErrors.summary && !error ? (
        <section className={styles.warningState} role="status">
          <strong>Resumo indisponivel.</strong>
          <span>{partialErrors.summary}</span>
        </section>
      ) : null}

      {reportError ? (
        <section className={styles.errorState} role="alert">
          <strong>Relatorio nao gerado.</strong>
          <span>{reportError}</span>
          <button type="button" onClick={clearReportFeedback}>
            Dispensar
          </button>
        </section>
      ) : null}

      {reportSuccess ? (
        <section className={styles.successState} role="status">
          <strong>{reportSuccess}</strong>
          <a href="/relatorios">Abrir Relatorios</a>
        </section>
      ) : null}

      <HistoricoMetricsCards
        processos={data.processos}
        total={data.total}
        summary={data.summary}
      />

      <section className={styles.chartGrid} aria-label="Graficos do historico">
        <RealDataChartPanel
          title="Processos por status"
          subtitle="Distribuicao calculada sobre a pagina atual retornada pela API."
          data={processosPorStatus}
          variant="pie"
        />
        <RealDataChartPanel
          title="Encerramentos recentes"
          subtitle="Volume por data usando finalizado_em ou iniciado_em dos processos carregados."
          data={processosPorData}
          variant="bar"
        />
      </section>

      <HistoricoFilters filters={filters} onChange={setFilters} />

      <section className={styles.contentGrid}>
        <HistoricoListTable
          processos={data.processos}
          total={data.total}
          page={data.page}
          limit={data.limit}
          isLoading={isLoading}
          selectedId={data.detail.processo?.id_processo}
          permissions={permissions}
          onSelect={(idProcesso) => void selectProcesso(idProcesso)}
          onGenerateReport={setReportTarget}
          onPageChange={setPage}
        />

        <HistoricoDetailPanel
          detail={data.detail}
          isLoading={isDetailLoading}
          error={partialErrors.detail}
          tanquesError={partialErrors.tanques}
          alarmesError={partialErrors.alarmes}
          eventosError={partialErrors.eventos}
          relatoriosError={partialErrors.relatorios}
          permissions={permissions}
          onGenerateReport={setReportTarget}
        />
      </section>

      {partialErrors.list && !error ? (
        <section className={styles.warningState} role="status">
          <strong>Listagem indisponivel.</strong>
          <span>{partialErrors.list}</span>
        </section>
      ) : null}

      <GerarRelatorioHistoricoModal
        processo={reportTarget}
        isGenerating={isGenerating}
        onClose={() => setReportTarget(null)}
        onConfirm={handleGenerateReport}
      />
    </main>
  );
}
