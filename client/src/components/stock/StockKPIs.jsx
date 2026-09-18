import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxesStacked,
  faArrowDown,
  faArrowUp,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';
import './StockKPIs.css';

const StockKPIs = ({
  totalStockQty = 0,
  todayPurchaseQty = 0,
  todaySalesQty = 0,
  lowStockCount = 0,
  outOfStockCount = 0,
  totalStockValue = 0,
  loading = false
}) => {
  const { t } = useTranslation();

  const formatQty = (qty) => {
    return Number(qty || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatRupee = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  if (loading) {
    return (
      <div className="stock-kpis-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stock-kpi-card erp-skeleton">
            <div className="stock-kpi-skeleton-line short"></div>
            <div className="stock-kpi-skeleton-line long"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="stock-kpis-grid" aria-label="சரக்கு இருப்பு முக்கிய அளவீடுகள்">
      {/* 1. Total Current Stock */}
      <div className="stock-kpi-card card-violet">
        <div className="stock-kpi-icon-wrap">
          <FontAwesomeIcon icon={faBoxesStacked} />
        </div>
        <div className="stock-kpi-content">
          <span className="stock-kpi-label">{t('kpi_total_stock_qty') || 'மொத்த இருப்பு'}</span>
          <div className="stock-kpi-value-group">
            <span className="stock-kpi-value font-numeric">{formatQty(totalStockQty)}</span>
            <span className="stock-kpi-unit">kg / அலகுகள்</span>
          </div>
          <span className="stock-kpi-subtext font-numeric text-muted">
            {t('col_stock_valuation') || 'மதிப்பு'}: {formatRupee(totalStockValue)}
          </span>
        </div>
      </div>

      {/* 2. Today's Purchases (Intake) */}
      <div className="stock-kpi-card card-blue">
        <div className="stock-kpi-icon-wrap">
          <FontAwesomeIcon icon={faArrowDown} />
        </div>
        <div className="stock-kpi-content">
          <span className="stock-kpi-label">{t('kpi_today_purchase_qty') || 'இன்று வந்தது'}</span>
          <div className="stock-kpi-value-group">
            <span className="stock-kpi-value font-numeric text-blue">{formatQty(todayPurchaseQty)}</span>
            <span className="stock-kpi-unit">kg</span>
          </div>
          <span className="stock-kpi-subtext">
            {t('col_incoming') || 'கொள்முதல் வரத்து'}
          </span>
        </div>
      </div>

      {/* 3. Today's Sales (Outgoing) */}
      <div className="stock-kpi-card card-emerald">
        <div className="stock-kpi-icon-wrap">
          <FontAwesomeIcon icon={faArrowUp} />
        </div>
        <div className="stock-kpi-content">
          <span className="stock-kpi-label">{t('kpi_today_sales_qty') || 'இன்று விற்றது'}</span>
          <div className="stock-kpi-value-group">
            <span className="stock-kpi-value font-numeric text-emerald">{formatQty(todaySalesQty)}</span>
            <span className="stock-kpi-unit">kg</span>
          </div>
          <span className="stock-kpi-subtext">
            {t('col_outgoing') || 'விற்பனை வழங்கல்'}
          </span>
        </div>
      </div>

      {/* 4. Low / Depleted Stock */}
      <div className="stock-kpi-card card-amber">
        <div className="stock-kpi-icon-wrap">
          <FontAwesomeIcon icon={faTriangleExclamation} />
        </div>
        <div className="stock-kpi-content">
          <span className="stock-kpi-label">{t('kpi_low_stock_count') || 'குறைந்த இருப்பு'}</span>
          <div className="stock-kpi-value-group">
            <span className="stock-kpi-value font-numeric text-amber">{lowStockCount}</span>
            <span className="stock-kpi-unit">பூக்கள்</span>
          </div>
          <span className="stock-kpi-subtext text-danger font-numeric">
            {outOfStockCount > 0 ? `${outOfStockCount} இருப்பு இல்லை` : 'கவனம் தேவை'}
          </span>
        </div>
      </div>
    </section>
  );
};

export default StockKPIs;
