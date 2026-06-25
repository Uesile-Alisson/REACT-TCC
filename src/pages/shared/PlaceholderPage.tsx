import type { ReactNode } from 'react';
import styles from './PlaceholderPage.module.scss';

type PlaceholderPageProps = {
  title: string;
  description: string;
  nextPhase: string;
  children?: ReactNode;
};

export function PlaceholderPage({
  title,
  description,
  nextPhase,
  children,
}: PlaceholderPageProps) {
  return (
    <section className={styles.page} aria-labelledby="placeholder-title">
      <div className={styles.header}>
        <p className={styles.overline}>Modulo TSEA</p>
        <h1 id="placeholder-title">{title}</h1>
        <p>{description}</p>
      </div>

      <div className={styles.content}>
        <div className={styles.statusPanel}>
          <span>Em construcao</span>
          <strong>{nextPhase}</strong>
          <p>
            Esta rota ja esta protegida, navegavel e preparada para receber a integracao completa
            nas proximas fases.
          </p>
        </div>

        {children}
      </div>
    </section>
  );
}
