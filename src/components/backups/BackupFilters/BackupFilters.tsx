import { motion } from 'framer-motion';
import { BACKUP_STATUS_OPTIONS, BACKUP_TYPE_OPTIONS } from '../../../hooks/useBackups';
import type { BackupFiltersState } from '../../../types';
import styles from './BackupFilters.module.scss';

type BackupFiltersProps = {
  filters: BackupFiltersState;
  onChange: (filters: BackupFiltersState) => void;
};

export function BackupFilters({ filters, onChange }: BackupFiltersProps) {
  const fieldMotion = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      className={styles.panel}
      aria-label="Filtros de backups"
      initial={{ opacity: 0, y: 12, filter: 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.label {...fieldMotion} transition={{ delay: 0.02, duration: 0.2 }}>
        Tipo
        <select
          value={filters.tipo_backup}
          onChange={(event) => onChange({ ...filters, tipo_backup: event.target.value as BackupFiltersState['tipo_backup'] })}
        >
          <option value="">Todos</option>
          {BACKUP_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </motion.label>
      <motion.label {...fieldMotion} transition={{ delay: 0.04, duration: 0.2 }}>
        Status
        <select
          value={filters.status_backup}
          onChange={(event) => onChange({ ...filters, status_backup: event.target.value as BackupFiltersState['status_backup'] })}
        >
          <option value="">Todos</option>
          {BACKUP_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </motion.label>
      <motion.label {...fieldMotion} transition={{ delay: 0.06, duration: 0.2 }}>
        Data inicial
        <input
          type="date"
          value={filters.data_inicio}
          onChange={(event) => onChange({ ...filters, data_inicio: event.target.value })}
        />
      </motion.label>
      <motion.label {...fieldMotion} transition={{ delay: 0.08, duration: 0.2 }}>
        Data final
        <input
          type="date"
          value={filters.data_fim}
          onChange={(event) => onChange({ ...filters, data_fim: event.target.value })}
        />
      </motion.label>
      <motion.label {...fieldMotion} transition={{ delay: 0.1, duration: 0.2 }}>
        Busca
        <input
          value={filters.busca}
          onChange={(event) => onChange({ ...filters, busca: event.target.value })}
          placeholder="Arquivo ou usuario"
        />
      </motion.label>
    </motion.section>
  );
}
