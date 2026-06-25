import { useRealtime } from './useRealtime';

export function useAcoplamentoRealtime() {
  const { lastAcoplamento, eventsCount } = useRealtime();

  return {
    lastAcoplamento,
    eventsCount,
  };
}
