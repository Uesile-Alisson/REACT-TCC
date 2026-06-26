import type { FormatoRelatorio, TipoRelatorio } from '../../../types';
import styles from './RelatorioBadges.module.scss';

type RelatorioTipoBadgeProps = {
  tipo?: TipoRelatorio;
};

type RelatorioFormatoBadgeProps = {
  formato?: FormatoRelatorio;
};

export function RelatorioTipoBadge({ tipo }: RelatorioTipoBadgeProps) {
  const label = tipo === 'ALARME' ? 'Alarme' : 'Processo';
  const tone = tipo === 'ALARME' ? styles.alarm : styles.process;

  return <span className={`${styles.badge} ${tone}`}>{label}</span>;
}

export function RelatorioFormatoBadge({ formato }: RelatorioFormatoBadgeProps) {
  const label = formato === 'XLSX' ? 'XLSX' : 'PDF';
  const tone = formato === 'XLSX' ? styles.sheet : styles.pdf;

  return <span className={`${styles.badge} ${tone}`}>{label}</span>;
}
