import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { UsuarioPermissions } from '../types';

export function useUsuariosPermissions(): UsuarioPermissions {
  const { user } = useAuth();
  const isAdmin = user?.nivel_acesso === 'ADMINISTRADOR';

  return useMemo(
    () => ({
      canViewUsuarios: isAdmin,
      canCreateUsuario: isAdmin,
      canEditUsuario: isAdmin,
      canUpdateNivelAcesso: isAdmin,
      canDeleteUsuario: isAdmin,
    }),
    [isAdmin],
  );
}
