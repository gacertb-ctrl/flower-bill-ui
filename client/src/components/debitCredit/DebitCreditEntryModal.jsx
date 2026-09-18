import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUp,
  faArrowDown,
  faCalendarDay,
  faCheck,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { fetchSuppliers } from '../../api/supplierAPI';
import { fetchCustomers } from '../../api/customerAPI';
import { createDebitEntry, createCreditEntry } from '../../api/debitCreditAPI';
import { SearchableSelect } from '../entry/SearchableSelect';
import './DebitCreditEntryModal.css';

const DebitCreditEntryModal = ({
  type = 'debit',
  show = false,
  onHide,
  onSubmit,
  date,
  tamilDateInfo
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    customer_supplier_code: '',
    amount: '',
    date: date || new Date().toISOString().split('T')[0]
  });

  const [options, setOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const amountInputRef = useRef(null);

  // Update date if prop changes
  useEffect(() => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
    }
  }, [date]);

  // Load suppliers or customers whenever modal opens
  useEffect(() => {
    if (show) {
      setErrorMessage('');
      const loadOptions = async () => {
        setLoadingOptions(true);
        try {
          const data = type === 'debit' ? await fetchSuppliers() : await fetchCustomers();
          const list = Array.isArray(data) ? data : Object.values(data || {});
          setOptions(
            list.map(item => ({
              code: item.code || item.customer_supplier_code,
              name: item.name || item.customer_supplier_name
            }))
          );
        } catch (error) {
          console.error("Error loading options for debit/credit modal", error);
        } finally {
          setLoadingOptions(false);
        }
      };
      loadOptions();
    }
  }, [show, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleQuickAdd = (increment) => {
    const current = parseFloat(formData.amount) || 0;
    setFormData(prev => ({ ...prev, amount: (current + increment).toString() }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.customer_supplier_code) {
      setErrorMessage(type === 'debit' ? t('select.supplier') : t('select.customer'));
      return;
    }

    const numAmount = parseFloat(formData.amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMessage(t('enterValidAmount') || 'சரியான தொகையை உள்ளிடவும்');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      if (type === 'debit') {
        await createDebitEntry(formData);
      } else {
        await createCreditEntry(formData);
      }

      if (onSubmit) onSubmit();

      // Reset form (retaining date)
      setFormData({
        customer_supplier_code: '',
        amount: '',
        date: date
      });
      onHide();
    } catch (error) {
      console.error("Error saving entry", error);
      setErrorMessage(t('messages.failedToSaveEntry') || 'பதிவு சேமிக்க முடியவில்லை');
    } finally {
      setSubmitting(false);
    }
  };

  const isDebit = type === 'debit';
  const modalTitle = isDebit ? t('addDebit') : t('addCredit');
  const modalSubtitle = isDebit
    ? (t('addDebitSubtitle') || 'புதிய சப்ளையர் பற்று பதிவு')
    : (t('addCreditSubtitle') || 'புதிய வாடிக்கையாளர் வரவு பதிவு');
  const labelText = isDebit ? t('supplier') : t('customer');
  const selectPlaceholder = isDebit ? t('select.supplier') : t('select.customer');

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className={`erp-financial-modal ${isDebit ? 'debit-theme' : 'credit-theme'}`}
    >
      <div className="modal-header">
        <div className="financial-modal-header-content">
          <div className={`modal-header-icon-box ${isDebit ? 'debit' : 'credit'}`}>
            <FontAwesomeIcon icon={isDebit ? faArrowUp : faArrowDown} />
          </div>
          <div>
            <h3 className="modal-title-text">{modalTitle}</h3>
            <div className="modal-subtitle-text">{modalSubtitle}</div>
          </div>
        </div>
        <button
          type="button"
          className="btn-close"
          onClick={onHide}
          aria-label="Close"
        />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* Date Info Bar */}
          <div className="modal-date-chip-bar">
            <div className="modal-date-chip-left">
              <FontAwesomeIcon icon={faCalendarDay} />
              <span>{date}</span>
            </div>
            {tamilDateInfo && (
              <span className="modal-tamil-date-tag">
                {tamilDateInfo}
              </span>
            )}
          </div>

          {errorMessage && (
            <div className="alert alert-danger py-2 px-3 small mb-3">
              {errorMessage}
            </div>
          )}

          {/* Party Selection Field */}
          <div className="financial-form-group">
            <label className="financial-form-label">
              <span>{labelText}<span className="field-required-star">*</span></span>
              {loadingOptions && (
                <span className="text-muted small">
                  <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
                  {t('loading') || 'ஏற்றுகிறது...'}
                </span>
              )}
            </label>
            <SearchableSelect
              name="customer_supplier_code"
              value={formData.customer_supplier_code}
              options={options}
              onChange={handleChange}
              placeholder={selectPlaceholder}
            />
          </div>

          {/* Amount Field */}
          <div className="financial-form-group">
            <label className="financial-form-label">
              <span>{t('amount')}<span className="field-required-star">*</span></span>
            </label>
            <div className="currency-input-wrap">
              <span className="currency-input-symbol">₹</span>
              <input
                ref={amountInputRef}
                type="number"
                step="any"
                min="0"
                name="amount"
                id="modal-input-amount"
                className="currency-form-control"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            {/* Quick Amount Suggestion Chips */}
            <div className="quick-amount-chips">
              <button
                type="button"
                className="quick-chip-btn"
                onClick={() => handleQuickAdd(500)}
              >
                +₹500
              </button>
              <button
                type="button"
                className="quick-chip-btn"
                onClick={() => handleQuickAdd(1000)}
              >
                +₹1,000
              </button>
              <button
                type="button"
                className="quick-chip-btn"
                onClick={() => handleQuickAdd(2000)}
              >
                +₹2,000
              </button>
              <button
                type="button"
                className="quick-chip-btn"
                onClick={() => handleQuickAdd(5000)}
              >
                +₹5,000
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="modal-btn-cancel"
            onClick={onHide}
          >
            {t('close')}
          </button>
          <button
            type="submit"
            className={`modal-btn-submit ${isDebit ? 'debit' : 'credit'}`}
            disabled={submitting}
            id="modal-btn-submit-entry"
          >
            {submitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>{t('saving') || 'சேமிக்கிறது...'}</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} />
                <span>{t('save')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DebitCreditEntryModal;
