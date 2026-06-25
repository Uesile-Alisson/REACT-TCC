import type { HistoricoFiltersState, HistoricoStatusFilter } from '../../../types';
import styles from './HistoricoFilters.module.scss';

type HistoricoFiltersProps = {
  filters: HistoricoFiltersState;
  onChange: (filters: HistoricoFiltersState) => void;
};

const STATUS_OPTIONS: HistoricoStatusFilter[] = ['', 'CONCLUIDO', 'INTERROMPIDO', 'FALHA'];

export function HistoricoFilters({ filters, onChange }: HistoricoFiltersProps) {
  return (
    <section className={styles.filters} aria-label="Filtros de historico">
      <label>
        Busca
        <input
          value={filters.busca}
          onChange={(event) => onChange({ ...filters, busca: event.target.value })}
          placeholder="ID, nome ou codigo"
        />
      </label>
      <label>
        Status
        <select
          value={filters.status_processo}
          onChange={(event) =>
            onChange({
              ...filters,
              status_processo: event.target.value as HistoricoStatusFilter,
            })
          }
          disabled={filters.apenas_falha}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status || 'todos'} value={status}>
              {status || 'Todos'}
            </option>
          ))}
        </select>
      </label>
      <label>
        Inicio
        <input
          type="date"
          value={filters.data_inicio}
          onChange={(event) => onChange({ ...filters, data_inicio: event.target.value })}
        />
      </label>
      <label>
        Fim
        <input
          type="date"
          value={filters.data_fim}
          onChange={(event) => onChange({ ...filters, data_fim: event.target.value })}
        />
      </label>
      <label className={styles.checkLabel}>
        <input
          type="checkbox"
          checked={filters.apenas_falha}
          onChange={(event) =>
            onChange({
              ...filters,
              apenas_falha: event.target.checked,
              status_processo: event.target.checked ? '' : filters.status_processo,
            })
          }
        />
        Apenas falha
      </label>
    </section>
  );
}
