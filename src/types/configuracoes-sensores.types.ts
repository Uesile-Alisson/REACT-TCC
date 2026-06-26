export type SensorTipo = 'VACUO' | 'ACOPLAMENTO' | 'MANGUEIRA';

export type SensorStatus = 'ATIVO' | 'INATIVO';

export type SensorProcessoOption = {
  id_sensor: number;
  id_tanque: number;
  label: string;
  nome: string;
  modelo: string;
  tipo_sensor: SensorTipo;
  status_sensor: SensorStatus;
  unidade_medida: string | null;
};

export type SensoresProcessoListResponse = {
  data: SensorProcessoOption[];
  total: number;
};
