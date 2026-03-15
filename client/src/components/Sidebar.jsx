import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHouse, faCalendar, faListCheck, faChartPie, faFileLines,
  faFile, faUsers, faGear
} from '@fortawesome/free-solid-svg-icons';
import '../styles/Sidebar.css';

function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active-link' : '';

  if (!user) return null;

  return (
    <aside className="saas-sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"></div>
        <span className="fw-bold">{t('appTitle') || "Flowebill"}</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <p className="section-title">{t('main_menu') || 'MAIN'}</p>
          <ul className="nav-list">
            <li>
              <Link className={`sidebar-link ${isActive('/')}`} to="/">
                <FontAwesomeIcon icon={faHouse} className="sidebar-icon" /> {t('dashboard')}
              </Link>
            </li>
            <li>
              <Link className={`sidebar-link ${isActive('/entries')}`} to="/entries">
                <FontAwesomeIcon icon={faCalendar} className="sidebar-icon" /> {t('Daily Entries')}
              </Link>
            </li>
            <li>
              <Link className={`sidebar-link ${isActive('/report')}`} to="/report">
                <FontAwesomeIcon icon={faChartPie} className="sidebar-icon" /> {t('report')}
              </Link>
            </li>
          </ul>
        </div>

        <div className="nav-section mt-4">
          <p className="section-title">{t('inventory_menu') || 'INVENTORY'}</p>
          <ul className="nav-list">
            <li>
              <Link className={`sidebar-link ${isActive('/products')}`} to="/products">
                <FontAwesomeIcon icon={faListCheck} className="sidebar-icon" /> {t('product')}
              </Link>
            </li>
            <li>
              <Link className={`sidebar-link ${isActive('/stocks')}`} to="/stocks">
                <FontAwesomeIcon icon={faFileLines} className="sidebar-icon" /> {t('stocks')}
              </Link>
            </li>
          </ul>
        </div>

        <div className="nav-section mt-4">
          <p className="section-title">{t('directory_menu') || 'DIRECTORY'}</p>
          <ul className="nav-list">
            <li>
              <Link className={`sidebar-link ${isActive('/customers')}`} to="/customers">
                <FontAwesomeIcon icon={faUsers} className="sidebar-icon" /> {t('customer')}
              </Link>
            </li>
            <li>
              <Link className={`sidebar-link ${isActive('/suppliers')}`} to="/suppliers">
                <FontAwesomeIcon icon={faUsers} className="sidebar-icon" /> {t('supplier')}
              </Link>
            </li>
          </ul>
        </div>

        <div className="nav-section mt-auto">
          <p className="section-title">{t('administration_menu') || 'ADMINISTRATION'}</p>
          <ul className="nav-list">
            <li>
              <Link className={`sidebar-link ${isActive('/debit-credit')}`} to="/debit-credit">
                <FontAwesomeIcon icon={faFile} className="sidebar-icon" /> {t('debitCredit')}
              </Link>
            </li>
            <li className="mt-3">
              <Link className={`sidebar-link ${isActive('/settings')}`} to="/settings">
                <FontAwesomeIcon icon={faGear} className="sidebar-icon" /> {t('settings')}
              </Link>
            </li>
            {user.role === 'admin' && (
              <li>
                <Link className={`sidebar-link ${isActive('/users')}`} to="/users">
                  <FontAwesomeIcon icon={faUsers} className="sidebar-icon" /> {t('manage_users')}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;