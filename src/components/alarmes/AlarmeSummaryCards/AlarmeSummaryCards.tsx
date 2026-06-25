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

export function AlarmeSummaryCards({ summary, alarmes }: AlarmeSummaryCardsProps) {
  const total = summary?.total ?? alarmes.length;
  const ativos = summary?.ativos ?? countByList(alarmes, (alarme) => alarme.status_alarme === 'ATIVO');
  const criticos = summary?.criticos ?? countByList(alarmes, (alarme) => alarme.severidade === 'CRITICO');
  const medios = summary?.por_severidade?.MEDIO ?? countByList(alarmes, (alarme) => alarme.severidade === 'MEDIO');
  const infos = summary?.por_severidade?.INFO ?? countByList(alarmes, (alarme) => alarme.severidade === 'INFO');
  const resolvidos = countByList(alarmes, (alarme) => alarme.status_alarme === 'RESOLVIDO');

  return (
    <section className={styles.grid} aria-label="Resumo de alarmes">
      <article>
        <Bell size={18} aria-hidden="true" />
        <span>Total</span>
        <strong>{total}</strong>
      </article>
      <article>
        <AlertTriangle size={18} aria-hidden="true" />
        <span>Ativos</span>
        <strong>{ativos}</strong>
      </article>
      <article className={styles.critical}>
        <AlertTriangle size={18} aria-hidden="true" />
        <span>Criticos</span>
        <strong>{criticos}</strong>
      </article>
      <article>
        <Info size={18} aria-hidden="true" />
        <span>Medio / Info</span>
        <strong>
          {medios} / {infos}
        </strong>
      </article>
      <article>
        <CheckCircle2 size={18} aria-hidden="true" />
        <span>Resolvidos</span>
        <strong>{resolvidos}</strong>
      </article>
    </section>
  );
}
