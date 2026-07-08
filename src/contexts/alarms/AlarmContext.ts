import { createContext } from 'react';
import type { AlarmeResponse } from '../../types';

export type AlarmContextData = {
  activeAlarms: AlarmeResponse[];
  transientInfoAlarms: AlarmeResponse[];
  isLoading: boolean;
  lastError: string | null;
  acknowledgeAlarm: (idAlarme: number, observacao?: string) => Promise<string>;
  resolveAlarm: (idAlarme: number, observacao?: string) => Promise<string>;
  refreshActiveAlarms: () => Promise<void>;
};

export const AlarmContext = createContext<AlarmContextData | undefined>(undefined);
