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

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Data invalida';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatBytes(value: unknown): string {
  const numericValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;

  if (!Number.isFinite(numericValue)) {
    return 'Nao informado';
  }

  return `${numericValue.toLocaleString('pt-BR')} bytes`;
}

function getMetadataValue(relatorio: RelatorioResponse, key: string): string {
  const value = relatorio[key];

  if (key === 'criado_em' || key === 'gerado_em') {
    return typeof value === 'string' ? formatDate(value) : 'Nao informado';
  }

  if (key === 'tamanho_bytes') {
    return formatBytes(value);
  }

  if (typeof value === 'string') {
    return value.trim() || 'Nao informado';
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value === null || value === undefined) {
    return 'Nao informado';
  }

  return JSON.stringify(value);
}

function getTechnicalMetadata(relatorio: RelatorioResponse): Array<{ label: string; value: string }> {
  const fields = [
    ['ID do relatorio', 'id_relatorio'],
    ['Titulo', 'titulo'],
    ['Descricao', 'descricao'],
    ['Nome do arquivo', 'nome_arquivo'],
    ['Tipo', 'tipo_relatorio'],
    ['Formato', 'formato_relatorio'],
    ['Origem', 'origem'],
    ['ID do processo', 'id_processo'],
    ['ID do alarme', 'id_alarme'],
    ['Usuario gerador', 'usuario_gerador'],
    ['Gerado em', 'gerado_em'],
    ['Criado em', 'criado_em'],
    ['Tamanho', 'tamanho_bytes'],
    ['Hash do arquivo', 'hash_arquivo'],
    ['Content type', 'content_type'],
    ['Storage provider', 'storage_provider'],
    ['Bucket', 'bucket_name'],
    ['GridFS file ID', 'gridfs_file_id'],
    ['Observacao', 'observacao'],
  ] as const;

  return fields.map(([label, key]) => ({
    label,
    value: getMetadataValue(relatorio, key),
  }));
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
        {getTechnicalMetadata(relatorio).map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
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
