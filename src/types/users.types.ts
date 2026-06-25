import type { DateString, Id, NivelAcesso } from './common.types';

export type NivelAcessoInfo = {
  id_nivel_acesso: Id;
  nome: NivelAcesso;
  descricao?: string | null;
  prioridade?: number | null;
};

export type UserResponse = {
  id_usuario: Id;
  nome: string;
  login: string;
  email: string;
  nivel_acesso?: NivelAcesso | { nome: NivelAcesso };
  niveisacessos?: NivelAcessoInfo;
  primeiro_acesso: boolean;
  ultimo_acesso?: DateString | null;
  criado_em?: DateString;
  atualizado_em?: DateString;
};

export type CreateUserRequest = {
  nome: string;
  login: string;
  email: string;
  id_nivel_acesso: Id;
};

export type UpdateUserRequest = {
  nome?: string;
  login?: string;
  email?: string;
};

export type UpdateUserRoleRequest = {
  id_nivel_acesso: Id;
};

export type CreateUserResponse = {
  message: string;
  temporaryPassword?: string;
  user: UserResponse;
};

export type DeleteUserResponse = {
  message: string;
};
