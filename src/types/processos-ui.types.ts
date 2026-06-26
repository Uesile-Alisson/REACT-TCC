import type {
  NivelAcesso,
  StatusProcesso,
} from './common.types';
import type {
  ProcessoEventResponse,
  ProcessoReadingResponse,
  ProcessoResponse,
} from './processos.types';

export type ProcessoAction =
  | 'start'
  | 'pause'
  | 'resume'
  | 'finish'
  | 'interrupt'
  | 'emergency-stop';

export type ProcessoActionState = {
  type: ProcessoAction;
  process: ProcessoResponse;
};

export type ProcessoFormState = {
  nome_processo: string;
  tempo_maximo: string;
  vacuo_alvo: string;
  id_tanque: string;
  vacuo_alvo_tanque: string;
  id_sensor: string;
  observacoes_sensor: string;
};

export type ProcessoFormErrors = Partial<Record<keyof ProcessoFormState, string>>;

export type ProcessoTanqueOption = {
  id_tanque: number;
  label: string;
  description: string;
  status_tanque?: string | null;
};

export type ProcessoSensorOption = {
  id_sensor: number;
  label: string;
  description?: string;
  status_sensor?: string | null;
};

export type ProcessosPageData = {
  activeProcess: ProcessoResponse | null;
  processes: ProcessoResponse[];
  selectedProcess: ProcessoResponse | null;
  selectedReadings: ProcessoReadingResponse[];
  selectedEvents: ProcessoEventResponse[];
  total: number;
  page: number;
  limit: number;
};

export type ProcessosFilters = {
  busca: string;
  status: StatusProcesso | '';
};

export type ProcessosPermissions = {
  canCreateProcess: boolean;
  canStartProcess: (status?: StatusProcesso) => boolean;
  canPauseProcess: (status?: StatusProcesso) => boolean;
  canResumeProcess: (status?: StatusProcesso) => boolean;
  canInterruptProcess: (status?: StatusProcesso) => boolean;
  canFinishProcess: (status?: StatusProcesso) => boolean;
  canEmergencyStop: (status?: StatusProcesso) => boolean;
  canViewProcessDetails: boolean;
};

export function isTechnicalRole(role?: NivelAcesso | null): boolean {
  return role === 'TECNICO' || role === 'ADMINISTRADOR';
}
