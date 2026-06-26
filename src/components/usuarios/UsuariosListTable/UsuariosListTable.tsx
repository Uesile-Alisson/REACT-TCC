import { motion } from 'framer-motion';
import type { UserResponse } from '../../../types';
import { getUserAccessLevel } from '../../../hooks/useUsuariosPage';
import { NivelAcessoBadge } from '../NivelAcessoBadge';
import styles from './UsuariosListTable.module.scss';

type UsuariosListTableProps = {
  users: UserResponse[];
  selectedUserId?: number;
  isLoading: boolean;
  canEdit: boolean;
  canUpdateRole: boolean;
  canDelete: boolean;
  onSelect: (user: UserResponse) => void;
  onEdit: (user: UserResponse) => void;
  onUpdateRole: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
};

export function UsuariosListTable({
  users,
  selectedUserId,
  isLoading,
  canEdit,
  canUpdateRole,
  canDelete,
  onSelect,
  onEdit,
  onUpdateRole,
  onDelete,
}: UsuariosListTableProps) {
  return (
    <section className={styles.panel} aria-label="Lista de usuarios">
      <div className={styles.panelHeader}>
        <div>
          <span>Controle administrativo</span>
          <h2>Usuarios cadastrados</h2>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Nivel</th>
              <th>Primeiro acesso</th>
              <th>Atualizacao</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <motion.tr
                className={user.id_usuario === selectedUserId ? styles.selected : undefined}
                key={user.id_usuario}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.025, duration: 0.18 }}
                whileHover={{ backgroundColor: 'rgba(83, 197, 255, 0.075)' }}
              >
                <td>
                  <button type="button" className={styles.linkButton} onClick={() => onSelect(user)}>
                    {user.nome}
                  </button>
                  <small>{user.login}</small>
                </td>
                <td>{user.email}</td>
                <td>
                  <NivelAcessoBadge nivel={getUserAccessLevel(user)} />
                </td>
                <td>{user.primeiro_acesso ? 'Pendente' : 'Concluido'}</td>
                <td>{user.atualizado_em ? new Date(user.atualizado_em).toLocaleString('pt-BR') : 'Indisponivel'}</td>
                <td>
                  <div className={styles.actions}>
                    <button type="button" onClick={() => onSelect(user)}>
                      Ver
                    </button>
                    {canEdit ? (
                      <button type="button" onClick={() => onEdit(user)}>
                        Editar
                      </button>
                    ) : null}
                    {canUpdateRole ? (
                      <button type="button" onClick={() => onUpdateRole(user)}>
                        Nivel
                      </button>
                    ) : null}
                    {canDelete ? (
                      <button type="button" className={styles.dangerButton} onClick={() => onDelete(user)}>
                        Excluir
                      </button>
                    ) : null}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {isLoading ? <div className={styles.emptyState}>Carregando usuarios...</div> : null}

        {!isLoading && users.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>Nenhum usuario encontrado.</strong>
            <span>A listagem esta integrada ao service real `/user`.</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
