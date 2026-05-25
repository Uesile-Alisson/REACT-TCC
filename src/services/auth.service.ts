import { AxiosError } from 'axios';
import { api, setAccessToken } from '../api/axios';
import type {
  ApiAuthUser,
  ApiError,
  ApiErrorResponse,
  ApiSignInResponse,
  AuthMessageResponse,
  AuthUser,
  FirstAccessRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SignInRequest,
  SignInResponse,
} from '../types/auth.types';

function normalizeAuthUser(apiUser: ApiAuthUser): AuthUser {
  const id = apiUser.id ?? apiUser.id_usuario;

  if (typeof id !== 'number') {
    throw createApiError('Resposta de usuário inválida.', undefined);
  }

  return {
    id,
    nome: apiUser.nome,
    login: apiUser.login,
    email: apiUser.email,
    nivel_acesso:
      typeof apiUser.nivel_acesso === 'string'
        ? apiUser.nivel_acesso
        : apiUser.nivel_acesso.nome,
    primeiro_acesso: apiUser.primeiro_acesso,
  };
}

function normalizeSignInResponse(response: ApiSignInResponse): SignInResponse {
  const apiUser = response.user ?? response.usuario;

  if (!apiUser) {
    throw createApiError('Resposta de autenticação inválida.', undefined);
  }

  return {
    access_token: response.access_token,
    user: normalizeAuthUser(apiUser),
  };
}

function createApiError(
  message: string,
  statusCode: number | undefined,
  validationErrors: ApiError['validationErrors'] = [],
): ApiError {
  return {
    message,
    statusCode,
    validationErrors,
  };
}

function resolveApiMessage(data: ApiErrorResponse | undefined): string {
  if (!data?.message) {
    return 'Não foi possível concluir a solicitação.';
  }

  if (Array.isArray(data.message)) {
    return data.message[0] ?? 'Não foi possível concluir a solicitação.';
  }

  return data.message;
}

function handleAuthError(error: unknown): never {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as ApiErrorResponse | undefined;

    if (error.code === 'ECONNABORTED') {
      throw createApiError('Tempo de conexão esgotado. Verifique se a API está respondendo.', undefined);
    }

    if (!error.response) {
      throw createApiError(
        'Não foi possível conectar à API de autenticação. Verifique se o servidor está rodando.',
        undefined,
      );
    }

    throw createApiError(
      resolveApiMessage(responseData),
      error.response?.status,
      responseData?.errors ?? [],
    );
  }

  if (isApiError(error)) {
    throw error;
  }

  throw createApiError('Erro inesperado na comunicação com a API.', undefined);
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

export async function signIn(payload: SignInRequest): Promise<SignInResponse> {
  try {
    const { data } = await api.post<ApiSignInResponse>('/auth/signin', payload);
    const auth = normalizeSignInResponse(data);

    setAccessToken(auth.access_token);

    return auth;
  } catch (error: unknown) {
    handleAuthError(error);
  }
}

export async function firstAccess(payload: FirstAccessRequest): Promise<AuthMessageResponse> {
  try {
    const requestPayload = {
      senhaNova: payload.senhaNova,
      confirmarSenha: payload.confirmarSenha,
    };

    const { data } = await api.post<AuthMessageResponse>('/auth/first-access', requestPayload);

    return data;
  } catch (error: unknown) {
    handleAuthError(error);
  }
}

export async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<AuthMessageResponse> {
  try {
    const { data } = await api.post<AuthMessageResponse>('/auth/forgot-password', payload);

    return data;
  } catch (error: unknown) {
    handleAuthError(error);
  }
}

export async function resetPassword(payload: ResetPasswordRequest): Promise<AuthMessageResponse> {
  try {
    const { data } = await api.post<AuthMessageResponse>('/auth/reset-password', payload);

    return data;
  } catch (error: unknown) {
    handleAuthError(error);
  }
}

export const authService = {
  signIn,
  firstAccess,
  forgotPassword,
  resetPassword,
};
