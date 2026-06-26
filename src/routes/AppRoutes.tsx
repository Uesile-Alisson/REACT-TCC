import { Navigate, Route, Routes } from 'react-router-dom';
import { ALL_ROLES, ADMIN_ROLES, TECHNICAL_ROLES } from '../config/navigation';
import { AppShell } from '../layouts/AppShell';
import { FirstAccessPage } from '../pages/auth/FirstAccessPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { AlarmesPage } from '../pages/alarmes/AlarmesPage';
import { BackupsPage } from '../pages/configuracoes/BackupsPage';
import { BombasPage } from '../pages/configuracoes/BombasPage';
import { ConfiguracoesMqttHardwarePage } from '../pages/configuracoes/ConfiguracoesMqttHardwarePage';
import { ConfiguracoesSistemaPage } from '../pages/configuracoes/ConfiguracoesSistemaPage';
import { TanquesPage } from '../pages/configuracoes/TanquesPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { HistoricoPage } from '../pages/historico/HistoricoPage';
import { AccessDeniedPage } from '../pages/AccessDenied';
import { NotFoundPage } from '../pages/NotFound';
import { ProcessosPage } from '../pages/processos/ProcessosPage';
import { RelatoriosPage } from '../pages/relatorios/RelatoriosPage';
import { UsuariosPage } from '../pages/usuarios/UsuariosPage';
import { useAuth } from '../hooks/useAuth';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { RoleGuard } from './RoleGuard';

function AppRedirect() {
  const { isAuthenticated, isFirstAccess, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={isFirstAccess ? '/first-access' : '/dashboard'} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppRedirect />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="/first-access" element={<FirstAccessPage />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          <Route
            path="/processos"
            element={
              <RoleGuard roles={ALL_ROLES}>
                <ProcessosPage />
              </RoleGuard>
            }
          />
          <Route
            path="/alarmes"
            element={
              <RoleGuard roles={ALL_ROLES}>
                <AlarmesPage />
              </RoleGuard>
            }
          />
          <Route
            path="/historico"
            element={
              <RoleGuard roles={ALL_ROLES}>
                <HistoricoPage />
              </RoleGuard>
            }
          />
          <Route
            path="/relatorios"
            element={
              <RoleGuard roles={ALL_ROLES}>
                <RelatoriosPage />
              </RoleGuard>
            }
          />
          <Route
            path="/configuracoes/sistema"
            element={
              <RoleGuard roles={TECHNICAL_ROLES}>
                <ConfiguracoesSistemaPage />
              </RoleGuard>
            }
          />
          <Route
            path="/configuracoes/mqtt-hardware"
            element={
              <RoleGuard roles={TECHNICAL_ROLES}>
                <ConfiguracoesMqttHardwarePage />
              </RoleGuard>
            }
          />
          <Route
            path="/configuracoes/tanques"
            element={
              <RoleGuard roles={TECHNICAL_ROLES}>
                <TanquesPage />
              </RoleGuard>
            }
          />
          <Route
            path="/configuracoes/bombas"
            element={
              <RoleGuard roles={TECHNICAL_ROLES}>
                <BombasPage />
              </RoleGuard>
            }
          />
          <Route
            path="/configuracoes/backups"
            element={
              <RoleGuard roles={ADMIN_ROLES}>
                <BackupsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/usuarios"
            element={
              <RoleGuard roles={ADMIN_ROLES}>
                <UsuariosPage />
              </RoleGuard>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      <Route path="*" element={<AppRedirect />} />
    </Routes>
  );
}
