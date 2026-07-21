export type SensorTipo = 'VACUO' | 'VAZAO' | 'NIVEL' | 'ACOPLAMENTO' | 'GENERICO';

export type SensorStatus = 'ATIVO' | 'INATIVO' | 'FALHA' | 'DESCONECTADO';

export type SensorProtocolo = 'I2C' | 'ANALOGICO' | 'DIGITAL' | 'SPI' | 'UART';

export type SensorIntegridadeStatus =
  | 'PENDENTE_CALIBRACAO'
  | 'VALIDO'
  | 'LEITURA_IMPOSSIVEL'
  | 'FORA_FAIXA'
  | 'OSCILANDO'
  | 'TRAVADO'
  | 'TIMEOUT'
  | 'MUDANCA_ABRUPTA';

export type SensorProcessoOption = {
  id_sensor: number;
  id_tanque: number;
  label: string;
  nome: string;
  modelo: string;
  tipo_sensor: SensorTipo;
  status_sensor: SensorStatus;
  status_integridade?: string;
  unidade_medida: string;
};

export type SensoresProcessoListResponse = {
  data: SensorProcessoOption[];
  total: number;
};

export type CreateSensorConfiguracaoDto = {
  nome: string;
  modelo: string;
  protocolo: SensorProtocolo;
  tipo_sensor: SensorTipo;
  status_sensor: SensorStatus;
  unidade_medida: string;
};

export type SensorConfiguracaoResponse = {
  id_sensor: number;
  nome: string;
  modelo: string;
  protocolo: SensorProtocolo;
  unidade_medida: string;
  precisao: number | null;
  status_sensor: SensorStatus;
  tipo_sensor: SensorTipo;
  fator_calibracao: number;
  offset_calibracao: number;
  status_integridade: SensorIntegridadeStatus;
  ultimo_valor_bruto: number | null;
  calibrado_em: string | null;
  calibracao_valida_ate: string | null;
  calibracao_referencia: string | null;
  calibracao_incerteza: number | null;
  calibracao_observacoes: string | null;
  id_usuario_calibracao: number | null;
  liberado_em: string | null;
  id_usuario_liberacao: number | null;
  integridade_validada_em: string | null;
  integridade_ultimo_erro: string | null;
  modo_calibracao_ativo: boolean;
  calibracao_iniciada_em: string | null;
  limite_minimo_operacional: number | null;
  limite_maximo_operacional: number | null;
  variacao_maxima_por_segundo: number | null;
  oscilacao_maxima: number | null;
  tempo_travado_segundos: number;
  criado_em: string;
};

export type SensorConfiguracaoQuery = {
  page?: number;
  limit?: number;
  busca?: string;
  status_sensor?: SensorStatus;
  tipo_sensor?: SensorTipo;
  id_tanque?: number;
  order_by?:
    | 'id_sensor'
    | 'nome'
    | 'modelo'
    | 'protocolo'
    | 'unidade_medida'
    | 'status_sensor'
    | 'tipo_sensor'
    | 'criado_em';
  order_direction?: 'asc' | 'desc';
};

export type SensoresConfiguracaoListResponse = {
  data: SensorConfiguracaoResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

export type UpdateSensorConfiguracaoRequest = {
  nome?: string;
  modelo?: string;
  protocolo?: SensorProtocolo;
  unidade_medida?: string;
  precisao?: number;
  tipo_sensor?: SensorTipo;
  limite_minimo_operacional?: number;
  limite_maximo_operacional?: number;
  variacao_maxima_por_segundo?: number;
  oscilacao_maxima?: number;
  tempo_travado_segundos?: number;
};

export type CalibrarSensorRequest = {
  valor_referencia: number;
  valor_observado?: number;
  offset_calibracao?: number;
  referencia: string;
  incerteza?: number;
  valida_ate?: string;
  observacoes?: string;
};

export type SensorConfigFormState = {
  nome: string;
  modelo: string;
  protocolo: SensorProtocolo;
  tipo_sensor: SensorTipo;
  status_sensor: SensorStatus;
  unidade_medida: string;
};

export type SensorConfigFormErrors = Partial<Record<keyof SensorConfigFormState, string>>;
