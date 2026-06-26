import { motion } from 'framer-motion';
import type { AlarmesFiltersState, SeveridadeAlarme, StatusAlarme } from '../../../types';
import styles from './AlarmeFilters.module.scss';

type AlarmeFiltersProps = {
  filters: AlarmesFiltersState;
  onChange: (filters: AlarmesFiltersState) => void;
};

const SEVERITY_OPTIONS: Array<SeveridadeAlarme | ''> = ['', 'INFO', 'MEDIO', 'CRITICO'];
const STATUS_OPTIONS: Array<StatusAlarme | ''> = ['', 'ATIVO', 'RESOLVIDO'];

export function AlarmeFilters({ filters, onChange }: AlarmeFiltersProps) {
  const fieldMotion = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      className={styles.filters}
      aria-label="Filtros de alarmes"
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
          placeholder="Mensagem, origem ou tipo"
        />
      </motion.label>
      <motion.label {...fieldMotion} transition={{ delay: 0.04, duration: 0.2 }}>
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
      </motion.label>
      <motion.label {...fieldMotion} transition={{ delay: 0.06, duration: 0.2 }}>
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
      </motion.label>
      <motion.label {...fieldMotion} transition={{ delay: 0.08, duration: 0.2 }}>
        Processo
        <input
          type="number"
          min="1"
          value={filters.id_processo}
          onChange={(event) => onChange({ ...filters, id_processo: event.target.value })}
          placeholder="ID"
        />
      </motion.label>
      <motion.label {...fieldMotion} transition={{ delay: 0.1, duration: 0.2 }}>
        Inicio
        <input
          type="date"
          value={filters.data_inicio}
          onChange={(event) => onChange({ ...filters, data_inicio: event.target.value })}
        />
      </motion.label>
      <motion.label {...fieldMotion} transition={{ delay: 0.12, duration: 0.2 }}>
        Fim
        <input
          type="date"
          value={filters.data_fim}
          onChange={(event) => onChange({ ...filters, data_fim: event.target.value })}
        />
      </motion.label>
      <motion.label className={styles.checkLabel} {...fieldMotion} transition={{ delay: 0.14, duration: 0.2 }}>
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
      </motion.label>
    </motion.section>
  );
}
