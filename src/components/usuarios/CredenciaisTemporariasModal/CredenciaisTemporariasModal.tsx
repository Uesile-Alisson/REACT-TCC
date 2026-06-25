import { useMemo } from 'react';
import { useCopiarCredenciais } from '../../../hooks/useCopiarCredenciais';
import type { TemporaryCredentials } from '../../../types';
import styles from './CredenciaisTemporariasModal.module.scss';

type CredenciaisTemporariasModalProps = {
  credentials: TemporaryCredentials | null;
  onClose: () => void;
};

export function CredenciaisTemporariasModal({ credentials, onClose }: CredenciaisTemporariasModalProps) {
  const { clipboardState, copyCredentials, resetClipboardState } = useCopiarCredenciais();
  const content = useMemo(() => {
    if (!credentials) {
      return '';
    }

    return [
      `Nome: ${credentials.nome}`,
      `Login: ${credentials.login}`,
      `E-mail: ${credentials.email}`,
      `Senha temporaria: ${credentials.temporaryPassword}`,
      'No primeiro acesso, a troca de senha sera solicitada.',
    ].join('\n');
  }, [credentials]);

  if (!credentials) {
    return null;
  }

  function handleClose(): void {
    resetClipboardState();
    onClose();
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="credentials-title">
      <section className={styles.modal}>
        <header>
          <div>
            <p>Credenciais temporarias</p>
            <h2 id="credentials-title">Copie agora</h2>
          </div>
          <button type="button" onClick={handleClose}>
            Fechar
          </button>
        </header>

        <p className={styles.note}>A senha temporaria nao sera exibida novamente apos fechar esta janela.</p>

        <dl className={styles.credentials}>
          <div>
            <dt>Login</dt>
            <dd>{credentials.login}</dd>
          </div>
          <div>
            <dt>Senha temporaria</dt>
            <dd>{credentials.temporaryPassword}</dd>
          </div>
        </dl>

        <textarea readOnly value={content} aria-label="Credenciais para copia manual" />

        {clipboardState === 'copied' ? <p className={styles.success}>Credenciais copiadas.</p> : null}
        {clipboardState === 'manual' ? (
          <p className={styles.warning}>Nao foi possivel copiar automaticamente. Selecione o texto acima.</p>
        ) : null}

        <footer>
          <button type="button" onClick={() => void copyCredentials(content)}>
            Copiar credenciais
          </button>
          <button type="button" onClick={handleClose}>
            Entendi
          </button>
        </footer>
      </section>
    </div>
  );
}
