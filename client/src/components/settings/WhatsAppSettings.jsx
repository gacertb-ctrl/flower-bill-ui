import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationTriangle,
  faQrcode,
  faUnlink,
  faLink
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const WhatsAppSettings = ({
  waStatus,
  qrCode,
  loadingWa = false,
  onConnect,
  onDisconnect
}) => {
  const { t } = useTranslation();
  const isConnected = waStatus === 'open';

  return (
    <div className="erp-settings-panel">
      <div className="settings-panel-header">
        <div>
          <h3 className="settings-panel-title">
            <FontAwesomeIcon icon={faWhatsapp} className="me-2 text-success" />
            {t('settings_wa_title') || 'வாட்ஸ்அப் வணிக இணைப்பு'}
          </h3>
          <p className="settings-panel-desc">
            {t('settings_wa_desc') || 'பில் மற்றும் அறிக்கைகளை வாடிக்கையாளர்கள்/சப்ளையர்களுக்கு நேரடியாக அனுப்ப வாட்ஸ்அப்பை இணைக்கவும்'}
          </p>
        </div>
      </div>

      <div className="settings-wa-status-card">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className={`settings-wa-icon-box ${isConnected ? 'connected' : 'disconnected'}`}>
              <FontAwesomeIcon icon={faWhatsapp} />
            </div>
            <div>
              <div className="settings-wa-status-title">
                {isConnected ? (
                  <span className="text-success">
                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                    {t('settings_wa_status_connected') || 'வாட்ஸ்அப் இணைக்கப்பட்டுள்ளது'}
                  </span>
                ) : (
                  <span className="text-warning">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                    {t('settings_wa_status_disconnected') || 'வாட்ஸ்அப் இணைக்கப்படவில்லை'}
                  </span>
                )}
              </div>
              <div className="settings-wa-status-desc">
                {isConnected
                  ? 'உங்கள் வாட்ஸ்அப் வெற்றிகரமாக இணைக்கப்பட்டு தானியங்கி அறிக்கைகளை அனுப்ப தயாராக உள்ளது.'
                  : 'அறிக்கைகளை நேரடியாக அனுப்ப உங்கள் கணக்கை இணைக்கவும்.'}
              </div>
            </div>
          </div>

          <div>
            {isConnected ? (
              <button
                type="button"
                className="btn-settings-danger"
                onClick={onDisconnect}
                disabled={loadingWa}
                id="btn-wa-disconnect"
              >
                <FontAwesomeIcon icon={faUnlink} />
                <span>{loadingWa ? 'துண்டிக்கப்படுகிறது...' : (t('settings_wa_disconnect_btn') || 'இணைப்பைத் துண்டிக்கவும்')}</span>
              </button>
            ) : !qrCode ? (
              <button
                type="button"
                className="btn-settings-success"
                onClick={onConnect}
                disabled={loadingWa}
                id="btn-wa-connect"
              >
                {loadingWa ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>{t('settings_wa_status_connecting') || 'இணைக்கப்படுகிறது...'}</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faLink} />
                    <span>{t('settings_wa_connect_btn') || 'வாட்ஸ்அப் இணைக்கவும்'}</span>
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>

        {/* QR Code display during connection */}
        {qrCode && !isConnected && (
          <div className="settings-qr-container mt-4 pt-4 border-top">
            <div className="text-center">
              <div className="mb-2">
                <FontAwesomeIcon icon={faQrcode} className="text-primary me-2" />
                <strong className="text-primary">{t('settings_wa_scan_qr') || 'QR குறியீட்டை ஸ்கேன் செய்யவும்'}</strong>
              </div>
              <p className="small text-muted mb-3">
                1. உங்கள் தொலைபேசியில் வாட்ஸ்அப்பைத் திறக்கவும்<br />
                2. Menu அல்லது Settings {'>'} Linked Devices தேர்வு செய்யவும்<br />
                3. Link a Device தொட்டு கீழே உள்ள குறியீட்டை ஸ்கேன் செய்யவும்
              </p>
              <div className="qr-image-wrapper p-3 bg-white d-inline-block rounded shadow-sm border">
                <img
                  src={qrCode}
                  alt="WhatsApp QR Code"
                  className="img-fluid"
                  style={{ width: '220px', height: '220px' }}
                />
              </div>
              <div className="mt-3">
                <span className="spinner-grow spinner-grow-sm text-success me-2" role="status"></span>
                <span className="small text-success fw-bold">இணைப்புக்காக காத்திருக்கிறது...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppSettings;
