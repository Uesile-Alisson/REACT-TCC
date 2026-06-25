import { getStatusLabel, getStatusTone } from '../historico.utils';
import styles from './HistoricoStatusBadge.module.scss';

type HistoricoStatusBadgeProps = {
  status?: string | null;
};

export function HistoricoStatusBadge({ status }: HistoricoStatusBadgeProps) {
  const tone = getStatusTone(status);

  return <span className={`${styles.badge} ${styles[tone]}`}>{getStatusLabel(status)}</span>;
}
