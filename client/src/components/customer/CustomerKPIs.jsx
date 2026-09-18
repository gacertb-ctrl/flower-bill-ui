import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserCheck,
  faExclamationCircle,
  faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';
import './CustomerKPIs.css';

export const formatRupee = (amount) => {
  const num = parseFloat(amount || 0);
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const CustomerKPIs = ({ customerData = [] }) => {
  const { t } = useTranslation();

  const metrics = useMemo(() => {
    let total = customerData.length;
    let active = 0;
    let withBalance = 0;
    let totalBalance = 0;

    customerData.forEach((item) => {
      // Active status check
      if (item.customer_supplier_is_active !== 'N') {
        active++;
      }

      // Financial balance check (debit = sales, credit = paid)
      const debit = parseFloat(item.debit_amount || 0);
      const credit = parseFloat(item.credit_amount || 0);
      const balance = debit - credit;

      if (balance > 0) {
        withBalance++;
        totalBalance += balance;
      }
    });

    return { total, active, withBalance, totalBalance };
  }, [customerData]);

  return (
    <div className="customer-kpi-grid">
      {/* Total Customers */}
      <div className="kpi-card kpi-violet">
        <div className="kpi-icon-wrapper">
          <FontAwesomeIcon icon={faUsers} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">{t('kpi_total_customers') || 'மொத்த வாடிக்கையாளர்கள்'}</span>
          <span className="kpi-value font-numeric">{metrics.total}</span>
        </div>
      </div>

      {/* Active Customers */}
      <div className="kpi-card kpi-green">
        <div className="kpi-icon-wrapper">
          <FontAwesomeIcon icon={faUserCheck} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">{t('kpi_active_customers') || 'செயலில் உள்ளவர்கள்'}</span>
          <span className="kpi-value font-numeric">{metrics.active}</span>
        </div>
      </div>

      {/* Customers with Balance */}
      <div className="kpi-card kpi-amber">
        <div className="kpi-icon-wrapper">
          <FontAwesomeIcon icon={faExclamationCircle} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">{t('kpi_balance_customers') || 'பாக்கி உள்ளவர்கள்'}</span>
          <span className="kpi-value font-numeric">{metrics.withBalance}</span>
        </div>
      </div>

      {/* Total Outstanding */}
      <div className="kpi-card kpi-rose">
        <div className="kpi-icon-wrapper">
          <FontAwesomeIcon icon={faMoneyBillWave} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">{t('kpi_total_balance') || 'மொத்த பாக்கி'}</span>
          <span className="kpi-value font-numeric">{formatRupee(metrics.totalBalance)}</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerKPIs;
