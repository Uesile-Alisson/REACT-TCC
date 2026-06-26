import { Download, Eye, FileSearch } from 'lucide-react';
import { motion } from 'framer-motion';
import type { KeyboardEvent, MouseEvent } from 'react';
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

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Data invalida';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
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

  function handleRowKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    idRelatorio: number,
  ): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onSelect(idRelatorio);
  }

  function stopActionPropagation(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
  }

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
            {relatorios.map((relatorio, index) => (
              <motion.tr
                key={relatorio.id_relatorio}
                className={selectedId === relatorio.id_relatorio ? styles.selected : undefined}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(relatorio.id_relatorio)}
                onKeyDown={(event) => handleRowKeyDown(event, relatorio.id_relatorio)}
                aria-label={`Abrir metadados do relatorio ${relatorio.id_relatorio}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.025, duration: 0.18 }}
                whileHover={{ backgroundColor: 'rgba(83, 197, 255, 0.075)' }}
              >
                <td>
                  <button
                    type="button"
                    className={styles.fileButton}
                    onClick={(event) => {
                      stopActionPropagation(event);
                      onSelect(relatorio.id_relatorio);
                    }}
                    aria-label={`Ver metadados do relatorio ${relatorio.id_relatorio}`}
                    title="Ver metadados"
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
                      onClick={(event) => {
                        stopActionPropagation(event);
                        onPreview(relatorio);
                      }}
                      disabled={!permissions.canPreviewRelatorio(relatorio)}
                      aria-label={`Abrir preview do relatorio ${relatorio.id_relatorio}`}
                      title="Abrir preview"
                    >
                      <Eye size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        stopActionPropagation(event);
                        onDownload(relatorio);
                      }}
                      disabled={!permissions.canDownloadRelatorio(relatorio) || downloadingId === relatorio.id_relatorio}
                      aria-label={`Baixar relatorio ${relatorio.id_relatorio}`}
                      title={downloadingId === relatorio.id_relatorio ? 'Baixando' : 'Baixar arquivo'}
                    >
                      <Download size={15} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </motion.tr>
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
