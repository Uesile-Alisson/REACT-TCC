import { motion } from 'framer-motion';
import { Clock, Gauge, RadioTower, Workflow } from 'lucide-react';
import type { ProcessoReadingResponse, ProcessoResponse } from '../../../types';
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
  acoplamentoStatusLabel?: string;
  esp32Online?: boolean | null;
};

export function ProcessMetricsCards({
  process,
  lastReading,
  acoplamentoStatusLabel,
  esp32Online,
}: ProcessMetricsCardsProps) {
  const tankCount = process ? countRelation(process, 'tanques') : null;
  const sensorCount = process ? countRelation(process, 'sensores') : null;
  const averageVacuum = process ? getUnknownNumber(process, 'vacuo_medio') : null;
  const finalVacuum = process ? getUnknownNumber(process, 'vacuo_final') : null;
  const cards = [
    { icon: Clock, label: 'Inicio', value: formatProcessDate(process?.iniciado_em ?? process?.criado_em) },
    {
      icon: Gauge,
      label: 'Vacuo alvo / atual',
      value: `${formatProcessNumber(process?.vacuo_alvo, 'kPa')} / ${formatProcessNumber(lastReading?.valor_vacuo ?? finalVacuum ?? averageVacuum, lastReading?.unidade_medida ?? 'kPa')}`,
    },
    { icon: Workflow, label: 'Tanques / sensores', value: `${tankCount ?? 'n/i'} / ${sensorCount ?? 'n/i'}` },
    {
      icon: RadioTower,
      label: 'Hardware',
      value: `ESP32 ${esp32Online === true ? 'online' : 'pendente'} / acoplamento ${
        acoplamentoStatusLabel?.toLowerCase() ?? 'nao informado'
      }`,
    },
  ];

  return (
    <section className={styles.grid} aria-label="Metricas do processo">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.article
            key={card.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{ y: -4, scale: 1.015 }}
            transition={{ delay: index * 0.035, duration: 0.22 }}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </motion.article>
        );
      })}
    </section>
  );
}
