import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCoins,
  faFileInvoiceDollar,
  faScaleBalanced,
  faArrowDown,
  faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import './ReportFinancialKPIs.css';

const ReportFinancialKPIs = ({
  tableData = [],
  reportType = 'purchase',
  period = 'date'
}) => {
  const { t } = useTranslation();

  const activeRows = useMemo(() => {
    return tableData.filter(
      r => parseFloat(r.credit_amount || 0) > 0 || parseFloat(r.debit_amount || 0) > 0
    );
  }, [tableData]);

  const totalCredit = useMemo(() => {
    return activeRows.reduce((sum, r) => sum + parseFloat(r.credit_amount || 0), 0);
  }, [activeRows]);

  const totalDebit = useMemo(() => {
    return activeRows.reduce((sum, r) => sum + parseFloat(r.debit_amount || 0), 0);
  }, [activeRows]);

  const netBalance = useMemo(() => {
    return totalCredit - totalDebit;
  }, [totalCredit, totalDebit]);

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isPurchase = reportType === 'purchase';

  return (
    <div className="erp-report-kpi-grid">
      {/* 1. Total Credit Card */}
      <div className="report-kpi-card credit-card" id="kpi-report-credit">
        <div className="kpi-top-bar">
          <span className="kpi-title-text">
            {isPurchase
              ? (t('reports.totalOutstanding') || t('reports_total_credit_kpi') || 'மொத்த வரவு')
              : (t('reports.todayCredit') || t('reports_total_credit_kpi') || 'மொத்த வரவு')}
          </span>
          <div className="kpi-icon-badge credit">
            <FontAwesomeIcon icon={faArrowDown} />
          </div>
        </div>
        <div className="kpi-amount-display credit">
          {formatCurrency(totalCredit)}
        </div>
        <div className="kpi-footer-row">
          <span>{t('reports_active_records') || 'செயலில் உள்ள பதிவுகள்'}: <strong>{activeRows.length}</strong></span>
          <span className="kpi-tag inflow">
            <FontAwesomeIcon icon={faCoins} className="me-1" />
            {t('inflow') || 'உள்வரவு'}
          </span>
        </div>
      </div>

      {/* 2. Total Debit Card */}
      <div className="report-kpi-card debit-card" id="kpi-report-debit">
        <div className="kpi-top-bar">
          <span className="kpi-title-text">
            {isPurchase
              ? (t('reports.totalDebit') || t('reports_total_debit_kpi') || 'மொத்த பற்று')
              : (t('reports.todayDebit') || t('reports_total_debit_kpi') || 'மொத்த பற்று')}
          </span>
          <div className="kpi-icon-badge debit">
            <FontAwesomeIcon icon={faArrowUp} />
          </div>
        </div>
        <div className="kpi-amount-display debit">
          {formatCurrency(totalDebit)}
        </div>
        <div className="kpi-footer-row">
          <span>{isPurchase ? (t('suppliers_title') || 'சப்ளையர்கள்') : (t('customers_title') || 'வாடிக்கையாளர்கள்')}: <strong>{activeRows.length}</strong></span>
          <span className="kpi-tag outflow">
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-1" />
            {t('outflow') || 'வெளிச்செல்லல்'}
          </span>
        </div>
      </div>

      {/* 3. Net Balance Card */}
      <div
        className={`report-kpi-card balance-card ${netBalance >= 0 ? 'surplus' : 'deficit'}`}
        id="kpi-report-balance"
      >
        <div className="kpi-top-bar">
          <span className="kpi-title-text">{t('reports_net_balance_kpi') || t('netBalance') || 'நிகர இருப்பு'}</span>
          <div className="kpi-icon-badge balance">
            <FontAwesomeIcon icon={faScaleBalanced} />
          </div>
        </div>
        <div className={`kpi-amount-display ${netBalance >= 0 ? 'balance-pos' : 'balance-neg'}`}>
          {netBalance >= 0 ? `+${formatCurrency(netBalance)}` : `-${formatCurrency(Math.abs(netBalance))}`}
        </div>
        <div className="kpi-footer-row">
          <span>{t('balanceFormula') || 'வரவு - பற்று'}</span>
          <span className={`kpi-tag ${netBalance >= 0 ? 'surplus' : 'deficit'}`}>
            {netBalance >= 0 ? (t('surplus') || 'வரவு அதிகம்') : (t('deficit') || 'பற்று அதிகம்')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReportFinancialKPIs;
