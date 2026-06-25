import type { UserResponse } from '../../../types';
import { getUserAccessLevel } from '../../../hooks/useUsuariosPage';
import { NivelAcessoBadge } from '../NivelAcessoBadge';
import styles from './UsuarioDetailPanel.module.scss';

type UsuarioDetailPanelProps = {
  user: UserResponse | null;
};

export function UsuarioDetailPanel({ user }: UsuarioDetailPanelProps) {
  if (!user) {
    return (
      <aside className={styles.panel} aria-label="Detalhes do usuario">
        <span className={styles.overline}>Detalhe administrativo</span>
        <h2>Sem usuario selecionado</h2>
        <p>Selecione um usuario na lista para visualizar dados seguros do cadastro.</p>
      </aside>
    );
  }

  return (
    <aside className={styles.panel} aria-label="Detalhes do usuario">
      <span className={styles.overline}>Detalhe administrativo</span>
      <div className={styles.titleRow}>
        <h2>{user.nome}</h2>
        <NivelAcessoBadge nivel={getUserAccessLevel(user)} />
      </div>

      <dl className={styles.dataGrid}>
        <div>
          <dt>ID</dt>
          <dd>{user.id_usuario}</dd>
        </div>
        <div>
          <dt>Login</dt>
          <dd>{user.login}</dd>
        </div>
        <div>
          <dt>E-mail</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>Primeiro acesso</dt>
          <dd>{user.primeiro_acesso ? 'Pendente' : 'Concluido'}</dd>
        </div>
        <div>
          <dt>Criado em</dt>
          <dd>{user.criado_em ? new Date(user.criado_em).toLocaleString('pt-BR') : 'Indisponivel'}</dd>
        </div>
        <div>
          <dt>Atualizado em</dt>
          <dd>{user.atualizado_em ? new Date(user.atualizado_em).toLocaleString('pt-BR') : 'Indisponivel'}</dd>
        </div>
      </dl>
    </aside>
  );
}
