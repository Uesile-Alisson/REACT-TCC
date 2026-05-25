import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { AuthInput } from './AuthInput';
import styles from './PasswordInput.module.scss';

type PasswordInputProps = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
};

export function PasswordInput({
  id,
  label,
  value,
  placeholder,
  autoComplete = 'new-password',
  onChange,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.wrapper}>
      <AuthInput
        id={id}
        label={label}
        type={visible ? 'text' : 'password'}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        icon={<LockKeyhole size={18} aria-hidden="true" />}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        className={styles.toggle}
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  );
}
