import { motion } from 'framer-motion';
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
  const fieldMotion = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
  };

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
    <motion.section
      className={styles.filters}
      aria-label="Filtros de relatorios"
      initial={{ opacity: 0, y: 12, filter: 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.header initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <div>
          <Filter size={16} aria-hidden="true" />
          <strong>Filtros operacionais</strong>
        </div>
        <motion.button
          type="button"
          onClick={() => onChange(emptyFilters)}
          whileHover={{ scale: 1.035, x: -2 }}
          whileTap={{ scale: 0.96 }}
        >
          <RotateCcw size={15} aria-hidden="true" />
          Limpar
        </motion.button>
      </motion.header>

      <div className={styles.grid}>
        <motion.label {...fieldMotion} transition={{ delay: 0.02, duration: 0.2 }}>
          Tipo
          <select
            value={filters.tipo_relatorio}
            onChange={(event) => updateFilter('tipo_relatorio', event.target.value as RelatoriosFiltersState['tipo_relatorio'])}
          >
            <option value="">Todos</option>
            <option value="PROCESSO">Processo</option>
            <option value="ALARME">Alarme</option>
          </select>
        </motion.label>

        <motion.label {...fieldMotion} transition={{ delay: 0.04, duration: 0.2 }}>
          Formato
          <select
            value={filters.formato}
            onChange={(event) => updateFilter('formato', event.target.value as RelatoriosFiltersState['formato'])}
          >
            <option value="">Todos</option>
            <option value="PDF">PDF</option>
            <option value="XLSX">XLSX</option>
          </select>
        </motion.label>

        <motion.label {...fieldMotion} transition={{ delay: 0.06, duration: 0.2 }}>
          Processo
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={filters.id_processo}
            onChange={(event) => updateFilter('id_processo', event.target.value)}
            placeholder="ID"
          />
        </motion.label>

        <motion.label {...fieldMotion} transition={{ delay: 0.08, duration: 0.2 }}>
          Alarme
          <input
            type="number"
            min="1"
            inputMode="numeric"
            value={filters.id_alarme}
            onChange={(event) => updateFilter('id_alarme', event.target.value)}
            placeholder="ID"
          />
        </motion.label>

        <motion.label {...fieldMotion} transition={{ delay: 0.1, duration: 0.2 }}>
          Inicio
          <input
            type="date"
            value={filters.data_inicio}
            onChange={(event) => updateFilter('data_inicio', event.target.value)}
          />
        </motion.label>

        <motion.label {...fieldMotion} transition={{ delay: 0.12, duration: 0.2 }}>
          Fim
          <input
            type="date"
            value={filters.data_fim}
            onChange={(event) => updateFilter('data_fim', event.target.value)}
          />
        </motion.label>
      </div>
    </motion.section>
  );
}
