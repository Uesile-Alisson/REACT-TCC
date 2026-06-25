import type { NivelAcesso } from '../../../types';
import styles from './NivelAcessoBadge.module.scss';

const LABELS: Record<NivelAcesso, string> = {
  OPERADOR: 'Operador',
  TECNICO: 'Tecnico',
  ADMINISTRADOR: 'Administrador',
};

const TONES: Record<NivelAcesso, string> = {
  OPERADOR: styles.neutral,
  TECNICO: styles.info,
  ADMINISTRADOR: styles.warning,
};

type NivelAcessoBadgeProps = {
  nivel: NivelAcesso;
};

export function NivelAcessoBadge({ nivel }: NivelAcessoBadgeProps) {
  return <span className={`${styles.badge} ${TONES[nivel]}`}>{LABELS[nivel]}</span>;
}
