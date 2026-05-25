import type { ReactNode } from 'react';
import { Activity } from 'lucide-react';
import logo from '../../assets/logo.png';
import styles from './AuthLayout.module.scss';

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className={styles.shell}>
      <section className={styles.brandPanel} aria-label="TSEA Solução a Vácuo">
        <div className={styles.brand}>
          <img className={styles.logoMark} src={logo} alt="Logo TSEA" />
          <div>
            <strong>TSEA</strong>
            <span>Solução a Vácuo</span>
          </div>
        </div>

        <div className={styles.heroCopy}>
          <p className={styles.overline}>Console de autenticação industrial</p>
          <h1>Controle seguro para operação a vácuo.</h1>
          <p>
            Interface preparada para ambientes industriais, com leitura rápida,
            contraste alto e aparência compatível com aplicações desktop.
          </p>
        </div>

        <div className={styles.signalBar} aria-hidden="true">
          <Activity size={18} />
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className={styles.formPanel}>{children}</section>
    </main>
  );
}
