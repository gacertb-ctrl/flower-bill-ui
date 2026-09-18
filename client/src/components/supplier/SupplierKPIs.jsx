import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import './SupplierKPIs.css';

export const formatRupee = (amount) => {
  const num = parseFloat(amount || 0);
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const SupplierKPIs = ({ supplierData = [] }) => {
  const { t } = useTranslation();

  const metrics = useMemo(() => {
    let total = supplierData.length;
    let active = 0;

    supplierData.forEach((item) => {
      // Active status check
      if (item.customer_supplier_is_active !== 'N') {
        active++;
      }
    });

    return { total, active };
  }, [supplierData]);

  return (
    <div className="supplier-kpi-grid">
      {/* Total Suppliers */}
      <div className="kpi-card kpi-violet">
        <div className="kpi-icon-wrapper">
          <FontAwesomeIcon icon={faUsers} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">{t('kpi_total_suppliers') || 'மொத்த சப்ளையர்கள்'}</span>
          <span className="kpi-value font-numeric">{metrics.total}</span>
        </div>
      </div>

      {/* Active Suppliers */}
      <div className="kpi-card kpi-green">
        <div className="kpi-icon-wrapper">
          <FontAwesomeIcon icon={faUserCheck} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">{t('kpi_active_suppliers') || 'செயலில் உள்ளவர்கள்'}</span>
          <span className="kpi-value font-numeric">{metrics.active}</span>
        </div>
      </div>
    </div>
  );
};

export default SupplierKPIs;
