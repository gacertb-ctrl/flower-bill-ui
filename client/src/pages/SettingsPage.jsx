import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { getOrgSettings, updateOrgSettings, changePassword } from '../api/settingsAPI';
import { getWhatsAppStatus, connectWhatsApp, disconnectWhatsApp } from '../api/whatsappAPI';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faCommentDots, faSpinner } from '@fortawesome/free-solid-svg-icons';

const SettingsPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth(); // Assuming user object has { role: 'admin' }
    const isAdmin = user?.role === 'admin';

    const [orgData, setOrgData] = useState({ name: '', logo_url: '', address: '' });
    const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '' });
    const [waStatus, setWaStatus] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [loadingWa, setLoadingWa] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            getOrgSettings().then(setOrgData).catch(console.error);
        }
        
        // Fetch WA status on load
        fetchWaStatus();
    }, [isAdmin]);

    const fetchWaStatus = async () => {
        try {
            const status = await getWhatsAppStatus();
            setWaStatus(status.instance?.state);
        } catch (error) {
            console.error(error);
        }
    };

    const handleWaConnect = async () => {
        setLoadingWa(true);
        try {
            const res = await connectWhatsApp();
            if (res.base64) {
                setQrCode(res.base64);
                // Start polling status since user needs to scan
                const interval = setInterval(async () => {
                    const st = await getWhatsAppStatus();
                    if (st.instance?.state === 'open') {
                        setWaStatus('open');
                        setQrCode(null);
                        clearInterval(interval);
                    }
                }, 3000);
            }
        } catch (error) {
            alert('Failed to connect WhatsApp');
        } finally {
            setLoadingWa(false);
        }
    };

    const handleWaDisconnect = async () => {
        if (!window.confirm("Are you sure you want to disconnect WhatsApp?")) return;
        setLoadingWa(true);
        try {
            await disconnectWhatsApp();
            setWaStatus('close');
        } catch (error) {
            alert('Failed to disconnect WhatsApp');
        } finally {
            setLoadingWa(false);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-nature-800 dark:text-nature-100 mb-8">{t('settings')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ALL USERS: Change Password */}
                <div className="flex flex-col">
                    <GlassCard className="p-0 h-full flex flex-col overflow-hidden">
                        <div className="bg-nature-200/50 dark:bg-nature-800/50 px-6 py-4 border-b border-nature-200 dark:border-nature-700/50 flex items-center">
                            <FontAwesomeIcon icon={faKey} className="text-nature-600 dark:text-nature-300 mr-3" />
                            <h3 className="text-lg font-bold text-nature-800 dark:text-nature-100">{t('update_password')}</h3>
                        </div>
                        <div className="p-6 flex-1">
                            <form onSubmit={handlePwdChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-nature-700 dark:text-nature-300 mb-1">{t('current_password')}</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100" 
                                        required
                                        value={pwdData.currentPassword}
                                        onChange={e => setPwdData({ ...pwdData, currentPassword: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nature-700 dark:text-nature-300 mb-1">{t('new_password')}</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100" 
                                        required
                                        value={pwdData.newPassword}
                                        onChange={e => setPwdData({ ...pwdData, newPassword: e.target.value })} 
                                    />
                                </div>
                                <div className="pt-2">
                                    <GlassButton type="submit" variant="primary" className="w-full justify-center">
                                        {t('update_password')}
                                    </GlassButton>
                                </div>
                            </form>
                        </div>
                    </GlassCard>
                </div>

                {/* WhatsApp Connection */}
                <div className="flex flex-col">
                    <GlassCard className="p-0 h-full flex flex-col overflow-hidden">
                        <div className="bg-green-100/50 dark:bg-green-900/30 px-6 py-4 border-b border-green-200/50 dark:border-green-800/50 flex items-center">
                            <FontAwesomeIcon icon={faCommentDots} className="text-green-600 dark:text-green-400 mr-3" />
                            <h3 className="text-lg font-bold text-green-800 dark:text-green-100">WhatsApp Integration</h3>
                        </div>
                        <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
                            {waStatus === 'open' ? (
                                <div className="w-full">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200 dark:border-green-700">
                                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <h4 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-6">WhatsApp is Connected</h4>
                                    <GlassButton onClick={handleWaDisconnect} disabled={loadingWa} variant="danger" className="w-full justify-center">
                                        {loadingWa ? (
                                            <><FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> Disconnecting...</>
                                        ) : 'Disconnect'}
                                    </GlassButton>
                                </div>
                            ) : (
                                <div className="w-full">
                                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-200 dark:border-yellow-700">
                                        <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    </div>
                                    <h4 className="text-xl font-semibold text-accent-gold dark:text-yellow-400 mb-6">WhatsApp is Not Connected</h4>
                                    
                                    {!qrCode ? (
                                        <GlassButton onClick={handleWaConnect} disabled={loadingWa} className="w-full justify-center bg-[#25D366] text-white hover:bg-[#128C7E]">
                                            {loadingWa ? (
                                                <><FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> Connecting...</>
                                            ) : (
                                                <><FontAwesomeIcon icon={faCommentDots} className="mr-2" /> Connect WhatsApp</>
                                            )}
                                        </GlassButton>
                                    ) : (
                                        <div className="bg-white p-4 rounded-xl shadow-inner border border-nature-200">
                                            <p className="text-nature-600 text-sm mb-4 font-medium">Scan this QR Code with your WhatsApp app.</p>
                                            <img src={qrCode} alt="WhatsApp QR Code" className="w-full max-w-[250px] mx-auto rounded-lg" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;