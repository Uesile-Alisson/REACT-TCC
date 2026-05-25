import { Check, X } from 'lucide-react';
import styles from './PasswordStrengthIndicator.module.scss';

type Rule = {
  id: string;
  label: string;
  passed: boolean;
};

type Strength = {
  label: 'Fraca' | 'Média' | 'Boa' | 'Forte';
  level: 1 | 2 | 3 | 4;
  tone: 'weak' | 'medium' | 'good' | 'strong';
};

type PasswordStrengthIndicatorProps = {
  password: string;
};

function getRules(password: string): Rule[] {
  return [
    { id: 'length', label: 'Mínimo de 6 caracteres', passed: password.length >= 6 },
    { id: 'uppercase', label: 'Pelo menos 1 letra maiúscula', passed: /[A-Z]/.test(password) },
    { id: 'number', label: 'Pelo menos 1 número', passed: /\d/.test(password) },
    {
      id: 'special',
      label: 'Pelo menos 1 caractere especial',
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

function getStrength(passedCount: number): Strength {
  if (passedCount >= 4) {
    return { label: 'Forte', level: 4, tone: 'strong' };
  }

  if (passedCount === 3) {
    return { label: 'Boa', level: 3, tone: 'good' };
  }

  if (passedCount === 2) {
    return { label: 'Média', level: 2, tone: 'medium' };
  }

  return { label: 'Fraca', level: 1, tone: 'weak' };
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const rules = getRules(password);
  const passedCount = rules.filter((rule) => rule.passed).length;
  const strength = getStrength(passedCount);

  return (
    <div className={styles.indicator} data-tone={strength.tone}>
      <div className={styles.summary}>
        <span>Nivel da senha</span>
        <strong>{strength.label}</strong>
      </div>

      <div className={styles.segments} aria-label={`Nivel da senha: ${strength.label}`}>
        {[1, 2, 3, 4].map((segment) => (
          <span
            className={segment <= strength.level ? styles.segmentActive : styles.segment}
            key={segment}
          />
        ))}
      </div>

      <ul className={styles.rules}>
        {rules.map((rule) => (
          <li className={rule.passed ? styles.rulePassed : styles.rule} key={rule.id}>
            {rule.passed ? <Check size={14} aria-hidden="true" /> : <X size={14} aria-hidden="true" />}
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
