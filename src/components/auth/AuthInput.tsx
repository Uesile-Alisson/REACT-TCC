import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './AuthInput.module.scss';

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
};

export function AuthInput({ id, label, icon, ...inputProps }: AuthInputProps) {
  const inputId = id ?? inputProps.name ?? label;

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>
      <span className={styles.control}>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        <input id={inputId} {...inputProps} />
      </span>
    </label>
  );
}
