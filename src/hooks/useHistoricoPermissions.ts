import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { HistoricoPermissions } from '../types';

export function useHistoricoPermissions(): HistoricoPermissions {
  const { user } = useAuth();
  const role = user?.nivel_acesso ?? null;
  const canGenerate = role === 'TECNICO' || role === 'ADMINISTRADOR';

  return useMemo(
    () => ({
      canViewHistorico: Boolean(role),
      canViewHistoricoDetail: Boolean(role),
      canGenerateHistoricoReport: canGenerate,
      canDeleteHistorico: false,
    }),
    [canGenerate, role],
  );
}
