import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileNavigation } from '../../components/navigation/MobileNavigation';
import { Sidebar } from '../../components/navigation/Sidebar';
import { Topbar } from '../../components/navigation/Topbar';
import { useAuth } from '../../hooks/useAuth';
import styles from './AppShell.module.scss';

export function AppShell() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMobileMenu, isMobileMenuOpen]);

  return (
    <div className={styles.appShell}>
      <Sidebar userRole={user?.nivel_acesso ?? null} />

      <div className={styles.workspace}>
        <Topbar
          isMenuOpen={isMobileMenuOpen}
          menuButtonRef={menuButtonRef}
          onLogout={logout}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          user={user}
        />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className={styles.content}
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>

      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        userRole={user?.nivel_acesso ?? null}
      />
    </div>
  );
}
