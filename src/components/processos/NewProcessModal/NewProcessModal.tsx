import { useMemo, useState } from 'react';
import { useProcessoConfiguracaoOptions } from '../../../hooks/useProcessoConfiguracaoOptions';
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
    errors.id_tanque = 'Selecione um tanque configurado.';
  }

  if (!form.id_sensor.trim() || Number(form.id_sensor) <= 0) {
    errors.id_sensor = 'Selecione um sensor real para o processo.';
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
  const {
    tanqueOptions,
    sensorOptions,
    loadingTanques,
    loadingSensores,
    errorTanques,
    errorSensores,
    setSelectedTanqueId,
    loadSensoresForTanque,
  } = useProcessoConfiguracaoOptions(isOpen);
  const errors = useMemo(() => validateForm(form), [form]);
  const hasErrors = Object.keys(errors).length > 0;
  const canSubmit =
    !isSubmitting &&
    !loadingTanques &&
    !loadingSensores &&
    !errorTanques &&
    !errorSensores &&
    !hasErrors &&
    form.id_tanque.trim().length > 0 &&
    form.id_sensor.trim().length > 0;

  if (!isOpen) {
    return null;
  }

  function updateField(field: keyof ProcessoFormState, value: string): void {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function handleTanqueChange(value: string): void {
    updateField('id_tanque', value);
    updateField('id_sensor', '');

    const idTanque = Number(value);
    setSelectedTanqueId(Number.isInteger(idTanque) && idTanque > 0 ? idTanque : null);

    if (Number.isInteger(idTanque) && idTanque > 0) {
      void loadSensoresForTanque(idTanque);
    }
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
            Tanque
            <select
              value={form.id_tanque}
              onChange={(event) => handleTanqueChange(event.target.value)}
              disabled={isSubmitting || loadingTanques || Boolean(errorTanques)}
            >
              <option value="">
                {loadingTanques ? 'Carregando tanques...' : 'Selecione um tanque configurado'}
              </option>
              {tanqueOptions.map((tanque) => (
                <option key={tanque.id_tanque} value={tanque.id_tanque}>
                  {tanque.label}
                </option>
              ))}
            </select>
            {submitted && errors.id_tanque ? <span>{errors.id_tanque}</span> : null}
            {errorTanques ? <span>{errorTanques}</span> : null}
            {!loadingTanques && !errorTanques && tanqueOptions.length === 0 ? (
              <span>Nenhum tanque configurado. Cadastre um tanque em Configuracoes &gt; Tanques.</span>
            ) : null}
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
            Sensor de vacuo
            <select
              value={form.id_sensor}
              onChange={(event) => updateField('id_sensor', event.target.value)}
              disabled={
                isSubmitting ||
                !form.id_tanque.trim() ||
                loadingSensores ||
                Boolean(errorSensores) ||
                sensorOptions.length === 0
              }
            >
              <option value="">
                {!form.id_tanque.trim()
                  ? 'Selecione um tanque primeiro'
                  : loadingSensores
                    ? 'Carregando sensores de vacuo...'
                    : sensorOptions.length === 0
                      ? 'Nenhum sensor de vacuo ativo disponivel'
                      : 'Selecione um sensor de vacuo'}
              </option>
              {sensorOptions.map((sensor) => (
                <option key={sensor.id_sensor} value={sensor.id_sensor}>
                  {sensor.label}
                </option>
              ))}
            </select>
            {submitted && errors.id_sensor ? <span>{errors.id_sensor}</span> : null}
            {errorSensores ? <span>{errorSensores}</span> : null}
            {!loadingSensores && form.id_tanque.trim() && !errorSensores && sensorOptions.length === 0 ? (
              <span>Nenhum sensor de vacuo ativo encontrado para configuracao do processo.</span>
            ) : null}
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
          Tanques e sensores de vacuo sao carregados da API de Configuracoes para preencher o DTO
          real do processo.
        </p>

        <footer>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="button" onClick={() => void handleSubmit()} disabled={!canSubmit}>
            {isSubmitting ? 'Configurando' : 'Configurar processo'}
          </button>
        </footer>
      </section>
    </div>
  );
}
