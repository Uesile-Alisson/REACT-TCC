import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { canAccessNavigationItem, navigationItems } from '../../../config/navigation';
import type { NivelAcesso } from '../../../types';
import styles from './Sidebar.module.scss';

type SidebarProps = {
  userRole?: NivelAcesso | null;
};

export function Sidebar({ userRole }: SidebarProps) {
  const visibleItems = navigationItems.filter((item) => canAccessNavigationItem(item, userRole));

  return (
    <motion.aside
      className={styles.sidebar}
      aria-label="Menu principal"
      initial={{ x: -18, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={styles.brand}
        whileHover={{ scale: 1.015, filter: 'drop-shadow(0 0 16px rgba(91, 200, 255, 0.32))' }}
        transition={{ type: 'spring', stiffness: 360, damping: 24 }}
      >
        <img src={logo} alt="" />
        <div>
          <strong>TSEA</strong>
          <span>Solucao a Vacuo</span>
        </div>
      </motion.div>

      <nav className={styles.nav}>
        {visibleItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.035 * index, duration: 0.22 }}
              whileHover={{ x: 5, scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
            >
              <NavLink
                className={({ isActive }) =>
                  isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                }
                to={item.path}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      <motion.div
        className={styles.footer}
        animate={{ opacity: [0.72, 1, 0.72] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span>Backend como fonte final de permissao</span>
      </motion.div>
    </motion.aside>
  );
}
