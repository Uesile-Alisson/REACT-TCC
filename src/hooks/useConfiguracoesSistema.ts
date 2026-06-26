import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../api/api-error';
import {
  getConfiguracoesSistema,
  updateConfiguracoesSistema,
} from '../services/configuracoes-sistema.service';
import type {
  ConfiguracoesSistemaResponse,
  ConfiguracoesSistemaUpdateRequest,
} from '../types';

type UseConfiguracoesSistemaResult = {
  configuracao: ConfiguracoesSistemaResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  success: string | null;
  refresh: () => Promise<void>;
  saveConfiguracao: (payload: ConfiguracoesSistemaUpdateRequest) => Promise<boolean>;
  clearFeedback: () => void;
};

function getConfiguracoesSistemaErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 403) {
      return 'Sem permissao para alterar configuracoes.';
    }

    if (error.statusCode === 404) {
      return 'Configuracao do sistema nao cadastrada no backend.';
    }

    if (error.statusCode && error.statusCode >= 500) {
      return 'Erro inesperado ao processar configuracoes do sistema.';
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Nao foi possivel comunicar com a API.';
}

export function useConfiguracoesSistema(): UseConfiguracoesSistemaResult {
  const [configuracao, setConfiguracao] = useState<ConfiguracoesSistemaResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getConfiguracoesSistema();
      setConfiguracao(response);
    } catch (loadError: unknown) {
      setConfiguracao(null);
      setError(getConfiguracoesSistemaErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveConfiguracao = useCallback(
    async (payload: ConfiguracoesSistemaUpdateRequest): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await updateConfiguracoesSistema(payload);
        setConfiguracao(response);
        setSuccess('Configuracoes do sistema atualizadas com sucesso.');
        return true;
      } catch (saveError: unknown) {
        setError(getConfiguracoesSistemaErrorMessage(saveError));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const clearFeedback = useCallback((): void => {
    setSuccess(null);
    setError(null);
  }, []);

  useEffect(() => {
    let shouldRun = true;

    queueMicrotask(() => {
      if (shouldRun) {
        void refresh();
      }
    });

    return () => {
      shouldRun = false;
    };
  }, [refresh]);

  return useMemo(
    () => ({
      configuracao,
      isLoading,
      isSaving,
      error,
      success,
      refresh,
      saveConfiguracao,
      clearFeedback,
    }),
    [
      clearFeedback,
      configuracao,
      error,
      isLoading,
      isSaving,
      refresh,
      saveConfiguracao,
      success,
    ],
  );
}
