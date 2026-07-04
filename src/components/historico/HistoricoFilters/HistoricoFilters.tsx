import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { HistoricoFiltersState, HistoricoStatusFilter } from '../../../types';
import styles from './HistoricoFilters.module.scss';

type HistoricoFiltersProps = {
  filters: HistoricoFiltersState;
  onChange: (filters: HistoricoFiltersState) => void;
};

const STATUS_OPTIONS: HistoricoStatusFilter[] = ['', 'CONCLUIDO', 'INTERROMPIDO', 'FALHA'];

export function HistoricoFilters({ filters, onChange }: HistoricoFiltersProps) {
  const fieldMotion = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      className={styles.filters}
      aria-label="Filtros de historico"
      initial={{ opacity: 0, y: 12, filter: 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.label {...fieldMotion} transition={{ delay: 0.02, duration: 0.2 }}>
        Busca
        <input
          value={filters.busca}
          onChange={(event) => onChange({ ...filters, busca: event.target.value })}
          placeholder="ID, nome ou codigo"
        />
      </motion.label>
      <motion.label {...fieldMotion} transition={{ delay: 0.04, duration: 0.2 }}>
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
      </motion.label>
      <motion.label {...fieldMotion} transition={{ delay: 0.06, duration: 0.2 }}>
        Inicio
        <input
          type="date"
          value={filters.data_inicio}
          onChange={(event) => onChange({ ...filters, data_inicio: event.target.value })}
        />
      </motion.label>
      <motion.label {...fieldMotion} transition={{ delay: 0.08, duration: 0.2 }}>
        Fim
        <input
          type="date"
          value={filters.data_fim}
          onChange={(event) => onChange({ ...filters, data_fim: event.target.value })}
        />
      </motion.label>
      <motion.label
        className={`${styles.checkLabel} ${filters.apenas_falha ? styles.checkLabelActive : ''}`}
        {...fieldMotion}
        transition={{ delay: 0.1, duration: 0.2 }}
        whileHover={{ y: -2, scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
      >
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
        <span className={styles.checkSwitch} aria-hidden="true">
          <span />
        </span>
        <span className={styles.checkText}>
          <AlertTriangle size={14} aria-hidden="true" />
          Falhas e interrompidos
        </span>
      </motion.label>
    </motion.section>
  );
}
