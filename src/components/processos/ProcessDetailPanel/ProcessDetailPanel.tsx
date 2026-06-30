import { Activity, Gauge, ListChecks } from 'lucide-react';
import type { ProcessoEventResponse, ProcessoReadingResponse, ProcessoResponse } from '../../../types';
import { formatProcessDate, formatProcessNumber } from '../processos.utils';
import { ProcessMetricsCards } from '../ProcessMetricsCards';
import { ProcessStatusBadge } from '../ProcessStatusBadge';
import styles from './ProcessDetailPanel.module.scss';

type ProcessDetailPanelProps = {
  process: ProcessoResponse | null;
  readings: ProcessoReadingResponse[];
  events: ProcessoEventResponse[];
  isLoading: boolean;
  error: string | null;
};

export function ProcessDetailPanel({
  process,
  readings,
  events,
  isLoading,
  error,
}: ProcessDetailPanelProps) {
  if (isLoading) {
    return <section className={styles.panel}>Carregando detalhe do processo...</section>;
  }

  if (error && !process) {
    return (
      <section className={styles.panel}>
        <p className={styles.error}>{error}</p>
      </section>
    );
  }

  if (!process) {
    return (
      <section className={styles.panel}>
        <p className={styles.empty}>Selecione um processo para visualizar detalhes tecnicos.</p>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Detalhe</p>
          <h2>{process.nome_processo ?? `Processo #${process.id_processo}`}</h2>
        </div>
        <ProcessStatusBadge status={process.status_processo} />
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}

      <ProcessMetricsCards process={process} lastReading={readings[0] ?? null} />

      <div className={styles.detailGrid}>
        <article>
          <h3>
            <Gauge size={16} aria-hidden="true" />
            Leituras recentes
          </h3>
          {readings.length > 0 ? (
            <ul>
              {readings.map((reading) => (
                <li key={reading.id_leitura_sensor ?? `${reading.registrado_em}-${reading.valor_vacuo}`}>
                  <strong>{formatProcessNumber(reading.valor_vacuo, 'mbar')}</strong>
                  <span>{formatProcessDate(reading.registrado_em)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhuma leitura retornada pelo endpoint.</p>
          )}
        </article>

        <article>
          <h3>
            <ListChecks size={16} aria-hidden="true" />
            Eventos recentes
          </h3>
          {events.length > 0 ? (
            <ul>
              {events.map((event) => (
                <li key={event.id_evento ?? `${event.registrado_em}-${event.tipo_evento}`}>
                  <strong>{event.tipo_evento ?? 'Evento'}</strong>
                  <span>{event.descricao ?? formatProcessDate(event.registrado_em)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum evento retornado pelo endpoint.</p>
          )}
        </article>

        <article>
          <h3>
            <Activity size={16} aria-hidden="true" />
            Status tecnico
          </h3>
          <p>Detalhes adicionais dependem dos campos opcionais retornados pela API.</p>
        </article>
      </div>
    </section>
  );
}
