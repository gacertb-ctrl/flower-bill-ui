import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faMapMarkerAlt,
  faImage,
  faSave,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

const BusinessSettings = ({ orgData, onSave, saving = false }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    logo_url: ''
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (orgData) {
      setFormData({
        name: orgData.name || '',
        address: orgData.address || '',
        logo_url: orgData.logo_url || ''
      });
      setHasChanges(false);
    }
  }, [orgData]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    setHasChanges(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setHasChanges(false);
  };

  return (
    <div className="erp-settings-panel">
      <div className="settings-panel-header">
        <div>
          <h3 className="settings-panel-title">
            {t('settings_business_title') || 'வணிக சுயவிவர அமைப்புகள்'}
          </h3>
          <p className="settings-panel-desc">
            {t('settings_business_desc') || 'உங்கள் நிறுவனத்தின் பெயர் மற்றும் தொடர்பு முகவரியை நிர்வகிக்கவும்'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {/* Organization Name */}
        <div className="settings-form-group">
          <label htmlFor="input-org-name" className="settings-form-label">
            {t('settings_org_name') || 'வணிகப் பெயர் / மலரகம் பெயர்'}
            <span className="text-danger ms-1">*</span>
          </label>
          <div className="settings-input-wrapper">
            <FontAwesomeIcon icon={faBuilding} className="settings-input-icon" />
            <input
              id="input-org-name"
              type="text"
              className="settings-form-input"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="எ.கா. ஸ்ரீ காந்திமதி மலரகம்"
              required
              disabled={saving}
            />
          </div>
        </div>

        {/* Organization Address */}
        <div className="settings-form-group">
          <label htmlFor="input-org-address" className="settings-form-label">
            {t('settings_org_address') || 'வணிக முகவரி'}
            <span className="text-danger ms-1">*</span>
          </label>
          <div className="settings-input-wrapper">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="settings-input-icon" />
            <input
              id="input-org-address"
              type="text"
              className="settings-form-input"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="எ.கா. திருநெல்வேலி ஜங்ஷன், திருநெல்வேலி - 627001"
              required
              disabled={saving}
            />
          </div>
        </div>

        {/* Logo URL */}
        <div className="settings-form-group">
          <label htmlFor="input-org-logo" className="settings-form-label">
            {t('settings_org_logo') || 'லோகோ URL (விரும்பினால்)'}
          </label>
          <div className="settings-input-wrapper">
            <FontAwesomeIcon icon={faImage} className="settings-input-icon" />
            <input
              id="input-org-logo"
              type="url"
              className="settings-form-input"
              value={formData.logo_url}
              onChange={(e) => handleChange('logo_url', e.target.value)}
              placeholder="https://example.com/logo.png"
              disabled={saving}
            />
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="settings-form-actions">
          <button
            type="submit"
            className="btn-settings-primary"
            disabled={saving}
            id="btn-save-business-settings"
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>{t('settings_saving_btn') || 'சேமிக்கப்படுகிறது...'}</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                <span>{t('settings_save_btn') || 'மாற்றங்களைச் சேமிக்கவும்'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessSettings;
