import { useContext } from 'react';
import { RealtimeContext } from '../contexts/realtime';

export function useRealtime() {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error('useRealtime deve ser usado dentro de um RealtimeProvider.');
  }

  return context;
}
