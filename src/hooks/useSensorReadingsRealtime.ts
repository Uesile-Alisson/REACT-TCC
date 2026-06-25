import { useRealtime } from './useRealtime';

export function useSensorReadingsRealtime() {
  const { lastSensorReading, eventsCount } = useRealtime();

  return {
    lastSensorReading,
    eventsCount,
  };
}
