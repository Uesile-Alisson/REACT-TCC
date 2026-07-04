import { useContext } from 'react';
import { AlarmContext } from '../contexts/alarms';

export function useAlarmContext() {
  const context = useContext(AlarmContext);

  if (!context) {
    throw new Error('useAlarmContext deve ser usado dentro de um AlarmProvider.');
  }

  return context;
}
