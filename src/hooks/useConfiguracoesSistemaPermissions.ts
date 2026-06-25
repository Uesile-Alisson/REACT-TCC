import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { ConfiguracoesSistemaPermissions } from '../types';

export function useConfiguracoesSistemaPermissions(): ConfiguracoesSistemaPermissions {
  const { user } = useAuth();
  const role = user?.nivel_acesso ?? null;
  const canUseTechnicalSettings = role === 'TECNICO' || role === 'ADMINISTRADOR';

  return useMemo(
    () => ({
      canViewConfiguracoesSistema: canUseTechnicalSettings,
      canEditConfiguracoesSistema: false,
    }),
    [canUseTechnicalSettings],
  );
}
