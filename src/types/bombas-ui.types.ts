import type { DateString } from './common.types';

export type TipoBomba = 'VACUO' | 'TRANSFERENCIA' | 'AUXILIAR';

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

export type BombasEndpointState = 'missing' | 'available';

export type BombasPermissions = {
  canViewBombas: boolean;
  canCreateBombas: boolean;
  canEditBombas: boolean;
  canDeleteBombas: boolean;
};

export type BombasPageState = {
  bombas: BombaConfigResponse[];
  selectedBomba: BombaConfigResponse | null;
  endpointState: BombasEndpointState;
  isLoading: boolean;
  error: string | null;
};

export type BombasSummary = {
  total: number;
  ativas: number;
  indisponiveis: number;
  automaticas: number;
};
