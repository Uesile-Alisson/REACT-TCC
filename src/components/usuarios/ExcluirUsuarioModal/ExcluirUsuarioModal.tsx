import { useState } from 'react';
import type { UserResponse } from '../../../types';
import styles from './ExcluirUsuarioModal.module.scss';

type ExcluirUsuarioModalProps = {
  user: UserResponse | null;
  isSubmitting: boolean;
  currentUserId?: number;
  onClose: () => void;
  onSubmit: (id: number) => Promise<void>;
};

export function ExcluirUsuarioModal({
  user,
  isSubmitting,
  currentUserId,
  onClose,
  onSubmit,
}: ExcluirUsuarioModalProps) {
  const [confirmation, setConfirmation] = useState<string>('');

  if (!user) {
    return null;
  }

  const activeUser = user;
  const isOwnUser = currentUserId === activeUser.id_usuario;
  const confirmed = confirmation.trim() === activeUser.login;

  async function handleSubmit(): Promise<void> {
    if (!confirmed || isOwnUser) {
      return;
    }

    await onSubmit(activeUser.id_usuario);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="delete-user-title">
      <section className={styles.modal}>
        <header>
          <div>
            <p>Excluir usuario</p>
            <h2 id="delete-user-title">{activeUser.nome}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Fechar
          </button>
        </header>

        <p className={styles.note}>
          Esta acao removera o usuario do sistema. Para confirmar, digite o login
          <strong> {activeUser.login}</strong>.
        </p>

        {isOwnUser ? (
          <p className={styles.danger}>Voce nao pode remover o proprio usuario pela interface.</p>
        ) : null}

        <label>
          Confirmacao
          <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
        </label>

        <footer>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting || !confirmed || isOwnUser}>
            {isSubmitting ? 'Excluindo' : 'Excluir usuario'}
          </button>
        </footer>
      </section>
    </div>
  );
}
