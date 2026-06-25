import axios, { AxiosError } from 'axios';
import type { ApiErrorPayload, ApiValidationError } from '../types/common.types';

const DEFAULT_ERROR_MESSAGE = 'Nao foi possivel concluir a solicitacao.';

export class ApiError extends Error {
  statusCode?: number;
  validationErrors: ApiValidationError[];
  originalError?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    validationErrors: ApiValidationError[] = [],
    originalError?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
    this.originalError = originalError;
  }
}

function getResponseMessage(data?: ApiErrorPayload): string {
  if (!data?.message) {
    return DEFAULT_ERROR_MESSAGE;
  }

  if (Array.isArray(data.message)) {
    return data.message[0] ?? DEFAULT_ERROR_MESSAGE;
  }

  return data.message;
}

function normalizeAxiosError(error: AxiosError<ApiErrorPayload>): ApiError {
  if (error.code === 'ECONNABORTED') {
    return new ApiError(
      'Tempo de conexao esgotado. Verifique se a API esta respondendo.',
      undefined,
      [],
      error,
    );
  }

  if (!error.response) {
    return new ApiError(
      'Nao foi possivel conectar a API. Verifique se o servidor esta rodando.',
      undefined,
      [],
      error,
    );
  }

  return new ApiError(
    getResponseMessage(error.response.data),
    error.response.status,
    error.response.data?.errors ?? [],
    error,
  );
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return normalizeAxiosError(error);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, undefined, [], error);
  }

  return new ApiError(DEFAULT_ERROR_MESSAGE, undefined, [], error);
}
