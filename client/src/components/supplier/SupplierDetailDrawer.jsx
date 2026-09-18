import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPhone,
  faLocationDot,
  faMoneyBillWave,
  faPen,
  faPercent,
  faHistory,
  faBoxesStacked,
  faReceipt
} from '@fortawesome/free-solid-svg-icons';
import { formatRupee } from './SupplierKPIs';
import { getLastSupplierTransactions } from '../../api/supplierAPI';
import './SupplierDetailDrawer.css';

const SupplierDetailDrawer = ({
  supplier,
  onClose,
  onEdit
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);

  // Load transactions when supplier changes
  useEffect(() => {
    if (!supplier?.code) return;

    let isMounted = true;
    const loadTx = async () => {
      setLoadingTx(true);
      try {
        const response = await getLastSupplierTransactions(supplier.code);
        if (isMounted && response?.data) {
          setTransactions(response.data);
        }
      } catch (err) {
        console.error("Error loading transactions in detail drawer:", err);
      } finally {
        if (isMounted) setLoadingTx(false);
      }
    };

    loadTx();
    return () => { isMounted = false; };
  }, [supplier?.code]);

  if (!supplier) return null;

  // Accounting for flower market supplier:
  // credit_amount = total purchases received
  // debit_amount = payouts made
  // payable = credit_amount - debit_amount
  const totalPurchase = parseFloat(supplier.credit_amount || 0);
  const totalPaid = parseFloat(supplier.debit_amount || 0);
  const payable = totalPurchase - totalPaid;
  const hasPayable = payable > 0;
  const commissionRate = supplier.commission ? `${supplier.commission}%` : '12.5%';

  // Filter transactions by type
  const purchaseTransactions = transactions.filter(t => t.type === 'purchase' || t.type === 'credit');
  const paymentTransactions = transactions.filter(t => t.type === 'payment' || t.type === 'debit');

  return (
    <div className="detail-drawer-overlay" onClick={onClose}>
      <div className="detail-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="detail-drawer-header">
          <div className="detail-drawer-title-group">
            <h2 className="detail-supplier-name">{supplier.name}</h2>
            <div className="detail-meta-row">
              <span className="erp-badge erp-badge-violet font-numeric">{supplier.code}</span>
              <span className="commission-badge font-numeric">{commissionRate}</span>
              {supplier.address && <span>{supplier.address}</span>}
            </div>
          </div>

          <button
            className="erp-icon-btn border-0"
            onClick={onClose}
            aria-label="Close details"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="detail-drawer-body">
          {/* Financial Summary Highlight */}
          <div className="drawer-financial-cards">
            <div className="drawer-fin-item">
              <span className="drawer-fin-label">{t('col_total_purchase') || 'கொள்முதல்'}</span>
              <span className="drawer-fin-val font-numeric text-primary">{formatRupee(totalPurchase)}</span>
            </div>

            <div className="drawer-fin-item">
              <span className="drawer-fin-label">{t('col_paid') || 'செலுத்தியது'}</span>
              <span className="drawer-fin-val font-numeric text-success">{formatRupee(totalPaid)}</span>
            </div>

            <div className="drawer-fin-item">
              <span className="drawer-fin-label">{t('col_payable') || 'பாக்கி'}</span>
              <span className={`drawer-fin-val font-numeric ${hasPayable ? 'text-danger' : 'text-success'}`}>
                {formatRupee(payable)}
              </span>
            </div>
          </div>

          {/* Prominent Quick Action Button */}
          <div className="drawer-quick-action-bar">
            <button
              className="btn-drawer-payment"
              onClick={() => {
                window.location.href = `/debit-credit?code=${supplier.code}`;
              }}
            >
              <FontAwesomeIcon icon={faMoneyBillWave} />
              <span>{t('quick_make_payment') || 'பணம் செலுத்துதல்'}</span>
            </button>

            <button
              className="btn-erp-secondary"
              onClick={() => onEdit(supplier)}
              title={t('edit') || 'திருத்த'}
            >
              <FontAwesomeIcon icon={faPen} />
              <span>{t('edit') || 'திருத்த'}</span>
            </button>
          </div>

          {/* Logical Tabs */}
          <div className="drawer-tabs">
            <button
              className={`drawer-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              {t('tab_overview') || 'கண்ணோட்டம்'}
            </button>

            <button
              className={`drawer-tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
              onClick={() => setActiveTab('purchases')}
            >
              {t('tab_purchases') || 'கொள்முதல்'} ({purchaseTransactions.length})
            </button>

            <button
              className={`drawer-tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              {t('tab_payments') || 'பட்டுவாடா'} ({paymentTransactions.length})
            </button>

            <button
              className={`drawer-tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
              onClick={() => setActiveTab('ledger')}
            >
              {t('tab_ledger') || 'லெட்ஜர்'} ({transactions.length})
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="drawer-tab-panel">
              <div className="detail-info-group">
                <div className="detail-info-row">
                  <span className="detail-info-label">
                    <FontAwesomeIcon icon={faPhone} className="me-2 text-muted" />
                    {t('supplier_phone') || 'அலைபேசி'}
                  </span>
                  <span className="detail-info-value">
                    {supplier.contact ? (
                      <a href={`tel:${supplier.contact}`} className="text-primary text-decoration-none font-numeric">
                        {supplier.contact}
                      </a>
                    ) : '-'}
                  </span>
                </div>

                <div className="detail-info-row">
                  <span className="detail-info-label">
                    <FontAwesomeIcon icon={faLocationDot} className="me-2 text-muted" />
                    {t('supplier_address') || 'முகவரி / நகரம்'}
                  </span>
                  <span className="detail-info-value">{supplier.address || '-'}</span>
                </div>

                <div className="detail-info-row">
                  <span className="detail-info-label">
                    <FontAwesomeIcon icon={faPercent} className="me-2 text-muted" />
                    {t('supplier_commission') || 'கமிஷன் விகிதம்'}
                  </span>
                  <span className="detail-info-value font-numeric">{commissionRate}</span>
                </div>

                <div className="detail-info-row">
                  <span className="detail-info-label">
                    {t('status') || 'நிலை'}
                  </span>
                  <span className="detail-info-value">
                    {supplier.customer_supplier_is_active !== 'N' ? (
                      <span className="erp-badge erp-badge-green">{t('badge_active') || 'செயலில்'}</span>
                    ) : (
                      <span className="erp-badge erp-badge-amber">செயலற்றது</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Purchases */}
          {activeTab === 'purchases' && (
            <div className="drawer-tab-panel">
              {loadingTx ? (
                <div className="text-center py-4 text-muted small">பரிவர்த்தனைகள் ஏற்றப்படுகின்றன...</div>
              ) : purchaseTransactions.length === 0 ? (
                <div className="text-center py-4 text-muted small">கொள்முதல் பதிவுகள் இல்லை</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {purchaseTransactions.map((tx, idx) => (
                    <div key={idx} className="drawer-tx-item">
                      <div className="drawer-tx-left">
                        <div className="d-flex align-items-center gap-2">
                          <FontAwesomeIcon icon={faBoxesStacked} className="text-primary" />
                          <span className="fw-semibold font-numeric">{tx.bill_number || `பில் #${idx + 1}`}</span>
                        </div>
                        <span className="drawer-tx-date font-numeric">
                          {tx.date ? tx.date.split('T')[0] : '-'}
                        </span>
                      </div>
                      <span className="fw-bold font-numeric text-primary">
                        {formatRupee(tx.amount || tx.credit || tx.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Payments / Payouts */}
          {activeTab === 'payments' && (
            <div className="drawer-tab-panel">
              {loadingTx ? (
                <div className="text-center py-4 text-muted small">பரிவர்த்தனைகள் ஏற்றப்படுகின்றன...</div>
              ) : paymentTransactions.length === 0 ? (
                <div className="text-center py-4 text-muted small">பட்டுவாடா பதிவுகள் இல்லை</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {paymentTransactions.map((tx, idx) => (
                    <div key={idx} className="drawer-tx-item">
                      <div className="drawer-tx-left">
                        <div className="d-flex align-items-center gap-2">
                          <FontAwesomeIcon icon={faReceipt} className="text-success" />
                          <span className="fw-semibold">பட்டுவாடா</span>
                        </div>
                        <span className="drawer-tx-date font-numeric">
                          {tx.date ? tx.date.split('T')[0] : '-'}
                        </span>
                      </div>
                      <span className="fw-bold font-numeric text-success">
                        {formatRupee(tx.amount || tx.debit)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Ledger */}
          {activeTab === 'ledger' && (
            <div className="drawer-tab-panel">
              {loadingTx ? (
                <div className="text-center py-4 text-muted small">பரிவர்த்தனைகள் ஏற்றப்படுகின்றன...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-4 text-muted small">பரிவர்த்தனை விவரங்கள் இல்லை</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {transactions.map((tx, idx) => (
                    <div key={idx} className="drawer-tx-item">
                      <div className="drawer-tx-left">
                        <span className="fw-semibold font-numeric">{tx.bill_number || `பரிவர்த்தனை #${idx + 1}`}</span>
                        <span className="drawer-tx-date font-numeric">
                          {tx.date ? tx.date.split('T')[0] : '-'}
                        </span>
                      </div>
                      <div className="d-flex flex-column align-items-end">
                        <span className="fw-bold font-numeric">
                          {formatRupee(tx.amount || tx.total || tx.credit || tx.debit)}
                        </span>
                        <span className="small text-muted" style={{ fontSize: '0.7rem' }}>
                          {tx.type || 'கொள்முதல்'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDetailDrawer;
