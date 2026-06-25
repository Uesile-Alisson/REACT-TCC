import type { AlarmesFiltersState, SeveridadeAlarme, StatusAlarme } from '../../../types';
import styles from './AlarmeFilters.module.scss';

type AlarmeFiltersProps = {
  filters: AlarmesFiltersState;
  onChange: (filters: AlarmesFiltersState) => void;
};

const SEVERITY_OPTIONS: Array<SeveridadeAlarme | ''> = ['', 'INFO', 'MEDIO', 'CRITICO'];
const STATUS_OPTIONS: Array<StatusAlarme | ''> = ['', 'ATIVO', 'RESOLVIDO'];

export function AlarmeFilters({ filters, onChange }: AlarmeFiltersProps) {
  return (
    <section className={styles.filters} aria-label="Filtros de alarmes">
      <label>
        Busca
        <input
          value={filters.busca}
          onChange={(event) => onChange({ ...filters, busca: event.target.value })}
          placeholder="Mensagem, origem ou tipo"
        />
      </label>
      <label>
        Severidade
        <select
          value={filters.severidade}
          onChange={(event) =>
            onChange({ ...filters, severidade: event.target.value as typeof filters.severidade })
          }
          disabled={filters.apenas_criticos}
        >
          {SEVERITY_OPTIONS.map((severity) => (
            <option key={severity || 'todas'} value={severity}>
              {severity || 'Todas'}
            </option>
          ))}
        </select>
      </label>
      <label>
        Status
        <select
          value={filters.status_alarme}
          onChange={(event) =>
            onChange({ ...filters, status_alarme: event.target.value as typeof filters.status_alarme })
          }
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status || 'todos'} value={status}>
              {status || 'Todos'}
            </option>
          ))}
        </select>
      </label>
      <label>
        Processo
        <input
          type="number"
          min="1"
          value={filters.id_processo}
          onChange={(event) => onChange({ ...filters, id_processo: event.target.value })}
          placeholder="ID"
        />
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
          checked={filters.apenas_criticos}
          onChange={(event) =>
            onChange({
              ...filters,
              apenas_criticos: event.target.checked,
              severidade: event.target.checked ? '' : filters.severidade,
            })
          }
        />
        Apenas criticos
      </label>
    </section>
  );
}
