import type { ButtonHTMLAttributes } from 'react';
import { ArrowRight } from 'lucide-react';
import styles from './AuthButton.module.scss';

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: string;
};

export function AuthButton({ children, ...buttonProps }: AuthButtonProps) {
  return (
    <button className={styles.button} type="button" {...buttonProps}>
      <span>{children}</span>
      <ArrowRight size={18} aria-hidden="true" />
    </button>
  );
}
