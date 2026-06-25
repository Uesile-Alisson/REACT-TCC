import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.scss';

export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel} role="status">
        <p>TSEA / Rota</p>
        <h1>Pagina nao encontrada</h1>
        <span>A rota solicitada nao existe ou ainda nao foi disponibilizada no frontend.</span>
        <Link to="/dashboard">Voltar ao Dashboard</Link>
      </section>
    </main>
  );
}
