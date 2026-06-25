import { AlertTriangle } from 'lucide-react';
import type {
  ConfiguracoesSistemaFormErrors,
  ConfiguracoesSistemaFormState,
} from '../../../types';
import styles from './ConfiguracoesSistemaSecurityCard.module.scss';

type ConfiguracoesSistemaSecurityCardProps = {
  formState: ConfiguracoesSistemaFormState;
  errors: ConfiguracoesSistemaFormErrors;
  readOnly: boolean;
  onChange: (field: keyof ConfiguracoesSistemaFormState, value: string) => void;
};

export function ConfiguracoesSistemaSecurityCard({
  formState,
  errors,
  readOnly,
  onChange,
}: ConfiguracoesSistemaSecurityCardProps) {
  return (
    <section className={styles.card}>
      <header>
        <p>Seguranca</p>
        <h2>Limites operacionais</h2>
      </header>

      <label>
        Limite de seguranca de vacuo
        <div>
          <input
            type="number"
            min="0"
            step="0.001"
            value={formState.limite_seguranca_vacuo}
            onChange={(event) => onChange('limite_seguranca_vacuo', event.target.value)}
            disabled={readOnly}
            placeholder="Indisponivel"
          />
          <span>kPa</span>
        </div>
        {errors.limite_seguranca_vacuo ? <strong>{errors.limite_seguranca_vacuo}</strong> : null}
      </label>

      <div className={styles.note}>
        <AlertTriangle size={17} aria-hidden="true" />
        <span>
          As regras finais de seguranca devem permanecer centralizadas no backend. Esta tela aplica
          apenas validacoes visuais basicas.
        </span>
      </div>
    </section>
  );
}
