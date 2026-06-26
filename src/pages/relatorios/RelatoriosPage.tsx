import { FilePlus2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { RealDataChartPanel } from '../../components/charts/RealDataChartPanel';
import { GerarRelatorioModal } from '../../components/relatorios/GerarRelatorioModal';
import { RelatorioDetailPanel } from '../../components/relatorios/RelatorioDetailPanel';
import { RelatorioPreviewModal } from '../../components/relatorios/RelatorioPreviewModal';
import { RelatoriosFilters } from '../../components/relatorios/RelatoriosFilters';
import { RelatoriosListTable } from '../../components/relatorios/RelatoriosListTable';
import { RelatoriosSummaryCards } from '../../components/relatorios/RelatoriosSummaryCards';
import { useAuth } from '../../hooks/useAuth';
import { useGerarRelatorio } from '../../hooks/useGerarRelatorio';
import { useRelatorioDownload } from '../../hooks/useRelatorioDownload';
import { useRelatorioPreview } from '../../hooks/useRelatorioPreview';
import { useRelatoriosPage } from '../../hooks/useRelatoriosPage';
import { useRelatoriosPermissions } from '../../hooks/useRelatoriosPermissions';
import type { GerarRelatorioFormState } from '../../types';
import { countBy } from '../../utils/chartData';
import styles from './RelatoriosPage.module.scss';

export function RelatoriosPage() {
  const { user } = useAuth();
  const {
    data,
    filters,
    isLoading,
    isDetailLoading,
    error,
    detailError,
    setFilters,
    setPage,
    refresh,
    selectRelatorio,
  } = useRelatoriosPage();
  const permissions = useRelatoriosPermissions();
  const {
    isGenerating,
    generationError,
    generationSuccess,
    clearGenerationFeedback,
    gerarRelatorio,
  } = useGerarRelatorio();
  const {
    downloadingId,
    downloadError,
    handleDownloadRelatorio,
  } = useRelatorioDownload({ nivelAcesso: user?.nivel_acesso ?? null });
  const {
    isPreviewOpen,
    previewUrl,
    previewFilename,
    previewContentType,
    previewFormat,
    isPreviewLoading,
    previewError,
    openPreview,
    closePreview,
  } = useRelatorioPreview();
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const relatoriosPorFormato = countBy(data.relatorios, (relatorio) => relatorio.formato);
  const relatoriosPorTipo = countBy(data.relatorios, (relatorio) => relatorio.tipo_relatorio);

  async function handleGenerateReport(formState: GerarRelatorioFormState): Promise<boolean> {
    const success = await gerarRelatorio(formState);

    if (success) {
      await refresh();
    }

    return success;
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>TSEA / Documentacao operacional</p>
          <h1>Relatorios</h1>
          <p>
            Consulte arquivos gerados pela API, visualize previews em PDF e baixe documentos
            conforme o nivel de acesso.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button type="button" onClick={() => void refresh()} disabled={isLoading}>
            <RefreshCw size={16} aria-hidden="true" />
            {isLoading ? 'Atualizando' : 'Atualizar'}
          </button>
          <button
            type="button"
            onClick={() => setIsGenerateModalOpen(true)}
            disabled={!permissions.canGenerateRelatorio}
          >
            <FilePlus2 size={16} aria-hidden="true" />
            Gerar
          </button>
        </div>
      </header>

      {error ? (
        <section className={styles.errorState} role="alert">
          <strong>Nao foi possivel carregar os relatorios.</strong>
          <span>{error}</span>
        </section>
      ) : null}

      {generationError ? (
        <section className={styles.errorState} role="alert">
          <strong>Geracao nao concluida.</strong>
          <span>{generationError}</span>
          <button type="button" onClick={clearGenerationFeedback}>
            Dispensar
          </button>
        </section>
      ) : null}

      {downloadError ? (
        <section className={styles.errorState} role="alert">
          <strong>Download nao concluido.</strong>
          <span>{downloadError}</span>
        </section>
      ) : null}

      {generationSuccess ? (
        <section className={styles.successState} role="status">
          <strong>{generationSuccess}</strong>
          <span>A listagem foi atualizada com os dados disponiveis da API.</span>
        </section>
      ) : null}

      {!permissions.canGenerateRelatorio ? (
        <section className={styles.warningState} role="status">
          <strong>Perfil em modo leitura.</strong>
          <span>Seu acesso permite consulta e preview em PDF quando autorizado pelo backend.</span>
        </section>
      ) : null}

      <RelatoriosSummaryCards
        relatorios={data.relatorios}
        total={data.total}
        canGenerate={permissions.canGenerateRelatorio}
        canDownload={data.relatorios.some((relatorio) => permissions.canDownloadRelatorio(relatorio))}
      />

      <section className={styles.chartGrid} aria-label="Graficos de relatorios">
        <RealDataChartPanel
          title="Relatorios por formato"
          subtitle="Distribuicao de PDF e XLSX na listagem atual."
          data={relatoriosPorFormato}
          variant="pie"
        />
        <RealDataChartPanel
          title="Relatorios por origem"
          subtitle="Agrupamento por tipo_relatorio retornado pela API."
          data={relatoriosPorTipo}
          variant="bar"
        />
      </section>

      <RelatoriosFilters filters={filters} onChange={setFilters} />

      <section className={styles.contentGrid}>
        <RelatoriosListTable
          relatorios={data.relatorios}
          total={data.total}
          page={data.page}
          limit={data.limit}
          isLoading={isLoading}
          selectedId={data.selectedRelatorio?.id_relatorio}
          downloadingId={downloadingId}
          permissions={permissions}
          onSelect={(idRelatorio) => void selectRelatorio(idRelatorio)}
          onPreview={(relatorio) => void openPreview(relatorio)}
          onDownload={(relatorio) => void handleDownloadRelatorio(relatorio)}
          onPageChange={setPage}
        />

        <RelatorioDetailPanel
          relatorio={data.selectedRelatorio}
          isLoading={isDetailLoading}
          error={detailError}
          permissions={permissions}
          onPreview={(relatorio) => void openPreview(relatorio)}
          onDownload={(relatorio) => void handleDownloadRelatorio(relatorio)}
        />
      </section>

      <GerarRelatorioModal
        isOpen={isGenerateModalOpen}
        isGenerating={isGenerating}
        onClose={() => setIsGenerateModalOpen(false)}
        onConfirm={handleGenerateReport}
      />

      <RelatorioPreviewModal
        isOpen={isPreviewOpen}
        previewUrl={previewUrl}
        filename={previewFilename}
        contentType={previewContentType}
        format={previewFormat}
        isLoading={isPreviewLoading}
        error={previewError}
        onClose={closePreview}
      />
    </main>
  );
}
