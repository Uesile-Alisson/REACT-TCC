import type { AlarmeResponse } from '../../../types';
import { AlarmeSeverityBadge } from '../../alarmes/AlarmeSeverityBadge';
import { AlarmeStatusBadge } from '../../alarmes/AlarmeStatusBadge';
import { formatHistoricoDate } from '../historico.utils';
import styles from './HistoricoAlarmesPanel.module.scss';

type HistoricoAlarmesPanelProps = {
  alarmes: AlarmeResponse[];
  error?: string;
};

export function HistoricoAlarmesPanel({ alarmes, error }: HistoricoAlarmesPanelProps) {
  return (
    <article className={styles.panel}>
      <h3>Alarmes relacionados</h3>
      {error ? <p className={styles.error}>{error}</p> : null}
      {alarmes.length > 0 ? (
        <ul>
          {alarmes.map((alarme) => (
            <li key={alarme.id_alarme}>
              <div>
                <strong>{alarme.tipo_alarme ?? `Alarme #${alarme.id_alarme}`}</strong>
                <span>{alarme.mensagem ?? formatHistoricoDate(alarme.criado_em)}</span>
              </div>
              <AlarmeSeverityBadge severity={alarme.severidade} />
              <AlarmeStatusBadge status={alarme.status_alarme} />
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum alarme relacionado retornado.</p>
      )}
    </article>
  );
}
