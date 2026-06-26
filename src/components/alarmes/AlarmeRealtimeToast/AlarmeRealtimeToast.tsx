import { X } from 'lucide-react';
import type { AlarmCreatedPayload } from '../../../types';
import { formatAlarmeDate } from '../alarmes.utils';
import { AlarmeSeverityBadge } from '../AlarmeSeverityBadge';
import styles from './AlarmeRealtimeToast.module.scss';

type AlarmeRealtimeToastProps = {
  alarm: AlarmCreatedPayload | null;
  onClose: () => void;
};

function getNonEmptyText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getAlarmTitle(alarm: AlarmCreatedPayload): string {
  return (
    getNonEmptyText(alarm.titulo) ??
    getNonEmptyText(alarm.title) ??
    getNonEmptyText(alarm.mensagem) ??
    getNonEmptyText(alarm.tipo_alarme) ??
    'Alarme recebido'
  );
}

function getAlarmDescription(alarm: AlarmCreatedPayload): string {
  const explicitDescription =
    getNonEmptyText(alarm.descricao) ??
    getNonEmptyText(alarm.description) ??
    getNonEmptyText(alarm.mensagem);

  if (explicitDescription) {
    return explicitDescription;
  }

  const technicalParts = [
    getNonEmptyText(alarm.tipo_alarme),
    getNonEmptyText(alarm.origem_alarme),
    getNonEmptyText(alarm.severidade),
  ].filter(Boolean);

  return technicalParts.length > 0
    ? `Evento ${technicalParts.join(' / ')} recebido pelo realtime.`
    : 'Evento de alarme recebido pelo realtime.';
}

function getAlarmDate(alarm: AlarmCreatedPayload): string | undefined {
  return (
    getNonEmptyText(alarm.ocorrido_em) ??
    getNonEmptyText(alarm.enviado_em) ??
    getNonEmptyText(alarm.criado_em) ??
    getNonEmptyText(alarm.created_at) ??
    undefined
  );
}

export function AlarmeRealtimeToast({ alarm, onClose }: AlarmeRealtimeToastProps) {
  if (!alarm) {
    return null;
  }

  const title = getAlarmTitle(alarm);
  const description = getAlarmDescription(alarm);
  const date = getAlarmDate(alarm);

  return (
    <section className={styles.toast} role="status">
      <div>
        <p>Novo alarme recebido</p>
        <strong>{title}</strong>
        <em>{description}</em>
        <span>{formatAlarmeDate(date)}</span>
      </div>
      <AlarmeSeverityBadge severity={alarm.severidade} />
      <button type="button" onClick={onClose} aria-label="Fechar aviso de alarme">
        <X size={16} aria-hidden="true" />
      </button>
    </section>
  );
}
