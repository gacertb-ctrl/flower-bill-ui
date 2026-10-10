import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxesStacked,
  faArrowDown,
  faArrowUp,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';
import './ProductKPIs.css';

export const formatRupee = (amount) => {
  const num = parseFloat(amount || 0);
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const ProductKPIs = ({ productData = [] }) => {
  const { t } = useTranslation();

  const metrics = useMemo(() => {
    let total = productData.length;
    let todayPurchases = 0;
    let todaySales = 0;
    let totalStockQty = 0;
    let totalStockValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    productData.forEach((item) => {
      const p = parseFloat(item.total_purchase_quality || 0);
      const s = parseFloat(item.total_sales_quality || 0);
      const balance = parseFloat(item.balance !== undefined ? item.balance : (item.quality || 0));
      const price = parseFloat(item.price || 0);

      todayPurchases += p;
      todaySales += s;

      if (balance > 0) {
        totalStockQty += balance;
        totalStockValuation += (balance * price);
      }

      if (balance <= 0) {
        outOfStockCount += 1;
      } else if (balance <= 5) {
        lowStockCount += 1;
      }
    });

    return {
      total,
      todayPurchases,
      todaySales,
      totalStockQty,
      totalStockValuation,
      lowStockCount,
      outOfStockCount
    };
  }, [productData]);

  return (
    <div className="product-kpi-grid">
      {/* 1. Total Catalog Items & Current Balance */}
      <div className="kpi-card kpi-violet">
        <div className="kpi-icon-wrapper">
          <FontAwesomeIcon icon={faBoxesStacked} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">{t('kpi_total_products') || 'மொத்த பூ வகைகள்'}</span>
          <div className="d-flex align-items-baseline gap-2">
            <span className="kpi-value font-numeric">{metrics.total}</span>
            <span className="small text-muted font-numeric">({metrics.totalStockQty.toFixed(2)} kg)</span>
          </div>
          <span className="small text-muted font-numeric mt-1">
            {t('col_stock_valuation') || 'மதிப்பு'}: {formatRupee(metrics.totalStockValuation)}
          </span>
        </div>
      </div>

      {/* 2. Today's Purchases */}
      <div className="kpi-card kpi-blue">
        <div className="kpi-icon-wrapper">
          <FontAwesomeIcon icon={faArrowDown} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">{t('kpi_today_purchase_qty') || 'இன்றைய வரத்து'}</span>
          <span className="kpi-value font-numeric" style={{ color: '#2563EB' }}>
            {metrics.todayPurchases.toFixed(2)}
          </span>
          <span className="small text-muted">
            {t('col_incoming') || 'கொள்முதல்'} (kg / படி)
          </span>
        </div>
      </div>

      {/* 3. Today's Sales */}
      <div className="kpi-card kpi-green">
        <div className="kpi-icon-wrapper">
          <FontAwesomeIcon icon={faArrowUp} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">{t('kpi_today_sales_qty') || 'இன்றைய விற்பனை'}</span>
          <span className="kpi-value font-numeric" style={{ color: '#059669' }}>
            {metrics.todaySales.toFixed(2)}
          </span>
          <span className="small text-muted">
            {t('col_outgoing') || 'விற்பனை வழங்கல்'}
          </span>
        </div>
      </div>

      {/* 4. Low & Depleted Stock Alert */}
      <div className="kpi-card kpi-amber">
        <div className="kpi-icon-wrapper">
          <FontAwesomeIcon icon={faTriangleExclamation} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">{t('kpi_low_stock_count') || 'குறைந்த இருப்பு'}</span>
          <div className="d-flex align-items-baseline gap-2">
            <span className="kpi-value font-numeric text-amber">{metrics.lowStockCount}</span>
            {metrics.outOfStockCount > 0 && (
              <span className="badge bg-danger font-numeric text-white px-2 py-1" style={{ fontSize: '0.7rem' }}>
                {metrics.outOfStockCount} {t('stock_out') || 'இல்லை'}
              </span>
            )}
          </div>
          <span className="small text-danger mt-1">
            {metrics.lowStockCount > 0 || metrics.outOfStockCount > 0 ? 'கவனம் தேவை' : 'சீரான இருப்பு'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductKPIs;

