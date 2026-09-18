import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faPalette,
  faShieldAlt,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import './SettingsNav.css';

const SettingsNav = ({ activeTab = 'business', onSelectTab, isAdmin = false }) => {
  const { t } = useTranslation();

  const categories = [
    {
      id: 'business',
      label: t('settings_tab_business') || 'வணிக அமைப்புகள்',
      icon: faBuilding
    },
    {
      id: 'appearance',
      label: t('settings_tab_appearance') || 'மொழி & தோற்றம்',
      icon: faPalette
    },
    {
      id: 'whatsapp',
      label: t('settings_tab_whatsapp') || 'வாட்ஸ்அப் இணைப்பு',
      icon: faWhatsapp
    },
    {
      id: 'security',
      label: t('settings_tab_security') || 'பாதுகாப்பு & கடவுச்சொல்',
      icon: faShieldAlt
    },
    ...(isAdmin ? [{
      id: 'staff',
      label: t('settings_tab_staff') || 'பணியாளர்கள் மேலாண்மை',
      icon: faUsers
    }] : [])
  ];

  return (
    <>
      {/* Desktop Vertical Menu (d-none d-lg-block) */}
      <div className="settings-nav-card d-none d-lg-block">
        <ul className="settings-nav-list" role="tablist">
          {categories.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  className={`settings-nav-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectTab(cat.id)}
                  id={`tab-btn-${cat.id}`}
                  role="tab"
                  aria-selected={isActive}
                >
                  <FontAwesomeIcon icon={cat.icon} className="settings-nav-icon" />
                  <span>{cat.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Mobile Horizontal Pill Strip (d-lg-none) */}
      <div className="settings-mobile-nav d-lg-none" role="tablist">
        {categories.map((cat) => {
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className={`settings-mobile-pill ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(cat.id)}
              id={`mob-tab-btn-${cat.id}`}
              role="tab"
              aria-selected={isActive}
            >
              <FontAwesomeIcon icon={cat.icon} style={{ fontSize: '0.85rem' }} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};

export default SettingsNav;
