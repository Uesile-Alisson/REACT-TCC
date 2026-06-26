import { motion } from 'framer-motion';
import { Archive, FileSpreadsheet, FileText, ShieldCheck } from 'lucide-react';
import type { RelatorioResponse } from '../../../types';
import styles from './RelatoriosSummaryCards.module.scss';

type RelatoriosSummaryCardsProps = {
  relatorios: RelatorioResponse[];
  total: number;
  canGenerate: boolean;
  canDownload: boolean;
};

export function RelatoriosSummaryCards({
  relatorios,
  total,
  canGenerate,
  canDownload,
}: RelatoriosSummaryCardsProps) {
  const pdfCount = relatorios.filter((relatorio) => relatorio.formato === 'PDF').length;
  const xlsxCount = relatorios.filter((relatorio) => relatorio.formato === 'XLSX').length;
  const cards = [
    { icon: Archive, label: 'Catalogados', value: total },
    { icon: FileText, label: 'PDF visiveis', value: pdfCount },
    { icon: FileSpreadsheet, label: 'Planilhas', value: xlsxCount },
    { icon: ShieldCheck, label: 'Permissao', value: canGenerate || canDownload ? 'Tecnica' : 'Leitura' },
  ];

  return (
    <section className={styles.cards} aria-label="Resumo de relatorios">
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
