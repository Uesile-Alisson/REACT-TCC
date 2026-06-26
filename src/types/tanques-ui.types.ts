import type { DateString, PaginatedResponse, SortDirection } from './common.types';

export type StatusTanque = 'ATIVO' | 'INATIVO' | 'MANUTENCAO' | 'FALHA';

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

export type TanquesEndpointState = 'available';

export type TanquesPermissions = {
  canViewTanques: boolean;
  canCreateTanques: boolean;
  canEditTanques: boolean;
  canActivateTanques: boolean;
  canDeactivateTanques: boolean;
};

export type TanquesOrderBy =
  | 'id_tanque'
  | 'nome'
  | 'volume'
  | 'vacuo_padrao'
  | 'status_tanque'
  | 'criado_em'
  | 'atualizado_em';

export type QueryTanquesConfiguracao = {
  page?: number;
  limit?: number;
  busca?: string;
  status_tanque?: StatusTanque;
  order_by?: TanquesOrderBy;
  order_direction?: Extract<SortDirection, 'asc' | 'desc'>;
};

export type CreateTanqueConfiguracaoDto = {
  nome: string;
  volume: number;
  unidade_volume: string;
  vacuo_padrao: number;
  status_tanque: StatusTanque;
};

export type UpdateTanqueConfiguracaoDto = Partial<CreateTanqueConfiguracaoDto>;

export type TanquesConfiguracaoListResponse = PaginatedResponse<TanqueConfigResponse>;

export type TanqueConfigFormState = {
  nome: string;
  volume: string;
  unidade_volume: string;
  vacuo_padrao: string;
  status_tanque: StatusTanque;
};

export type TanqueConfigFormErrors = Partial<Record<keyof TanqueConfigFormState, string>>;

export type TanquesPageState = {
  tanques: TanqueConfigResponse[];
  selectedTanque: TanqueConfigResponse | null;
  endpointState: TanquesEndpointState;
  isLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  successMessage: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type TanquesSummary = {
  total: number;
  ativos: number;
  indisponiveis: number;
  volumeConfigurado: number;
};
