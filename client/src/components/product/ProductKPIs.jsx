import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxesStacked,
  faCircleCheck
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
    let active = total;

    return { total, active };
  }, [productData]);

  return (
    <div className="product-kpi-grid">
      {/* 1. Total Products */}
      <div className="kpi-card kpi-violet">
        <div className="kpi-icon-wrapper">
          <FontAwesomeIcon icon={faBoxesStacked} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">{t('kpi_total_products') || 'மொத்த பொருட்கள்'}</span>
          <span className="kpi-value font-numeric">{metrics.total}</span>
        </div>
      </div>

      {/* 2. Active Products */}
      <div className="kpi-card kpi-green">
        <div className="kpi-icon-wrapper">
          <FontAwesomeIcon icon={faCircleCheck} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">{t('kpi_active_products') || 'செயலில் உள்ளவை'}</span>
          <span className="kpi-value font-numeric">{metrics.active}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductKPIs;
