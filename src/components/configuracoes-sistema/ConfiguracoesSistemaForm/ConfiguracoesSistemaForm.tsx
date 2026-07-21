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
  onChange: (field: keyof ConfiguracoesSistemaFormState, value: string) => void;
};

type AdvancedField = {
  field: keyof ConfiguracoesSistemaFormState;
  label: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  kind?: 'number' | 'text' | 'boolean';
};

const advancedGroups: Array<{ title: string; description: string; fields: AdvancedField[] }> = [
  {
    title: 'Operacao geral',
    description: 'Limites globais usados na criacao e no encerramento dos processos.',
    fields: [
      { field: 'tempo_maximo_padrao', label: 'Tempo maximo padrao', unit: 's', min: 1 },
      { field: 'encerramento_automatico', label: 'Encerramento automatico', kind: 'boolean' },
      { field: 'quantidade_maxima_tanques', label: 'Quantidade maxima de tanques', min: 1 },
      { field: 'versao_sistema', label: 'Versao do sistema', kind: 'text' },
    ],
  },
  {
    title: 'Leitura e estabilizacao',
    description: 'Cadencia da telemetria e criterios para reconhecer vacuo estavel.',
    fields: [
      { field: 'tempo_estabilizacao_vacuo_segundos', label: 'Tempo de estabilizacao', unit: 's', min: 5, max: 3600 },
      { field: 'estabilizacao_cobertura_minima_percentual', label: 'Cobertura minima', unit: '%', min: 1, max: 100, step: 0.01 },
      { field: 'intervalo_leitura_esperado_ms', label: 'Intervalo esperado de leitura', unit: 'ms', min: 100, max: 60000 },
      { field: 'timeout_leitura_sensor_ms', label: 'Timeout do sensor', unit: 'ms', min: 100, max: 120000 },
      { field: 'tempo_retencao_vacuo_segundos', label: 'Tempo de retencao', unit: 's', min: 5, max: 3600 },
      { field: 'perda_vacuo_maxima_retencao', label: 'Perda maxima na retencao', unit: 'kPa', min: 0, max: 1000, step: 0.001 },
    ],
  },
  {
    title: 'Deteccao de estagnacao',
    description: 'Janelas e evidencias usadas para detectar falta de progresso do vacuo.',
    fields: [
      { field: 'estagnacao_janela_segundos', label: 'Janela', unit: 's', min: 10, max: 3600 },
      { field: 'estagnacao_variacao_minima', label: 'Variacao minima', unit: 'kPa', min: 0, max: 1000, step: 0.001 },
      { field: 'estagnacao_leituras_minimas', label: 'Leituras minimas', min: 3, max: 1000 },
      { field: 'estagnacao_janelas_consecutivas', label: 'Janelas consecutivas', min: 1, max: 10 },
      { field: 'estagnacao_tempo_minimo_bomba_principal_segundos', label: 'Tempo minimo da bomba principal', unit: 's', min: 0, max: 3600 },
      { field: 'estagnacao_tempo_maximo_sem_progresso_segundos', label: 'Tempo maximo sem progresso', unit: 's', min: 10, max: 86400 },
      { field: 'estagnacao_fator_minimo_proximidade_alvo', label: 'Fator minimo de proximidade', min: 0.05, max: 1, step: 0.001 },
    ],
  },
  {
    title: 'Avaliacao do auxilio',
    description: 'Parametros que controlam a avaliacao do subsistema auxiliar.',
    fields: [
      { field: 'auxilio_janela_avaliacao_segundos', label: 'Janela de avaliacao', unit: 's', min: 5, max: 3600 },
      { field: 'auxilio_melhoria_minima', label: 'Melhoria minima', unit: 'kPa', min: 0.001, max: 1000, step: 0.001 },
      { field: 'auxilio_timeout_segundos', label: 'Timeout do auxilio', unit: 's', min: 10, max: 86400 },
    ],
  },
];

export function ConfiguracoesSistemaForm({
  configuracao,
  formState,
  errors,
  readOnly,
  onChange,
}: ConfiguracoesSistemaFormProps) {
  return (
    <section className={styles.form} aria-label="Formulario de configuracoes do sistema">
      <ConfiguracoesSistemaStatusCard
        configuracao={configuracao}
        formState={formState}
        errors={errors}
        readOnly={readOnly}
        onChange={onChange}
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

      <section className={styles.advanced} aria-label="Parametros operacionais avancados">
        <header>
          <p>Parametros avancados</p>
          <h2>Ciclo, telemetria, estagnacao e auxilio</h2>
        </header>

        <div className={styles.advancedGroups}>
          {advancedGroups.map((group) => (
            <article key={group.title} className={styles.advancedGroup}>
              <div className={styles.groupHeading}>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
              </div>
              <div className={styles.fields}>
                {group.fields.map((item) => (
                  <label key={item.field}>
                    <span>{item.label}{item.unit ? ` (${item.unit})` : ''}</span>
                    {item.kind === 'boolean' ? (
                      <select
                        value={formState[item.field]}
                        onChange={(event) => onChange(item.field, event.target.value)}
                        disabled={readOnly}
                      >
                        <option value="true">Ativado</option>
                        <option value="false">Desativado</option>
                      </select>
                    ) : (
                      <input
                        type={item.kind === 'text' ? 'text' : 'number'}
                        value={formState[item.field]}
                        min={item.min}
                        max={item.max}
                        step={item.step ?? 1}
                        onChange={(event) => onChange(item.field, event.target.value)}
                        disabled={readOnly}
                      />
                    )}
                    {errors[item.field] ? <strong>{errors[item.field]}</strong> : null}
                  </label>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
