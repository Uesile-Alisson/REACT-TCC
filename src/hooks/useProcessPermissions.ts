import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { ProcessosPermissions, StatusProcesso } from '../types';
import { isTechnicalRole } from '../types/processos-ui.types';

function isRunnableStatus(status?: StatusProcesso): boolean {
  return status === 'CONFIGURADO';
}

function isPausableStatus(status?: StatusProcesso): boolean {
  return status === 'EM_EXECUCAO';
}

function isResumableStatus(status?: StatusProcesso): boolean {
  return status === 'PAUSADO';
}

function isTerminableStatus(status?: StatusProcesso): boolean {
  return status === 'EM_EXECUCAO' || status === 'PAUSADO';
}

export function useProcessPermissions(): ProcessosPermissions {
  const { user } = useAuth();
  const role = user?.nivel_acesso ?? null;
  const canUseTechnicalActions = isTechnicalRole(role);

  return useMemo(
    () => ({
      canCreateProcess: canUseTechnicalActions,
      canStartProcess: (status?: StatusProcesso) => canUseTechnicalActions && isRunnableStatus(status),
      canPauseProcess: (status?: StatusProcesso) => canUseTechnicalActions && isPausableStatus(status),
      canResumeProcess: (status?: StatusProcesso) => canUseTechnicalActions && isResumableStatus(status),
      canInterruptProcess: (status?: StatusProcesso) => canUseTechnicalActions && isTerminableStatus(status),
      canFinishProcess: (status?: StatusProcesso) => canUseTechnicalActions && isTerminableStatus(status),
      canEmergencyStop: (status?: StatusProcesso) => isTerminableStatus(status),
      canViewProcessDetails: Boolean(role),
    }),
    [canUseTechnicalActions, role],
  );
}
