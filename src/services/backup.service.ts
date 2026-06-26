import { api } from '../api/axios';
import type {
  BackupDetail,
  BackupListResponse,
  BackupQuery,
  CreateBackupRequest,
  RestoreBackupRequest,
} from '../types';

const BACKUP_ENDPOINT = '/configuracoes/backup';

export async function createBackup(payload: CreateBackupRequest): Promise<BackupDetail> {
  const { data } = await api.post<BackupDetail>(BACKUP_ENDPOINT, payload);

  return data;
}

export async function listBackups(query?: BackupQuery): Promise<BackupListResponse> {
  const { data } = await api.get<BackupListResponse>(BACKUP_ENDPOINT, { params: query });

  return data;
}

export async function getBackupById(id: number): Promise<BackupDetail> {
  const { data } = await api.get<BackupDetail>(`${BACKUP_ENDPOINT}/${id}`);

  return data;
}

export async function restoreBackup(
  id: number,
  payload: RestoreBackupRequest,
): Promise<BackupDetail> {
  const { data } = await api.post<BackupDetail>(`${BACKUP_ENDPOINT}/${id}/restaurar`, payload);

  return data;
}

export const backupService = {
  createBackup,
  listBackups,
  getBackupById,
  restoreBackup,
};
