import { useMemo, useState } from 'react';
import type {
  CreateTanqueConfiguracaoDto,
  StatusTanque,
  TanqueConfigFormErrors,
  TanqueConfigFormState,
  TanqueConfigResponse,
  UpdateTanqueConfiguracaoDto,
} from '../../../types';
import styles from './TanqueConfigModal.module.scss';

type TanqueConfigModalProps = {
  tanque: TanqueConfigResponse | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: (payload: CreateTanqueConfiguracaoDto) => Promise<boolean>;
  onUpdate: (id_tanque: number, payload: UpdateTanqueConfiguracaoDto) => Promise<boolean>;
};

const STATUS_OPTIONS: StatusTanque[] = ['ATIVO', 'INATIVO', 'MANUTENCAO', 'FALHA'];

const emptyForm: TanqueConfigFormState = {
  nome: '',
  volume: '',
  unidade_volume: 'L',
  vacuo_padrao: '',
  status_tanque: 'ATIVO',
};

function buildInitialForm(tanque: TanqueConfigResponse | null): TanqueConfigFormState {
  if (!tanque) {
    return emptyForm;
  }

  return {
    nome: tanque.nome,
    volume: String(tanque.volume),
    unidade_volume: tanque.unidade_volume,
    vacuo_padrao: String(tanque.vacuo_padrao),
    status_tanque: tanque.status_tanque,
  };
}

function parseNumber(value: string): number | null {
  const normalizedValue = value.replace(',', '.').trim();
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function validateForm(form: TanqueConfigFormState): TanqueConfigFormErrors {
  const errors: TanqueConfigFormErrors = {};
  const volume = parseNumber(form.volume);
  const vacuoPadrao = parseNumber(form.vacuo_padrao);

  if (!form.nome.trim()) {
    errors.nome = 'Informe o nome do tanque.';
  }

  if (!form.unidade_volume.trim()) {
    errors.unidade_volume = 'Informe a unidade de volume.';
  }

  if (volume === null || volume <= 0) {
    errors.volume = 'Informe volume maior que zero.';
  }

  if (vacuoPadrao === null) {
    errors.vacuo_padrao = 'Informe um vacuo numerico valido.';
  }

  if (!STATUS_OPTIONS.includes(form.status_tanque)) {
    errors.status_tanque = 'Selecione um status valido.';
  }

  return errors;
}

function buildCreatePayload(form: TanqueConfigFormState): CreateTanqueConfiguracaoDto {
  return {
    nome: form.nome.trim(),
    volume: parseNumber(form.volume) ?? 0,
    unidade_volume: form.unidade_volume.trim(),
    vacuo_padrao: parseNumber(form.vacuo_padrao) ?? 0,
    status_tanque: form.status_tanque,
  };
}

function buildUpdatePayload(
  form: TanqueConfigFormState,
  initialForm: TanqueConfigFormState,
): UpdateTanqueConfiguracaoDto {
  const payload: UpdateTanqueConfiguracaoDto = {};
  const nextPayload = buildCreatePayload(form);
  const initialPayload = buildCreatePayload(initialForm);

  if (nextPayload.nome !== initialPayload.nome) {
    payload.nome = nextPayload.nome;
  }

  if (nextPayload.volume !== initialPayload.volume) {
    payload.volume = nextPayload.volume;
  }

  if (nextPayload.unidade_volume !== initialPayload.unidade_volume) {
    payload.unidade_volume = nextPayload.unidade_volume;
  }

  if (nextPayload.vacuo_padrao !== initialPayload.vacuo_padrao) {
    payload.vacuo_padrao = nextPayload.vacuo_padrao;
  }

  if (nextPayload.status_tanque !== initialPayload.status_tanque) {
    payload.status_tanque = nextPayload.status_tanque;
  }

  return payload;
}

export function TanqueConfigModal({
  tanque,
  isOpen,
  isSubmitting,
  onClose,
  onCreate,
  onUpdate,
}: TanqueConfigModalProps) {
  const [form, setForm] = useState<TanqueConfigFormState>(() => buildInitialForm(tanque));
  const [submitted, setSubmitted] = useState<boolean>(false);
  const initialForm = useMemo(() => buildInitialForm(tanque), [tanque]);
  const errors = useMemo(() => validateForm(form), [form]);
  const hasErrors = Object.keys(errors).length > 0;

  if (!isOpen) {
    return null;
  }

  const isEditing = Boolean(tanque);

  function updateField<TField extends keyof TanqueConfigFormState>(
    field: TField,
    value: TanqueConfigFormState[TField],
  ): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(): Promise<void> {
    setSubmitted(true);

    if (hasErrors) {
      return;
    }

    const success = tanque
      ? await onUpdate(tanque.id_tanque, buildUpdatePayload(form, initialForm))
      : await onCreate(buildCreatePayload(form));

    if (success) {
      onClose();
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="tanque-modal-title">
      <section className={styles.modal}>
        <header>
          <div>
            <p>{isEditing ? 'Editar tanque' : 'Novo tanque'}</p>
            <h2 id="tanque-modal-title">{isEditing ? tanque?.nome : 'Cadastrar tanque'}</h2>
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
            Volume
            <input value={form.volume} onChange={(event) => updateField('volume', event.target.value)} />
            {submitted && errors.volume ? <span>{errors.volume}</span> : null}
          </label>
          <label>
            Unidade
            <input
              value={form.unidade_volume}
              onChange={(event) => updateField('unidade_volume', event.target.value)}
            />
            {submitted && errors.unidade_volume ? <span>{errors.unidade_volume}</span> : null}
          </label>
          <label>
            Vacuo padrao
            <input
              value={form.vacuo_padrao}
              onChange={(event) => updateField('vacuo_padrao', event.target.value)}
            />
            {submitted && errors.vacuo_padrao ? <span>{errors.vacuo_padrao}</span> : null}
          </label>
          <label>
            Status
            <select
              value={form.status_tanque}
              onChange={(event) => updateField('status_tanque', event.target.value as StatusTanque)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {submitted && errors.status_tanque ? <span>{errors.status_tanque}</span> : null}
          </label>
        </div>

        <p className={styles.note}>Campos internos e datas sao definidos pela API.</p>

        <footer>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando' : isEditing ? 'Salvar tanque' : 'Criar tanque'}
          </button>
        </footer>
      </section>
    </div>
  );
}
