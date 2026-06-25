import { useCallback, useMemo, useState } from 'react';
import type {
  ConfiguracoesSistemaEndpointState,
  ConfiguracoesSistemaResponse,
} from '../types';

type UseConfiguracoesSistemaResult = {
  configuracao: ConfiguracoesSistemaResponse | null;
  endpointState: ConfiguracoesSistemaEndpointState;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  success: string | null;
  refresh: () => Promise<void>;
  clearFeedback: () => void;
};

const MISSING_ENDPOINT_MESSAGE =
  'A API atual nao expoe endpoint HTTP para leitura ou edicao de Configuracoes do Sistema.';

export function useConfiguracoesSistema(): UseConfiguracoesSistemaResult {
  const [success, setSuccess] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setSuccess('Contrato verificado: configuracoes gerais ainda nao estao expostas pela API HTTP.');
  }, []);

  const clearFeedback = useCallback((): void => {
    setSuccess(null);
  }, []);

  return useMemo(
    () => ({
      configuracao: null,
      endpointState: 'missing',
      isLoading: false,
      isSaving: false,
      error: MISSING_ENDPOINT_MESSAGE,
      success,
      refresh,
      clearFeedback,
    }),
    [clearFeedback, refresh, success],
  );
}
