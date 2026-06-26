import type { ApiErrorPayload, ApiMessageResponse, NivelAcesso } from './common.types';

export type AccessLevel = NivelAcesso;

export type AuthUser = {
  id: number;
  nome: string;
  login: string;
  email: string;
  id_nivel_acesso?: number;
  nivel_acesso: AccessLevel;
  primeiro_acesso: boolean;
};

export type SignInRequest = {
  login: string;
  senha: string;
};

export type SignInResponse = {
  access_token: string;
  user: AuthUser;
};

export type FirstAccessRequest = {
  senhaTemporaria?: string;
  senhaNova: string;
  confirmarSenha: string;
};

export type ForgotPasswordRequest = {
  login: string;
};

export type ResetPasswordRequest = {
  token: string;
  senhaNova: string;
  confirmarSenha: string;
};

export type AuthMessageResponse = ApiMessageResponse;

export type ApiError = {
  message: string;
  statusCode?: number;
  validationErrors?: ApiErrorPayload['errors'];
};

export type ApiErrorResponse = ApiErrorPayload;

export type ApiAccessLevel =
  | AccessLevel
  | {
      nome: AccessLevel;
    };

export type ApiAuthUser = {
  id?: number;
  id_usuario?: number;
  nome: string;
  login: string;
  email?: string | null;
  id_nivel_acesso?: number;
  nivel_acesso: ApiAccessLevel;
  primeiro_acesso: boolean;
};

export type ApiSignInResponse = {
  access_token: string;
  user?: ApiAuthUser;
  usuario?: ApiAuthUser;
};

export type AuthMeResponse = {
  id_usuario: number;
  nome: string;
  login: string;
  email?: string | null;
  id_nivel_acesso: number;
  nivel_acesso: AccessLevel;
  primeiro_acesso: boolean;
};
