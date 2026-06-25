import { AlertTriangle, CheckCircle2, Clock, Database, XCircle } from 'lucide-react';
import type { HistoricoDashboardResponse, HistoricoProcessoResponse } from '../../../types';
import { countByStatus } from '../historico.utils';
import styles from './HistoricoMetricsCards.module.scss';

type HistoricoMetricsCardsProps = {
  processos: HistoricoProcessoResponse[];
  total: number;
  summary: HistoricoDashboardResponse | null;
};

export function HistoricoMetricsCards({ processos, total, summary }: HistoricoMetricsCardsProps) {
  const concluidos = countByStatus(processos, 'CONCLUIDO');
  const interrompidos = countByStatus(processos, 'INTERROMPIDO');
  const falhas = countByStatus(processos, 'FALHA');
  const hasSummary = Boolean(summary?.processos);

  return (
    <section className={styles.grid} aria-label="Resumo historico">
      <article>
        <Database size={18} aria-hidden="true" />
        <span>Total historico</span>
        <strong>{total}</strong>
      </article>
      <article>
        <CheckCircle2 size={18} aria-hidden="true" />
        <span>Concluidos</span>
        <strong>{concluidos}</strong>
      </article>
      <article>
        <Clock size={18} aria-hidden="true" />
        <span>Interrompidos</span>
        <strong>{interrompidos}</strong>
      </article>
      <article className={styles.danger}>
        <XCircle size={18} aria-hidden="true" />
        <span>Falhas</span>
        <strong>{falhas}</strong>
      </article>
      <article>
        <AlertTriangle size={18} aria-hidden="true" />
        <span>Resumo API</span>
        <strong>{hasSummary ? 'Disponivel' : 'Pendente'}</strong>
      </article>
    </section>
  );
}
