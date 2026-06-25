import type { ProcessoEventResponse } from '../../../types';
import { formatHistoricoDate } from '../historico.utils';
import styles from './HistoricoEventosPanel.module.scss';

type HistoricoEventosPanelProps = {
  eventos: ProcessoEventResponse[];
  error?: string;
};

export function HistoricoEventosPanel({ eventos, error }: HistoricoEventosPanelProps) {
  return (
    <article className={styles.panel}>
      <h3>Eventos e logs</h3>
      {error ? <p className={styles.error}>{error}</p> : null}
      {eventos.length > 0 ? (
        <ul>
          {eventos.map((evento) => (
            <li key={evento.id_evento ?? `${evento.tipo_evento}-${evento.registrado_em}`}>
              <strong>{evento.tipo_evento ?? 'Evento'}</strong>
              <span>{evento.descricao ?? formatHistoricoDate(evento.registrado_em)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum evento relacionado retornado.</p>
      )}
    </article>
  );
}
