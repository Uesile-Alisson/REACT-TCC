import { getProcessStatusLabel, getProcessTone, type ProcessTone } from '../processos.utils';
import styles from './ProcessStatusBadge.module.scss';

type ProcessStatusBadgeProps = {
  status?: string | null;
  label?: string;
  tone?: ProcessTone;
};

export function ProcessStatusBadge({ status, label, tone }: ProcessStatusBadgeProps) {
  const badgeTone = tone ?? getProcessTone(status);

  return (
    <span className={`${styles.badge} ${styles[badgeTone]}`}>
      {label ?? getProcessStatusLabel(status)}
    </span>
  );
}
