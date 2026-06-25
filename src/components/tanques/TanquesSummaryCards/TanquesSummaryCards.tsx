import type { TanquesSummary } from '../../../types';
import styles from './TanquesSummaryCards.module.scss';

type TanquesSummaryCardsProps = {
  summary: TanquesSummary;
};

export function TanquesSummaryCards({ summary }: TanquesSummaryCardsProps) {
  const cards = [
    { label: 'Tanques catalogados', value: summary.total.toString(), detail: 'Registros disponiveis' },
    { label: 'Operacionais', value: summary.ativos.toString(), detail: 'Status ativo' },
    { label: 'Indisponiveis', value: summary.indisponiveis.toString(), detail: 'Bloqueio ou manutencao' },
    {
      label: 'Capacidade cadastrada',
      value: summary.volumeConfigurado.toLocaleString('pt-BR'),
      detail: 'Total configurado',
    },
  ];

  return (
    <section className={styles.grid} aria-label="Resumo de tanques">
      {cards.map((card) => (
        <article className={styles.card} key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <small>{card.detail}</small>
        </article>
      ))}
    </section>
  );
}
