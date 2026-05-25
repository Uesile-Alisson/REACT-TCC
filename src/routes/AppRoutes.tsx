import { Navigate, Route, Routes } from 'react-router-dom';
import { FirstAccessPage } from '../pages/auth/FirstAccessPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { useAuth } from '../hooks/useAuth';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';

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
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<AppRedirect />} />
    </Routes>
  );
}
