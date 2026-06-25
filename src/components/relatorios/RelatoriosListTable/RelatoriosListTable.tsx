import { Download, Eye, FileSearch } from 'lucide-react';
import type { RelatorioResponse, RelatoriosPermissions } from '../../../types';
import { RelatorioFormatoBadge, RelatorioTipoBadge } from '../RelatorioBadges';
import styles from './RelatoriosListTable.module.scss';

type RelatoriosListTableProps = {
  relatorios: RelatorioResponse[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  selectedId?: number;
  downloadingId: number | null;
  permissions: RelatoriosPermissions;
  onSelect: (idRelatorio: number) => void;
  onPreview: (relatorio: RelatorioResponse) => void;
  onDownload: (relatorio: RelatorioResponse) => void;
  onPageChange: (page: number) => void;
};

function formatDate(value?: string): string {
  if (!value) {
    return 'Sem data';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getOriginLabel(relatorio: RelatorioResponse): string {
  const idProcesso = relatorio.id_processo;
  const idAlarme = relatorio.id_alarme;

  if (typeof idProcesso === 'number') {
    return `Processo #${idProcesso}`;
  }

  if (typeof idAlarme === 'number') {
    return `Alarme #${idAlarme}`;
  }

  return relatorio.tipo_relatorio === 'ALARME' ? 'Alarme' : 'Processo';
}

export function RelatoriosListTable({
  relatorios,
  total,
  page,
  limit,
  isLoading,
  selectedId,
  downloadingId,
  permissions,
  onSelect,
  onPreview,
  onDownload,
  onPageChange,
}: RelatoriosListTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section className={styles.panel}>
      <header>
        <div>
          <p>Repositorio</p>
          <h2>Relatorios gerados</h2>
        </div>
        <span>{isLoading ? 'Sincronizando' : `${total} registros`}</span>
      </header>

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Arquivo</th>
              <th>Origem</th>
              <th>Tipo</th>
              <th>Formato</th>
              <th>Criado em</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {relatorios.map((relatorio) => (
              <tr
                key={relatorio.id_relatorio}
                className={selectedId === relatorio.id_relatorio ? styles.selected : undefined}
              >
                <td>
                  <button
                    type="button"
                    className={styles.fileButton}
                    onClick={() => onSelect(relatorio.id_relatorio)}
                  >
                    <FileSearch size={16} aria-hidden="true" />
                    <span>{relatorio.nome_arquivo ?? `Relatorio #${relatorio.id_relatorio}`}</span>
                  </button>
                </td>
                <td>{getOriginLabel(relatorio)}</td>
                <td>
                  <RelatorioTipoBadge tipo={relatorio.tipo_relatorio} />
                </td>
                <td>
                  <RelatorioFormatoBadge formato={relatorio.formato} />
                </td>
                <td>{formatDate(relatorio.criado_em)}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      onClick={() => onPreview(relatorio)}
                      disabled={!permissions.canPreviewRelatorio(relatorio)}
                      title="Abrir preview"
                    >
                      <Eye size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownload(relatorio)}
                      disabled={!permissions.canDownloadRelatorio(relatorio) || downloadingId === relatorio.id_relatorio}
                      title="Baixar arquivo"
                    >
                      <Download size={15} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {relatorios.length === 0 ? (
        <div className={styles.emptyState}>
          <strong>{isLoading ? 'Carregando relatorios...' : 'Nenhum relatorio encontrado.'}</strong>
          <span>Ajuste os filtros ou gere um novo relatorio tecnico.</span>
        </div>
      ) : null}

      <footer>
        <span>
          Pagina {page} de {totalPages}
        </span>
        <div>
          <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || isLoading}>
            Anterior
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
          >
            Proxima
          </button>
        </div>
      </footer>
    </section>
  );
}
