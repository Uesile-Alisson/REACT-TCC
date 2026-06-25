import { Clock, Gauge, Layers } from 'lucide-react';
import type { ProcessoResponse, SensorReadingPayload } from '../../../types';
import {
  countArrayField,
  formatDateTime,
  formatNumber,
  getProcessStatusLabel,
  getProcessStatusTone,
} from '../dashboard.utils';
import { StatusBadge } from '../StatusBadge';
import styles from './ActiveProcessCard.module.scss';

type ActiveProcessCardProps = {
  process: ProcessoResponse;
  activeAlarms?: number | null;
  lastSensorReading?: SensorReadingPayload | null;
  partialError?: string;
};

export function ActiveProcessCard({
  process,
  activeAlarms,
  lastSensorReading,
  partialError,
}: ActiveProcessCardProps) {
  const tankCount = countArrayField(process, 'tanques');
  const currentVacuum = lastSensorReading?.valor_vacuo ?? null;

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Processo em andamento</p>
          <h2>{process.nome_processo ?? `Processo #${process.id_processo}`}</h2>
        </div>
        <StatusBadge
          label={getProcessStatusLabel(process.status_processo)}
          tone={getProcessStatusTone(process.status_processo)}
        />
      </header>

      {partialError ? <p className={styles.partialError}>{partialError}</p> : null}

      <dl className={styles.metrics}>
        <div>
          <dt>
            <Clock size={15} aria-hidden="true" />
            Inicio
          </dt>
          <dd>{formatDateTime(process.iniciado_em ?? process.criado_em)}</dd>
        </div>
        <div>
          <dt>
            <Gauge size={15} aria-hidden="true" />
            Vacuo alvo
          </dt>
          <dd>{formatNumber(process.vacuo_alvo, 'mbar')}</dd>
        </div>
        <div>
          <dt>
            <Gauge size={15} aria-hidden="true" />
            Vacuo atual
          </dt>
          <dd>{formatNumber(currentVacuum, 'mbar')}</dd>
        </div>
        <div>
          <dt>
            <Layers size={15} aria-hidden="true" />
            Tanques
          </dt>
          <dd>{tankCount ?? 'Nao informado'}</dd>
        </div>
      </dl>

      <footer className={styles.footer}>
        <span>Alarmes ativos relacionados: {activeAlarms ?? 'Pendente'}</span>
        <span>Nenhuma acao operacional e executada neste painel.</span>
      </footer>
    </article>
  );
}
