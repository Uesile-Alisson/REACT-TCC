import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { AlarmesPermissions, StatusAlarme } from '../types';

export function useAlarmePermissions(): AlarmesPermissions {
  const { user } = useAuth();
  const role = user?.nivel_acesso ?? null;
  const canResolve = role === 'TECNICO' || role === 'ADMINISTRADOR';

  return useMemo(
    () => ({
      canViewAlarmes: Boolean(role),
      canViewAlarmeDetails: Boolean(role),
      canResolveAlarme: (status: StatusAlarme) => canResolve && status === 'ATIVO',
    }),
    [canResolve, role],
  );
}
