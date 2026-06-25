import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { NivelAcesso } from '../types';

type RoleGuardProps = {
  roles: NivelAcesso[];
  children?: ReactNode;
};

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.nivel_acesso)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children ?? <Outlet />;
}
