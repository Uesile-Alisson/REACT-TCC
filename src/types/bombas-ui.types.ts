import type { DateString, PaginatedResponse, SortDirection } from './common.types';

export type TipoBomba = 'AUXILIAR' | 'PRINCIPAL' | 'TRANSFERENCIA_FLUIDO';

export type StatusBomba = 'ATIVA' | 'INATIVA' | 'MANUTENCAO' | 'FALHA';

export type BombaConfigResponse = {
  id_bomba: number;
  id_configuracao_sistema: number;
  id_usuario_alteracao?: number | null;
  nome: string;
  tipo_bomba: TipoBomba;
  status_padrao: StatusBomba;
  entrada_por_pressao: boolean;
  entrada_por_tempo: boolean;
  encerramento_automatico?: boolean;
  criado_em: DateString;
  atualizado_em: DateString;
};

export type BombasEndpointState = 'available';

export type BombasPermissions = {
  canViewBombas: boolean;
  canCreateBombas: boolean;
  canEditBombas: boolean;
  canActivateBombas: boolean;
  canDeactivateBombas: boolean;
};

export type BombasOrderBy =
  | 'id_bomba'
  | 'nome'
  | 'tipo_bomba'
  | 'status_padrao'
  | 'criado_em'
  | 'atualizado_em';

export type QueryBombasConfiguracao = {
  page?: number;
  limit?: number;
  busca?: string;
  status_padrao?: StatusBomba;
  tipo_bomba?: TipoBomba;
  order_by?: BombasOrderBy;
  order_direction?: Extract<SortDirection, 'asc' | 'desc'>;
};

export type CreateBombaConfiguracaoDto = {
  nome: string;
  tipo_bomba: TipoBomba;
  status_padrao: StatusBomba;
  entrada_por_pressao?: boolean;
  entrada_por_tempo?: boolean;
  encerramento_automatico?: boolean;
};

export type UpdateBombaConfiguracaoDto = Partial<CreateBombaConfiguracaoDto>;

export type BombasConfiguracaoListResponse = PaginatedResponse<BombaConfigResponse>;

export type BombaConfigFormState = {
  nome: string;
  tipo_bomba: TipoBomba;
  status_padrao: StatusBomba;
  entrada_por_pressao: boolean;
  entrada_por_tempo: boolean;
  encerramento_automatico: boolean;
};

export type BombaConfigFormErrors = Partial<Record<keyof BombaConfigFormState, string>>;

export type BombasPageState = {
  bombas: BombaConfigResponse[];
  selectedBomba: BombaConfigResponse | null;
  endpointState: BombasEndpointState;
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

export type BombasSummary = {
  total: number;
  ativas: number;
  indisponiveis: number;
  automaticas: number;
};
