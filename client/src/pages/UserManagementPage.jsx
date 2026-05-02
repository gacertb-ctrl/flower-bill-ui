import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getStaff, createStaff, deleteStaff } from '../api/settingsAPI';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faUserPlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';

const UserManagementPage = () => {
    const { t } = useTranslation();
    const [staffList, setStaffList] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '' });

    const loadStaff = async () => {
        try {
            const data = await getStaff();
            setStaffList(data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { loadStaff(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createStaff(newUser);
            setNewUser({ username: '', password: '' });
            loadStaff();
            alert('Staff created');
        } catch (e) { alert('Error creating staff'); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this user?')) {
            await deleteStaff(id);
            loadStaff();
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-nature-800 dark:text-nature-100 mb-8">{t('user_management')}</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create User Form */}
                <div className="lg:col-span-1">
                    <GlassCard className="p-0 overflow-hidden">
                        <div className="bg-nature-200/50 dark:bg-nature-800/50 px-6 py-4 border-b border-nature-200 dark:border-nature-700/50 flex items-center">
                            <FontAwesomeIcon icon={faUserPlus} className="text-nature-600 dark:text-nature-300 mr-3" />
                            <h3 className="text-lg font-bold text-nature-800 dark:text-nature-100">{t('add_staff')}</h3>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-nature-700 dark:text-nature-300 mb-1">{t('username')}</label>
                                    <input 
                                        className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all" 
                                        required 
                                        value={newUser.username}
                                        onChange={e => setNewUser({ ...newUser, username: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nature-700 dark:text-nature-300 mb-1">{t('password')}</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all" 
                                        required 
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })} 
                                    />
                                </div>
                                <div className="pt-2">
                                    <GlassButton className="w-full justify-center bg-green-500 text-white hover:bg-green-600 shadow-glow">
                                        {t('create_user')}
                                    </GlassButton>
                                </div>
                            </form>
                        </div>
                    </GlassCard>
                </div>

                {/* User List */}
                <div className="lg:col-span-2">
                    <GlassCard className="p-0 overflow-hidden h-full flex flex-col">
                        <div className="bg-accent-blue/10 dark:bg-accent-blue/20 px-6 py-4 border-b border-blue-200/50 dark:border-blue-800/50 flex items-center">
                            <FontAwesomeIcon icon={faUsers} className="text-accent-blue mr-3" />
                            <h3 className="text-lg font-bold text-nature-800 dark:text-nature-100">Staff List</h3>
                        </div>
                        <div className="p-6 flex-1 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-nature-500 dark:text-nature-400 border-b border-nature-200 dark:border-nature-700/50">
                                        <th className="py-3 px-4 font-medium">{t('username')}</th>
                                        <th className="py-3 px-4 font-medium">{t('role')}</th>
                                        <th className="py-3 px-4 font-medium text-right">{t('action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffList.map(user => (
                                        <tr key={user.user_id} className="border-b border-nature-100 dark:border-nature-700/30 hover:bg-nature-50/50 dark:hover:bg-nature-800/50 transition-colors">
                                            <td className="py-3 px-4 text-nature-800 dark:text-nature-100 font-medium">{user.username}</td>
                                            <td className="py-3 px-4">
                                                <span className="inline-block px-2.5 py-1 bg-accent-blue/20 text-accent-blue text-xs font-semibold rounded-full">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button 
                                                    className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors" 
                                                    onClick={() => handleDelete(user.user_id)}
                                                    title="Delete User"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {staffList.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="py-8 text-center text-nature-500 dark:text-nature-400">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default UserManagementPage;