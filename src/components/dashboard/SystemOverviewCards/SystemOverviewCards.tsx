import { motion } from 'framer-motion';
import { Activity, Bell, FileText, RadioTower } from 'lucide-react';
import type { DashboardData } from '../../../types';
import { formatBoolean, getMqttTone, getProcessStatusLabel } from '../dashboard.utils';
import { StatusBadge } from '../StatusBadge';
import styles from './SystemOverviewCards.module.scss';

type SystemOverviewCardsProps = {
  data: DashboardData;
  realtimeConnected: boolean;
  realtimeConnecting: boolean;
};

export function SystemOverviewCards({
  data,
  realtimeConnected,
  realtimeConnecting,
}: SystemOverviewCardsProps) {
  const processLabel = data.activeProcess
    ? getProcessStatusLabel(data.activeProcess.status_processo)
    : data.lastProcess
      ? 'Sem processo ativo'
      : 'Sem processo recente';
  const mqttStatus = data.hardwareStatus?.status_conexao ?? 'Sem status';
  const realtimeLabel = realtimeConnected
    ? 'Realtime online'
    : realtimeConnecting
      ? 'Conectando'
      : 'Realtime offline';

  return (
    <section className={styles.grid} aria-label="Resumo rapido">
      <motion.article
        className={styles.card}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        whileHover={{ y: -5, scale: 1.012 }}
        transition={{ duration: 0.22 }}
      >
        <div className={styles.iconBox}>
          <Activity size={20} aria-hidden="true" />
        </div>
        <div>
          <p>Processo</p>
          <strong>{processLabel}</strong>
          <span>{data.activeProcess?.nome_processo ?? data.lastProcess?.nome_processo ?? 'Aguardando dados'}</span>
        </div>
      </motion.article>

      <motion.article
        className={styles.card}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        whileHover={{ y: -5, scale: 1.012 }}
        transition={{ delay: 0.04, duration: 0.22 }}
      >
        <div className={styles.iconBox}>
          <Bell size={20} aria-hidden="true" />
        </div>
        <div>
          <p>Alarmes ativos</p>
          <strong>{data.alarmsSummary?.ativos ?? 'Pendente'}</strong>
          <span>Criticos: {data.alarmsSummary?.criticos ?? 'Pendente'}</span>
        </div>
      </motion.article>

      <motion.article
        className={styles.card}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        whileHover={{ y: -5, scale: 1.012 }}
        transition={{ delay: 0.08, duration: 0.22 }}
      >
        <div className={styles.iconBox}>
          <RadioTower size={20} aria-hidden="true" />
        </div>
        <div>
          <p>Comunicacao</p>
          <strong>{formatBoolean(data.hardwareStatus?.esp32_online)}</strong>
          <span>MQTT: {mqttStatus}</span>
          <StatusBadge label={realtimeLabel} tone={realtimeConnected ? 'success' : 'neutral'} />
        </div>
      </motion.article>

      <motion.article
        className={styles.card}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        whileHover={{ y: -5, scale: 1.012 }}
        transition={{ delay: 0.12, duration: 0.22 }}
      >
        <div className={styles.iconBox}>
          <FileText size={20} aria-hidden="true" />
        </div>
        <div>
          <p>Relatorios</p>
          <strong>{data.reportsCount ?? 'Pendente'}</strong>
          <span>Consulta simples pelo service existente</span>
          <StatusBadge label={mqttStatus} tone={getMqttTone(mqttStatus)} />
        </div>
      </motion.article>
    </section>
  );
}
