import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import logo from '../../assets/logo.png';
import styles from './AuthLayout.module.scss';

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className={styles.shell}>
      <motion.section
        className={styles.brandPanel}
        aria-label="TSEA Solucao a Vacuo"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className={styles.brand}
          whileHover={{ scale: 1.015, filter: 'drop-shadow(0 0 20px rgba(91, 200, 255, 0.28))' }}
        >
          <img className={styles.logoMark} src={logo} alt="Logo TSEA" />
          <div>
            <strong>TSEA</strong>
            <span>Solucao a Vacuo</span>
          </div>
        </motion.div>

        <motion.div
          className={styles.heroCopy}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.36 }}
        >
          <p className={styles.overline}>Console de autenticacao industrial</p>
          <h1>Controle seguro para operacao a vacuo.</h1>
          <p>
            Interface preparada para ambientes industriais, com leitura rapida,
            contraste alto e aparencia compativel com aplicacoes desktop.
          </p>
        </motion.div>

        <motion.div
          className={styles.signalBar}
          aria-hidden="true"
          animate={{
            opacity: [0.72, 1, 0.72],
            boxShadow: [
              '0 0 0 rgba(91, 200, 255, 0)',
              '0 0 22px rgba(91, 200, 255, 0.18)',
              '0 0 0 rgba(91, 200, 255, 0)',
            ],
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Activity size={18} />
          <span />
          <span />
          <span />
          <span />
        </motion.div>
      </motion.section>

      <motion.section
        className={styles.formPanel}
        initial={{ opacity: 0, x: 18, filter: 'blur(6px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.section>
    </main>
  );
}
