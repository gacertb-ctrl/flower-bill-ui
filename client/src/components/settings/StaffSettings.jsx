import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserPlus,
  faTrash,
  faUserShield,
  faUser
} from '@fortawesome/free-solid-svg-icons';

const StaffSettings = ({
  staffList = [],
  onCreateStaff,
  onDeleteStaff,
  creating = false
}) => {
  const { t } = useTranslation();
  const [newStaff, setNewStaff] = useState({ username: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newStaff.username || !newStaff.password) return;
    onCreateStaff(newStaff, () => {
      setNewStaff({ username: '', password: '' });
    });
  };

  return (
    <div className="erp-settings-panel">
      <div className="settings-panel-header">
        <div>
          <h3 className="settings-panel-title">
            <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
            {t('settings_staff_title') || 'பணியாளர்கள் / பயனர்கள் பட்டியல்'}
          </h3>
          <p className="settings-panel-desc">
            {t('settings_staff_desc') || 'சிஸ்டத்தில் உள்ள ஊழியர்கள் மற்றும் அவர்களின் பாத்திரங்களை நிர்வகிக்கவும்'}
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* Create Staff Form Card */}
        <div className="col-12 col-xl-5">
          <div className="settings-inner-card">
            <h4 className="settings-inner-card-title">
              <FontAwesomeIcon icon={faUserPlus} className="me-2 text-primary" />
              {t('settings_add_staff_title') || 'புதிய பணியாளரைச் சேர்க்க'}
            </h4>
            <form onSubmit={handleSubmit} className="settings-form mt-3">
              <div className="settings-form-group">
                <label className="settings-form-label">
                  {t('username') || 'பயனர்பெயர்'}
                  <span className="text-danger ms-1">*</span>
                </label>
                <div className="settings-input-wrapper">
                  <FontAwesomeIcon icon={faUser} className="settings-input-icon" />
                  <input
                    type="text"
                    className="settings-form-input"
                    value={newStaff.username}
                    onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                    placeholder="பயனர்பெயர்"
                    required
                    disabled={creating}
                    id="input-staff-username"
                  />
                </div>
              </div>

              <div className="settings-form-group">
                <label className="settings-form-label">
                  {t('password') || 'கடவுச்சொல்'}
                  <span className="text-danger ms-1">*</span>
                </label>
                <div className="settings-input-wrapper">
                  <FontAwesomeIcon icon={faUserShield} className="settings-input-icon" />
                  <input
                    type="password"
                    className="settings-form-input"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    placeholder="கடவுச்சொல்"
                    required
                    disabled={creating}
                    id="input-staff-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-settings-primary w-100 mt-2"
                disabled={creating}
                id="btn-create-staff"
              >
                {creating ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>சேர்க்கப்படுகிறது...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUserPlus} />
                    <span>{t('create_user') || 'பணியாளரைச் சேர்'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Existing Staff Table Card */}
        <div className="col-12 col-xl-7">
          <div className="settings-inner-card">
            <h4 className="settings-inner-card-title mb-3">
              <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
              <span>{t('staff_list') || 'செயலில் உள்ள பணியாளர்கள்'} ({staffList.length})</span>
            </h4>

            {staffList.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                பணியாளர்கள் பதிவுகள் எதுவும் இல்லை.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="settings-staff-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t('username') || 'பயனர்பெயர்'}</th>
                      <th>{t('role') || 'பாத்திரம்'}</th>
                      <th className="text-end">{t('action') || 'செயல்'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((user, idx) => (
                      <tr key={user.user_id || idx}>
                        <td className="text-muted">{idx + 1}</td>
                        <td>
                          <strong>{user.username}</strong>
                        </td>
                        <td>
                          <span className={`badge ${user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn-settings-icon-danger"
                            onClick={() => onDeleteStaff(user.user_id)}
                            title={t('delete') || 'நீக்குக'}
                            aria-label={`Delete ${user.username}`}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffSettings;
