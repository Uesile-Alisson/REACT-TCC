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

  return (
    <section className={styles.cards} aria-label="Resumo de relatorios">
      <article>
        <Archive size={18} aria-hidden="true" />
        <span>Catalogados</span>
        <strong>{total}</strong>
      </article>
      <article>
        <FileText size={18} aria-hidden="true" />
        <span>PDF visiveis</span>
        <strong>{pdfCount}</strong>
      </article>
      <article>
        <FileSpreadsheet size={18} aria-hidden="true" />
        <span>Planilhas</span>
        <strong>{xlsxCount}</strong>
      </article>
      <article>
        <ShieldCheck size={18} aria-hidden="true" />
        <span>Permissao</span>
        <strong>{canGenerate || canDownload ? 'Tecnica' : 'Leitura'}</strong>
      </article>
    </section>
  );
}
