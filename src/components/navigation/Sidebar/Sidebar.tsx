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
    <aside className={styles.sidebar} aria-label="Menu principal">
      <div className={styles.brand}>
        <img src={logo} alt="" />
        <div>
          <strong>TSEA</strong>
          <span>Solucao a Vacuo</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {visibleItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
              }
              to={item.path}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <span>Backend como fonte final de permissao</span>
      </div>
    </aside>
  );
}
