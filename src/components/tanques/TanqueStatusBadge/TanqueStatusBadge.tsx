import type { StatusTanque } from '../../../types';
import styles from './TanqueStatusBadge.module.scss';

const STATUS_LABEL: Record<StatusTanque, string> = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  MANUTENCAO: 'Manutencao',
  FALHA: 'Falha',
};

const STATUS_TONE: Record<StatusTanque, string> = {
  ATIVO: styles.success,
  INATIVO: styles.neutral,
  MANUTENCAO: styles.warning,
  FALHA: styles.danger,
};

type TanqueStatusBadgeProps = {
  status: StatusTanque;
};

export function TanqueStatusBadge({ status }: TanqueStatusBadgeProps) {
  return <span className={`${styles.badge} ${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</span>;
}
