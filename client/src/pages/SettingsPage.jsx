import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { getOrgSettings, updateOrgSettings, changePassword } from '../api/settingsAPI';
import { getWhatsAppStatus, getWhatsAppQRCode, disconnectWhatsApp } from '../api/whatsappAPI';
// You'll need to export UserContext/AuthContext from your context file to use this
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth(); // Assuming user object has { role: 'admin' }
    const isAdmin = user?.role === 'admin';

    const [orgData, setOrgData] = useState({ name: '', logo_url: '', address: '' });
    const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '' });
    const [wsStatus, setWsStatus] = useState('OFFLINE'); // OFFLINE, CONNECTING, OPEN
    const [qrCode, setQrCode] = useState(null);
    const [loadingWS, setLoadingWS] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            getOrgSettings().then(setOrgData).catch(console.error);
            checkWSStatus();
        }
    }, [isAdmin]);

    const checkWSStatus = async () => {
        try {
            const data = await getWhatsAppStatus();
            setWsStatus(data.instance?.state || 'OFFLINE');
        } catch (error) {
            console.error('Failed to get WhatsApp status', error);
        }
    };

    const handleConnectWS = async () => {
        setLoadingWS(true);
        try {
            const data = await getWhatsAppQRCode();
            if (data.code || data.base64) {
                setQrCode(data.base64 || data.code);
                setWsStatus('CONNECTING');
            }
        } catch (error) {
            alert('Failed to get QR Code');
        } finally {
            setLoadingWS(false);
        }
    };

    const handleDisconnectWS = async () => {
        if (window.confirm(t('Are you sure you want to disconnect WhatsApp?'))) {
            setLoadingWS(true);
            try {
                await disconnectWhatsApp();
                setWsStatus('OFFLINE');
                setQrCode(null);
                alert(t('WhatsApp Disconnected'));
            } catch (error) {
                alert('Failed to disconnect');
            } finally {
                setLoadingWS(false);
            }
        }
    };

    const handleOrgUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateOrgSettings(orgData);
            alert(t('settings_updated'));
        } catch (error) { alert('Failed to update'); }
    };

    const handlePwdChange = async (e) => {
        e.preventDefault();
        try {
            const response = await changePassword(pwdData);
            alert(t('password_changed'));
            setPwdData({ currentPassword: '', newPassword: '' });
        } catch (error) { alert(error.response?.data?.error || 'Failed to change password'); }
    };

    return (
        <div className="container-fluid py-4" style={{ minHeight: '100vh' }}>
            <div className="saas-card mb-4 p-3 border-0">
                <div>
                    <h2 className="fw-bold text-primary mb-0">{t('settings')}</h2>
                    <p className="text-muted small mb-0">{t('Manage your personal preferences')}</p>
                </div>
            </div>

            <div className="row mt-4">
                {/* ALL USERS: Change Password */}
                <div className="col-md-6">
                    <div className="saas-card">
                        <div className="saas-card-header">
                            <h6 className="m-0 font-weight-bold text-primary">{t('update_password')}</h6>
                        </div>
                        <div className="saas-card-body">
                            <form onSubmit={handlePwdChange}>
                                <div className="mb-3">
                                    <label className="fw-bold text-muted small">{t('current_password')}</label>
                                    <input type="password" className="form-control" required
                                        value={pwdData.currentPassword}
                                        onChange={e => setPwdData({ ...pwdData, currentPassword: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="fw-bold text-muted small">{t('new_password')}</label>
                                    <input type="password" className="form-control" required
                                        value={pwdData.newPassword}
                                        onChange={e => setPwdData({ ...pwdData, newPassword: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-primary shadow-sm">{t('update_password')}</button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* WhatsApp Connection Section */}
                {isAdmin && (
                    <div className="col-md-6">
                        <div className="saas-card">
                            <div className="saas-card-header">
                                <h6 className="m-0 font-weight-bold text-primary">{t('whatsapp_connection')}</h6>
                            </div>
                            <div className="saas-card-body">
                                <div className="mb-4 d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="mb-1 fw-bold text-muted small">{t('status')}</p>
                                        <h5 className={`fw-bold ${wsStatus === 'open' ? 'text-success' : 'text-danger'}`}>
                                            {wsStatus === 'open' ? t('Connected') : t('Not Connected')}
                                        </h5>
                                    </div>
                                    <div className="text-end">
                                        {wsStatus === 'open' ? (
                                            <button className="btn btn-outline-danger shadow-sm" onClick={handleDisconnectWS} disabled={loadingWS}>
                                                {loadingWS ? t('Processing...') : t('Disconnect')}
                                            </button>
                                        ) : (
                                            <button className="btn btn-primary shadow-sm" onClick={handleConnectWS} disabled={loadingWS}>
                                                {loadingWS ? t('Loading QR...') : t('Connect WhatsApp')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {wsStatus === 'CONNECTING' && qrCode && (
                                    <div className="text-center p-3 border rounded bg-light">
                                        <p className="small text-muted mb-2">{t('Scan this QR code with your WhatsApp')}</p>
                                        <img src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`} alt="QR Code" style={{ maxWidth: '200px' }} />
                                        <div className="mt-3">
                                            <button className="btn btn-sm btn-link" onClick={checkWSStatus}>{t('I scanned it, Refresh status')}</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;