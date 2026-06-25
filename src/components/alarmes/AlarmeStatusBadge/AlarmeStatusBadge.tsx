import type { StatusAlarme } from '../../../types';
import { getStatusLabel, getStatusTone } from '../alarmes.utils';
import styles from './AlarmeStatusBadge.module.scss';

type AlarmeStatusBadgeProps = {
  status?: StatusAlarme | string | null;
};

export function AlarmeStatusBadge({ status }: AlarmeStatusBadgeProps) {
  const tone = getStatusTone(status);

  return <span className={`${styles.badge} ${styles[tone]}`}>{getStatusLabel(status)}</span>;
}
