import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLock,
  faKey,
  faEye,
  faEyeSlash,
  faSave,
  faShieldAlt,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

const SecuritySettings = ({ onSavePassword, saving = false }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setValidationError(t('settings_pwd_required') || 'அனைத்து கடவுச்சொல் புலங்களையும் உள்ளிடவும்');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setValidationError(t('settings_pwd_mismatch') || 'புதிய கடவுச்சொற்கள் பொருந்தவில்லை');
      return;
    }

    onSavePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    }, () => {
      // Reset on success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    });
  };

  return (
    <div className="erp-settings-panel">
      <div className="settings-panel-header">
        <div>
          <h3 className="settings-panel-title">
            <FontAwesomeIcon icon={faShieldAlt} className="me-2 text-primary" />
            {t('settings_security_title') || 'பாதுகாப்பு மற்றும் கடவுச்சொல் மாற்றம்'}
          </h3>
          <p className="settings-panel-desc">
            {t('settings_security_desc') || 'உங்கள் உள்நுழைவு கடவுச்சொல்லை பாதுகாப்பாக மாற்றவும்'}
          </p>
        </div>
      </div>

      {validationError && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 py-2 px-3 small rounded-3">
          <FontAwesomeIcon icon={faExclamationCircle} />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="settings-form">
        {/* Current Password */}
        <div className="settings-form-group">
          <label htmlFor="input-curr-pwd" className="settings-form-label">
            {t('settings_curr_pwd') || 'தற்போதைய கடவுச்சொல்'}
            <span className="text-danger ms-1">*</span>
          </label>
          <div className="settings-input-wrapper">
            <FontAwesomeIcon icon={faKey} className="settings-input-icon" />
            <input
              id="input-curr-pwd"
              type={showCurrent ? 'text' : 'password'}
              className="settings-form-input"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              placeholder="தற்போதைய கடவுச்சொல்"
              required
              disabled={saving}
            />
            <button
              type="button"
              className="settings-pwd-toggle-btn"
              onClick={() => setShowCurrent(!showCurrent)}
              tabIndex={-1}
              aria-label="Toggle Current Password"
            >
              <FontAwesomeIcon icon={showCurrent ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="settings-form-group">
          <label htmlFor="input-new-pwd" className="settings-form-label">
            {t('settings_new_pwd') || 'புதிய கடவுச்சொல்'}
            <span className="text-danger ms-1">*</span>
          </label>
          <div className="settings-input-wrapper">
            <FontAwesomeIcon icon={faLock} className="settings-input-icon" />
            <input
              id="input-new-pwd"
              type={showNew ? 'text' : 'password'}
              className="settings-form-input"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="புதிய கடவுச்சொல்"
              required
              disabled={saving}
            />
            <button
              type="button"
              className="settings-pwd-toggle-btn"
              onClick={() => setShowNew(!showNew)}
              tabIndex={-1}
              aria-label="Toggle New Password"
            >
              <FontAwesomeIcon icon={showNew ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="settings-form-group">
          <label htmlFor="input-confirm-pwd" className="settings-form-label">
            {t('settings_confirm_pwd') || 'புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்'}
            <span className="text-danger ms-1">*</span>
          </label>
          <div className="settings-input-wrapper">
            <FontAwesomeIcon icon={faLock} className="settings-input-icon" />
            <input
              id="input-confirm-pwd"
              type={showConfirm ? 'text' : 'password'}
              className="settings-form-input"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="புதிய கடவுச்சொல்லை மீண்டும் உள்ளிடவும்"
              required
              disabled={saving}
            />
            <button
              type="button"
              className="settings-pwd-toggle-btn"
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex={-1}
              aria-label="Toggle Confirm Password"
            >
              <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="settings-form-actions">
          <button
            type="submit"
            className="btn-settings-primary"
            disabled={saving}
            id="btn-save-password"
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>{t('settings_saving_btn') || 'சேமிக்கப்படுகிறது...'}</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                <span>{t('update_password') || 'கடவுச்சொல்லைப் புதுப்பிக்கவும்'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySettings;
