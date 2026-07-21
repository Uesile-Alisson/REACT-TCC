import type { DateString } from './common.types';

export type StatusGeralSistema =
  | 'OPERACIONAL'
  | 'ALERTA'
  | 'FALHA'
  | 'BLOQUEADO'
  | 'MANUTENCAO';

export type ConfiguracoesSistemaOperacionais = {
  tempo_maximo_padrao: number;
  encerramento_automatico: boolean;
  tempo_estabilizacao_vacuo_segundos: number;
  estabilizacao_cobertura_minima_percentual: number;
  intervalo_leitura_esperado_ms: number;
  timeout_leitura_sensor_ms: number;
  tempo_retencao_vacuo_segundos: number;
  perda_vacuo_maxima_retencao: number;
  limite_seguranca_vacuo: number;
  vacuo_padrao: number;
  quantidade_maxima_tanques: number;
  status_geral_sistema: StatusGeralSistema;
  versao_sistema: string;
  tolerancia_vacuo_percentual: number;
  estagnacao_janela_segundos: number;
  estagnacao_variacao_minima: number;
  estagnacao_leituras_minimas: number;
  estagnacao_janelas_consecutivas: number;
  estagnacao_tempo_minimo_bomba_principal_segundos: number;
  estagnacao_tempo_maximo_sem_progresso_segundos: number;
  estagnacao_fator_minimo_proximidade_alvo: number;
  auxilio_janela_avaliacao_segundos: number;
  auxilio_melhoria_minima: number;
  auxilio_timeout_segundos: number;
};

export type ConfiguracoesSistemaResponse = ConfiguracoesSistemaOperacionais & {
  id_configuracao_sistema: number;
  atualizado_em: DateString;
  criado_em: DateString;
  id_usuario_alteracao?: number | null;
};

export type ConfiguracoesSistemaUpdateRequest = Partial<ConfiguracoesSistemaOperacionais>;

export type ConfiguracoesSistemaFormState = {
  [Field in keyof ConfiguracoesSistemaOperacionais]: string;
};

export type ConfiguracoesSistemaFormErrors = Partial<
  Record<keyof ConfiguracoesSistemaFormState, string>
>;

export type ConfiguracoesSistemaPermissions = {
  canViewConfiguracoesSistema: boolean;
  canEditConfiguracoesSistema: boolean;
};
