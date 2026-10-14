import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faUserPlus,
  faUserPen,
  faTruck,
  faLock,
  faCheck,
  faSave,
  faPercent,
  faPhone,
  faMapMarkerAlt,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import './ERPModal.css';

const CustomerSupplierModal = ({
  show,
  onHide,
  type = 'customer',
  mode = 'add',
  initialData = null,
  onSubmit
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    number: '',
    address: '',
    commission: type === 'supplier' ? '12.5' : ''
  });
  const [loading, setLoading] = useState(false);

  // Initialize form with data when editing or reset for new entry
  useEffect(() => {
    if (mode === 'update' && initialData) {
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        number: initialData.contact || '',
        address: initialData.address || '',
        commission: initialData.commission || (type === 'supplier' ? '12.5' : '')
      });
    } else {
      setFormData({
        code: '',
        name: '',
        number: '',
        address: '',
        commission: type === 'supplier' ? '12.5' : ''
      });
    }
  }, [mode, initialData, type, show]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name?.trim()) {
      alert(t('name_required') || 'பெயரை உள்ளிடவும்');
      return;
    }
    if (mode === 'add' && !formData.code?.trim()) {
      alert(t('code_required') || 'குறியீட்டை உள்ளிடவும்');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const isCustomer = type === 'customer';
  const themeClass = isCustomer ? 'theme-customer' : 'theme-supplier';

  // Titles
  const mainTitle = isCustomer
    ? (mode === 'add' ? (t('add_customer') || 'புதிய வாடிக்கையாளர் சேர்த்தல்') : (t('update_customer') || 'வாடிக்கையாளர் திருத்தம்'))
    : (mode === 'add' ? (t('add_supplier') || 'புதிய சப்ளையர் சேர்த்தல்') : (t('update_supplier') || 'சப்ளையர் திருத்தம்'));

  const subtitle = isCustomer
    ? (mode === 'add' ? 'புதிய வாடிக்கையாளர் விவரங்கள் மற்றும் ஆரம்ப அமைப்புகள்' : 'வாடிக்கையாளர் சுயவிவரம் மற்றும் தொடர்புத் தகவலைப் புதுப்பிக்கவும்')
    : (mode === 'add' ? 'புதிய சப்ளையர் விபரம் மற்றும் கமிஷன் விகிதத்தை உள்ளிடவும்' : 'சப்ளையர் சுயவிவரம் மற்றும் கணக்கு விவரங்களைப் புதுப்பிக்கவும்');

  const badgeText = mode === 'add' ? (t('new') || 'புதியது') : (t('edit') || 'திருத்தம்');

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName="erp-modern-modal"
      className="erp-modal-root"
      id="customerSupplierModal"
      backdrop="static"
    >
      <form onSubmit={handleSubmit}>
        {/* Modern ERP Header */}
        <div className={`erp-modal-header ${themeClass}`}>
          <div className="erp-modal-header-left">
            <div className="erp-modal-icon-box">
              <FontAwesomeIcon
                icon={
                  isCustomer
                    ? (mode === 'add' ? faUserPlus : faUserPen)
                    : faTruck
                }
              />
            </div>
            <div className="erp-modal-title-wrap">
              <h3 className="erp-modal-title">
                <span>{mainTitle}</span>
                <span className="erp-modal-badge">{badgeText}</span>
              </h3>
              <span className="erp-modal-subtitle">{subtitle}</span>
            </div>
          </div>

          <button
            type="button"
            className="erp-modal-close-btn"
            onClick={onHide}
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="erp-modal-body">
          <div className="erp-modal-form-grid">
            {/* Field 1: Code */}
            <div className="erp-form-field col-span-1">
              <label htmlFor="code" className="erp-form-label">
                <span className="label-ta">
                  {isCustomer ? (t('customer.code') || 'வாடிக்கையாளர் குறியீடு') : (t('supplier.code') || 'சப்ளையர் குறியீடு')}
                  <span className="required-star">*</span>
                </span>
                <span className="label-en">/ Code</span>
              </label>
              <div className="erp-form-input-wrap">
                <input
                  type="text"
                  className="erp-form-input font-numeric"
                  id="code"
                  placeholder={isCustomer ? 'CUS001 அல்லது ஆங்கிலப் பெயர்' : 'SUP001 அல்லது ஆங்கிலப் பெயர்'}
                  value={formData.code}
                  onChange={handleChange}
                  required
                  disabled={mode === 'update'}
                />
                {mode === 'update' && (
                  <FontAwesomeIcon icon={faLock} className="erp-form-input-lock" title="குறியீட்டை மாற்ற முடியாது" />
                )}
              </div>
            </div>

            {/* Field 2: Name */}
            <div className="erp-form-field col-span-1">
              <label htmlFor="name" className="erp-form-label">
                <span className="label-ta">
                  {isCustomer ? (t('customer.name') || 'வாடிக்கையாளர் பெயர்') : (t('supplier.name') || 'சப்ளையர் பெயர்')}
                  <span className="required-star">*</span>
                </span>
                <span className="label-en">/ Name</span>
              </label>
              <div className="erp-form-input-wrap">
                <input
                  type="text"
                  className="erp-form-input"
                  id="name"
                  placeholder={isCustomer ? 'செல்வராஜ் அல்லது ஆங்கிலப் பெயர்' : 'மாரிமுத்து அல்லது ஆங்கிலப் பெயர்'}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoFocus={mode === 'update'}
                />
              </div>
            </div>

            {/* Field 3: Contact Number */}
            <div className={`erp-form-field ${isCustomer ? 'col-span-2' : 'col-span-1'}`}>
              <label htmlFor="number" className="erp-form-label">
                <span className="label-ta">
                  {t('contact_no') || 'மொபைல் / தொலைபேசி எண்'}
                </span>
                <span className="label-en">/ Phone Number</span>
              </label>
              <div className="erp-form-input-wrap">
                <input
                  type="tel"
                  className="erp-form-input font-numeric"
                  id="number"
                  placeholder="9876543210"
                  value={formData.number}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Field 4: Supplier Commission (Only for Supplier) */}
            {!isCustomer && (
              <div className="erp-form-field col-span-1">
                <label htmlFor="commission" className="erp-form-label">
                  <span className="label-ta">{t('Commission') || 'கமிஷன் விகிதம்'}</span>
                  <span className="label-en">/ Commission %</span>
                </label>
                <div className="erp-form-input-wrap">
                  <input
                    type="number"
                    step="0.1"
                    className="erp-form-input font-numeric has-addon-right"
                    id="commission"
                    placeholder="12.5"
                    value={formData.commission}
                    onChange={handleChange}
                  />
                  <span className="erp-form-addon-right">%</span>
                </div>
              </div>
            )}

            {/* Field 5: Address */}
            <div className="erp-form-field col-span-2">
              <label htmlFor="address" className="erp-form-label">
                <span className="label-ta">
                  {isCustomer ? (t('customer.address') || 'முகவரி / ஊர்') : (t('supplier.address') || 'முகவரி / ஊர்')}
                </span>
                <span className="label-en">/ Address & City</span>
              </label>
              <textarea
                className="erp-form-textarea"
                id="address"
                rows={3}
                placeholder="கதவு எண், தெரு பெயர், ஊர் (எ.கா: சுரண்டை, தென்காசி)"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="erp-modal-footer">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onHide}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimes} />
            <span>{t('close') || 'ரத்து'}</span>
          </button>

          <button
            type="submit"
            className={`btn-modal-submit ${themeClass}`}
            disabled={loading}
          >
            <FontAwesomeIcon icon={mode === 'add' ? faSave : faCheck} spin={loading} />
            <span>
              {loading
                ? (t('saving') || 'சேமிக்கப்படுகிறது...')
                : (mode === 'add'
                    ? (isCustomer ? (t('save_customer') || 'வாடிக்கையாளரை சேமி') : (t('save_supplier') || 'சப்ளையரை சேமி'))
                    : (t('update') || 'புதுப்பிக்கவும்')
                  )
              }
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerSupplierModal;