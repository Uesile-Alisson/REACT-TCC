import { BellRing } from 'lucide-react';
import type { AlarmCreatedPayload, AlarmeDashboardResponse, AlarmeResponse } from '../../../types';
import { formatDateTime, getSeverityTone } from '../dashboard.utils';
import { StatusBadge } from '../StatusBadge';
import styles from './RecentAlarmsPanel.module.scss';

type RecentAlarmsPanelProps = {
  summary: AlarmeDashboardResponse | null;
  recentAlarms: AlarmeResponse[];
  lastRealtimeAlarm?: AlarmCreatedPayload | null;
  partialError?: string;
};

function getAlarmTitle(alarm: AlarmeResponse | AlarmCreatedPayload): string {
  return alarm.tipo_alarme ?? alarm.mensagem ?? `Alarme #${alarm.id_alarme ?? 'sem id'}`;
}

function getAlarmDate(alarm: AlarmeResponse | AlarmCreatedPayload): string {
  return formatDateTime(alarm.criado_em);
}

function getAlarmDescription(alarm: AlarmeResponse | AlarmCreatedPayload): string {
  if (typeof alarm.mensagem === 'string' && alarm.mensagem.trim()) {
    return alarm.mensagem;
  }

  if ('origem_alarme' in alarm && typeof alarm.origem_alarme === 'string') {
    return alarm.origem_alarme;
  }

  return 'Sem mensagem adicional';
}

export function RecentAlarmsPanel({
  summary,
  recentAlarms,
  lastRealtimeAlarm,
  partialError,
}: RecentAlarmsPanelProps) {
  const items = lastRealtimeAlarm
    ? [lastRealtimeAlarm, ...recentAlarms].slice(0, 5)
    : recentAlarms;

  return (
    <article className={styles.panel}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <p className={styles.overline}>Alarmes recentes</p>
          <h2>Resumo de ocorrencias</h2>
        </div>
        <StatusBadge
          label={`Criticos ${summary?.criticos ?? 'pendente'}`}
          tone={summary?.criticos ? 'danger' : 'neutral'}
        />
      </header>

      <div className={styles.summary}>
        <span>Total: {summary?.total ?? 'Pendente'}</span>
        <span>Ativos: {summary?.ativos ?? 'Pendente'}</span>
        <span>Criticos: {summary?.criticos ?? 'Pendente'}</span>
      </div>

      {items.length > 0 ? (
        <ul className={styles.list}>
          {items.map((alarm, index) => (
            <li key={`${alarm.id_alarme ?? 'realtime'}-${index}`}>
              <BellRing size={16} aria-hidden="true" />
              <div>
                <strong>{getAlarmTitle(alarm)}</strong>
                <span>{getAlarmDescription(alarm)}</span>
                <small>{getAlarmDate(alarm)}</small>
              </div>
              <StatusBadge
                label={alarm.severidade ?? 'Sem severidade'}
                tone={getSeverityTone(alarm.severidade)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>Nenhum alarme recente encontrado pelo endpoint consultado.</p>
      )}

      {partialError ? <p className={styles.partialError}>{partialError}</p> : null}
    </article>
  );
}
