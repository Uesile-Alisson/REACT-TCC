import type { DateString } from './common.types';

export type StatusTanque = 'ATIVO' | 'INATIVO' | 'MANUTENCAO' | 'BLOQUEADO';

export type TanqueConfigResponse = {
  id_tanque: number;
  nome: string;
  volume: number;
  unidade_volume: string;
  vacuo_padrao: number;
  status_tanque: StatusTanque;
  criado_em: DateString;
  atualizado_em: DateString;
};

export type TanquesEndpointState = 'missing' | 'available';

export type TanquesPermissions = {
  canViewTanques: boolean;
  canCreateTanques: boolean;
  canEditTanques: boolean;
  canDeleteTanques: boolean;
};

export type TanquesPageState = {
  tanques: TanqueConfigResponse[];
  selectedTanque: TanqueConfigResponse | null;
  endpointState: TanquesEndpointState;
  isLoading: boolean;
  error: string | null;
};

export type TanquesSummary = {
  total: number;
  ativos: number;
  indisponiveis: number;
  volumeConfigurado: number;
};
