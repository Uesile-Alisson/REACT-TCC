import type { BombasSummary } from '../../../types';
import styles from './BombasSummaryCards.module.scss';

type BombasSummaryCardsProps = {
  summary: BombasSummary;
};

export function BombasSummaryCards({ summary }: BombasSummaryCardsProps) {
  const cards = [
    { label: 'Bombas catalogadas', value: summary.total.toString(), detail: 'Registros disponiveis' },
    { label: 'Operacionais', value: summary.ativas.toString(), detail: 'Status padrao ativo' },
    { label: 'Indisponiveis', value: summary.indisponiveis.toString(), detail: 'Falha ou manutencao' },
    { label: 'Automatizadas', value: summary.automaticas.toString(), detail: 'Pressao ou tempo' },
  ];

  return (
    <section className={styles.grid} aria-label="Resumo de bombas">
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
