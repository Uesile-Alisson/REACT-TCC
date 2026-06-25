import { Eye } from 'lucide-react';
import type { ProcessoResponse, StatusProcesso } from '../../../types';
import { formatProcessDate, formatProcessNumber } from '../processos.utils';
import { ProcessStatusBadge } from '../ProcessStatusBadge';
import styles from './ProcessListTable.module.scss';

type ProcessListTableProps = {
  processes: ProcessoResponse[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  selectedId?: number;
  onSelect: (idProcesso: number) => void;
  onPageChange: (page: number) => void;
};

const STATUS_OPTIONS: Array<StatusProcesso | ''> = [
  '',
  'CONFIGURADO',
  'EM_EXECUCAO',
  'PAUSADO',
  'CONCLUIDO',
  'INTERROMPIDO',
  'FALHA',
];

export { STATUS_OPTIONS };

export function ProcessListTable({
  processes,
  total,
  page,
  limit,
  isLoading,
  selectedId,
  onSelect,
  onPageChange,
}: ProcessListTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Listagem</p>
          <h2>Processos cadastrados</h2>
        </div>
        <span>{isLoading ? 'Carregando' : `${total} registro(s)`}</span>
      </header>

      {processes.length > 0 ? (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Processo</th>
                <th>Status</th>
                <th>Inicio</th>
                <th>Fim</th>
                <th>Vacuo alvo</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process) => (
                <tr key={process.id_processo} className={selectedId === process.id_processo ? styles.activeRow : undefined}>
                  <td>
                    <strong>{process.nome_processo ?? `Processo #${process.id_processo}`}</strong>
                    <span>ID {process.id_processo}</span>
                  </td>
                  <td>
                    <ProcessStatusBadge status={process.status_processo} />
                  </td>
                  <td>{formatProcessDate(process.iniciado_em ?? process.criado_em)}</td>
                  <td>{formatProcessDate(process.finalizado_em)}</td>
                  <td>{formatProcessNumber(process.vacuo_alvo, 'mbar')}</td>
                  <td>
                    <button type="button" onClick={() => onSelect(process.id_processo)}>
                      <Eye size={15} aria-hidden="true" />
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.empty}>
          {isLoading ? 'Carregando processos...' : 'Nenhum processo encontrado para os filtros atuais.'}
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
