import type { StatusBomba } from '../../../types';
import styles from './BombaStatusBadge.module.scss';

const STATUS_LABEL: Record<StatusBomba, string> = {
  ATIVA: 'Ativa',
  INATIVA: 'Inativa',
  MANUTENCAO: 'Manutencao',
  FALHA: 'Falha',
};

const STATUS_TONE: Record<StatusBomba, string> = {
  ATIVA: styles.success,
  INATIVA: styles.neutral,
  MANUTENCAO: styles.warning,
  FALHA: styles.danger,
};

type BombaStatusBadgeProps = {
  status: StatusBomba;
};

export function BombaStatusBadge({ status }: BombaStatusBadgeProps) {
  return <span className={`${styles.badge} ${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</span>;
}
