export type AccessLevel = 'OPERADOR' | 'TECNICO' | 'ADMINISTRADOR';

export type AuthUser = {
  id: number;
  nome: string;
  login: string;
  email: string;
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
  senhaTemporaria: string;
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

export type AuthMessageResponse = {
  message: string;
};

export type ApiValidationError = {
  field?: string;
  message: string;
};

export type ApiError = {
  message: string;
  statusCode?: number;
  validationErrors?: ApiValidationError[];
};

export type ApiErrorResponse = {
  message?: string | string[];
  statusCode?: number;
  error?: string;
  errors?: ApiValidationError[];
};

export type ApiAccessLevel = AccessLevel | {
  nome: AccessLevel;
};

export type ApiAuthUser = {
  id?: number;
  id_usuario?: number;
  nome: string;
  login: string;
  email: string;
  nivel_acesso: ApiAccessLevel;
  primeiro_acesso: boolean;
};

export type ApiSignInResponse = {
  access_token: string;
  user?: ApiAuthUser;
  usuario?: ApiAuthUser;
};
