import { useMemo, useState } from 'react';
import type {
  CreateSensorConfiguracaoDto,
  SensorConfigFormErrors,
  SensorConfigFormState,
  SensorProtocolo,
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

const SENSOR_TYPES: SensorTipo[] = ['VACUO', 'VAZAO', 'NIVEL', 'ACOPLAMENTO', 'GENERICO'];
const SENSOR_STATUS: SensorStatus[] = ['ATIVO', 'INATIVO', 'FALHA', 'DESCONECTADO'];
const SENSOR_PROTOCOLS: SensorProtocolo[] = ['I2C', 'ANALOGICO', 'DIGITAL', 'SPI', 'UART'];

const emptyForm: SensorConfigFormState = {
  nome: '',
  modelo: '',
  protocolo: 'ANALOGICO',
  tipo_sensor: 'VACUO',
  status_sensor: 'ATIVO',
  unidade_medida: 'kPa',
};

function validateForm(form: SensorConfigFormState): SensorConfigFormErrors {
  const errors: SensorConfigFormErrors = {};

  if (!form.nome.trim()) {
    errors.nome = 'Informe o nome do sensor.';
  } else if (form.nome.trim().length > 80) {
    errors.nome = 'O nome deve ter no maximo 80 caracteres.';
  }

  if (!form.modelo.trim()) {
    errors.modelo = 'Informe o modelo do sensor.';
  } else if (form.modelo.trim().length > 100) {
    errors.modelo = 'O modelo deve ter no maximo 100 caracteres.';
  }

  if (!SENSOR_PROTOCOLS.includes(form.protocolo)) {
    errors.protocolo = 'Selecione um protocolo valido.';
  }

  if (!form.unidade_medida.trim()) {
    errors.unidade_medida = 'Informe a unidade de medida.';
  } else if (form.unidade_medida.trim().length > 20) {
    errors.unidade_medida = 'A unidade deve ter no maximo 20 caracteres.';
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
    modelo: form.modelo.trim(),
    protocolo: form.protocolo,
    tipo_sensor: form.tipo_sensor,
    status_sensor: form.status_sensor,
    unidade_medida: form.unidade_medida.trim(),
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
            <h2 id="sensor-modal-title">Cadastrar sensor para uso em {tanque.nome}</h2>
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
            {submitted && errors.modelo ? <span>{errors.modelo}</span> : null}
          </label>
          <label>
            Protocolo
            <select
              value={form.protocolo}
              onChange={(event) => updateField('protocolo', event.target.value as SensorProtocolo)}
            >
              {SENSOR_PROTOCOLS.map((protocol) => (
                <option key={protocol} value={protocol}>
                  {protocol}
                </option>
              ))}
            </select>
            {submitted && errors.protocolo ? <span>{errors.protocolo}</span> : null}
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
            {submitted && errors.unidade_medida ? <span>{errors.unidade_medida}</span> : null}
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
          O cadastro do sensor e global. Ele ficara disponivel para selecao no tanque ao configurar
          um processo; nenhuma valvula sera criada ou alterada.
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
