import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPen,
  faTrash,
  faBoxesStacked,
  faTag,
  faScaleBalanced,
  faCartPlus,
  faArrowDown,
  faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import { formatRupee } from './ProductKPIs';
import './ProductDetailDrawer.css';

const ProductDetailDrawer = ({
  product,
  onClose,
  onEdit,
  onDelete,
  user
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!product) return null;

  const price = parseFloat(product.price || 0);
  const purchases = parseFloat(product.total_purchase_quality || 0);
  const sales = parseFloat(product.total_sales_quality || 0);
  const balance = product.balance !== undefined ? parseFloat(product.balance) : parseFloat(product.quality || 0);
  const stockValue = product.valuation !== undefined ? parseFloat(product.valuation) : (balance > 0 ? balance * price : 0);

  // Stock status
  const getStockStatus = (q) => {
    if (q > 5) {
      return { label: t('stock_sufficient') || 'போதுமானது', className: 'sufficient', dot: '🟢' };
    }
    if (q > 0) {
      return { label: t('stock_low') || 'குறைந்த இருப்பு', className: 'low', dot: '🟡' };
    }
    return { label: t('stock_out') || 'இருப்பு இல்லை', className: 'out', dot: '🔴' };
  };

  const status = getStockStatus(balance);

  const getUnitDisplay = (unit) => {
    if (!unit) return '-';
    if (unit === 'kg') return t('kg') || 'கிலோ';
    if (unit === 'g') return t('g') || 'கிராம்';
    if (unit === 'படி') return t('padi') || 'படி';
    if (unit === 'pie') return t('pieces') || 'எண்ணிக்கை';
    return unit;
  };

  return (
    <div className="detail-drawer-overlay" onClick={onClose}>
      <div className="detail-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="detail-drawer-header">
          <div className="detail-drawer-title-group">
            <h2 className="detail-product-name">{product.name || product.product_name}</h2>
            <div className="detail-meta-row">
              <span className="erp-badge erp-badge-violet font-numeric">{product.code || product.product_code}</span>
              <span className="unit-badge">{getUnitDisplay(product.unit)}</span>
              <span className={`stock-status-pill ${status.className}`}>
                <span>{status.dot}</span>
                <span>{status.label}</span>
              </span>
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
          {/* Financial & Stock Highlight Banner (5 Consolidated Metrics) */}
          <div className="drawer-financial-cards">
            <div className="drawer-fin-item">
              <span className="drawer-fin-label">{t('col_price') || 'விலை'}</span>
              <span className="drawer-fin-val font-numeric text-primary">{formatRupee(price)}</span>
            </div>

            <div className="drawer-fin-item">
              <span className="drawer-fin-label">{t('col_stock_value') || 'மதிப்பு'}</span>
              <span className="drawer-fin-val font-numeric text-muted">
                {formatRupee(stockValue)}
              </span>
            </div>

            <div className="drawer-fin-item">
              <span className="drawer-fin-label">
                <FontAwesomeIcon icon={faArrowDown} className="me-1 text-blue" />
                {t('col_incoming') || 'வரத்து (கொள்முதல்)'}
              </span>
              <span className="drawer-fin-val font-numeric text-blue">
                +{purchases.toFixed(2)} {product.unit || ''}
              </span>
            </div>

            <div className="drawer-fin-item">
              <span className="drawer-fin-label">
                <FontAwesomeIcon icon={faArrowUp} className="me-1 text-emerald" />
                {t('col_outgoing') || 'விற்பனை'}
              </span>
              <span className="drawer-fin-val font-numeric text-emerald">
                -{sales.toFixed(2)} {product.unit || ''}
              </span>
            </div>

            <div className="drawer-fin-item drawer-fin-full">
              <span className="drawer-fin-label">{t('col_stock') || 'தற்போதைய இருப்பு'}</span>
              <span className={`drawer-fin-val font-numeric ${balance <= 0 ? 'text-danger' : balance <= 5 ? 'text-amber' : 'text-primary'}`}>
                {balance.toFixed(2)} {product.unit || ''}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="drawer-quick-action-bar">
            <button
              className="btn-drawer-action"
              onClick={() => onEdit(product)}
            >
              <FontAwesomeIcon icon={faPen} />
              <span>{t('edit') || 'திருத்த'}</span>
            </button>

            <button
              className="btn-erp-secondary"
              onClick={() => {
                navigate('/entries');
                onClose();
              }}
              title={t('quick_nav_entries') || 'நாள் பதிவு'}
            >
              <FontAwesomeIcon icon={faCartPlus} />
              <span>{t('quick_nav_entries') || 'பதிவு'}</span>
            </button>


            {user?.role === 'admin' && (
              <button
                className="btn-erp-secondary text-danger"
                onClick={() => onDelete(product.code || product.product_code)}
                title={t('action_delete') || 'நீக்கு'}
              >
                <FontAwesomeIcon icon={faTrash} />
                <span>{t('action_delete') || 'நீக்கு'}</span>
              </button>
            )}
          </div>

          {/* Detailed Info Group */}
          <div className="detail-info-group">
            <div className="detail-info-row">
              <span className="detail-info-label">
                <FontAwesomeIcon icon={faTag} className="me-2 text-muted" />
                {t('product.code') || 'பொருள் குறியீடு'}
              </span>
              <span className="detail-info-value font-numeric">{product.code || product.product_code}</span>
            </div>

            <div className="detail-info-row">
              <span className="detail-info-label">
                <FontAwesomeIcon icon={faBoxesStacked} className="me-2 text-muted" />
                {t('product.name') || 'பொருள் பெயர்'}
              </span>
              <span className="detail-info-value">{product.name || product.product_name}</span>
            </div>

            <div className="detail-info-row">
              <span className="detail-info-label">
                <FontAwesomeIcon icon={faScaleBalanced} className="me-2 text-muted" />
                {t('col_unit') || 'அலகு'}
              </span>
              <span className="detail-info-value">{getUnitDisplay(product.unit)}</span>
            </div>

            <div className="detail-info-row">
              <span className="detail-info-label">
                {t('col_stock_status') || 'இருப்பு நிலை'}
              </span>
              <span className="detail-info-value">
                <span className={`stock-status-pill ${status.className}`}>
                  <span>{status.dot}</span>
                  <span>{status.label}</span>
                </span>
              </span>
            </div>

            <div className="detail-info-row">
              <span className="detail-info-label">
                {t('col_price') || 'அலகு விலை'}
              </span>
              <span className="detail-info-value font-numeric">{formatRupee(price)}</span>
            </div>

            <div className="detail-info-row">
              <span className="detail-info-label">
                {t('col_stock_value') || 'மொத்த இருப்பு மதிப்பு'}
              </span>
              <span className="detail-info-value font-numeric">{formatRupee(stockValue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailDrawer;
