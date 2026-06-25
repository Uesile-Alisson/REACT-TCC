import type { Id, NivelAcesso } from './common.types';
import type { UserResponse } from './users.types';

export type UsuarioFormState = {
  nome: string;
  login: string;
  email: string;
  id_nivel_acesso: string;
};

export type UsuarioFormErrors = Partial<Record<keyof UsuarioFormState, string>>;

export type UsuarioSummary = {
  total: number;
  administradores: number;
  tecnicos: number;
  operadores: number;
  primeiroAcessoPendente: number;
};

export type UsuarioPermissions = {
  canViewUsuarios: boolean;
  canCreateUsuario: boolean;
  canEditUsuario: boolean;
  canUpdateNivelAcesso: boolean;
  canDeleteUsuario: boolean;
};

export type UsuarioAction = 'create' | 'edit' | 'role' | 'delete';

export type UsuarioFeedback = {
  type: 'success' | 'error';
  message: string;
} | null;

export type TemporaryCredentials = {
  nome: string;
  login: string;
  email: string;
  temporaryPassword: string;
  primeiro_acesso: boolean;
};

export type UsuarioNivelOption = {
  id_nivel_acesso: Id;
  nivel_acesso: NivelAcesso;
  label: string;
};

export type UsuariosPageData = {
  users: UserResponse[];
  selectedUser: UserResponse | null;
  summary: UsuarioSummary;
  isLoading: boolean;
  actionLoading: UsuarioAction | null;
  feedback: UsuarioFeedback;
};
