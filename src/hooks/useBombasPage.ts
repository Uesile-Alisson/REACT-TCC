import { useCallback, useMemo, useState } from 'react';
import type { BombaConfigResponse, BombasPageState, BombasSummary } from '../types';

const BOMBAS_ENDPOINT_MISSING_MESSAGE =
  'A API atual nao expoe endpoint HTTP dedicado para cadastro e manutencao de Bombas.';

export function useBombasPage(): BombasPageState & {
  summary: BombasSummary;
  selectBomba: (bomba: BombaConfigResponse | null) => void;
  refresh: () => Promise<void>;
} {
  const [selectedBomba, setSelectedBomba] = useState<BombaConfigResponse | null>(null);

  const bombas = useMemo<BombaConfigResponse[]>(() => [], []);

  const summary = useMemo<BombasSummary>(
    () => ({
      total: bombas.length,
      ativas: bombas.filter((bomba) => bomba.status_padrao === 'ATIVA').length,
      indisponiveis: bombas.filter((bomba) => bomba.status_padrao !== 'ATIVA').length,
      automaticas: bombas.filter(
        (bomba) => bomba.entrada_por_pressao || bomba.entrada_por_tempo,
      ).length,
    }),
    [bombas],
  );

  const selectBomba = useCallback((bomba: BombaConfigResponse | null): void => {
    setSelectedBomba(bomba);
  }, []);

  const refresh = useCallback(async (): Promise<void> => undefined, []);

  return {
    bombas,
    selectedBomba,
    endpointState: 'missing',
    isLoading: false,
    error: BOMBAS_ENDPOINT_MISSING_MESSAGE,
    summary,
    selectBomba,
    refresh,
  };
}
