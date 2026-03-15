import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { getOrgSettings, updateOrgSettings, changePassword } from '../api/settingsAPI';
// You'll need to export UserContext/AuthContext from your context file to use this
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth(); // Assuming user object has { role: 'admin' }
    const isAdmin = user?.role === 'admin';

    const [orgData, setOrgData] = useState({ name: '', logo_url: '', address: '' });
    const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '' });

    useEffect(() => {
        if (isAdmin) {
            getOrgSettings().then(setOrgData).catch(console.error);
        }
    }, [isAdmin]);

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
            </div>
        </div>
    );
};

export default SettingsPage;