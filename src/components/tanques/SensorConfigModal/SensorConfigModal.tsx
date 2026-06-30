import { useMemo, useState } from 'react';
import type {
  CreateSensorConfiguracaoDto,
  SensorConfigFormErrors,
  SensorConfigFormState,
  SensorStatus,
  SensorTipo,
  TanqueConfigResponse,
} from '../../../types';
import styles from '../TanqueConfigModal/TanqueConfigModal.module.scss';

type SensorConfigModalProps = {
  tanque: TanqueConfigResponse;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: (id_tanque: number, payload: CreateSensorConfiguracaoDto) => Promise<boolean>;
};

const SENSOR_TYPES: SensorTipo[] = ['VACUO', 'ACOPLAMENTO', 'MANGUEIRA'];
const SENSOR_STATUS: SensorStatus[] = ['ATIVO', 'INATIVO'];

const emptyForm: SensorConfigFormState = {
  nome: '',
  modelo: '',
  tipo_sensor: 'VACUO',
  status_sensor: 'ATIVO',
  unidade_medida: 'mbar',
};

function validateForm(form: SensorConfigFormState): SensorConfigFormErrors {
  const errors: SensorConfigFormErrors = {};

  if (!form.nome.trim()) {
    errors.nome = 'Informe o nome do sensor.';
  }

  if (!SENSOR_TYPES.includes(form.tipo_sensor)) {
    errors.tipo_sensor = 'Selecione um tipo valido.';
  }

  if (!SENSOR_STATUS.includes(form.status_sensor)) {
    errors.status_sensor = 'Selecione um status valido.';
  }

  return errors;
}

function buildPayload(form: SensorConfigFormState): CreateSensorConfiguracaoDto {
  return {
    nome: form.nome.trim(),
    modelo: form.modelo.trim() || undefined,
    tipo_sensor: form.tipo_sensor,
    status_sensor: form.status_sensor,
    unidade_medida: form.unidade_medida.trim() || null,
  };
}

export function SensorConfigModal({
  tanque,
  isSubmitting,
  onClose,
  onCreate,
}: SensorConfigModalProps) {
  const [form, setForm] = useState<SensorConfigFormState>(emptyForm);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const errors = useMemo(() => validateForm(form), [form]);
  const hasErrors = Object.keys(errors).length > 0;

  function updateField<TField extends keyof SensorConfigFormState>(
    field: TField,
    value: SensorConfigFormState[TField],
  ): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(): Promise<void> {
    setSubmitted(true);

    if (hasErrors) {
      return;
    }

    const success = await onCreate(tanque.id_tanque, buildPayload(form));

    if (success) {
      onClose();
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="sensor-modal-title">
      <section className={styles.modal}>
        <header>
          <div>
            <p>Novo sensor</p>
            <h2 id="sensor-modal-title">Cadastrar sensor em {tanque.nome}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Fechar
          </button>
        </header>

        <div className={styles.grid}>
          <label>
            Nome
            <input value={form.nome} onChange={(event) => updateField('nome', event.target.value)} />
            {submitted && errors.nome ? <span>{errors.nome}</span> : null}
          </label>
          <label>
            Modelo
            <input value={form.modelo} onChange={(event) => updateField('modelo', event.target.value)} />
          </label>
          <label>
            Tipo
            <select
              value={form.tipo_sensor}
              onChange={(event) => updateField('tipo_sensor', event.target.value as SensorTipo)}
            >
              {SENSOR_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {submitted && errors.tipo_sensor ? <span>{errors.tipo_sensor}</span> : null}
          </label>
          <label>
            Unidade
            <input
              value={form.unidade_medida}
              onChange={(event) => updateField('unidade_medida', event.target.value)}
            />
          </label>
          <label>
            Status
            <select
              value={form.status_sensor}
              onChange={(event) => updateField('status_sensor', event.target.value as SensorStatus)}
            >
              {SENSOR_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {submitted && errors.status_sensor ? <span>{errors.status_sensor}</span> : null}
          </label>
        </div>

        <p className={styles.note}>
          O sensor sera vinculado ao tanque selecionado. Nenhuma valvula sera criada ou alterada.
        </p>

        <footer>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando' : 'Criar sensor'}
          </button>
        </footer>
      </section>
    </div>
  );
}
