import type { DateString } from './common.types';

export type StatusGeralSistema =
  | 'OPERACIONAL'
  | 'ALERTA'
  | 'FALHA'
  | 'BLOQUEADO'
  | 'MANUTENCAO';

export type ConfiguracoesSistemaResponse = {
  id_configuracao_sistema: number;
  vacuo_padrao: number;
  limite_seguranca_vacuo: number;
  tolerancia_vacuo_percentual: number;
  status_geral_sistema: StatusGeralSistema;
  atualizado_em: DateString;
  criado_em: DateString;
  id_usuario_alteracao?: number | null;
};

export type ConfiguracoesSistemaUpdateRequest = {
  vacuo_padrao: number;
  limite_seguranca_vacuo: number;
  tolerancia_vacuo_percentual: number;
};

export type ConfiguracoesSistemaFormState = {
  vacuo_padrao: string;
  limite_seguranca_vacuo: string;
  tolerancia_vacuo_percentual: string;
};

export type ConfiguracoesSistemaFormErrors = Partial<
  Record<keyof ConfiguracoesSistemaFormState, string>
>;

export type ConfiguracoesSistemaPermissions = {
  canViewConfiguracoesSistema: boolean;
  canEditConfiguracoesSistema: boolean;
};

export type ConfiguracoesSistemaEndpointState = 'missing' | 'available';
