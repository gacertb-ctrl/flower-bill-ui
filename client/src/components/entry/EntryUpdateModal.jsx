import React, { useEffect, useState } from 'react';
import { Modal, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPen,
  faIndianRupeeSign,
  faCheck,
  faScaleBalanced
} from '@fortawesome/free-solid-svg-icons';
import { updatePurchaseEntry, updateSalesEntry } from '../../api/entryAPI';

const EntryUpdateModal = ({ show, onHide, type, editData, onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    id: '',
    quantity: '',
    unit: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);

  const isPurchase = type === 'purchase';

  useEffect(() => {
    if (editData) {
      const cleanNum = (val) => {
        if (val === null || val === undefined || val === '') return '';
        const n = parseFloat(val);
        if (isNaN(n)) return '';
        return Number(Math.round(n * 10000) / 10000).toString();
      };

      setFormData({
        id: editData.id,
        quantity: cleanNum(editData.quantity),
        unit: editData.unit || 'kg',
        price: cleanNum(editData.price)
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculatedTotal = (
    (parseFloat(formData.quantity) || 0) * (parseFloat(formData.price) || 0)
  ).toFixed(2);

  const formatRupee = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amt || 0);
  };

  const handleSubmit = async () => {
    const payload = {
      id: formData.id,
      quantity: formData.quantity,
      unit: formData.unit,
      price: formData.price
    };

    setLoading(true);
    try {
      if (type === 'purchase') {
        await updatePurchaseEntry(payload);
      } else {
        await updateSalesEntry(payload);
      }
      onSuccess();
      onHide();
    } catch (e) {
      console.error(e);
      alert('பதிவை திருத்துவதில் பிழை ஏற்பட்டது');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className="erp-transaction-modal"
      backdrop="static"
    >
      <div className={`erp-modal-header ${isPurchase ? 'purchase-theme' : 'sales-theme'}`}>
        <h3 className="erp-modal-title">
          <FontAwesomeIcon icon={faPen} />
          <span>
            {isPurchase
              ? 'கொள்முதல் பதிவு திருத்தம்'
              : 'விற்பனை பதிவு திருத்தம்'}
          </span>
        </h3>
        <button
          className="erp-modal-close-btn"
          onClick={onHide}
          type="button"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="erp-modal-body p-4">
        <Form>
          <Row className="g-3">
            {/* Quantity */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small text-muted fw-bold mb-1">
                  {t('quantity') || 'அளவு'}
                </Form.Label>
                <InputGroup size="sm">
                  <Form.Control
                    type="number"
                    step="any"
                    name="quantity"
                    className="font-numeric fw-bold"
                    value={formData.quantity}
                    onChange={handleChange}
                    autoFocus
                  />
                  <Form.Select
                    name="unit"
                    style={{ maxWidth: '80px', fontSize: '11px', fontWeight: 600 }}
                    value={formData.unit}
                    onChange={handleChange}
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="படி">படி</option>
                    <option value="pie">pie</option>
                  </Form.Select>
                </InputGroup>
              </Form.Group>
            </Col>

            {/* Price */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small text-muted fw-bold mb-1">
                  {t('unit_rate') || 'விலை'} (₹)
                </Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-light text-muted">
                    <FontAwesomeIcon icon={faIndianRupeeSign} style={{ fontSize: '0.7rem' }} />
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="any"
                    name="price"
                    className="font-numeric fw-bold text-end"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          {/* Recalculated Total Card */}
          <div className="mt-3 p-3 bg-light rounded-3 d-flex align-items-center justify-content-between border">
            <div className="d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faScaleBalanced} className="text-muted" />
              <span className="small text-muted fw-bold">மறு கணக்கீட்டு மொத்தம்:</span>
            </div>
            <span className="font-numeric fw-bold fs-5 text-dark">
              {formatRupee(parseFloat(calculatedTotal || 0))}
            </span>
          </div>
        </Form>
      </div>

      <div className="erp-modal-footer">
        <button
          type="button"
          className="btn-erp-modal-cancel"
          onClick={onHide}
        >
          {t('Cancel') || 'ரத்து'}
        </button>
        <button
          type="button"
          className={`btn-erp-modal-save ${isPurchase ? 'purchase-btn' : 'sales-btn'}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faCheck} className="me-1" />
          <span>{t('action_update') || 'மாற்றங்களை சேமி'}</span>
        </button>
      </div>
    </Modal>
  );
};

export default EntryUpdateModal;
