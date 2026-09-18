import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ERPLayout from '../components/layout/ERPLayout';
import SettingsNav from '../components/settings/SettingsNav';
import BusinessSettings from '../components/settings/BusinessSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import WhatsAppSettings from '../components/settings/WhatsAppSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import StaffSettings from '../components/settings/StaffSettings';
import {
  getOrgSettings,
  updateOrgSettings,
  changePassword,
  getStaff,
  createStaff,
  deleteStaff
} from '../api/settingsAPI';
import {
  getWhatsAppStatus,
  connectWhatsApp,
  disconnectWhatsApp
} from '../api/whatsappAPI';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import './SettingsPage.css';

const SettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('business');
  const [orgData, setOrgData] = useState({ name: '', address: '', logo_url: '' });
  const [savingOrg, setSavingOrg] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [waStatus, setWaStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loadingWa, setLoadingWa] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [toast, setToast] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('erp_theme') === 'dark';
  });

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('erp_theme', next ? 'dark' : 'light');
    if (next) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // Load Organization settings and WhatsApp status
  useEffect(() => {
    getOrgSettings()
      .then((data) => {
        if (data) setOrgData(data);
      })
      .catch(console.error);

    fetchWaStatus();

    if (isAdmin) {
      loadStaff();
    }
  }, [isAdmin]);

  const fetchWaStatus = async () => {
    try {
      const status = await getWhatsAppStatus();
      setWaStatus(status.instance?.state || 'close');
    } catch (error) {
      setWaStatus('close');
    }
  };

  const loadStaff = async () => {
    try {
      const data = await getStaff();
      if (Array.isArray(data)) setStaffList(data);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  // 1. Business Profile Update
  const handleSaveOrg = async (formData) => {
    setSavingOrg(true);
    try {
      await updateOrgSettings(formData);
      setOrgData(formData);
      showToast(t('settings_saved_success') || 'அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டது');
    } catch (error) {
      showToast(t('settings_save_failed') || 'அமைப்புகளைச் சேமிக்க முடியவில்லை', true);
    } finally {
      setSavingOrg(false);
    }
  };

  // 2. WhatsApp Connect / Disconnect
  const handleConnectWa = async () => {
    setLoadingWa(true);
    try {
      const res = await connectWhatsApp();
      if (res && res.base64) {
        setQrCode(res.base64);
        const interval = setInterval(async () => {
          const st = await getWhatsAppStatus();
          if (st.instance?.state === 'open') {
            setWaStatus('open');
            setQrCode(null);
            clearInterval(interval);
            showToast(t('settings_wa_status_connected') || 'வாட்ஸ்அப் இணைக்கப்பட்டுள்ளது');
          }
        }, 3000);
      }
    } catch (error) {
      showToast('வாட்ஸ்அப் இணைக்க முடியவில்லை', true);
    } finally {
      setLoadingWa(false);
    }
  };

  const handleDisconnectWa = async () => {
    const confirmMsg = t('settings_wa_disconnect_confirm') || 'நிச்சயமாக வாட்ஸ்அப் இணைப்பைத் துண்டிக்க விரும்புகிறீர்களா?';
    if (!window.confirm(confirmMsg)) return;

    setLoadingWa(true);
    try {
      await disconnectWhatsApp();
      setWaStatus('close');
      setQrCode(null);
      showToast('வாட்ஸ்அப் இணைப்பு துண்டிக்கப்பட்டது');
    } catch (error) {
      showToast('இணைப்பைத் துண்டிக்க முடியவில்லை', true);
    } finally {
      setLoadingWa(false);
    }
  };

  // 3. Password Update
  const handleSavePassword = async (pwdData, onSuccess) => {
    setSavingPwd(true);
    try {
      await changePassword(pwdData);
      showToast(t('settings_pwd_changed_success') || 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது');
      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error.response?.data?.error || 'கடவுச்சொல்லை மாற்ற முடியவில்லை';
      showToast(msg, true);
    } finally {
      setSavingPwd(false);
    }
  };

  // 4. Staff Management
  const handleCreateStaff = async (staffData, onSuccess) => {
    setCreatingStaff(true);
    try {
      await createStaff(staffData);
      showToast(t('settings_staff_created') || 'பணியாளர் வெற்றிகரமாக சேர்க்கப்பட்டார்');
      if (onSuccess) onSuccess();
      loadStaff();
    } catch (error) {
      showToast('பணியாளரைச் சேர்க்க முடியவில்லை', true);
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    const confirmMsg = t('settings_delete_staff_confirm') || 'இந்த பணியாளரை நிச்சயமாக நீக்க விரும்புகிறீர்களா?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteStaff(id);
      showToast(t('settings_staff_deleted') || 'பணியாளர் நீக்கப்பட்டார்');
      loadStaff();
    } catch (error) {
      showToast('பணியாளரை நீக்க முடியவில்லை', true);
    }
  };

  return (
    <ERPLayout>
      {/* Lightweight Toast Alert */}
      {toast && (
        <div className="settings-toast-container">
          <div className={`settings-toast ${toast.isError ? 'error' : ''}`}>
            <FontAwesomeIcon
              icon={toast.isError ? faExclamationCircle : faCheckCircle}
              className={`settings-toast-icon ${toast.isError ? 'text-danger' : ''}`}
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="erp-settings-container">
        {/* Page Header */}
        <div className="settings-page-header">
          <h1 className="settings-title">{t('settings_title') || 'அமைப்புகள் மேலாண்மை'}</h1>
          <p className="settings-subtitle">
            {t('settings_subtitle') || 'வணிக விவரங்கள், மொழி, வாட்ஸ்அப் மற்றும் பயனர் விருப்பத்தேர்வுகள்'}
          </p>
        </div>

        {/* Two-Column Responsive Settings Layout */}
        <div className="row g-4">
          {/* Left Column: Navigation Category Menu */}
          <div className="col-12 col-lg-3">
            <SettingsNav
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              isAdmin={isAdmin}
            />
          </div>

          {/* Right Column: Selected Category Content */}
          <div className="col-12 col-lg-9">
            {activeTab === 'business' && (
              <BusinessSettings
                orgData={orgData}
                onSave={handleSaveOrg}
                saving={savingOrg}
              />
            )}

            {activeTab === 'appearance' && (
              <AppearanceSettings
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'whatsapp' && (
              <WhatsAppSettings
                waStatus={waStatus}
                qrCode={qrCode}
                loadingWa={loadingWa}
                onConnect={handleConnectWa}
                onDisconnect={handleDisconnectWa}
              />
            )}

            {activeTab === 'security' && (
              <SecuritySettings
                onSavePassword={handleSavePassword}
                saving={savingPwd}
              />
            )}

            {activeTab === 'staff' && isAdmin && (
              <StaffSettings
                staffList={staffList}
                onCreateStaff={handleCreateStaff}
                onDeleteStaff={handleDeleteStaff}
                creating={creatingStaff}
              />
            )}
          </div>
        </div>
      </div>
    </ERPLayout>
  );
};

export default SettingsPage;