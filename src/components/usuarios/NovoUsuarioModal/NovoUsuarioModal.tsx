import { useMemo, useState } from 'react';
import { NIVEL_ACESSO_OPTIONS } from '../../../hooks/useUsuariosPage';
import type { CreateUserRequest, UsuarioFormErrors, UsuarioFormState } from '../../../types';
import styles from './NovoUsuarioModal.module.scss';

type NovoUsuarioModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateUserRequest) => Promise<void>;
};

const initialForm: UsuarioFormState = {
  nome: '',
  login: '',
  email: '',
  id_nivel_acesso: '1',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(form: UsuarioFormState): UsuarioFormErrors {
  const errors: UsuarioFormErrors = {};

  if (!form.nome.trim()) {
    errors.nome = 'Informe o nome.';
  }

  if (!form.login.trim()) {
    errors.login = 'Informe o login.';
  }

  if (/\s/.test(form.login.trim())) {
    errors.login = 'Login nao deve conter espacos.';
  }

  if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'Informe um e-mail valido.';
  }

  if (Number(form.id_nivel_acesso) <= 0) {
    errors.id_nivel_acesso = 'Selecione o nivel de acesso.';
  }

  return errors;
}

export function NovoUsuarioModal({ isOpen, isSubmitting, onClose, onSubmit }: NovoUsuarioModalProps) {
  const [form, setForm] = useState<UsuarioFormState>(initialForm);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const errors = useMemo(() => validateForm(form), [form]);
  const hasErrors = Object.keys(errors).length > 0;

  if (!isOpen) {
    return null;
  }

  function updateField(field: keyof UsuarioFormState, value: string): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(): Promise<void> {
    setSubmitted(true);

    if (hasErrors) {
      return;
    }

    await onSubmit({
      nome: form.nome.trim(),
      login: form.login.trim(),
      email: form.email.trim(),
      id_nivel_acesso: Number(form.id_nivel_acesso),
    });
    setForm(initialForm);
    setSubmitted(false);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="new-user-title">
      <section className={styles.modal}>
        <header>
          <div>
            <p>Novo usuario</p>
            <h2 id="new-user-title">Cadastrar acesso administrativo</h2>
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
            Login
            <input value={form.login} onChange={(event) => updateField('login', event.target.value)} />
            {submitted && errors.login ? <span>{errors.login}</span> : null}
          </label>
          <label>
            E-mail
            <input value={form.email} onChange={(event) => updateField('email', event.target.value)} />
            {submitted && errors.email ? <span>{errors.email}</span> : null}
          </label>
          <label>
            Nivel de acesso
            <select
              value={form.id_nivel_acesso}
              onChange={(event) => updateField('id_nivel_acesso', event.target.value)}
            >
              {NIVEL_ACESSO_OPTIONS.map((option) => (
                <option key={option.id_nivel_acesso} value={option.id_nivel_acesso}>
                  {option.label}
                </option>
              ))}
            </select>
            {submitted && errors.id_nivel_acesso ? <span>{errors.id_nivel_acesso}</span> : null}
          </label>
        </div>

        <p className={styles.note}>
          A senha temporaria e gerada pela API e exibida apenas uma vez apos a criacao.
        </p>

        <footer>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Criando' : 'Criar usuario'}
          </button>
        </footer>
      </section>
    </div>
  );
}
