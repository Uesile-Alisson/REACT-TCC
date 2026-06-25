import { Clock, Gauge, RadioTower, Workflow } from 'lucide-react';
import type { ProcessoReadingResponse, ProcessoResponse, SensorAcoplamentoPayload } from '../../../types';
import {
  countRelation,
  formatProcessDate,
  formatProcessNumber,
  getUnknownNumber,
} from '../processos.utils';
import styles from './ProcessMetricsCards.module.scss';

type ProcessMetricsCardsProps = {
  process: ProcessoResponse | null;
  lastReading?: ProcessoReadingResponse | null;
  lastAcoplamento?: SensorAcoplamentoPayload | null;
  esp32Online?: boolean | null;
};

export function ProcessMetricsCards({
  process,
  lastReading,
  lastAcoplamento,
  esp32Online,
}: ProcessMetricsCardsProps) {
  const tankCount = process ? countRelation(process, 'tanques') : null;
  const sensorCount = process ? countRelation(process, 'sensores') : null;
  const averageVacuum = process ? getUnknownNumber(process, 'vacuo_medio') : null;
  const finalVacuum = process ? getUnknownNumber(process, 'vacuo_final') : null;

  return (
    <section className={styles.grid} aria-label="Metricas do processo">
      <article>
        <Clock size={18} aria-hidden="true" />
        <span>Inicio</span>
        <strong>{formatProcessDate(process?.iniciado_em ?? process?.criado_em)}</strong>
      </article>
      <article>
        <Gauge size={18} aria-hidden="true" />
        <span>Vacuo alvo / atual</span>
        <strong>
          {formatProcessNumber(process?.vacuo_alvo, 'mbar')} /{' '}
          {formatProcessNumber(lastReading?.valor_vacuo ?? finalVacuum ?? averageVacuum, 'mbar')}
        </strong>
      </article>
      <article>
        <Workflow size={18} aria-hidden="true" />
        <span>Tanques / sensores</span>
        <strong>
          {tankCount ?? 'n/i'} / {sensorCount ?? 'n/i'}
        </strong>
      </article>
      <article>
        <RadioTower size={18} aria-hidden="true" />
        <span>Hardware</span>
        <strong>
          ESP32 {esp32Online === true ? 'online' : 'pendente'} /{' '}
          {lastAcoplamento?.status_acoplamento ?? 'acoplamento pendente'}
        </strong>
      </article>
    </section>
  );
}
