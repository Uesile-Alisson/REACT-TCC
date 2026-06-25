import { Eye, FilePlus2 } from 'lucide-react';
import type { HistoricoPermissions, HistoricoProcessoResponse } from '../../../types';
import { formatHistoricoDate, getUnknownNumber } from '../historico.utils';
import { HistoricoStatusBadge } from '../HistoricoStatusBadge';
import styles from './HistoricoListTable.module.scss';

type HistoricoListTableProps = {
  processos: HistoricoProcessoResponse[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  selectedId?: number;
  permissions: HistoricoPermissions;
  onSelect: (idProcesso: number) => void;
  onGenerateReport: (processo: HistoricoProcessoResponse) => void;
  onPageChange: (page: number) => void;
};

export function HistoricoListTable({
  processos,
  total,
  page,
  limit,
  isLoading,
  selectedId,
  permissions,
  onSelect,
  onGenerateReport,
  onPageChange,
}: HistoricoListTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Listagem</p>
          <h2>Processos encerrados</h2>
        </div>
        <span>{isLoading ? 'Carregando' : `${total} registro(s)`}</span>
      </header>

      {processos.length > 0 ? (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Processo</th>
                <th>Status final</th>
                <th>Inicio</th>
                <th>Fim</th>
                <th>Vacuo final</th>
                <th>Eficiencia</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {processos.map((processo) => (
                <tr
                  key={processo.id_processo}
                  className={selectedId === processo.id_processo ? styles.activeRow : undefined}
                >
                  <td>
                    <strong>{processo.nome_processo ?? `Processo #${processo.id_processo}`}</strong>
                    <span>ID {processo.id_processo}</span>
                  </td>
                  <td>
                    <HistoricoStatusBadge status={processo.status_processo} />
                  </td>
                  <td>{formatHistoricoDate(processo.iniciado_em)}</td>
                  <td>{formatHistoricoDate(processo.finalizado_em)}</td>
                  <td>{getUnknownNumber(processo, 'vacuo_final')}</td>
                  <td>{getUnknownNumber(processo, 'eficiencia')}</td>
                  <td>
                    <div className={styles.actions}>
                      <button type="button" onClick={() => onSelect(processo.id_processo)}>
                        <Eye size={15} aria-hidden="true" />
                        Detalhes
                      </button>
                      {permissions.canGenerateHistoricoReport ? (
                        <button type="button" onClick={() => onGenerateReport(processo)}>
                          <FilePlus2 size={15} aria-hidden="true" />
                          Relatorio
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.empty}>
          {isLoading ? 'Carregando historico...' : 'Nenhum processo historico encontrado.'}
        </p>
      )}

      <footer className={styles.pagination}>
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1 || isLoading}>
          Anterior
        </button>
        <span>
          Pagina {page} de {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
        >
          Proxima
        </button>
      </footer>
    </section>
  );
}
