import { useMemo, useState } from 'react';
import type { ProcessoFormErrors, ProcessoFormState } from '../../../types';
import styles from './NewProcessModal.module.scss';

type NewProcessModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (form: ProcessoFormState) => Promise<void>;
};

const initialForm: ProcessoFormState = {
  nome_processo: '',
  tempo_maximo: '',
  vacuo_alvo: '',
  id_tanque: '',
  vacuo_alvo_tanque: '',
  id_sensor: '',
  observacoes_sensor: '',
};

function validateForm(form: ProcessoFormState): ProcessoFormErrors {
  const errors: ProcessoFormErrors = {};

  if (!form.tempo_maximo.trim() || Number(form.tempo_maximo) <= 0) {
    errors.tempo_maximo = 'Informe tempo maximo positivo.';
  }

  if (!form.id_tanque.trim() || Number(form.id_tanque) <= 0) {
    errors.id_tanque = 'Informe o ID do tanque.';
  }

  if (!form.id_sensor.trim() || Number(form.id_sensor) <= 0) {
    errors.id_sensor = 'Informe o ID do sensor.';
  }

  if (form.vacuo_alvo.trim() && Number(form.vacuo_alvo) <= 0) {
    errors.vacuo_alvo = 'Use valor positivo.';
  }

  if (form.vacuo_alvo_tanque.trim() && Number(form.vacuo_alvo_tanque) <= 0) {
    errors.vacuo_alvo_tanque = 'Use valor positivo.';
  }

  return errors;
}

export function NewProcessModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: NewProcessModalProps) {
  const [form, setForm] = useState<ProcessoFormState>(initialForm);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const errors = useMemo(() => validateForm(form), [form]);
  const hasErrors = Object.keys(errors).length > 0;

  if (!isOpen) {
    return null;
  }

  function updateField(field: keyof ProcessoFormState, value: string): void {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function handleSubmit(): Promise<void> {
    setSubmitted(true);

    if (hasErrors) {
      return;
    }

    await onSubmit(form);
    setForm(initialForm);
    setSubmitted(false);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="new-process-title">
      <section className={styles.modal}>
        <header>
          <div>
            <p>Novo processo</p>
            <h2 id="new-process-title">Configurar processo de vacuo</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Fechar
          </button>
        </header>

        <div className={styles.grid}>
          <label>
            Nome
            <input
              value={form.nome_processo}
              onChange={(event) => updateField('nome_processo', event.target.value)}
              placeholder="Ex.: Ciclo tanque A"
            />
          </label>
          <label>
            Tempo maximo
            <input
              type="number"
              min="1"
              value={form.tempo_maximo}
              onChange={(event) => updateField('tempo_maximo', event.target.value)}
              placeholder="Minutos"
            />
            {submitted && errors.tempo_maximo ? <span>{errors.tempo_maximo}</span> : null}
          </label>
          <label>
            Vacuo alvo geral
            <input
              type="number"
              min="0"
              value={form.vacuo_alvo}
              onChange={(event) => updateField('vacuo_alvo', event.target.value)}
              placeholder="mbar"
            />
            {submitted && errors.vacuo_alvo ? <span>{errors.vacuo_alvo}</span> : null}
          </label>
          <label>
            ID do tanque
            <input
              type="number"
              min="1"
              value={form.id_tanque}
              onChange={(event) => updateField('id_tanque', event.target.value)}
              placeholder="ID real da API"
            />
            {submitted && errors.id_tanque ? <span>{errors.id_tanque}</span> : null}
          </label>
          <label>
            Vacuo alvo do tanque
            <input
              type="number"
              min="0"
              value={form.vacuo_alvo_tanque}
              onChange={(event) => updateField('vacuo_alvo_tanque', event.target.value)}
              placeholder="mbar"
            />
            {submitted && errors.vacuo_alvo_tanque ? <span>{errors.vacuo_alvo_tanque}</span> : null}
          </label>
          <label>
            ID do sensor
            <input
              type="number"
              min="1"
              value={form.id_sensor}
              onChange={(event) => updateField('id_sensor', event.target.value)}
              placeholder="ID real da API"
            />
            {submitted && errors.id_sensor ? <span>{errors.id_sensor}</span> : null}
          </label>
        </div>

        <label className={styles.full}>
          Observacoes do sensor
          <textarea
            value={form.observacoes_sensor}
            onChange={(event) => updateField('observacoes_sensor', event.target.value)}
            placeholder="Opcional"
          />
        </label>

        <p className={styles.note}>
          Como ainda nao existe endpoint de opcoes de tanques/sensores nesta tela, os IDs precisam
          ser informados conforme registros reais da API.
        </p>

        <footer>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Configurando' : 'Configurar processo'}
          </button>
        </footer>
      </section>
    </div>
  );
}
