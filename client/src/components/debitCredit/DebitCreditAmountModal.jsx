import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPen,
  faCheck,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { updateDebitEntry, updateCreditEntry } from '../../api/debitCreditAPI';
import './DebitCreditEntryModal.css';

const DebitCreditAmountModal = ({
  show = false,
  onHide,
  type = 'debit',
  editData = null,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editData) {
      setAmount(editData.amount || '');
      setErrorMessage('');
    }
  }, [editData, show]);

  const handleQuickAdd = (increment) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + increment).toString());
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMessage(t('enterValidAmount') || 'சரியான தொகையை உள்ளிடவும்');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      const payload = {
        id: editData.id,
        amount
      };

      if (type === 'debit') {
        await updateDebitEntry(payload);
      } else {
        await updateCreditEntry(payload);
      }

      if (onSuccess) onSuccess();
      onHide();
    } catch (error) {
      console.error("Error updating entry", error);
      setErrorMessage(t('messages.failedToSaveEntry') || 'தொகையை மாற்ற முடியவில்லை');
    } finally {
      setSubmitting(false);
    }
  };

  const isDebit = type === 'debit';
  const partyCode = editData?.customer_supplier_code || '';
  const partyName = editData?.customer_supplier_name || '';

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
            <FontAwesomeIcon icon={faPen} />
          </div>
          <div>
            <h3 className="modal-title-text">{t('update amount')}</h3>
            <div className="modal-subtitle-text">
              {partyName ? `${partyName} ${partyCode ? `(${partyCode})` : ''}` : (isDebit ? t('purchaseDebit') : t('salesCredit'))}
            </div>
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
          {errorMessage && (
            <div className="alert alert-danger py-2 px-3 small mb-3">
              {errorMessage}
            </div>
          )}

          {partyName && (
            <div className="modal-date-chip-bar">
              <span className="text-muted small">{isDebit ? t('supplier') : t('customer')}:</span>
              <span className="fw-bold">{partyName} {partyCode && `[${partyCode}]`}</span>
            </div>
          )}

          <div className="financial-form-group">
            <label className="financial-form-label">
              <span>{t('amount')}<span className="field-required-star">*</span></span>
            </label>
            <div className="currency-input-wrap">
              <span className="currency-input-symbol">₹</span>
              <input
                type="number"
                step="any"
                min="0"
                className="currency-form-control"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                required
                autoFocus
                id="modal-input-update-amount"
              />
            </div>

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
            id="modal-btn-confirm-update-amount"
          >
            {submitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>{t('updating') || 'மாற்றுகிறது...'}</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} />
                <span>{t('update')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DebitCreditAmountModal;
