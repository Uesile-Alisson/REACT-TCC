import { useMemo, useState } from 'react';
import type {
  BombaConfigFormErrors,
  BombaConfigFormState,
  BombaConfigResponse,
  CreateBombaConfiguracaoDto,
  StatusBomba,
  TipoBomba,
  UpdateBombaConfiguracaoDto,
} from '../../../types';
import styles from '../../tanques/TanqueConfigModal/TanqueConfigModal.module.scss';

type BombaConfigModalProps = {
  bomba: BombaConfigResponse | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: (payload: CreateBombaConfiguracaoDto) => Promise<boolean>;
  onUpdate: (id_bomba: number, payload: UpdateBombaConfiguracaoDto) => Promise<boolean>;
};

const TIPO_OPTIONS: TipoBomba[] = ['PRINCIPAL', 'AUXILIAR', 'TRANSFERENCIA_FLUIDO'];
const STATUS_OPTIONS: StatusBomba[] = ['ATIVA', 'INATIVA', 'MANUTENCAO', 'FALHA'];

const emptyForm: BombaConfigFormState = {
  nome: '',
  tipo_bomba: 'PRINCIPAL',
  status_padrao: 'ATIVA',
  entrada_por_pressao: false,
  entrada_por_tempo: false,
  encerramento_automatico: true,
};

function buildInitialForm(bomba: BombaConfigResponse | null): BombaConfigFormState {
  if (!bomba) {
    return emptyForm;
  }

  return {
    nome: bomba.nome,
    tipo_bomba: bomba.tipo_bomba,
    status_padrao: bomba.status_padrao,
    entrada_por_pressao: bomba.entrada_por_pressao,
    entrada_por_tempo: bomba.entrada_por_tempo,
    encerramento_automatico: bomba.encerramento_automatico ?? false,
  };
}

function validateForm(form: BombaConfigFormState): BombaConfigFormErrors {
  const errors: BombaConfigFormErrors = {};

  if (!form.nome.trim()) {
    errors.nome = 'Informe o nome da bomba.';
  }

  if (!TIPO_OPTIONS.includes(form.tipo_bomba)) {
    errors.tipo_bomba = 'Selecione um tipo valido.';
  }

  if (!STATUS_OPTIONS.includes(form.status_padrao)) {
    errors.status_padrao = 'Selecione um status valido.';
  }

  return errors;
}

function buildCreatePayload(form: BombaConfigFormState): CreateBombaConfiguracaoDto {
  return {
    nome: form.nome.trim(),
    tipo_bomba: form.tipo_bomba,
    status_padrao: form.status_padrao,
    entrada_por_pressao: form.entrada_por_pressao,
    entrada_por_tempo: form.entrada_por_tempo,
    encerramento_automatico: form.encerramento_automatico,
  };
}

function buildUpdatePayload(
  form: BombaConfigFormState,
  initialForm: BombaConfigFormState,
): UpdateBombaConfiguracaoDto {
  const payload: UpdateBombaConfiguracaoDto = {};
  const nextPayload = buildCreatePayload(form);
  const initialPayload = buildCreatePayload(initialForm);

  if (nextPayload.nome !== initialPayload.nome) {
    payload.nome = nextPayload.nome;
  }

  if (nextPayload.tipo_bomba !== initialPayload.tipo_bomba) {
    payload.tipo_bomba = nextPayload.tipo_bomba;
  }

  if (nextPayload.status_padrao !== initialPayload.status_padrao) {
    payload.status_padrao = nextPayload.status_padrao;
  }

  if (nextPayload.entrada_por_pressao !== initialPayload.entrada_por_pressao) {
    payload.entrada_por_pressao = nextPayload.entrada_por_pressao;
  }

  if (nextPayload.entrada_por_tempo !== initialPayload.entrada_por_tempo) {
    payload.entrada_por_tempo = nextPayload.entrada_por_tempo;
  }

  if (nextPayload.encerramento_automatico !== initialPayload.encerramento_automatico) {
    payload.encerramento_automatico = nextPayload.encerramento_automatico;
  }

  return payload;
}

export function BombaConfigModal({
  bomba,
  isOpen,
  isSubmitting,
  onClose,
  onCreate,
  onUpdate,
}: BombaConfigModalProps) {
  const [form, setForm] = useState<BombaConfigFormState>(() => buildInitialForm(bomba));
  const [submitted, setSubmitted] = useState<boolean>(false);
  const initialForm = useMemo(() => buildInitialForm(bomba), [bomba]);
  const errors = useMemo(() => validateForm(form), [form]);
  const hasErrors = Object.keys(errors).length > 0;

  if (!isOpen) {
    return null;
  }

  const isEditing = Boolean(bomba);

  function updateField<TField extends keyof BombaConfigFormState>(
    field: TField,
    value: BombaConfigFormState[TField],
  ): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(): Promise<void> {
    setSubmitted(true);

    if (hasErrors) {
      return;
    }

    const success = bomba
      ? await onUpdate(bomba.id_bomba, buildUpdatePayload(form, initialForm))
      : await onCreate(buildCreatePayload(form));

    if (success) {
      onClose();
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="bomba-modal-title">
      <section className={styles.modal}>
        <header>
          <div>
            <p>{isEditing ? 'Editar bomba' : 'Nova bomba'}</p>
            <h2 id="bomba-modal-title">{isEditing ? bomba?.nome : 'Cadastrar bomba'}</h2>
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
            Tipo
            <select
              value={form.tipo_bomba}
              onChange={(event) => updateField('tipo_bomba', event.target.value as TipoBomba)}
            >
              {TIPO_OPTIONS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            {submitted && errors.tipo_bomba ? <span>{errors.tipo_bomba}</span> : null}
          </label>
          <label>
            Status padrao
            <select
              value={form.status_padrao}
              onChange={(event) => updateField('status_padrao', event.target.value as StatusBomba)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {submitted && errors.status_padrao ? <span>{errors.status_padrao}</span> : null}
          </label>
          <label>
            Entrada por pressao
            <select
              value={form.entrada_por_pressao ? 'true' : 'false'}
              onChange={(event) => updateField('entrada_por_pressao', event.target.value === 'true')}
            >
              <option value="true">Habilitada</option>
              <option value="false">Desabilitada</option>
            </select>
          </label>
          <label>
            Entrada por tempo
            <select
              value={form.entrada_por_tempo ? 'true' : 'false'}
              onChange={(event) => updateField('entrada_por_tempo', event.target.value === 'true')}
            >
              <option value="true">Habilitada</option>
              <option value="false">Desabilitada</option>
            </select>
          </label>
          <label>
            Encerramento automatico
            <select
              value={form.encerramento_automatico ? 'true' : 'false'}
              onChange={(event) => updateField('encerramento_automatico', event.target.value === 'true')}
            >
              <option value="true">Habilitado</option>
              <option value="false">Desabilitado</option>
            </select>
          </label>
        </div>

        <p className={styles.note}>Esta tela altera cadastro tecnico. Nao ha acionamento fisico de bomba.</p>

        <footer>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando' : isEditing ? 'Salvar bomba' : 'Criar bomba'}
          </button>
        </footer>
      </section>
    </div>
  );
}
