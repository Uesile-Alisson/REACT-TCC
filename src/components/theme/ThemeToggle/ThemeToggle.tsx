import { motion, useReducedMotion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import styles from './ThemeToggle.module.scss';

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const label = isDark ? 'Ativar tema claro' : 'Ativar tema escuro';
  const classNames = className ? `${styles.toggle} ${className}` : styles.toggle;

  return (
    <motion.button
      type="button"
      className={classNames}
      aria-label={label}
      title={label}
      onClick={toggleTheme}
      whileHover={shouldReduceMotion ? undefined : { y: -1, scale: 1.02 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
    >
      <span className={styles.track} aria-hidden="true">
        <motion.span
          className={styles.thumb}
          animate={{ x: isDark ? 0 : 26 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {isDark ? <Moon size={14} /> : <Sun size={14} />}
        </motion.span>
      </span>
      <span className={styles.text}>{isDark ? 'Dark' : 'Light'}</span>
    </motion.button>
  );
}
