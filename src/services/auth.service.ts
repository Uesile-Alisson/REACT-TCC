import { ApiError } from '../api/api-error';
import { api, setAccessToken } from '../api/axios';
import type {
  ApiAccessLevel,
  ApiAuthUser,
  ApiSignInResponse,
  AuthMessageResponse,
  AuthUser,
  FirstAccessRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SignInRequest,
  SignInResponse,
} from '../types/auth.types';

function normalizeAccessLevel(accessLevel: ApiAccessLevel): AuthUser['nivel_acesso'] {
  return typeof accessLevel === 'string' ? accessLevel : accessLevel.nome;
}

function normalizeAuthUser(apiUser: ApiAuthUser): AuthUser {
  const id = apiUser.id ?? apiUser.id_usuario;

  if (typeof id !== 'number') {
    throw new ApiError('Resposta de usuario invalida.');
  }

  return {
    id,
    nome: apiUser.nome,
    login: apiUser.login,
    email: apiUser.email,
    nivel_acesso: normalizeAccessLevel(apiUser.nivel_acesso),
    primeiro_acesso: apiUser.primeiro_acesso,
  };
}

function normalizeSignInResponse(response: ApiSignInResponse): SignInResponse {
  const apiUser = response.user ?? response.usuario;

  if (!apiUser) {
    throw new ApiError('Resposta de autenticacao invalida.');
  }

  return {
    access_token: response.access_token,
    user: normalizeAuthUser(apiUser),
  };
}

export async function signIn(payload: SignInRequest): Promise<SignInResponse> {
  const { data } = await api.post<ApiSignInResponse>('/auth/signin', payload);
  const auth = normalizeSignInResponse(data);

  setAccessToken(auth.access_token);

  return auth;
}

export async function firstAccess(payload: FirstAccessRequest): Promise<AuthMessageResponse> {
  const { data } = await api.post<AuthMessageResponse>('/auth/first-access', {
    senhaNova: payload.senhaNova,
    confirmarSenha: payload.confirmarSenha,
  });

  return data;
}

export async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<AuthMessageResponse> {
  const { data } = await api.post<AuthMessageResponse>('/auth/forgot-password', payload);

  return data;
}

export async function resetPassword(payload: ResetPasswordRequest): Promise<AuthMessageResponse> {
  const { data } = await api.post<AuthMessageResponse>('/auth/reset-password', payload);

  return data;
}

export const authService = {
  signIn,
  firstAccess,
  forgotPassword,
  resetPassword,
};
