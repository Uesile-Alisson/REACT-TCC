import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import styles from './AuthCard.module.scss';

type AuthCardProps = {
  children: ReactNode;
};

export function AuthCard({ children }: AuthCardProps) {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ boxShadow: '0 28px 80px rgba(0, 0, 0, 0.32), 0 0 42px rgba(91, 200, 255, 0.1)' }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
