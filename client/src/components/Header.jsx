import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell, faPlus } from '@fortawesome/free-solid-svg-icons';
import '../styles/Header.css';

function Header() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  useEffect(() => {
    document.title = t('appTitle') || 'My App';
  }, [t]);

  if (!user) return null;

  return (
    <header className="saas-header">
      <div className="header-left">
        <h1 className="greeting">{t('hi')}, {user.username || 'Admin'}</h1>
      </div>

      <div className="header-right">
        {/* Language Switcher */}
        <div className="btn-group shadow-sm rounded-pill overflow-hidden me-2" role="group">
          <button 
            type="button" 
            className={`btn btn-sm ${i18n.language === 'en' ? 'btn-primary' : 'btn-light text-muted'}`}
            onClick={() => handleLanguageChange('en')}
          >
            EN
          </button>
          <button 
            type="button" 
            className={`btn btn-sm ${i18n.language === 'ta' ? 'btn-primary' : 'btn-light text-muted'}`}
            onClick={() => handleLanguageChange('ta')}
          >
            தமிழ்
          </button>
        </div>

        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input type="text" placeholder={t('searchPlaceholder')} />
        </div>

        <button className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-3">
          <FontAwesomeIcon icon={faPlus} />
          {t('create')}
        </button>

        <button className="icon-btn position-relative">
          <FontAwesomeIcon icon={faBell} />
          <span className="notification-dot"></span>
        </button>

        <div className="user-avatar">
          {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
}

export default Header;