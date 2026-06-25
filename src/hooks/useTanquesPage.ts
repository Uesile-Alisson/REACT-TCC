import { useCallback, useMemo, useState } from 'react';
import type { TanqueConfigResponse, TanquesPageState, TanquesSummary } from '../types';

const TANQUES_ENDPOINT_MISSING_MESSAGE =
  'A API atual nao expoe endpoint HTTP dedicado para cadastro e manutencao de Tanques.';

export function useTanquesPage(): TanquesPageState & {
  summary: TanquesSummary;
  selectTanque: (tanque: TanqueConfigResponse | null) => void;
  refresh: () => Promise<void>;
} {
  const [selectedTanque, setSelectedTanque] = useState<TanqueConfigResponse | null>(null);

  const tanques = useMemo<TanqueConfigResponse[]>(() => [], []);

  const summary = useMemo<TanquesSummary>(
    () => ({
      total: tanques.length,
      ativos: tanques.filter((tanque) => tanque.status_tanque === 'ATIVO').length,
      indisponiveis: tanques.filter((tanque) => tanque.status_tanque !== 'ATIVO').length,
      volumeConfigurado: tanques.reduce((total, tanque) => total + tanque.volume, 0),
    }),
    [tanques],
  );

  const selectTanque = useCallback((tanque: TanqueConfigResponse | null): void => {
    setSelectedTanque(tanque);
  }, []);

  const refresh = useCallback(async (): Promise<void> => undefined, []);

  return {
    tanques,
    selectedTanque,
    endpointState: 'missing',
    isLoading: false,
    error: TANQUES_ENDPOINT_MISSING_MESSAGE,
    summary,
    selectTanque,
    refresh,
  };
}
