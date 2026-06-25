import { X } from 'lucide-react';
import type { AlarmCreatedPayload } from '../../../types';
import { formatAlarmeDate } from '../alarmes.utils';
import { AlarmeSeverityBadge } from '../AlarmeSeverityBadge';
import styles from './AlarmeRealtimeToast.module.scss';

type AlarmeRealtimeToastProps = {
  alarm: AlarmCreatedPayload | null;
  onClose: () => void;
};

export function AlarmeRealtimeToast({ alarm, onClose }: AlarmeRealtimeToastProps) {
  if (!alarm) {
    return null;
  }

  return (
    <section className={styles.toast} role="status">
      <div>
        <p>Novo alarme recebido</p>
        <strong>{alarm.tipo_alarme ?? alarm.mensagem ?? `Alarme #${alarm.id_alarme ?? 'realtime'}`}</strong>
        <span>{formatAlarmeDate(alarm.criado_em)}</span>
      </div>
      <AlarmeSeverityBadge severity={alarm.severidade} />
      <button type="button" onClick={onClose} aria-label="Fechar aviso de alarme">
        <X size={16} aria-hidden="true" />
      </button>
    </section>
  );
}
