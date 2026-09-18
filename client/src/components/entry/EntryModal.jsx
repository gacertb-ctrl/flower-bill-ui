import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, InputGroup, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faMoon,
  faUser,
  faBoxOpen,
  faCalendarCheck,
  faIndianRupeeSign,
  faPlus,
  faAddressCard,
  faLayerGroup,
  faShoppingCart,
  faArrowUpRightFromSquare,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

import { fetchSuppliers } from '../../api/supplierAPI';
import { fetchCustomers } from '../../api/customerAPI';
import { fetchProducts } from '../../api/productAPI';
import { createPurchaseEntryBulk, createSalesEntryBulk } from '../../api/entryAPI';
import { SearchableSelect } from './SearchableSelect';
import './EntryModal.css';

const EntryModal = ({ type, show, onHide, onSubmit, date, tamilDateInfo }) => {
  const { t } = useTranslation();

  // Mode: 'account' (One Person -> Many Products) or 'product' (One Product -> Many People)
  const [viewMode, setViewMode] = useState('account');
  const [loading, setLoading] = useState(false);

  const [headerData, setHeaderData] = useState({
    code: '',
    date: date
  });

  const [rows, setRows] = useState([
    { row_code: '', quality: '', unit: 'kg', price: '', price_total: 0 }
  ]);

  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Theme configuration based on Entry Type
  const isPurchase = type === 'purchase';

  useEffect(() => {
    setHeaderData((prev) => ({ ...prev, date: date }));
  }, [date]);

  useEffect(() => {
    async function fetchForModel() {
      try {
        const [s, c, p] = await Promise.all([fetchSuppliers(), fetchCustomers(), fetchProducts()]);
        setSuppliers(Array.isArray(s) ? s : Object.values(s || {}));
        setCustomers(Array.isArray(c) ? c : Object.values(c || {}));
        setProducts(Array.isArray(p) ? p : Object.values(p || {}));
      } catch (e) {
        console.error('Fetch Error', e);
      }
    }
    if (show) fetchForModel();
  }, [show]);

  const personList = isPurchase ? suppliers : customers;
  const mappedPeople = personList.map((item) => ({
    code: item.code || item.customer_supplier_code,
    name:
      (item.name || item.customer_supplier_name || '') +
      ' ( ' +
      (item.code || item.customer_supplier_code || '') +
      ' )'
  }));

  const mappedProducts = products.map((item) => ({
    code: item.code || item.product_code,
    name:
      (item.name || item.product_name || '') +
      ' ( ' +
      (item.code || item.product_code || '') +
      ' )'
  }));

  const addRow = () =>
    setRows([...rows, { row_code: '', quality: '', unit: 'kg', price: '', price_total: 0 }]);

  const removeRow = (index) =>
    rows.length > 1 && setRows(rows.filter((_, i) => i !== index));

  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;

    if (field === 'row_code') {
      const productRef =
        viewMode === 'account'
          ? products.find((p) => p.code.toString() === value.toString())
          : products.find((p) => p.code.toString() === headerData.code.toString());

      if (productRef) {
        newRows[index].unit = productRef.unit || 'kg';
        newRows[index].price = productRef.product_price || productRef.price || '';
      }
    }

    // Recalculate Line Total
    if (['quality', 'price', 'unit', 'row_code'].includes(field)) {
      const qty = parseFloat(newRows[index].quality) || 0;
      const prc = parseFloat(newRows[index].price) || 0;

      const productRef =
        viewMode === 'account'
          ? products.find((p) => p.code.toString() === newRows[index].row_code.toString())
          : products.find((p) => p.code.toString() === headerData.code.toString());

      if (productRef && productRef.unit && newRows[index].unit && productRef.unit !== newRows[index].unit) {
        if (productRef.unit === 'kg' && newRows[index].unit === 'g') {
          newRows[index].price_total = (qty * (prc / 1000)).toFixed(2);
        } else if (productRef.unit === 'g' && newRows[index].unit === 'kg') {
          newRows[index].price_total = (qty * (prc * 1000)).toFixed(2);
        } else {
          newRows[index].price_total = (qty * prc).toFixed(2);
        }
      } else {
        newRows[index].price_total = (qty * prc).toFixed(2);
      }
    }
    setRows(newRows);

    if (field === 'row_code' && value) {
      addRow();
    }
  };

  const grandTotal = rows
    .reduce((acc, row) => acc + (parseFloat(row.price_total) || 0), 0)
    .toFixed(2);

  const handleSubmit = async () => {
    if (!headerData.code) {
      return alert(t('Please make a selection in the header') || 'மேலே உள்ள தேர்வை முடிக்கவும்');
    }
    const validRows = rows.filter((r) => r.row_code && r.quality);
    if (validRows.length === 0) {
      return alert(t('Please add at least one valid item') || 'குறைந்தது ஒரு சரியான பூ பொருளை சேர்க்கவும்');
    }

    setLoading(true);
    const payload = {
      date: headerData.date,
      viewMode,
      headerCode: headerData.code,
      items: validRows
    };

    try {
      if (isPurchase) {
        await createPurchaseEntryBulk(payload);
      } else {
        await createSalesEntryBulk(payload);
      }
      onSubmit();
      onHide();
      setRows([{ row_code: '', quality: '', unit: 'kg', price: '', price_total: 0 }]);
      setHeaderData({ ...headerData, code: '' });
    } catch (e) {
      console.error(e);
      alert(t('Error saving entries') || 'பதிவுகளை சேமிப்பதில் பிழை ஏற்பட்டது');
    } finally {
      setLoading(false);
    }
  };

  const formatRupee = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amt || 0);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className="erp-transaction-modal"
      backdrop="static"
    >
      {/* Dynamic 2026 ERP Modal Header */}
      <div className={`erp-modal-header ${isPurchase ? 'purchase-theme' : 'sales-theme'}`}>
        <h3 className="erp-modal-title">
          <FontAwesomeIcon icon={isPurchase ? faShoppingCart : faArrowUpRightFromSquare} />
          <span>
            {isPurchase
              ? t('btn_add_purchase') + ' பதிவு' || 'கொள்முதல் பதிவு'
              : t('btn_add_sales') + ' பதிவு' || 'விற்பனை பதிவு'}
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

      <div className="erp-modal-body">
        {/* VIEW MODE SWITCHER */}
        <div className="erp-mode-switcher-container">
          <div className="erp-mode-switcher">
            <button
              type="button"
              className={`erp-mode-btn ${
                viewMode === 'account'
                  ? isPurchase
                    ? 'active purchase-active'
                    : 'active sales-active'
                  : ''
              }`}
              onClick={() => setViewMode('account')}
            >
              <FontAwesomeIcon icon={faUser} />
              <span>
                {isPurchase
                  ? t('filter_by_supplier') || 'சப்ளையர் வாரியாக'
                  : t('filter_by_customer') || 'வாடிக்கையாளர் வாரியாக'}
              </span>
            </button>
            <button
              type="button"
              className={`erp-mode-btn ${
                viewMode === 'product'
                  ? isPurchase
                    ? 'active purchase-active'
                    : 'active sales-active'
                  : ''
              }`}
              onClick={() => setViewMode('product')}
            >
              <FontAwesomeIcon icon={faBoxOpen} />
              <span>{t('mode_by_product') || 'பூ பொருள் வாரியாக'}</span>
            </button>
          </div>
        </div>

        {/* HEADER INFORMATION CARD */}
        <div className="erp-header-info-card">
          <Row className="g-3 align-items-center">
            <Col md={5}>
              <Form.Label className="small text-muted fw-bold mb-2 d-flex align-items-center gap-1">
                <FontAwesomeIcon
                  icon={viewMode === 'account' ? faAddressCard : faLayerGroup}
                  className="text-primary"
                />
                <span>
                  {viewMode === 'account'
                    ? isPurchase
                      ? t('select.supplier') || 'சப்ளையரை தேர்வு செய்க'
                      : t('select.customer') || 'வாடிக்கையாளரை தேர்வு செய்க'
                    : t('select.product') || 'பூ பொருளை தேர்வு செய்க'}
                </span>
              </Form.Label>
              <SearchableSelect
                value={headerData.code}
                options={viewMode === 'account' ? mappedPeople : mappedProducts}
                onChange={(e) => setHeaderData({ ...headerData, code: e.target.value })}
              />
            </Col>

            <Col md={4}>
              <div className="erp-date-badge-card tamil-date">
                <div className="badge-icon">
                  <FontAwesomeIcon icon={faMoon} />
                </div>
                <div>
                  <span className="badge-sub d-block">
                    {t('tamil_calendar_date') || 'தமிழ் தேதி'}
                  </span>
                  <span className="badge-val">
                    {tamilDateInfo?.tamil_month_name_ta}{' '}
                    {tamilDateInfo?.tamil_date || '—'}
                  </span>
                </div>
              </div>
            </Col>

            <Col md={3}>
              <div className="erp-date-badge-card gregorian-date">
                <div className="badge-icon">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                </div>
                <div>
                  <span className="badge-sub d-block">
                    {t('gregorian_calendar_date') || 'காலண்டர் தேதி'}
                  </span>
                  <span className="badge-val">{headerData.date}</span>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* DATA ENTRY LINE ITEMS CARD */}
        <div className="erp-line-items-card">
          <div className="table-responsive">
            <table className="erp-line-items-table" aria-label="பரிவர்த்தனை விவரங்கள்">
              <thead>
                <tr>
                  <th style={{ width: '35%' }}>
                    {viewMode === 'account'
                      ? t('product.add') || 'பூ பொருள் சேர்க்க'
                      : isPurchase
                      ? t('supplier.add') || 'சப்ளையர் சேர்க்க'
                      : t('customer.add') || 'வாடிக்கையாளர் சேர்க்க'}
                  </th>
                  <th style={{ width: '25%' }}>{t('quantity') || 'அளவு & அலகு'}</th>
                  <th style={{ width: '20%' }}>{t('price') || 'விலை (₹)'}</th>
                  <th style={{ width: '15%' }} className="text-end">
                    {t('total') || 'மொத்தம் (₹)'}
                  </th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td className="row-item-select">
                      <SearchableSelect
                        value={row.row_code}
                        options={viewMode === 'account' ? mappedProducts : mappedPeople}
                        onChange={(e) => handleRowChange(index, 'row_code', e.target.value)}
                      />
                    </td>
                    <td className="row-qty-unit">
                      <InputGroup size="sm">
                        <Form.Control
                          type="number"
                          step="any"
                          className="text-center font-numeric fw-bold"
                          placeholder="0.00"
                          value={row.quality}
                          onChange={(e) => handleRowChange(index, 'quality', e.target.value)}
                        />
                        <Form.Select
                          style={{ maxWidth: '75px', fontSize: '11px', fontWeight: 600 }}
                          value={row.unit}
                          onChange={(e) => handleRowChange(index, 'unit', e.target.value)}
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="படி">படி</option>
                          <option value="pie">pie</option>
                        </Form.Select>
                      </InputGroup>
                    </td>
                    <td className="row-price">
                      <InputGroup size="sm">
                        <InputGroup.Text className="bg-light text-muted">
                          <FontAwesomeIcon icon={faIndianRupeeSign} style={{ fontSize: '0.7rem' }} />
                        </InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="any"
                          className="text-end font-numeric fw-bold"
                          placeholder="0.00"
                          value={row.price}
                          onChange={(e) => handleRowChange(index, 'price', e.target.value)}
                        />
                      </InputGroup>
                    </td>
                    <td className="row-total font-numeric text-end">
                      {formatRupee(parseFloat(row.price_total || 0))}
                    </td>
                    <td className="row-action">
                      {rows.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-row"
                          onClick={() => removeRow(index)}
                          title="Remove row"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-light border-top d-flex justify-content-start">
            <button
              type="button"
              className="btn-add-line-item"
              onClick={addRow}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>{t('btn_add_another_item') || '+ மற்றொரு பொருள் சேர்க்க'}</span>
            </button>
          </div>

          {/* Grand Total Banner */}
          <div className="erp-modal-grand-total">
            <span className="total-title">
              {t('transaction_grand_total') || 'மொத்த பரிவர்த்தனை தொகை'}:
            </span>
            <span className="total-amount-display font-numeric">
              {formatRupee(parseFloat(grandTotal || 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Modal Footer */}
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
          id="btn-modal-save-entries"
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
              <span>{t('Saving...') || 'சேமிக்கிறது...'}</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
              <span>{t('btn_save_entries') || 'பதிவு செய்'}</span>
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};

export default EntryModal;
