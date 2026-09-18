import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/authAPI';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faLock,
  faEye,
  faEyeSlash,
  faSun,
  faMoon,
  faShieldAlt,
  faExclamationCircle,
  faInfoCircle,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import './LoginPage.css';

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState(() => localStorage.getItem('saved_username') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('saved_username')));
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminHelp, setShowAdminHelp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('erp_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

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

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    const errors = {};

    if (!username.trim()) {
      errors.username = t('login_err_username_required') || 'தயவுசெய்து பயனர்பெயரை உள்ளிடவும்';
    }
    if (!password) {
      errors.password = t('login_err_password_required') || 'தயவுசெய்து கடவுச்சொல்லை உள்ளிடவும்';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const { token, refreshToken, user } = await loginUser(username.trim(), password);
      
      if (rememberMe) {
        localStorage.setItem('saved_username', username.trim());
      } else {
        localStorage.removeItem('saved_username');
      }

      login(token, refreshToken, user);
    } catch (err) {
      // Friendly message
      let msg = err.message || '';
      if (msg.includes('Invalid username or password') || msg.includes('401') || msg.includes('Invalid credentials')) {
        msg = t('login_err_invalid_credentials') || 'பயனர்பெயர் அல்லது கடவுச்சொல் தவறானது';
      } else if (msg.includes('Network') || msg.includes('failed')) {
        msg = t('login_err_network') || 'சேவையக இணைப்பு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்';
      }
      setError(msg || (t('login_err_invalid_credentials') || 'பயனர்பெயர் அல்லது கடவுச்சொல் தவறானது'));
      setLoading(false);
    }
  };

  return (
    <div className="erp-login-wrapper">
      {/* Top Floating Actions: Language Switch & Theme Toggle */}
      <header className="erp-login-topbar">
        <div className="login-lang-switch">
          <button
            type="button"
            className={`login-lang-pill ${i18n.language === 'ta' ? 'active' : ''}`}
            onClick={() => changeLanguage('ta')}
            aria-label="தமிழ் மொழிக்கு மாற்று"
            id="btn-login-lang-ta"
          >
            தமிழ்
          </button>
          <button
            type="button"
            className={`login-lang-pill ${i18n.language === 'en' ? 'active' : ''}`}
            onClick={() => changeLanguage('en')}
            aria-label="Switch to English"
            id="btn-login-lang-en"
          >
            EN
          </button>
        </div>

        <button
          type="button"
          className="login-theme-btn"
          onClick={toggleDarkMode}
          aria-label="Toggle Theme"
          id="btn-login-theme-toggle"
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
        >
          <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
        </button>
      </header>

      {/* Main Centered Login Card */}
      <main className="erp-login-card-container">
        <div className="erp-login-card">
          {/* Subtle Flower Brand Logo & Header */}
          <div className="login-brand-block">
            <div className="login-flower-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C16 2 20 8 20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12C12 8 16 2 16 2Z" fill="#6D28D9" />
                <path d="M16 30C16 30 12 24 12 20C12 17.7909 13.7909 16 16 16C18.2091 16 20 17.7909 20 20C20 24 16 30 16 30Z" fill="#6D28D9" />
                <path d="M2 16C2 16 8 12 12 12C14.2091 12 16 13.7909 16 16C16 18.2091 14.2091 20 12 20C8 20 2 16 2 16Z" fill="#DB2777" />
                <path d="M30 16C30 16 24 20 20 20C17.7909 20 16 18.2091 16 16C16 13.7909 17.7909 12 20 12C24 12 30 16 30 16Z" fill="#DB2777" />
                <circle cx="16" cy="16" r="3.5" fill="#FBBF24" />
              </svg>
            </div>
            <h1 className="login-brand-title">{t('login_brand_name') || '🌸 பூ மார்க்கெட்'}</h1>
            <div className="login-brand-subtitle">
              <span>{t('login_brand_sub') || 'பில்லிங் சிஸ்டம்'}</span>
              <span>•</span>
              <span>{t('login_city') || 'திருநெல்வேலி'}</span>
            </div>
          </div>

          {/* Heading Section */}
          <div className="login-heading-section">
            <h2 className="login-main-heading">{t('login_heading') || 'உள்நுழைய'}</h2>
            <p className="login-sub-text">{t('login_description') || 'உங்கள் கணக்கில் உள்நுழைய விவரங்களை உள்ளிடவும்'}</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="login-alert-banner" role="alert" id="login-alert-banner">
              <FontAwesomeIcon icon={faExclamationCircle} className="login-alert-icon" />
              <div>{error}</div>
            </div>
          )}

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Username Field */}
            <div className="login-field-group">
              <label htmlFor="login-username-input" className="login-label">
                {t('login_username_label') || 'பயனர்பெயர்'}
              </label>
              <div className="login-input-box">
                <FontAwesomeIcon icon={faUser} className="login-field-icon" />
                <input
                  id="login-username-input"
                  type="text"
                  className={`login-field-input ${fieldErrors.username ? 'has-error' : ''}`}
                  placeholder={t('login_username_placeholder') || 'பயனர்பெயரை உள்ளிடவும்'}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (fieldErrors.username) {
                      const next = { ...fieldErrors };
                      delete next.username;
                      setFieldErrors(next);
                    }
                  }}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
              {fieldErrors.username && (
                <div className="login-inline-error" id="err-username">{fieldErrors.username}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="login-field-group">
              <label htmlFor="login-password-input" className="login-label">
                {t('login_password_label') || 'கடவுச்சொல்'}
              </label>
              <div className="login-input-box">
                <FontAwesomeIcon icon={faLock} className="login-field-icon" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  className={`login-field-input ${fieldErrors.password ? 'has-error' : ''}`}
                  placeholder={t('login_password_placeholder') || 'கடவுச்சொல்லை உள்ளிடவும்'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      const next = { ...fieldErrors };
                      delete next.password;
                      setFieldErrors(next);
                    }
                  }}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="login-pwd-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? (t('login_hide_password') || 'கடவுச்சொல்லை மறை') : (t('login_show_password') || 'கடவுச்சொல்லைக் காட்டு')}
                  id="btn-toggle-password"
                  tabIndex={-1}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {fieldErrors.password && (
                <div className="login-inline-error" id="err-password">{fieldErrors.password}</div>
              )}
            </div>

            {/* Remember Me & Admin Help */}
            <div className="login-options-row">
              <label className="login-remember-wrap">
                <input
                  type="checkbox"
                  className="login-remember-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  id="checkbox-remember-me"
                />
                <span>{t('login_remember_me') || 'என்னை நினைவில் கொள்க'}</span>
              </label>

              <button
                type="button"
                className="login-help-link"
                onClick={() => setShowAdminHelp(!showAdminHelp)}
                id="btn-login-admin-help"
              >
                {t('login_admin_help') || 'உதவிக்கு நிர்வாகி'}
              </button>
            </div>

            {/* Admin Support Message Drawer/Alert */}
            {showAdminHelp && (
              <div className="login-admin-alert" id="admin-help-box">
                <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                <span>
                  {i18n.language === 'ta'
                    ? 'கடவுச்சொல் மறந்தாலோ அல்லது புதிய கணக்கு தேவைப்பட்டாலோ கணினி நிர்வாகியை (Administrator) தொடர்பு கொள்ளவும்.'
                    : 'Please contact your system administrator if you forgot your password or need account credentials.'}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-login-submit"
              disabled={loading}
              id="btn-login-submit"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>{t('login_submitting_btn') || 'உள்நுழைகிறது...'}</span>
                </>
              ) : (
                <>
                  <span>{t('login_submit_btn') || 'உள்நுழைய'}</span>
                  <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '0.8125rem' }} />
                </>
              )}
            </button>
          </form>

          {/* Trust Footer */}
          <div className="login-trust-footer">
            <FontAwesomeIcon icon={faShieldAlt} className="login-trust-icon" />
            <span>{t('login_security_badge') || 'பாதுகாப்பான ERP உள்நுழைவு • 2026'}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;