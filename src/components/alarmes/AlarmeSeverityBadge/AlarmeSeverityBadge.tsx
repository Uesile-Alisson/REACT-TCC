import type { SeveridadeAlarme } from '../../../types';
import { getSeverityLabel, getSeverityTone } from '../alarmes.utils';
import styles from './AlarmeSeverityBadge.module.scss';

type AlarmeSeverityBadgeProps = {
  severity?: SeveridadeAlarme | string | null;
};

export function AlarmeSeverityBadge({ severity }: AlarmeSeverityBadgeProps) {
  const tone = getSeverityTone(severity);

  return <span className={`${styles.badge} ${styles[tone]}`}>{getSeverityLabel(severity)}</span>;
}
