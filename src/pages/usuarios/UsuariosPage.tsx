import { Plus, RefreshCw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { RealDataChartPanel } from '../../components/charts/RealDataChartPanel';
import { AlterarNivelAcessoModal } from '../../components/usuarios/AlterarNivelAcessoModal';
import { CredenciaisTemporariasModal } from '../../components/usuarios/CredenciaisTemporariasModal';
import { EditarUsuarioModal } from '../../components/usuarios/EditarUsuarioModal';
import { ExcluirUsuarioModal } from '../../components/usuarios/ExcluirUsuarioModal';
import { NovoUsuarioModal } from '../../components/usuarios/NovoUsuarioModal';
import { UsuarioDetailPanel } from '../../components/usuarios/UsuarioDetailPanel';
import { UsuariosListTable } from '../../components/usuarios/UsuariosListTable';
import { useAuth } from '../../hooks/useAuth';
import { getUserAccessLevel, useUsuariosPage } from '../../hooks/useUsuariosPage';
import { useUsuariosPermissions } from '../../hooks/useUsuariosPermissions';
import type { UserResponse } from '../../types';
import styles from './UsuariosPage.module.scss';

export function UsuariosPage() {
  const { user: currentUser } = useAuth();
  const permissions = useUsuariosPermissions();
  const {
    users,
    selectedUser,
    summary,
    isLoading,
    actionLoading,
    feedback,
    temporaryCredentials,
    selectUser,
    refresh,
    createUser,
    updateUser,
    updateUserRole,
    deleteUser,
    clearFeedback,
    clearTemporaryCredentials,
  } = useUsuariosPage();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editUser, setEditUser] = useState<UserResponse | null>(null);
  const [roleUser, setRoleUser] = useState<UserResponse | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<UserResponse | null>(null);
  const accessLevelChartData = useMemo(
    () => [
      { name: 'Operadores', value: users.filter((user) => getUserAccessLevel(user) === 'OPERADOR').length },
      { name: 'Tecnicos', value: users.filter((user) => getUserAccessLevel(user) === 'TECNICO').length },
      {
        name: 'Administradores',
        value: users.filter((user) => getUserAccessLevel(user) === 'ADMINISTRADOR').length,
      },
    ],
    [users],
  );
  const firstAccessChartData = useMemo(
    () => [
      { name: 'Pendente', value: users.filter((user) => user.primeiro_acesso).length },
      { name: 'Concluido', value: users.filter((user) => !user.primeiro_acesso).length },
    ],
    [users],
  );
  const canManageUser = useCallback(
    (targetUser: UserResponse): boolean => {
      const targetLevel = getUserAccessLevel(targetUser);
      const isAnotherUser = currentUser?.id !== targetUser.id_usuario;

      return !(currentUser?.nivel_acesso === 'ADMINISTRADOR' && targetLevel === 'ADMINISTRADOR' && isAnotherUser);
    },
    [currentUser?.id, currentUser?.nivel_acesso],
  );

  if (!permissions.canViewUsuarios) {
    return (
      <main className={styles.page}>
        <section className={styles.errorState} role="alert">
          <strong>Acesso negado.</strong>
          <span>Somente administradores podem visualizar a gestao de usuarios.</span>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>TSEA / Administracao</p>
          <h1>Usuarios</h1>
          <p>Gerencie usuarios e niveis de acesso do sistema TSEA.</p>
        </div>

        <div className={styles.headerActions}>
          <button type="button" onClick={() => void refresh()} disabled={isLoading}>
            <RefreshCw size={16} aria-hidden="true" />
            {isLoading ? 'Atualizando' : 'Atualizar'}
          </button>
          {permissions.canCreateUsuario ? (
            <button type="button" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={16} aria-hidden="true" />
              Novo usuario
            </button>
          ) : null}
        </div>
      </header>

      {feedback ? (
        <section
          className={feedback.type === 'success' ? styles.successState : styles.errorState}
          role={feedback.type === 'success' ? 'status' : 'alert'}
        >
          <strong>{feedback.type === 'success' ? 'Operacao concluida.' : 'Nao foi possivel concluir.'}</strong>
          <span>{feedback.message}</span>
          <button type="button" onClick={clearFeedback}>
            Dispensar
          </button>
        </section>
      ) : null}

      <section className={styles.summaryGrid} aria-label="Resumo de usuarios">
        <article>
          <span>Total</span>
          <strong>{summary.total}</strong>
          <small>Usuarios carregados</small>
        </article>
        <article>
          <span>Administradores</span>
          <strong>{summary.administradores}</strong>
          <small>Acesso completo</small>
        </article>
        <article>
          <span>Tecnicos</span>
          <strong>{summary.tecnicos}</strong>
          <small>Operacao tecnica</small>
        </article>
        <article>
          <span>Operadores</span>
          <strong>{summary.operadores}</strong>
          <small>Uso operacional</small>
        </article>
        <article>
          <span>Primeiro acesso</span>
          <strong>{summary.primeiroAcessoPendente}</strong>
          <small>Pendentes</small>
        </article>
      </section>

      <section className={styles.chartGrid} aria-label="Graficos de usuarios">
        <RealDataChartPanel
          title="Usuarios por nivel"
          subtitle="Distribuicao calculada com a lista de usuarios carregada no frontend."
          data={accessLevelChartData}
          variant="bar"
          emptyMessage={isLoading ? 'Carregando usuarios para montar o grafico.' : 'Sem usuarios carregados.'}
        />
        <RealDataChartPanel
          title="Primeiro acesso"
          subtitle="Situacao de primeiro acesso dos usuarios retornados pela API."
          data={firstAccessChartData}
          variant="pie"
          emptyMessage={isLoading ? 'Carregando usuarios para montar o grafico.' : 'Sem dados de primeiro acesso.'}
        />
      </section>

      <section className={styles.contentGrid}>
        <UsuariosListTable
          users={users}
          selectedUserId={selectedUser?.id_usuario}
          isLoading={isLoading}
          canEdit={permissions.canEditUsuario}
          canUpdateRole={permissions.canUpdateNivelAcesso}
          canDelete={permissions.canDeleteUsuario}
          canManageUser={canManageUser}
          onSelect={selectUser}
          onEdit={setEditUser}
          onUpdateRole={setRoleUser}
          onDelete={setDeleteUserTarget}
        />
        <UsuarioDetailPanel user={selectedUser} />
      </section>

      <NovoUsuarioModal
        isOpen={isCreateModalOpen}
        isSubmitting={actionLoading === 'create'}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (payload) => {
          await createUser(payload);
          setIsCreateModalOpen(false);
        }}
      />

      <EditarUsuarioModal
        key={editUser?.id_usuario ?? 'edit-empty'}
        user={editUser}
        isSubmitting={actionLoading === 'edit'}
        onClose={() => setEditUser(null)}
        onSubmit={async (id, payload) => {
          await updateUser(id, payload);
          setEditUser(null);
        }}
      />

      <AlterarNivelAcessoModal
        key={roleUser?.id_usuario ?? 'role-empty'}
        user={roleUser}
        isSubmitting={actionLoading === 'role'}
        onClose={() => setRoleUser(null)}
        onSubmit={async (id, payload) => {
          await updateUserRole(id, payload);
          setRoleUser(null);
        }}
      />

      <ExcluirUsuarioModal
        key={deleteUserTarget?.id_usuario ?? 'delete-empty'}
        user={deleteUserTarget}
        currentUserId={currentUser?.id}
        isSubmitting={actionLoading === 'delete'}
        onClose={() => setDeleteUserTarget(null)}
        onSubmit={async (id) => {
          await deleteUser(id);
          setDeleteUserTarget(null);
        }}
      />

      <CredenciaisTemporariasModal
        credentials={temporaryCredentials}
        onClose={clearTemporaryCredentials}
      />
    </main>
  );
}
