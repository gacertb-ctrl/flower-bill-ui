import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPhone,
  faLocationDot,
  faMoneyBillWave,
  faPen,
  faPrint,
  faHistory,
  faFileInvoice,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import { formatRupee } from './CustomerKPIs';
import { getLastCustomerTransactions } from '../../api/customerAPI';
import './CustomerDetailDrawer.css';

const CustomerDetailDrawer = ({
  customer,
  onClose,
  onEdit
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);

  // Load transactions when customer changes
  useEffect(() => {
    if (!customer?.code) return;

    let isMounted = true;
    const loadTx = async () => {
      setLoadingTx(true);
      try {
        const response = await getLastCustomerTransactions({ cus_sup_code: customer.code });
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
  }, [customer?.code]);

  if (!customer) return null;

  const debit = parseFloat(customer.debit_amount || 0);
  const credit = parseFloat(customer.credit_amount || 0);
  const balance = debit - credit;
  const hasBalance = balance > 0;

  // Filter transactions by type
  const salesTransactions = transactions.filter(t => t.type === 'sales' || t.type === 'purchase');
  const paymentTransactions = transactions.filter(t => t.type === 'credit' || t.type === 'payment');

  return (
    <div className="detail-drawer-overlay" onClick={onClose}>
      <div className="detail-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="detail-drawer-header">
          <div className="detail-drawer-title-group">
            <h2 className="detail-customer-name">{customer.name}</h2>
            <div className="detail-meta-row">
              <span className="erp-badge erp-badge-violet font-numeric">{customer.code}</span>
              {customer.address && <span>{customer.address}</span>}
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
              <span className="drawer-fin-val font-numeric text-primary">{formatRupee(debit)}</span>
            </div>

            <div className="drawer-fin-item">
              <span className="drawer-fin-label">{t('col_paid') || 'செலுத்தியது'}</span>
              <span className="drawer-fin-val font-numeric text-success">{formatRupee(credit)}</span>
            </div>

            <div className="drawer-fin-item">
              <span className="drawer-fin-label">{t('col_balance') || 'பாக்கி'}</span>
              <span className={`drawer-fin-val font-numeric ${hasBalance ? 'text-danger' : 'text-success'}`}>
                {formatRupee(balance)}
              </span>
            </div>
          </div>

          {/* Prominent Quick Action Button */}
          <div className="drawer-quick-action-bar">
            <button
              className="btn-drawer-payment"
              onClick={() => {
                window.location.href = `/debit-credit?code=${customer.code}`;
              }}
            >
              <FontAwesomeIcon icon={faMoneyBillWave} />
              <span>{t('quick_receive_payment') || 'பணம் பெறுதல்'}</span>
            </button>

            <button
              className="btn-erp-secondary"
              onClick={() => onEdit(customer)}
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
              className={`drawer-tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
              onClick={() => setActiveTab('sales')}
            >
              {t('tab_sales') || 'விற்பனை'} ({salesTransactions.length})
            </button>

            <button
              className={`drawer-tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              {t('tab_payments') || 'பணம்'} ({paymentTransactions.length})
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
                    {t('customer_phone') || 'அலைபேசி'}
                  </span>
                  <span className="detail-info-value">
                    {customer.contact ? (
                      <a href={`tel:${customer.contact}`} className="text-primary text-decoration-none font-numeric">
                        {customer.contact}
                      </a>
                    ) : '-'}
                  </span>
                </div>

                <div className="detail-info-row">
                  <span className="detail-info-label">
                    <FontAwesomeIcon icon={faLocationDot} className="me-2 text-muted" />
                    {t('customer_address') || 'முகவரி'}
                  </span>
                  <span className="detail-info-value">{customer.address || '-'}</span>
                </div>

                <div className="detail-info-row">
                  <span className="detail-info-label">{t('customer_code') || 'குறியீடு'}</span>
                  <span className="detail-info-value font-numeric">{customer.code}</span>
                </div>

                <div className="detail-info-row">
                  <span className="detail-info-label">கணக்கு நிலை</span>
                  <span className="detail-info-value">
                    {hasBalance ? (
                      <span className="erp-badge erp-badge-rose">
                        {t('badge_has_balance') || 'பாக்கி உள்ளது'}
                      </span>
                    ) : (
                      <span className="erp-badge erp-badge-green">
                        {t('badge_settled') || 'செலுத்தப்பட்டது'}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <button
                className="btn-erp-secondary w-100 mt-2"
                onClick={() => {
                  window.open(`/print-report?period=date&type=sales&code=${customer.code}`, '_blank');
                }}
              >
                <FontAwesomeIcon icon={faPrint} />
                <span>அறிக்கை அச்சிடு / பதிவிறக்கு</span>
              </button>
            </div>
          )}

          {/* Tab 2: Sales (விற்பனை) */}
          {activeTab === 'sales' && (
            <div className="drawer-tab-panel">
              {loadingTx ? (
                <div className="text-center py-4 text-muted small">ஏற்றுகிறது...</div>
              ) : salesTransactions.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  விற்பனை பதிவுகள் எதுவும் இல்லை
                </div>
              ) : (
                salesTransactions.map((tx, idx) => (
                  <div key={idx} className="drawer-tx-item">
                    <div className="drawer-tx-left">
                      <span className="fw-semibold text-primary font-numeric">
                        {formatRupee(tx.total)}
                      </span>
                      <span className="drawer-tx-date font-numeric">
                        {tx.date ? tx.date.split('T')[0] : ''}
                      </span>
                    </div>

                    <button
                      className="btn-erp-secondary btn-sm"
                      onClick={() => {
                        window.open(`/print-report?period=date&type=sales&code=${customer.code}&date=${tx.date?.split('T')[0]}`, '_blank');
                      }}
                      title="Download receipt"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Payments (பணம்) */}
          {activeTab === 'payments' && (
            <div className="drawer-tab-panel">
              {loadingTx ? (
                <div className="text-center py-4 text-muted small">ஏற்றுகிறது...</div>
              ) : paymentTransactions.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  பணம் செலுத்திய பதிவுகள் எதுவும் இல்லை
                </div>
              ) : (
                paymentTransactions.map((tx, idx) => (
                  <div key={idx} className="drawer-tx-item">
                    <div className="drawer-tx-left">
                      <span className="fw-semibold text-success font-numeric">
                        {formatRupee(tx.total)}
                      </span>
                      <span className="drawer-tx-date font-numeric">
                        {tx.date ? tx.date.split('T')[0] : ''}
                      </span>
                    </div>

                    <span className="erp-badge erp-badge-green font-numeric">வரவு</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Ledger (லெட்ஜர்) */}
          {activeTab === 'ledger' && (
            <div className="drawer-tab-panel">
              {loadingTx ? (
                <div className="text-center py-4 text-muted small">ஏற்றுகிறது...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  பரிவர்த்தனைகள் எதுவும் இல்லை
                </div>
              ) : (
                transactions.map((tx, idx) => (
                  <div key={idx} className="drawer-tx-item">
                    <div className="drawer-tx-left">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold font-numeric">{formatRupee(tx.total)}</span>
                        <span className={`erp-badge ${tx.type === 'sales' || tx.type === 'purchase' ? 'erp-badge-rose' : 'erp-badge-green'}`}>
                          {tx.type === 'sales' ? 'விற்பனை' : tx.type === 'credit' ? 'வரவு' : tx.type}
                        </span>
                      </div>
                      <span className="drawer-tx-date font-numeric">
                        {tx.date ? tx.date.split('T')[0] : ''}
                      </span>
                    </div>

                    <button
                      className="btn-erp-secondary btn-sm"
                      onClick={() => {
                        window.open(`/print-report?period=date&type=${tx.type}&code=${customer.code}&date=${tx.date?.split('T')[0]}`, '_blank');
                      }}
                      title="Download receipt"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailDrawer;
