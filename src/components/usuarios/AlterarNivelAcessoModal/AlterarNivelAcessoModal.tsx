import { useState } from 'react';
import { getNivelAcessoId, getUserAccessLevel, NIVEL_ACESSO_OPTIONS } from '../../../hooks/useUsuariosPage';
import type { UpdateUserRoleRequest, UserResponse } from '../../../types';
import { NivelAcessoBadge } from '../NivelAcessoBadge';
import styles from './AlterarNivelAcessoModal.module.scss';

type AlterarNivelAcessoModalProps = {
  user: UserResponse | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (id: number, payload: UpdateUserRoleRequest) => Promise<void>;
};

export function AlterarNivelAcessoModal({
  user,
  isSubmitting,
  onClose,
  onSubmit,
}: AlterarNivelAcessoModalProps) {
  const currentLevel = user ? getUserAccessLevel(user) : 'OPERADOR';
  const [selectedLevelId, setSelectedLevelId] = useState<string>(String(getNivelAcessoId(currentLevel)));

  if (!user) {
    return null;
  }

  const activeUser = user;

  async function handleSubmit(): Promise<void> {
    await onSubmit(activeUser.id_usuario, { id_nivel_acesso: Number(selectedLevelId) });
  }

  const selectedOption = NIVEL_ACESSO_OPTIONS.find(
    (option) => option.id_nivel_acesso === Number(selectedLevelId),
  );
  const sensitiveChange = currentLevel === 'ADMINISTRADOR' || selectedOption?.nivel_acesso === 'ADMINISTRADOR';

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="role-user-title">
      <section className={styles.modal}>
        <header>
          <div>
            <p>Alterar nivel</p>
            <h2 id="role-user-title">{activeUser.nome}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Fechar
          </button>
        </header>

        <div className={styles.currentLevel}>
          <span>Nivel atual</span>
          <NivelAcessoBadge nivel={currentLevel} />
        </div>

        <label>
          Novo nivel de acesso
          <select value={selectedLevelId} onChange={(event) => setSelectedLevelId(event.target.value)}>
            {NIVEL_ACESSO_OPTIONS.map((option) => (
              <option key={option.id_nivel_acesso} value={option.id_nivel_acesso}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {sensitiveChange ? (
          <p className={styles.note}>
            Alteracao sensivel: revise se este perfil deve manter ou receber acesso administrativo.
          </p>
        ) : null}

        <footer>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Alterando' : 'Confirmar nivel'}
          </button>
        </footer>
      </section>
    </div>
  );
}
