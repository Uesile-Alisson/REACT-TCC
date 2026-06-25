import { LogOut, RadioTower, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getNavigationItemByPath } from '../../../config/navigation';
import { useMqttHardwareRealtime } from '../../../hooks/useMqttHardwareRealtime';
import type { AuthUser } from '../../../types';
import styles from './Topbar.module.scss';

type TopbarProps = {
  user: AuthUser | null;
  onLogout: () => void;
};

function formatProfile(user: AuthUser | null): string {
  if (!user) {
    return 'Sessao autenticada';
  }

  if (user.nivel_acesso === 'TECNICO') {
    return 'Tecnico';
  }

  if (user.nivel_acesso === 'ADMINISTRADOR') {
    return 'Administrador';
  }

  return 'Operador';
}

export function Topbar({ user, onLogout }: TopbarProps) {
  const location = useLocation();
  const activeItem = getNavigationItemByPath(location.pathname);
  const { isConnected, isConnecting, esp32Online } = useMqttHardwareRealtime();

  return (
    <header className={styles.topbar}>
      <div>
        <p className={styles.overline}>Area autenticada</p>
        <h1>{activeItem?.label ?? 'TSEA'}</h1>
      </div>

      <div className={styles.actions}>
        <span className={styles.statusBadge}>
          <RadioTower size={16} aria-hidden="true" />
          {isConnected ? 'Realtime online' : isConnecting ? 'Realtime conectando' : 'Realtime offline'}
        </span>
        <span className={styles.statusBadge}>ESP32 {esp32Online === true ? 'online' : 'status pendente'}</span>
        <span className={styles.userBadge}>
          <ShieldCheck size={16} aria-hidden="true" />
          {user ? `${user.nome} / ${formatProfile(user)}` : formatProfile(user)}
        </span>
        <button className={styles.logoutButton} type="button" onClick={onLogout}>
          <LogOut size={16} aria-hidden="true" />
          Sair
        </button>
      </div>
    </header>
  );
}
