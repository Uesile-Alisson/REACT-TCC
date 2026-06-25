import type {
  ConfiguracoesSistemaFormErrors,
  ConfiguracoesSistemaFormState,
  ConfiguracoesSistemaResponse,
} from '../../../types';
import { ConfiguracoesSistemaSecurityCard } from '../ConfiguracoesSistemaSecurityCard';
import { ConfiguracoesSistemaStatusCard } from '../ConfiguracoesSistemaStatusCard';
import { ConfiguracoesSistemaVacuoCard } from '../ConfiguracoesSistemaVacuoCard';
import styles from './ConfiguracoesSistemaForm.module.scss';

type ConfiguracoesSistemaFormProps = {
  configuracao: ConfiguracoesSistemaResponse | null;
  formState: ConfiguracoesSistemaFormState;
  errors: ConfiguracoesSistemaFormErrors;
  readOnly: boolean;
  endpointMissing: boolean;
  onChange: (field: keyof ConfiguracoesSistemaFormState, value: string) => void;
};

export function ConfiguracoesSistemaForm({
  configuracao,
  formState,
  errors,
  readOnly,
  endpointMissing,
  onChange,
}: ConfiguracoesSistemaFormProps) {
  return (
    <section className={styles.form} aria-label="Formulario de configuracoes do sistema">
      <ConfiguracoesSistemaStatusCard
        configuracao={configuracao}
        endpointMissing={endpointMissing}
      />

      <div className={styles.grid}>
        <ConfiguracoesSistemaVacuoCard
          formState={formState}
          errors={errors}
          readOnly={readOnly}
          onChange={onChange}
        />
        <ConfiguracoesSistemaSecurityCard
          formState={formState}
          errors={errors}
          readOnly={readOnly}
          onChange={onChange}
        />
      </div>
    </section>
  );
}
