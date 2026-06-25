import { useMemo, useState } from 'react';
import type { UpdateUserRequest, UserResponse, UsuarioFormErrors, UsuarioFormState } from '../../../types';
import styles from './EditarUsuarioModal.module.scss';

type EditarUsuarioModalProps = {
  user: UserResponse | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (id: number, payload: UpdateUserRequest) => Promise<void>;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildInitialForm(user: UserResponse): UsuarioFormState {
  return {
    nome: user.nome,
    login: user.login,
    email: user.email,
    id_nivel_acesso: '',
  };
}

function validateForm(form: UsuarioFormState): UsuarioFormErrors {
  const errors: UsuarioFormErrors = {};

  if (!form.nome.trim()) {
    errors.nome = 'Informe o nome.';
  }

  if (!form.login.trim() || /\s/.test(form.login.trim())) {
    errors.login = 'Informe login sem espacos.';
  }

  if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'Informe um e-mail valido.';
  }

  return errors;
}

export function EditarUsuarioModal({ user, isSubmitting, onClose, onSubmit }: EditarUsuarioModalProps) {
  const [form, setForm] = useState<UsuarioFormState | null>(user ? buildInitialForm(user) : null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const errors = useMemo(() => (form ? validateForm(form) : {}), [form]);
  const hasErrors = Object.keys(errors).length > 0;

  if (!user || !form) {
    return null;
  }

  const activeUser = user;
  const activeForm = form;

  function updateField(field: keyof UsuarioFormState, value: string): void {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  }

  async function handleSubmit(): Promise<void> {
    setSubmitted(true);

    if (hasErrors) {
      return;
    }

    await onSubmit(activeUser.id_usuario, {
      nome: activeForm.nome.trim(),
      login: activeForm.login.trim(),
      email: activeForm.email.trim(),
    });
    setSubmitted(false);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
      <section className={styles.modal}>
        <header>
          <div>
            <p>Editar usuario</p>
            <h2 id="edit-user-title">{activeUser.nome}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Fechar
          </button>
        </header>

        <div className={styles.grid}>
          <label>
            Nome
            <input value={activeForm.nome} onChange={(event) => updateField('nome', event.target.value)} />
            {submitted && errors.nome ? <span>{errors.nome}</span> : null}
          </label>
          <label>
            Login
            <input value={activeForm.login} onChange={(event) => updateField('login', event.target.value)} />
            {submitted && errors.login ? <span>{errors.login}</span> : null}
          </label>
          <label>
            E-mail
            <input value={activeForm.email} onChange={(event) => updateField('email', event.target.value)} />
            {submitted && errors.email ? <span>{errors.email}</span> : null}
          </label>
        </div>

        <p className={styles.note}>Dados sensiveis de autenticacao nao sao exibidos ou alterados nesta tela.</p>

        <footer>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando' : 'Salvar alteracoes'}
          </button>
        </footer>
      </section>
    </div>
  );
}
