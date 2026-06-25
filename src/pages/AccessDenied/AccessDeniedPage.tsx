import { Link } from 'react-router-dom';
import styles from './AccessDeniedPage.module.scss';

export function AccessDeniedPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel} role="alert">
        <p>TSEA / Permissao</p>
        <h1>Acesso negado</h1>
        <span>Seu perfil nao possui permissao para acessar esta area do sistema.</span>
        <Link to="/dashboard">Voltar ao Dashboard</Link>
      </section>
    </main>
  );
}
