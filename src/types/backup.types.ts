import type { DateString, Id, PaginatedResponse, QueryParams } from './common.types';

export type BackupType = 'SISTEMA' | 'MQTT' | 'COMPLETO';

export type BackupStatus =
  | 'GERADO'
  | 'RESTAURADO'
  | 'FALHA_GERACAO'
  | 'FALHA_RESTAURACAO'
  | 'INVALIDO';

export type BackupOrigin = 'MANUAL' | 'AUTOMATICO' | 'SISTEMA';

export type BackupUser = {
  id_usuario: Id;
  nome: string;
  login?: string;
};

export type BackupListItem = {
  id_backup: Id;
  tipo_backup: BackupType;
  origem_backup: BackupOrigin;
  status_backup: BackupStatus;
  nome_arquivo: string;
  hash_arquivo?: string | null;
  tamanho_bytes?: string | number | null;
  content_type?: string | null;
  storage_provider?: string | null;
  criado_em: DateString;
  restaurado_em?: DateString | null;
  usuario_criacao?: BackupUser | null;
  usuario_restauracao?: BackupUser | null;
  metadados?: unknown;
};

export type BackupDetail = BackupListItem & {
  snapshot_preview?: unknown;
  erro?: string | null;
};

export type BackupListResponse = PaginatedResponse<BackupListItem> | BackupListItem[];

export type BackupQuery = QueryParams & {
  tipo_backup?: BackupType;
  status_backup?: BackupStatus;
  data_inicio?: DateString;
  data_fim?: DateString;
  page?: number;
  limit?: number;
};

export type CreateBackupRequest = {
  tipo_backup: BackupType;
  observacao?: string;
  origem_backup?: BackupOrigin;
};

export type RestoreBackupRequest = {
  confirmar_restauracao: true;
  motivo?: string;
};

export type BackupFiltersState = {
  tipo_backup: BackupType | '';
  status_backup: BackupStatus | '';
  data_inicio: string;
  data_fim: string;
  busca: string;
};

export type BackupActionFeedback = {
  type: 'success' | 'error';
  message: string;
} | null;
