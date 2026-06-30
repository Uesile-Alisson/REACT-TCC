import type { RefObject } from 'react';
import { motion } from 'framer-motion';
import { Menu, RadioTower } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getNavigationItemByPath } from '../../../config/navigation';
import { useMqttHardwareRealtime } from '../../../hooks/useMqttHardwareRealtime';
import type { AuthUser } from '../../../types';
import { UserProfilePopover } from '../UserProfilePopover';
import styles from './Topbar.module.scss';

type TopbarProps = {
  isMenuOpen: boolean;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  user: AuthUser | null;
  onLogout: () => void;
  onOpenMenu: () => void;
};

export function Topbar({ isMenuOpen, menuButtonRef, user, onLogout, onOpenMenu }: TopbarProps) {
  const location = useLocation();
  const activeItem = getNavigationItemByPath(location.pathname);
  const { isConnected, isConnecting, esp32Online } = useMqttHardwareRealtime();

  return (
    <motion.header
      className={styles.topbar}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div className={styles.titleGroup} layout>
        <motion.button
          ref={menuButtonRef}
          type="button"
          className={styles.menuButton}
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          aria-label="Abrir menu"
          onClick={onOpenMenu}
          whileHover={{ scale: 1.06, rotate: 2 }}
          whileTap={{ scale: 0.94 }}
        >
          <Menu size={20} aria-hidden="true" />
        </motion.button>

        <div>
          <p className={styles.overline}>Area autenticada</p>
          <h1>{activeItem?.label ?? 'TSEA'}</h1>
        </div>
      </motion.div>

      <div className={styles.actions}>
        <motion.span
          className={styles.statusBadge}
          animate={{ boxShadow: isConnected ? '0 0 22px rgba(64, 220, 153, 0.18)' : '0 0 18px rgba(255, 188, 96, 0.12)' }}
          whileHover={{ y: -2, scale: 1.02 }}
        >
          <RadioTower size={16} aria-hidden="true" />
          {isConnected ? 'Realtime online' : isConnecting ? 'Realtime conectando' : 'Realtime offline'}
        </motion.span>
        <motion.span className={styles.statusBadge} whileHover={{ y: -2, scale: 1.02 }}>
          ESP32 {esp32Online === true ? 'online' : 'status pendente'}
        </motion.span>
        <UserProfilePopover user={user} onLogout={onLogout} />
      </div>
    </motion.header>
  );
}
