import { motion } from 'framer-motion';
import { AlertTriangle, Bell, CheckCircle2, Info } from 'lucide-react';
import type { AlarmeDashboardResponse, AlarmeResponse } from '../../../types';
import styles from './AlarmeSummaryCards.module.scss';

type AlarmeSummaryCardsProps = {
  summary: AlarmeDashboardResponse | null;
  alarmes: AlarmeResponse[];
};

function countByList(alarmes: AlarmeResponse[], predicate: (alarme: AlarmeResponse) => boolean): number {
  return alarmes.filter(predicate).length;
}

function isOperationalActiveAlarm(alarme: AlarmeResponse): boolean {
  return alarme.status_alarme === 'ATIVO' && alarme.severidade !== 'INFO';
}

export function AlarmeSummaryCards({ summary, alarmes }: AlarmeSummaryCardsProps) {
  const total = summary?.total ?? alarmes.length;
  const ativos = summary?.ativos ?? countByList(alarmes, isOperationalActiveAlarm);
  const criticos = summary?.criticos ?? countByList(alarmes, (alarme) => alarme.severidade === 'CRITICO');
  const medios = summary?.por_severidade?.MEDIO ?? countByList(alarmes, (alarme) => alarme.severidade === 'MEDIO');
  const infos = summary?.por_severidade?.INFO ?? countByList(alarmes, (alarme) => alarme.severidade === 'INFO');
  const resolvidos = countByList(alarmes, (alarme) => alarme.status_alarme === 'RESOLVIDO');

  const cards = [
    { icon: Bell, label: 'Total', value: total, className: undefined },
    { icon: AlertTriangle, label: 'Ativos', value: ativos, className: undefined },
    { icon: AlertTriangle, label: 'Criticos', value: criticos, className: styles.critical },
    { icon: Info, label: 'Medio / Info', value: `${medios} / ${infos}`, className: undefined },
    { icon: CheckCircle2, label: 'Resolvidos', value: resolvidos, className: undefined },
  ];

  return (
    <section className={styles.grid} aria-label="Resumo de alarmes">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.article
            key={card.label}
            className={card.className}
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
