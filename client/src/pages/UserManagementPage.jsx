import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getStaff, createStaff, deleteStaff } from '../api/settingsAPI';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

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
        <div className="container-fluid py-4 fade-in-up delay-1" style={{ minHeight: '100vh' }}>
            <div className="glass-card mb-4 p-3 border-0">
                <div>
                    <h2 className="fw-bold text-primary mb-0">{t('user_management')}</h2>
                    <p className="text-muted small mb-0">{t('Manage system users')}</p>
                </div>
            </div>

            <div className="row g-4 fade-in-up delay-2">
                {/* Create User Form */}
                <div className="col-lg-4 col-md-5">
                    <div className="glass-card">
                        <div className="glass-card-header">
                            <h6 className="m-0 font-weight-bold text-primary">{t('add_staff')}</h6>
                        </div>
                        <div className="glass-card-body">
                            <form onSubmit={handleCreate}>
                                <div className="mb-3">
                                    <label className="fw-bold text-muted small">{t('username')}</label>
                                    <input className="form-control" required value={newUser.username}
                                        onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                                </div>
                                <div className="mb-4">
                                    <label className="fw-bold text-muted small">{t('password')}</label>
                                    <input type="password" class="form-control" required value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                                </div>
                                <button className="btn btn-primary w-100 shadow-sm"><i className="bi bi-person-plus-fill me-2"></i>{t('create_user')}</button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* User List */}
                <div className="col-lg-8 col-md-7">
                    <div className="glass-card">
                        <div className="glass-card-header">
                            <h6 className="m-0 font-weight-bold text-primary">All Users</h6>
                        </div>
                        <div className="glass-card-body p-0">
                            <div className="table-responsive bg-transparent shadow-none border-0">
                                <table className="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th className="text-secondary text-uppercase" style={{ fontSize: '0.8rem' }}>{t('username')}</th>
                                            <th className="text-secondary text-uppercase" style={{ fontSize: '0.8rem' }}>{t('role')}</th>
                                            <th className="text-secondary text-uppercase" style={{ fontSize: '0.8rem' }}>{t('action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staffList.map(user => (
                                            <tr key={user.user_id}>
                                                <td className="fw-bold text-dark">{user.username}</td>
                                                <td><span className="badge bg-primary p-2 rounded-pill px-3 shadow-sm">{user.role}</span></td>
                                                <td>
                                                    <button className="btn btn-outline-danger btn-sm rounded-circle shadow-sm" onClick={() => handleDelete(user.user_id)}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagementPage;