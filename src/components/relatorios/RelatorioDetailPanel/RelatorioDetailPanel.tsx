import { CalendarClock, Database, Download, Eye, LockKeyhole } from 'lucide-react';
import type { RelatorioResponse, RelatoriosPermissions } from '../../../types';
import { RelatorioFormatoBadge, RelatorioTipoBadge } from '../RelatorioBadges';
import styles from './RelatorioDetailPanel.module.scss';

type RelatorioDetailPanelProps = {
  relatorio: RelatorioResponse | null;
  isLoading: boolean;
  error: string | null;
  permissions: RelatoriosPermissions;
  onPreview: (relatorio: RelatorioResponse) => void;
  onDownload: (relatorio: RelatorioResponse) => void;
};

function formatDate(value?: string): string {
  if (!value) {
    return 'Nao informado';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getNumberMetadata(relatorio: RelatorioResponse, key: string): string {
  const value = relatorio[key];

  return typeof value === 'number' ? String(value) : 'Nao informado';
}

function getStringMetadata(relatorio: RelatorioResponse, key: string): string {
  const value = relatorio[key];

  return typeof value === 'string' && value.trim() ? value : 'Nao informado';
}

export function RelatorioDetailPanel({
  relatorio,
  isLoading,
  error,
  permissions,
  onPreview,
  onDownload,
}: RelatorioDetailPanelProps) {
  if (!relatorio) {
    return (
      <aside className={styles.panel}>
        <div className={styles.emptyState}>
          <Database size={22} aria-hidden="true" />
          <strong>Selecione um relatorio</strong>
          <span>Os metadados operacionais aparecem aqui sem permitir edicao do arquivo.</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.panel}>
      <header>
        <div>
          <p>Metadados</p>
          <h2>{relatorio.nome_arquivo ?? `Relatorio #${relatorio.id_relatorio}`}</h2>
        </div>
        {isLoading ? <span>Carregando</span> : null}
      </header>

      {error ? (
        <section className={styles.warningState} role="status">
          <strong>Detalhe parcial.</strong>
          <span>{error}</span>
        </section>
      ) : null}

      <div className={styles.badges}>
        <RelatorioTipoBadge tipo={relatorio.tipo_relatorio} />
        <RelatorioFormatoBadge formato={relatorio.formato} />
      </div>

      <dl className={styles.metadata}>
        <div>
          <dt>ID do relatorio</dt>
          <dd>{relatorio.id_relatorio}</dd>
        </div>
        <div>
          <dt>ID do processo</dt>
          <dd>{getNumberMetadata(relatorio, 'id_processo')}</dd>
        </div>
        <div>
          <dt>ID do alarme</dt>
          <dd>{getNumberMetadata(relatorio, 'id_alarme')}</dd>
        </div>
        <div>
          <dt>Content type</dt>
          <dd>{relatorio.content_type ?? 'Nao informado'}</dd>
        </div>
        <div>
          <dt>Criado em</dt>
          <dd>{formatDate(relatorio.criado_em)}</dd>
        </div>
        <div>
          <dt>Observacao</dt>
          <dd>{getStringMetadata(relatorio, 'observacao')}</dd>
        </div>
      </dl>

      <section className={styles.integrity}>
        <CalendarClock size={17} aria-hidden="true" />
        <span>Arquivo imutavel. Edicao, exclusao e reprocessamento nao estao disponiveis nesta tela.</span>
      </section>

      <footer>
        <button
          type="button"
          onClick={() => onPreview(relatorio)}
          disabled={!permissions.canPreviewRelatorio(relatorio)}
        >
          <Eye size={16} aria-hidden="true" />
          Preview
        </button>
        <button
          type="button"
          onClick={() => onDownload(relatorio)}
          disabled={!permissions.canDownloadRelatorio(relatorio)}
        >
          {permissions.canDownloadRelatorio(relatorio) ? (
            <Download size={16} aria-hidden="true" />
          ) : (
            <LockKeyhole size={16} aria-hidden="true" />
          )}
          Download
        </button>
      </footer>
    </aside>
  );
}
