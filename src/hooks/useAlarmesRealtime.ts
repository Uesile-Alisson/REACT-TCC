import { useRealtime } from './useRealtime';

export function useAlarmesRealtime() {
  const { lastAlarm, eventsCount } = useRealtime();

  return {
    lastAlarm,
    eventsCount,
  };
}
