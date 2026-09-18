import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faCalendar,
  faUsers,
  faBoxesStacked,
  faChartPie,
  faFileInvoice,
  faMoneyBillWave,
  faGear,
  faBars,
  faTimes,
  faBell,
  faMoon,
  faSun,
  faSignOutAlt,
  faCalendarAlt,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import './ERPLayout.css';

const ERPLayout = ({ children, totalCustomers = 0, totalSuppliers = 0, totalProducts = 0, totalStocks = 0, pageTitle, breadcrumbCurrent }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('erp_theme') === 'dark';
  });

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('erp_theme', nextMode ? 'dark' : 'light');
    if (nextMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }, [isDarkMode]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  // Tamil-formatted current date
  const currentDateFormatted = new Date().toLocaleDateString(
    i18n.language === 'ta' ? 'ta-IN' : 'en-IN',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const isHomePage = location.pathname === '/';
  const isEntriesPage = location.pathname === '/entries';
  const isStocksPage = location.pathname === '/stocks';
  const isSupplierPage = location.pathname === '/suppliers';
  const isProductPage = location.pathname === '/products';
  const isDebitCreditPage = location.pathname === '/debit-credit';
  const isReportPage = location.pathname === '/report';
  const isSettingsPage = location.pathname === '/settings';
  const isUsersPage = location.pathname === '/users';
  const currentPageTitle = breadcrumbCurrent || (
    isHomePage ? (t('dashboard_title') || 'முகப்பு') :
    isEntriesPage ? (t('daily_entries_title') || 'நாள் பதிவுகள்') :
    isStocksPage ? (t('inventory_title') || 'இருப்பு') :
    isProductPage ? (t('products_title') || 'பொருட்கள்') :
    isSupplierPage ? (t('suppliers_title') || 'சப்ளையர்கள்') :
    isDebitCreditPage ? (t('debit_credit_title') || t('debitCredit') || 'பற்று / வரவு') :
    isReportPage ? (t('reports.title') || 'அறிக்கைகள்') :
    isSettingsPage ? (t('settings_title') || t('settings') || 'அமைப்புகள்') :
    isUsersPage ? (t('user_management') || 'பயனர்கள்') :
    (t('customers_title') || 'வாடிக்கையாளர்கள்')
  );

  const navItems = [
    { path: '/', labelKey: 'quick_nav_home', defaultLabel: 'முகப்பு', icon: faHouse },
    { path: '/entries', labelKey: 'quick_nav_entries', defaultLabel: 'நாள் பதிவுகள்', icon: faCalendar },
    {
      path: '/customers',
      labelKey: 'customers_title',
      defaultLabel: 'வாடிக்கையாளர்கள்',
      icon: faUsers,
      badge: totalCustomers > 0 ? totalCustomers : null
    },
    {
      path: '/suppliers',
      labelKey: 'suppliers_title',
      defaultLabel: 'சப்ளையர்கள்',
      icon: faUsers,
      badge: totalSuppliers > 0 ? totalSuppliers : null
    },
    {
      path: '/products',
      labelKey: 'products_title',
      defaultLabel: 'பொருட்கள்',
      icon: faBoxesStacked,
      badge: totalProducts > 0 ? totalProducts : null
    },
    {
      path: '/stocks',
      labelKey: 'inventory_title',
      defaultLabel: 'இருப்பு',
      icon: faChartPie,
      badge: totalStocks > 0 ? totalStocks : null
    },
    { path: '/debit-credit', labelKey: 'debitCredit', defaultLabel: 'பற்று / வரவு', icon: faMoneyBillWave },
    { path: '/report', labelKey: 'report', defaultLabel: 'அறிக்கைகள்', icon: faFileInvoice },
    { path: '/settings', labelKey: 'settings', defaultLabel: 'அமைப்புகள்', icon: faGear },
  ];

  return (
    <div className={`erp-app-shell ${isDarkMode ? 'erp-dark' : ''}`}>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`erp-mobile-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Royal Violet Sidebar (Desktop 250px) */}
      <aside className={`erp-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="erp-sidebar-brand">
          <div className="erp-brand-icon">
            <FontAwesomeIcon icon={faBoxesStacked} />
          </div>
          <div className="erp-brand-text">
            <span className="erp-brand-title">{t('ganthimathi') || 'ஸ்ரீ காந்திமதி மலரகம்'}</span>
            <span className="erp-brand-subtitle">FloweBill ERP 2026</span>
          </div>
          {mobileOpen && (
            <button
              className="erp-icon-btn ms-auto text-white border-0"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        <nav className="erp-sidebar-nav">
          <div className="erp-nav-section-title">{t('main_menu') || 'முதன்மை மெனு'}</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`erp-nav-item ${isActive ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={item.icon} className="erp-nav-icon" />
                <span>{t(item.labelKey) || item.defaultLabel}</span>
                {item.badge && <span className="erp-nav-badge">{item.badge}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="erp-sidebar-footer">
          <div className="erp-user-info">
            <div className="erp-user-avatar">
              {(user?.name || user?.username || 'A')[0].toUpperCase()}
            </div>
            <div className="erp-user-details">
              <span className="erp-user-name">{user?.name || user?.username || 'நிர்வாகி'}</span>
              <span className="erp-user-role">{user?.role || 'Admin'}</span>
            </div>
          </div>
          <button
            className="erp-logout-btn"
            onClick={logout}
            title={t('logout') || 'வெளியேறு'}
            aria-label="Logout"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="erp-main-area">
        {/* Compact Top Header */}
        <header className="erp-top-header">
          <div className="erp-header-left">
            <button
              className="erp-mobile-menu-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>

            <div className="erp-breadcrumb">
              <Link to="/">{t('quick_nav_home') || 'முகப்பு'}</Link>
              <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '0.65rem' }} />
              <span className="erp-breadcrumb-current">
                {currentPageTitle}
              </span>
            </div>
          </div>

          <div className="erp-header-right">
            {/* Tamil Date Badge */}
            <div className="erp-date-badge">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-primary" />
              <span>{currentDateFormatted}</span>
            </div>

            {/* Language Switcher */}
            <div className="erp-lang-switcher">
              <button
                className={`erp-lang-btn ${i18n.language === 'ta' ? 'active' : ''}`}
                onClick={() => changeLanguage('ta')}
              >
                தமிழ்
              </button>
              <button
                className={`erp-lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
              >
                EN
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              className="erp-icon-btn"
              onClick={toggleDarkMode}
              title={isDarkMode ? t('light_mode') : t('dark_mode')}
              aria-label="Toggle dark mode"
            >
              <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
            </button>

            {/* Notifications Bell */}
            <button
              className="erp-icon-btn"
              title={t('notifications') || 'அறிவிப்புகள்'}
              aria-label="Notifications"
            >
              <FontAwesomeIcon icon={faBell} />
              <span className="erp-notif-dot"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="erp-page-content">{children}</main>
      </div>

      {/* Genuine Mobile Bottom Navigation (High-Frequency Actions) */}
      <nav className="erp-mobile-bottom-nav">
        <div className="erp-mobile-nav-items">
          <Link
            to="/"
            className={`erp-mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faHouse} />
            <span>{t('quick_nav_home') || 'முகப்பு'}</span>
          </Link>
          <Link
            to="/customers"
            className={`erp-mobile-nav-link ${location.pathname === '/customers' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faUsers} />
            <span>{t('customers_title') || 'வாடிக்கையாளர்'}</span>
          </Link>
          <Link
            to="/suppliers"
            className={`erp-mobile-nav-link ${location.pathname === '/suppliers' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faUsers} />
            <span>{t('suppliers_title') || 'சப்ளையர்'}</span>
          </Link>
          <Link
            to="/products"
            className={`erp-mobile-nav-link ${location.pathname === '/products' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faBoxesStacked} />
            <span>{t('products_title') || 'பொருட்கள்'}</span>
          </Link>
          <Link
            to="/stocks"
            className={`erp-mobile-nav-link ${location.pathname === '/stocks' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faChartPie} />
            <span>{t('inventory_title') || 'இருப்பு'}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default ERPLayout;
