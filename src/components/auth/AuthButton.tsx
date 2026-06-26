import { motion, type HTMLMotionProps } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import styles from './AuthButton.module.scss';

type AuthButtonProps = HTMLMotionProps<'button'> & {
  children: string;
};

export function AuthButton({ children, ...buttonProps }: AuthButtonProps) {
  return (
    <motion.button
      className={styles.button}
      type="button"
      whileHover={{ scale: 1.025, boxShadow: '0 0 28px rgba(91, 200, 255, 0.22)' }}
      whileTap={{ scale: 0.97 }}
      {...buttonProps}
    >
      <span>{children}</span>
      <ArrowRight size={18} aria-hidden="true" />
    </motion.button>
  );
}
