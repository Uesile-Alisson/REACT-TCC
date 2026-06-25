import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/navigation/Sidebar';
import { Topbar } from '../../components/navigation/Topbar';
import { useAuth } from '../../hooks/useAuth';
import styles from './AppShell.module.scss';

export function AppShell() {
  const { logout, user } = useAuth();

  return (
    <div className={styles.appShell}>
      <Sidebar userRole={user?.nivel_acesso ?? null} />

      <div className={styles.workspace}>
        <Topbar user={user} onLogout={logout} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
