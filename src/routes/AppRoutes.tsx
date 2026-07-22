import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ALL_ROLES, ADMIN_ROLES, TECHNICAL_ROLES } from '../config/navigation';
import { FirstAccessPage } from '../pages/auth/FirstAccessPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { AccessDeniedPage } from '../pages/AccessDenied';
import { NotFoundPage } from '../pages/NotFound';
import { useAuth } from '../hooks/useAuth';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { RoleGuard } from './RoleGuard';

const AppShell = lazy(() =>
  import('../layouts/AppShell').then((module) => ({ default: module.AppShell })),
);
const AlarmesPage = lazy(() =>
  import('../pages/alarmes/AlarmesPage').then((module) => ({ default: module.AlarmesPage })),
);
const BackupsPage = lazy(() =>
  import('../pages/configuracoes/BackupsPage').then((module) => ({ default: module.BackupsPage })),
);
const BombasPage = lazy(() =>
  import('../pages/configuracoes/BombasPage').then((module) => ({ default: module.BombasPage })),
);
const ConfiguracoesMqttHardwarePage = lazy(() =>
  import('../pages/configuracoes/ConfiguracoesMqttHardwarePage').then((module) => ({
    default: module.ConfiguracoesMqttHardwarePage,
  })),
);
const ConfiguracoesSistemaPage = lazy(() =>
  import('../pages/configuracoes/ConfiguracoesSistemaPage').then((module) => ({
    default: module.ConfiguracoesSistemaPage,
  })),
);
const TanquesPage = lazy(() =>
  import('../pages/configuracoes/TanquesPage').then((module) => ({ default: module.TanquesPage })),
);
const DashboardPage = lazy(() =>
  import('../pages/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const HistoricoPage = lazy(() =>
  import('../pages/historico/HistoricoPage').then((module) => ({ default: module.HistoricoPage })),
);
const ProcessosPage = lazy(() =>
  import('../pages/processos/ProcessosPage').then((module) => ({ default: module.ProcessosPage })),
);
const RelatoriosPage = lazy(() =>
  import('../pages/relatorios/RelatoriosPage').then((module) => ({ default: module.RelatoriosPage })),
);
const UsuariosPage = lazy(() =>
  import('../pages/usuarios/UsuariosPage').then((module) => ({ default: module.UsuariosPage })),
);

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
    <Suspense fallback={<div role="status">Carregando interface...</div>}>
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
    </Suspense>
  );
}
