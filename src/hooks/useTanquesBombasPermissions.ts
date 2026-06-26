import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { BombasPermissions, TanquesPermissions } from '../types';

type TanquesBombasPermissions = TanquesPermissions & BombasPermissions;

export function useTanquesBombasPermissions(): TanquesBombasPermissions {
  const { user } = useAuth();
  const role = user?.nivel_acesso ?? null;
  const canUseTechnicalSettings = role === 'TECNICO' || role === 'ADMINISTRADOR';

  return useMemo(
    () => ({
      canViewTanques: canUseTechnicalSettings,
      canCreateTanques: canUseTechnicalSettings,
      canEditTanques: canUseTechnicalSettings,
      canActivateTanques: canUseTechnicalSettings,
      canDeactivateTanques: canUseTechnicalSettings,
      canViewBombas: canUseTechnicalSettings,
      canCreateBombas: canUseTechnicalSettings,
      canEditBombas: canUseTechnicalSettings,
      canActivateBombas: canUseTechnicalSettings,
      canDeactivateBombas: canUseTechnicalSettings,
    }),
    [canUseTechnicalSettings],
  );
}
