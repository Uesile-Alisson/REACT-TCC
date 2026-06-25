import axios, { type InternalAxiosRequestConfig } from 'axios';
import { normalizeApiError } from './api-error';
import { notifyUnauthorizedSession } from './auth-events';
import { createQueryString } from './query-string';
import { getAccessToken } from './token-storage';

const FALLBACK_API_BASE_URL = 'http://localhost:3000/api';

function resolveApiBaseUrl(): string {
  const envBaseUrl =
    import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? FALLBACK_API_BASE_URL;

  return String(envBaseUrl).replace(/\/+$/, '');
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    serialize: createQueryString,
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = normalizeApiError(error);

    if (apiError.statusCode === 401) {
      notifyUnauthorizedSession();
    }

    return Promise.reject(apiError);
  },
);

export { clearAccessToken, getAccessToken, removeAccessToken, setAccessToken } from './token-storage';
