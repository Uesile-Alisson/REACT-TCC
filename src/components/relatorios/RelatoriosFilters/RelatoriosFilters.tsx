import { Filter, RotateCcw } from 'lucide-react';
import type { RelatoriosFiltersState } from '../../../types';
import styles from './RelatoriosFilters.module.scss';

type RelatoriosFiltersProps = {
  filters: RelatoriosFiltersState;
  onChange: (filters: RelatoriosFiltersState) => void;
};

const emptyFilters: RelatoriosFiltersState = {
  tipo_relatorio: '',
  formato: '',
  id_processo: '',
  id_alarme: '',
  data_inicio: '',
  data_fim: '',
};

export function RelatoriosFilters({ filters, onChange }: RelatoriosFiltersProps) {
  function updateFilter<Key extends keyof RelatoriosFiltersState>(
    key: Key,
    value: RelatoriosFiltersState[Key],
  ): void {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <section className={styles.filters} aria-label="Filtros de relatorios">
      <header>
        <div>
          <Filter size={16} aria-hidden="true" />
          <strong>Filtros operacionais</strong>
        </div>
        <button type="button" onClick={() => onChange(emptyFilters)}>
          <RotateCcw size={15} aria-hidden="true" />
          Limpar
        </button>
      </header>

      <div className={styles.grid}>
        <label>
          Tipo
          <select
            value={filters.tipo_relatorio}
            onChange={(event) => updateFilter('tipo_relatorio', event.target.value as RelatoriosFiltersState['tipo_relatorio'])}
          >
            <option value="">Todos</option>
            <option value="PROCESSO">Processo</option>
            <option value="ALARME">Alarme</option>
          </select>
        </label>

        <label>
          Formato
          <select
            value={filters.formato}
            onChange={(event) => updateFilter('formato', event.target.value as RelatoriosFiltersState['formato'])}
          >
            <option value="">Todos</option>
            <option value="PDF">PDF</option>
            <option value="XLSX">XLSX</option>
          </select>
        </label>

        <label>
          Processo
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={filters.id_processo}
            onChange={(event) => updateFilter('id_processo', event.target.value)}
            placeholder="ID"
          />
        </label>

        <label>
          Alarme
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={filters.id_alarme}
            onChange={(event) => updateFilter('id_alarme', event.target.value)}
            placeholder="ID"
          />
        </label>

        <label>
          Inicio
          <input
            type="date"
            value={filters.data_inicio}
            onChange={(event) => updateFilter('data_inicio', event.target.value)}
          />
        </label>

        <label>
          Fim
          <input
            type="date"
            value={filters.data_fim}
            onChange={(event) => updateFilter('data_fim', event.target.value)}
          />
        </label>
      </div>
    </section>
  );
}
