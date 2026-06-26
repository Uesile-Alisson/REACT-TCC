import type {
  ConfiguracoesSistemaFormErrors,
  ConfiguracoesSistemaFormState,
} from '../../../types';
import styles from './ConfiguracoesSistemaVacuoCard.module.scss';

type ConfiguracoesSistemaVacuoCardProps = {
  formState: ConfiguracoesSistemaFormState;
  errors: ConfiguracoesSistemaFormErrors;
  readOnly: boolean;
  onChange: (field: keyof ConfiguracoesSistemaFormState, value: string) => void;
};

export function ConfiguracoesSistemaVacuoCard({
  formState,
  errors,
  readOnly,
  onChange,
}: ConfiguracoesSistemaVacuoCardProps) {
  return (
    <section className={styles.card}>
      <header>
        <p>Parametros de Vacuo</p>
        <h2>Referencia operacional</h2>
      </header>

      <div className={styles.fields}>
        <label>
          Vacuo padrao
          <div>
            <input
              type="number"
              step="0.001"
              value={formState.vacuo_padrao}
              onChange={(event) => onChange('vacuo_padrao', event.target.value)}
              disabled={readOnly}
              placeholder="Indisponivel"
            />
            <span>kPa</span>
          </div>
          {errors.vacuo_padrao ? <strong>{errors.vacuo_padrao}</strong> : null}
        </label>

        <label>
          Tolerancia de vacuo
          <div>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formState.tolerancia_vacuo_percentual}
              onChange={(event) => onChange('tolerancia_vacuo_percentual', event.target.value)}
              disabled={readOnly}
              placeholder="Indisponivel"
            />
            <span>%</span>
          </div>
          {errors.tolerancia_vacuo_percentual ? (
            <strong>{errors.tolerancia_vacuo_percentual}</strong>
          ) : null}
        </label>
      </div>
    </section>
  );
}
