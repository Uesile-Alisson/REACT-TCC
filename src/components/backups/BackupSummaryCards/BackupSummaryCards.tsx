import { motion } from 'framer-motion';
import { AlertTriangle, DatabaseBackup, RotateCcw } from 'lucide-react';
import type { BackupListItem } from '../../../types';
import { formatBackupDate } from '../backupUtils';
import styles from './BackupSummaryCards.module.scss';

type BackupSummaryCardsProps = {
  backups: BackupListItem[];
  total: number;
};

export function BackupSummaryCards({ backups, total }: BackupSummaryCardsProps) {
  const sistema = backups.filter((backup) => backup.tipo_backup === 'SISTEMA').length;
  const mqtt = backups.filter((backup) => backup.tipo_backup === 'MQTT').length;
  const completo = backups.filter((backup) => backup.tipo_backup === 'COMPLETO').length;
  const restaurados = backups.filter((backup) => backup.status_backup === 'RESTAURADO').length;
  const falhas = backups.filter((backup) => backup.status_backup.includes('FALHA')).length;
  const ultimoBackup = backups[0]?.criado_em;
  const ultimoRestaurado = backups.find((backup) => backup.restaurado_em)?.restaurado_em;

  const cards = [
    { icon: DatabaseBackup, label: 'Total', value: total, className: undefined },
    { icon: DatabaseBackup, label: 'Sistema', value: sistema, className: undefined },
    { icon: DatabaseBackup, label: 'MQTT/Hardware', value: mqtt, className: undefined },
    { icon: DatabaseBackup, label: 'Completos', value: completo, className: undefined },
    { icon: RotateCcw, label: 'Restaurados', value: restaurados, className: undefined },
    { icon: AlertTriangle, label: 'Falhas', value: falhas, className: falhas > 0 ? styles.danger : undefined },
    { icon: null, label: 'Ultimo backup', value: formatBackupDate(ultimoBackup), className: undefined },
    { icon: null, label: 'Ultimo restore', value: formatBackupDate(ultimoRestaurado), className: undefined },
  ];

  return (
    <section className={styles.grid} aria-label="Resumo de backups">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.article
            key={card.label}
            className={card.className}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            whileHover={{ y: -4, scale: 1.015 }}
            transition={{ delay: index * 0.03, duration: 0.22 }}
          >
            {Icon ? <Icon size={18} aria-hidden="true" /> : null}
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </motion.article>
        );
      })}
    </section>
  );
}
