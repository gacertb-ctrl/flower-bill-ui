import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faBoxesStacked,
  faArrowDown,
  faArrowUp,
  faCartPlus,
  faMoneyBillWave,
  faExternalLinkAlt,
  faTriangleExclamation,
  faCircleCheck
} from '@fortawesome/free-solid-svg-icons';
import './StockDetailDrawer.css';

const StockDetailDrawer = ({
  stock,
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!stock || !isOpen) return null;

  const purchases = parseFloat(stock.total_purchase_quality || 0);
  const sales = parseFloat(stock.total_sales_quality || 0);
  const balance = purchases - sales;
  const price = parseFloat(stock.price || 0);
  const valuation = balance > 0 ? balance * price : 0;

  const formatRupee = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amt || 0);
  };

  return (
    <div className="detail-drawer-overlay" onClick={onClose}>
      {/* Slide-in Drawer */}
      <aside
        className="detail-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-drawer-title"
      >
        {/* Drawer Header */}
        <div className="detail-drawer-header">
          <div className="erp-drawer-title-group">
            <div className="d-flex align-items-center gap-2">
              <h2 id="stock-drawer-title" className="erp-drawer-title">
                {stock.product_name}
              </h2>
              <span className="erp-badge erp-badge-violet font-numeric">
                {stock.product_code}
              </span>
              <span className="unit-pill">{stock.unit || 'kg'}</span>
            </div>
            <span className="erp-drawer-subtitle">
              {t('stock_drawer_title') || 'சரக்கு இருப்பு விரைவு விவரம்'}
            </span>
          </div>

          <button
            className="erp-icon-btn"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="erp-drawer-body">
          {/* Status Alert Banner */}
          {balance <= 0 ? (
            <div className="stock-alert-banner alert-out">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              <div>
                <strong>{t('stock_status_out') || 'இருப்பு இல்லை'}</strong>
                <p>இந்த பூ வகையின் இருப்பு தீர்ந்துவிட்டது. உடனடியாக புதிய வரத்து பதிவு செய்யவும்.</p>
              </div>
            </div>
          ) : balance <= 5 ? (
            <div className="stock-alert-banner alert-low">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              <div>
                <strong>{t('stock_status_low') || 'குறைந்த இருப்பு'}</strong>
                <p>இருப்பு அளவு 5 {stock.unit || 'kg'}-க்கு குறைவாக உள்ளது. வரத்து தேவையை கவனிக்கவும்.</p>
              </div>
            </div>
          ) : (
            <div className="stock-alert-banner alert-sufficient">
              <FontAwesomeIcon icon={faCircleCheck} />
              <div>
                <strong>{t('stock_status_sufficient') || 'போதுமான இருப்பு'}</strong>
                <p>இன்றைய விற்பனைக்கு தேவையான அளவு இருப்பு போதுமானதாக உள்ளது.</p>
              </div>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="stock-drawer-metrics">
            <div className="drawer-metric-card">
              <span className="metric-label">{t('col_price') || 'விலை'}</span>
              <span className="metric-val font-numeric text-primary">
                {formatRupee(price)}
              </span>
              <span className="metric-sub">{stock.unit ? `1 ${stock.unit}` : ''}</span>
            </div>

            <div className="drawer-metric-card">
              <span className="metric-label">{t('col_current_balance') || 'தற்போதைய இருப்பு'}</span>
              <span className={`metric-val font-numeric ${balance <= 0 ? 'text-danger' : 'text-emerald'}`}>
                {balance.toFixed(2)} {stock.unit || 'kg'}
              </span>
              <span className="metric-sub">{balance > 0 ? 'கையிருப்பு' : 'தீர்ந்தது'}</span>
            </div>

            <div className="drawer-metric-card full-width">
              <span className="metric-label">{t('col_stock_valuation') || 'மொத்த இருப்பு மதிப்பு'}</span>
              <span className="metric-val font-numeric">
                {formatRupee(valuation)}
              </span>
              <span className="metric-sub font-numeric">
                {balance > 0 ? `${balance.toFixed(2)} ${stock.unit} × ${formatRupee(price)}` : 'மதிப்பு இல்லை'}
              </span>
            </div>
          </div>

          {/* Daily Movement Breakdown */}
          <div className="stock-drawer-section">
            <h3 className="section-title">
              <FontAwesomeIcon icon={faBoxesStacked} className="me-2 text-primary" />
              இன்றைய வரவு செலவு நகர்வு
            </h3>

            <div className="movement-list">
              <div className="movement-row">
                <div className="d-flex align-items-center gap-2">
                  <div className="movement-icon-wrap in">
                    <FontAwesomeIcon icon={faArrowDown} />
                  </div>
                  <div>
                    <span className="movement-label">{t('col_incoming') || 'மொத்த கொள்முதல் வரத்து'}</span>
                    <span className="movement-sub">சப்ளையர்களிடமிருந்து பெறப்பட்டது</span>
                  </div>
                </div>
                <span className="movement-qty font-numeric text-blue">
                  +{purchases.toFixed(2)} {stock.unit || 'kg'}
                </span>
              </div>

              <div className="movement-row">
                <div className="d-flex align-items-center gap-2">
                  <div className="movement-icon-wrap out">
                    <FontAwesomeIcon icon={faArrowUp} />
                  </div>
                  <div>
                    <span className="movement-label">{t('col_outgoing') || 'மொத்த விற்பனை வழங்கல்'}</span>
                    <span className="movement-sub">வாடிக்கையாளர்களுக்கு விற்கப்பட்டது</span>
                  </div>
                </div>
                <span className="movement-qty font-numeric text-emerald">
                  -{sales.toFixed(2)} {stock.unit || 'kg'}
                </span>
              </div>

              <div className="movement-row net">
                <span className="movement-label fw-bold">{t('col_current_balance') || 'நிகர இருப்பு நிலை'}</span>
                <span className={`movement-qty font-numeric fw-bold ${balance <= 0 ? 'text-danger' : 'text-primary'}`}>
                  {balance.toFixed(2)} {stock.unit || 'kg'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="stock-drawer-section">
            <h3 className="section-title">
              <FontAwesomeIcon icon={faMoneyBillWave} className="me-2 text-primary" />
              துரித பதிவுகள்
            </h3>

            <div className="drawer-quick-actions">
              <button
                className="btn-erp-primary w-100 justify-content-center"
                onClick={() => navigate('/entries')}
              >
                <FontAwesomeIcon icon={faCartPlus} />
                <span>{t('action_entry_purchase') || 'கொள்முதல் வரவு பதிவு'}</span>
              </button>

              <button
                className="btn-erp-secondary w-100 justify-content-center"
                onClick={() => navigate('/products')}
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} />
                <span>பொருள் விவரம் & விலை திருத்தம்</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default StockDetailDrawer;
