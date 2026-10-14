import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faBoxesStacked,
  faBoxOpen,
  faLock,
  faCheck,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import './ERPModal.css';

const ProductModal = ({
  show,
  onHide,
  mode = 'add',
  onSubmit,
  initialData = null
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    product_code: '',
    product_name: '',
    product_quality: '',
    product_unit: '',
    product_price: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        product_code: initialData.product_code || initialData.code || '',
        product_name: initialData.product_name || initialData.name || '',
        product_quality: initialData.product_quality !== undefined ? initialData.product_quality : (initialData.quality || ''),
        product_unit: initialData.product_unit || initialData.unit || 'kg',
        product_price: initialData.product_price !== undefined ? initialData.product_price : (initialData.price || '')
      });
    } else {
      setFormData({
        product_code: '',
        product_name: '',
        product_quality: '',
        product_unit: 'kg',
        product_price: ''
      });
    }
  }, [initialData, show]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.product_name?.trim()) {
      alert(t('product_name_required') || 'பொருள் பெயரை உள்ளிடவும்');
      return;
    }
    if (mode === 'add' && !formData.product_code?.trim()) {
      alert(t('product_code_required') || 'பொருள் குறியீட்டை உள்ளிடவும்');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onHide();
    } catch (error) {
      console.error('Error submitting product:', error);
    } finally {
      setLoading(false);
    }
  };

  const mainTitle = mode === 'add'
    ? (t('add_new_product') || 'புதிய பொருள் சேர்த்தல்')
    : (t('update_product') || 'பொருள் விபரம் திருத்தம்');

  const subtitle = mode === 'add'
    ? 'புதிய பூ வகை, அலகு மற்றும் விலை விவரங்களை உள்ளிடவும்'
    : 'பொருள் பெயர், அலகு மற்றும் தற்போதைய சந்தை விலையைப் புதுப்பிக்கவும்';

  const badgeText = mode === 'add' ? (t('new') || 'புதியது') : (t('edit') || 'திருத்தம்');

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName="erp-modern-modal"
      className="erp-modal-root"
      id="productModal"
      backdrop="static"
    >
      <form onSubmit={handleSubmit}>
        {/* Modern ERP Header - Emerald Theme */}
        <div className="erp-modal-header theme-product">
          <div className="erp-modal-header-left">
            <div className="erp-modal-icon-box">
              <FontAwesomeIcon icon={mode === 'add' ? faBoxOpen : faBoxesStacked} />
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
            {/* Field 1: Product Code */}
            <div className="erp-form-field col-span-1">
              <label htmlFor="product_code" className="erp-form-label">
                <span className="label-ta">
                  {t('product.code') || 'பொருள் குறியீடு'}
                  <span className="required-star">*</span>
                </span>
                <span className="label-en">/ Code</span>
              </label>
              <div className="erp-form-input-wrap">
                <input
                  type="text"
                  className="erp-form-input font-numeric"
                  id="product_code"
                  placeholder="PRD001 அல்லது ஆங்கிலப் பெயர்"
                  value={formData.product_code}
                  onChange={handleChange}
                  required
                  disabled={mode === 'update'}
                />
                {mode === 'update' && (
                  <FontAwesomeIcon icon={faLock} className="erp-form-input-lock" title="குறியீட்டை மாற்ற முடியாது" />
                )}
              </div>
            </div>

            {/* Field 2: Product Name */}
            <div className="erp-form-field col-span-1">
              <label htmlFor="product_name" className="erp-form-label">
                <span className="label-ta">
                  {t('product.name') || 'பொருள் பெயர்'}
                  <span className="required-star">*</span>
                </span>
                <span className="label-en">/ Name</span>
              </label>
              <div className="erp-form-input-wrap">
                <input
                  type="text"
                  className="erp-form-input"
                  id="product_name"
                  placeholder="மல்லிகை, முல்லை, ரோஜா..."
                  value={formData.product_name}
                  onChange={handleChange}
                  required
                  autoFocus={mode === 'update'}
                />
              </div>
            </div>

            {/* Field 3: Unit */}
            <div className="erp-form-field col-span-1">
              <label htmlFor="product_unit" className="erp-form-label">
                <span className="label-ta">
                  {t('col_unit') || 'அளவீட்டு அலகு'}
                  <span className="required-star">*</span>
                </span>
                <span className="label-en">/ Unit</span>
              </label>
              <select
                className="erp-form-select"
                id="product_unit"
                name="product_unit"
                value={formData.product_unit}
                onChange={handleSelectChange}
                required
              >
                <option value="kg">{t('kg') || 'கிலோ (kg)'}</option>
                <option value="g">{t('g') || 'கிராம் (g)'}</option>
                <option value="படி">{t('padi') || 'படி'}</option>
                <option value="pie">{t('pieces') || 'எண்ணிக்கை (pie)'}</option>
              </select>
            </div>

            {/* Field 4: Price */}
            <div className="erp-form-field col-span-1">
              <label htmlFor="product_price" className="erp-form-label">
                <span className="label-ta">
                  {t('product.price') || 'அலகு விலை'}
                </span>
                <span className="label-en">/ Unit Price (₹)</span>
              </label>
              <div className="erp-form-input-wrap">
                <span className="erp-form-addon-left">₹</span>
                <input
                  type="number"
                  step="0.01"
                  className="erp-form-input font-numeric has-addon-left"
                  id="product_price"
                  placeholder="0.00"
                  value={formData.product_price}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Field 5: Initial / Base Stock (Quality) */}
            <div className="erp-form-field col-span-2">
              <label htmlFor="product_quality" className="erp-form-label">
                <span className="label-ta">
                  {t('product.quality') || 'ஆரம்ப இருப்பு அளவு'}
                </span>
                <span className="label-en">/ Initial Stock Quantity ({formData.product_unit || 'kg'})</span>
              </label>
              <div className="erp-form-input-wrap">
                <input
                  type="number"
                  step="0.01"
                  className="erp-form-input font-numeric"
                  id="product_quality"
                  placeholder="0.00"
                  value={formData.product_quality}
                  onChange={handleChange}
                />
              </div>
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
            className="btn-modal-submit theme-product"
            disabled={loading}
          >
            <FontAwesomeIcon icon={mode === 'add' ? faSave : faCheck} spin={loading} />
            <span>
              {loading
                ? (t('saving') || 'சேமிக்கப்படுகிறது...')
                : (mode === 'add' ? (t('save_product') || 'பொருளை சேமி') : (t('update') || 'புதுப்பிக்கவும்'))
              }
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;