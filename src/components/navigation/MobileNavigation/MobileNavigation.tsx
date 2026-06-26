import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import logo from '../../../assets/logo.png';
import { canAccessNavigationItem, navigationItems } from '../../../config/navigation';
import type { NivelAcesso } from '../../../types';
import styles from './MobileNavigation.module.scss';

type MobileNavigationProps = {
  isOpen: boolean;
  onClose: () => void;
  userRole?: NivelAcesso | null;
};

export function MobileNavigation({ isOpen, onClose, userRole }: MobileNavigationProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const visibleItems = navigationItems.filter((item) => canAccessNavigationItem(item, userRole));

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className={styles.overlay}
          role="presentation"
          onMouseDown={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.section
            id="mobile-navigation"
            className={styles.panel}
            aria-label="Menu principal"
            aria-modal="true"
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
            initial={{ x: -28, opacity: 0, filter: 'blur(5px)' }}
            animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ x: -24, opacity: 0, filter: 'blur(5px)' }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className={styles.header}>
              <motion.div
                className={styles.brand}
                whileHover={{ scale: 1.015, filter: 'drop-shadow(0 0 16px rgba(91, 200, 255, 0.32))' }}
              >
                <img src={logo} alt="" />
                <div>
                  <strong>TSEA</strong>
                  <span>Solucao a Vacuo</span>
                </div>
              </motion.div>

              <motion.button
                ref={closeButtonRef}
                type="button"
                className={styles.closeButton}
                aria-label="Fechar menu"
                onClick={onClose}
                whileHover={{ scale: 1.07, rotate: 3 }}
                whileTap={{ scale: 0.94 }}
              >
                <X size={20} aria-hidden="true" />
              </motion.button>
            </header>

            <nav className={styles.nav}>
              {visibleItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.035 * index, duration: 0.2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <NavLink
                      className={({ isActive }) =>
                        isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                      }
                      to={item.path}
                      onClick={onClose}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>
                  </motion.div>
                );
              })}
            </nav>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
