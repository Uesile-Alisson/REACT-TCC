import { Eye, Wrench } from 'lucide-react';
import type { AlarmeResponse, AlarmesPermissions } from '../../../types';
import { formatAlarmeDate } from '../alarmes.utils';
import { AlarmeSeverityBadge } from '../AlarmeSeverityBadge';
import { AlarmeStatusBadge } from '../AlarmeStatusBadge';
import styles from './AlarmeListTable.module.scss';

type AlarmeListTableProps = {
  alarmes: AlarmeResponse[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  selectedId?: number;
  permissions: AlarmesPermissions;
  onSelect: (idAlarme: number) => void;
  onResolve: (alarme: AlarmeResponse) => void;
  onPageChange: (page: number) => void;
};

export function AlarmeListTable({
  alarmes,
  total,
  page,
  limit,
  isLoading,
  selectedId,
  permissions,
  onSelect,
  onResolve,
  onPageChange,
}: AlarmeListTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Listagem</p>
          <h2>Alarmes operacionais</h2>
        </div>
        <span>{isLoading ? 'Carregando' : `${total} registro(s)`}</span>
      </header>

      {alarmes.length > 0 ? (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Alarme</th>
                <th>Severidade</th>
                <th>Status</th>
                <th>Origem</th>
                <th>Processo</th>
                <th>Criacao</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {alarmes.map((alarme) => (
                <tr
                  key={alarme.id_alarme}
                  className={`${alarme.severidade === 'CRITICO' && alarme.status_alarme === 'ATIVO' ? styles.criticalRow : ''} ${
                    selectedId === alarme.id_alarme ? styles.activeRow : ''
                  }`}
                >
                  <td>
                    <strong>{alarme.tipo_alarme ?? `Alarme #${alarme.id_alarme}`}</strong>
                    <span>{alarme.mensagem ?? 'Sem mensagem'}</span>
                  </td>
                  <td>
                    <AlarmeSeverityBadge severity={alarme.severidade} />
                  </td>
                  <td>
                    <AlarmeStatusBadge status={alarme.status_alarme} />
                  </td>
                  <td>{alarme.origem_alarme ?? 'Nao informado'}</td>
                  <td>{typeof alarme.id_processo === 'number' ? `#${alarme.id_processo}` : 'Nao informado'}</td>
                  <td>{formatAlarmeDate(alarme.criado_em)}</td>
                  <td>
                    <div className={styles.actions}>
                      <button type="button" onClick={() => onSelect(alarme.id_alarme)}>
                        <Eye size={15} aria-hidden="true" />
                        Detalhes
                      </button>
                      {permissions.canResolveAlarme(alarme.status_alarme) ? (
                        <button type="button" onClick={() => onResolve(alarme)}>
                          <Wrench size={15} aria-hidden="true" />
                          Resolver
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
          {isLoading ? 'Carregando alarmes...' : 'Nenhum alarme encontrado para os filtros atuais.'}
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
