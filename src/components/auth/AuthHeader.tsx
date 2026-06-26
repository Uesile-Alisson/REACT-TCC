import { motion } from 'framer-motion';
import styles from './AuthHeader.module.scss';

type AuthHeaderProps = {
  title: string;
  description: string;
};

export function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <motion.header
      className={styles.header}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: 0.06 }}
    >
      <motion.span animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2.8, repeat: Infinity }}>
        Secure Access
      </motion.span>
      <h2>{title}</h2>
      <p>{description}</p>
    </motion.header>
  );
}
