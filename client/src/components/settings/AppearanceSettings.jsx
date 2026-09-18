import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLanguage,
  faSun,
  faMoon,
  faCheckCircle,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

const AppearanceSettings = ({ isDarkMode, onToggleTheme, onShowToast }) => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
    if (onShowToast) {
      onShowToast(t('settings_saved_success') || 'அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டது');
    }
  };

  const handleThemeChange = (dark) => {
    if (dark !== isDarkMode) {
      onToggleTheme();
      if (onShowToast) {
        onShowToast(t('settings_saved_success') || 'அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டது');
      }
    }
  };

  return (
    <div className="erp-settings-panel">
      <div className="settings-panel-header">
        <div>
          <h3 className="settings-panel-title">
            {t('settings_appearance_title') || 'மொழி மற்றும் காட்சி தோற்றம்'}
          </h3>
          <p className="settings-panel-desc">
            {t('settings_appearance_desc') || 'பயன்பாட்டின் மொழி மற்றும் திரை நிற அமைப்பைத் தேர்ந்தெடுக்கவும்'}
          </p>
        </div>
      </div>

      <div className="settings-section-divider">
        <h4 className="settings-subheading">
          <FontAwesomeIcon icon={faLanguage} className="me-2 text-primary" />
          {t('settings_lang_label') || 'பயன்பாட்டு மொழி'}
        </h4>
        <div className="settings-options-grid">
          <div
            className={`settings-card-option ${i18n.language === 'ta' ? 'selected' : ''}`}
            onClick={() => handleLanguageChange('ta')}
            id="opt-lang-ta"
            role="button"
            tabIndex={0}
          >
            <div className="settings-option-content">
              <div className="settings-option-badge">தமிழ்</div>
              <div className="settings-option-name">தமிழ் (Tamil)</div>
              <div className="settings-option-desc">இயல்புநிலை தமிழ் பயனர் இடைமுகம்</div>
            </div>
            {i18n.language === 'ta' && (
              <FontAwesomeIcon icon={faCheckCircle} className="settings-option-check" />
            )}
          </div>

          <div
            className={`settings-card-option ${i18n.language === 'en' ? 'selected' : ''}`}
            onClick={() => handleLanguageChange('en')}
            id="opt-lang-en"
            role="button"
            tabIndex={0}
          >
            <div className="settings-option-content">
              <div className="settings-option-badge">EN</div>
              <div className="settings-option-name">English</div>
              <div className="settings-option-desc">Standard English UI Interface</div>
            </div>
            {i18n.language === 'en' && (
              <FontAwesomeIcon icon={faCheckCircle} className="settings-option-check" />
            )}
          </div>
        </div>
      </div>

      <div className="settings-section-divider mt-4">
        <h4 className="settings-subheading">
          <FontAwesomeIcon icon={faSun} className="me-2 text-warning" />
          {t('settings_theme_label') || 'திரை நிற முறை (Theme)'}
        </h4>
        <div className="settings-options-grid">
          <div
            className={`settings-card-option ${!isDarkMode ? 'selected' : ''}`}
            onClick={() => handleThemeChange(false)}
            id="opt-theme-light"
            role="button"
            tabIndex={0}
          >
            <div className="settings-option-content">
              <div className="settings-theme-preview light">
                <div className="theme-preview-sidebar"></div>
                <div className="theme-preview-body">
                  <div className="theme-preview-bar"></div>
                  <div className="theme-preview-card"></div>
                </div>
              </div>
              <div className="settings-option-name">
                <FontAwesomeIcon icon={faSun} className="me-1 text-warning" />
                {t('settings_theme_light') || 'வெளிச்ச முறை (Light)'}
              </div>
              <div className="settings-option-desc">பிரகாசமான வெள்ளை பின்னணி</div>
            </div>
            {!isDarkMode && (
              <FontAwesomeIcon icon={faCheckCircle} className="settings-option-check" />
            )}
          </div>

          <div
            className={`settings-card-option ${isDarkMode ? 'selected' : ''}`}
            onClick={() => handleThemeChange(true)}
            id="opt-theme-dark"
            role="button"
            tabIndex={0}
          >
            <div className="settings-option-content">
              <div className="settings-theme-preview dark">
                <div className="theme-preview-sidebar dark"></div>
                <div className="theme-preview-body dark">
                  <div className="theme-preview-bar dark"></div>
                  <div className="theme-preview-card dark"></div>
                </div>
              </div>
              <div className="settings-option-name">
                <FontAwesomeIcon icon={faMoon} className="me-1 text-indigo" />
                {t('settings_theme_dark') || 'இருள் முறை (Dark)'}
              </div>
              <div className="settings-option-desc">கண்களுக்கு இதமான இருண்ட பின்னணி</div>
            </div>
            {isDarkMode && (
              <FontAwesomeIcon icon={faCheckCircle} className="settings-option-check" />
            )}
          </div>
        </div>
      </div>

      <div className="settings-section-divider mt-4">
        <h4 className="settings-subheading">
          <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-info" />
          {t('calendar_settings') || 'நாட்காட்டி விருப்பத்தேர்வு'}
        </h4>
        <div className="settings-info-box">
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary">தமிழ் நாட்காட்டி</span>
            <span className="text-secondary small">• ஆங்கில நாட்காட்டியுடன் இணைந்தது</span>
          </div>
          <p className="small text-muted mb-0">
            தமிழ் மலர் சந்தை பாரம்பரிய முறையில் தமிழ் மாதம் (சித்திரை முதல் பங்குனி வரை) மற்றும் தமிழ் தேதிகள் கணினி மூலம் தானாகவே கணக்கிடப்படுகின்றன.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
