import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserCheck,
  faHandHoldingDollar,
  faMoneyBillWave
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
    let withPayable = 0;
    let totalPayable = 0;

    supplierData.forEach((item) => {
      // Active status check
      if (item.customer_supplier_is_active !== 'N') {
        active++;
      }

      // Accounting for flower market supplier:
      // credit_amount = total purchases received
      // debit_amount = payouts made
      // payable = credit_amount - debit_amount
      const totalPurchase = parseFloat(item.credit_amount || 0);
      const totalPaid = parseFloat(item.debit_amount || 0);
      const payable = totalPurchase - totalPaid;

      if (payable > 0) {
        withPayable++;
        totalPayable += payable;
      }
    });

    return { total, active, withPayable, totalPayable };
  }, [supplierData]);

  return (
    <div className="supplier-kpi-grid">
      {/* 1. Total Suppliers */}
      <div className="kpi-card kpi-violet">
        <div className="kpi-icon-wrapper">
          <FontAwesomeIcon icon={faUsers} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">{t('kpi_total_suppliers') || 'மொத்த சப்ளையர்கள்'}</span>
          <span className="kpi-value font-numeric">{metrics.total}</span>
        </div>
      </div>

      {/* 2. Active Suppliers */}
      <div className="kpi-card kpi-green">
        <div className="kpi-icon-wrapper">
          <FontAwesomeIcon icon={faUserCheck} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">{t('kpi_active_suppliers') || 'செயலில் உள்ளவர்கள்'}</span>
          <span className="kpi-value font-numeric">{metrics.active}</span>
        </div>
      </div>

      {/* 3. With Payable */}
      <div className="kpi-card kpi-blue">
        <div className="kpi-icon-wrapper">
          <FontAwesomeIcon icon={faHandHoldingDollar} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">{t('kpi_suppliers_with_payable') || 'பாக்கியுள்ள சப்ளையர்கள்'}</span>
          <span className="kpi-value font-numeric">{metrics.withPayable}</span>
        </div>
      </div>

      {/* 4. Total Payable Amount */}
      <div className="kpi-card kpi-rose">
        <div className="kpi-icon-wrapper">
          <FontAwesomeIcon icon={faMoneyBillWave} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">{t('kpi_total_payable_amount') || 'செலுத்த வேண்டிய பாக்கி'}</span>
          <span className="kpi-value font-numeric">{formatRupee(metrics.totalPayable)}</span>
        </div>
      </div>
    </div>
  );
};

export default SupplierKPIs;
