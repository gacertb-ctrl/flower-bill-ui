import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faChevronLeft,
  faChevronRight,
  faRotateRight,
  faArrowUp,
  faArrowDown,
  faFileInvoiceDollar,
  faCoins
} from '@fortawesome/free-solid-svg-icons';
import ERPLayout from '../components/layout/ERPLayout';
import PurchaseDebitPanel from '../components/debitCredit/PurchaseDebitPanel';
import SalesCreditPanel from '../components/debitCredit/SalesCreditPanel';
import DebitCreditEntryModal from '../components/debitCredit/DebitCreditEntryModal';
import DebitCreditAmountModal from '../components/debitCredit/DebitCreditAmountModal';
import {
  getDebitEntries,
  getCreditEntries,
  deleteDebitEntry,
  deleteCreditEntry
} from '../api/debitCreditAPI';
import { fetchTamilDate } from '../api/entryAPI';
import './DebitCreditPage.css';

const DebitCreditPage = () => {
  const { t } = useTranslation();

  // Date State
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [tamilDateInfo, setTamilDateInfo] = useState('');

  // Data States
  const [debitEntries, setDebitEntries] = useState([]);
  const [creditEntries, setCreditEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mobile segmented tab: 'debit' | 'credit'
  const [activeMobileTab, setActiveMobileTab] = useState('debit');

  // Modals
  const [showDebitModal, setShowDebitModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [updateType, setUpdateType] = useState('debit');

  // Load Data
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [debitRes, creditRes] = await Promise.all([
        getDebitEntries(date).catch(() => []),
        getCreditEntries(date).catch(() => [])
      ]);
      setDebitEntries(Array.isArray(debitRes) ? debitRes : []);
      setCreditEntries(Array.isArray(creditRes) ? creditRes : []);
    } catch (error) {
      console.error("Error fetching debit/credit data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [date]);

  // Load Tamil Date
  useEffect(() => {
    let isMounted = true;
    const loadTamilInfo = async () => {
      try {
        const info = await fetchTamilDate(date);
        if (isMounted && info) {
          setTamilDateInfo(`${info.tamil_month_name_ta || ''} ${info.tamil_date || ''}`);
        }
      } catch (err) {
        if (isMounted) setTamilDateInfo('');
      }
    };
    loadTamilInfo();
    return () => { isMounted = false; };
  }, [date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Date Navigation Helpers
  const handlePrevDay = () => {
    const current = new Date(date);
    current.setDate(current.getDate() - 1);
    setDate(current.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const current = new Date(date);
    current.setDate(current.getDate() + 1);
    setDate(current.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  };

  // Delete Action with Confirmation
  const handleDelete = async (type, id) => {
    const confirmText = t('confirm.deleteEntry') || 'இப்பதிவை நீக்க உறுதிப்படுத்துகிறீர்களா?';
    if (window.confirm(confirmText)) {
      try {
        if (type === 'debit') {
          await deleteDebitEntry(id);
        } else {
          await deleteCreditEntry(id);
        }
        loadData(true);
      } catch (error) {
        console.error("Error deleting entry", error);
        alert(t('messages.failedToDeleteEntry') || 'பதிவை நீக்க முடியவில்லை');
      }
    }
  };

  // Edit Action
  const handleEdit = (type, row) => {
    setEditItem({
      id: type === 'debit' ? (row.debit_id || row.id) : (row.credit_id || row.id),
      customer_supplier_code: row.customer_supplier_code || row.code || '',
      customer_supplier_name: row.customer_supplier_name || row.name || '',
      amount: type === 'debit' ? row.debit_amount : row.credit_amount
    });
    setUpdateType(type);
    setShowUpdateModal(true);
  };

  // KPI Calculations
  const totalDebit = useMemo(() => {
    return debitEntries.reduce((sum, item) => sum + (parseFloat(item.debit_amount) || 0), 0);
  }, [debitEntries]);

  const totalCredit = useMemo(() => {
    return creditEntries.reduce((sum, item) => sum + (parseFloat(item.credit_amount) || 0), 0);
  }, [creditEntries]);

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <ERPLayout
      pageTitle={t('debitCredit') || 'பற்று / வரவு'}
      breadcrumbCurrent={t('debitCredit') || 'பற்று / வரவு'}
    >
      <div className="erp-debit-credit-page">
        {/* Top Header & Date Navigation Bar */}
        <div className="erp-dc-header-bar">
          <div className="erp-dc-header-left">
            <h1 className="erp-dc-title">
              {t('debitCreditTitle') || t('debitCredit') || 'பற்று / வரவு மேலாண்மை'}
            </h1>
            <div className="erp-dc-subtitle">
              {t('debitCreditLedgerSubtitle') || 'கொள்முதல் பற்று மற்றும் விற்பனை வரவு கணக்கு மேலாண்மை'}
            </div>
          </div>

          {/* Date Picker & Quick Actions Bar */}
          <div className="erp-dc-date-bar">
            <button
              type="button"
              className="erp-date-nav-btn"
              onClick={handlePrevDay}
              title={t('prevDay') || 'முந்தைய நாள்'}
              aria-label="Previous day"
              id="btn-date-prev"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <input
              type="date"
              className="erp-dc-date-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              id="input-erp-date"
              aria-label="Select Date"
            />

            <button
              type="button"
              className="erp-date-nav-btn"
              onClick={handleNextDay}
              title={t('nextDay') || 'அடுத்த நாள்'}
              aria-label="Next day"
              id="btn-date-next"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>

            <button
              type="button"
              className="erp-today-btn"
              onClick={handleToday}
              id="btn-date-today"
            >
              {t('today') || 'இன்று'}
            </button>

            {tamilDateInfo && (
              <div className="erp-tamil-chip" title="தமிழ் தேதி">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>{tamilDateInfo}</span>
              </div>
            )}

            <button
              type="button"
              className="erp-refresh-btn"
              onClick={() => loadData(false)}
              title={t('refresh') || 'புதுப்பிக்க'}
              aria-label="Refresh data"
              id="btn-refresh-dc"
            >
              <FontAwesomeIcon icon={faRotateRight} spin={refreshing} />
            </button>
          </div>
        </div>

        {/* 3 KPI Summary Cards */}
        <div className="erp-dc-kpi-grid">
          {/* Total Debit Card */}
          <div className="erp-dc-kpi-card debit-card" id="kpi-card-debit">
            <div className="kpi-top-row">
              <span className="kpi-label-text">{t('purchaseDebit')}</span>
              <div className="kpi-icon-pill debit">
                <FontAwesomeIcon icon={faArrowUp} />
              </div>
            </div>
            <div className="kpi-amount-val debit">
              {formatCurrency(totalDebit)}
            </div>
            <div className="kpi-meta-row">
              <span>{t('entriesCount') || 'பதிவுகள்'}: <strong>{debitEntries.length}</strong></span>
              <span className="kpi-status-tag deficit">
                <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-1" />
                {t('outflow') || 'வெளிச்செல்லல்'}
              </span>
            </div>
          </div>

          {/* Total Credit Card */}
          <div className="erp-dc-kpi-card credit-card" id="kpi-card-credit">
            <div className="kpi-top-row">
              <span className="kpi-label-text">{t('salesCredit')}</span>
              <div className="kpi-icon-pill credit">
                <FontAwesomeIcon icon={faArrowDown} />
              </div>
            </div>
            <div className="kpi-amount-val credit">
              {formatCurrency(totalCredit)}
            </div>
            <div className="kpi-meta-row">
              <span>{t('entriesCount') || 'பதிவுகள்'}: <strong>{creditEntries.length}</strong></span>
              <span className="kpi-status-tag surplus">
                <FontAwesomeIcon icon={faCoins} className="me-1" />
                {t('inflow') || 'உள்வரவு'}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Segmented Switcher (Visible on mobile only < 768px) */}
        <div className="erp-mobile-tab-bar d-md-none">
          <button
            type="button"
            className={`mobile-segment-btn ${activeMobileTab === 'debit' ? 'active debit' : ''}`}
            onClick={() => setActiveMobileTab('debit')}
            id="tab-mobile-debit"
          >
            <FontAwesomeIcon icon={faArrowUp} />
            <span>{t('purchaseDebit')}</span>
            <span className="segment-badge debit">{debitEntries.length}</span>
          </button>
          <button
            type="button"
            className={`mobile-segment-btn ${activeMobileTab === 'credit' ? 'active credit' : ''}`}
            onClick={() => setActiveMobileTab('credit')}
            id="tab-mobile-credit"
          >
            <FontAwesomeIcon icon={faArrowDown} />
            <span>{t('salesCredit')}</span>
            <span className="segment-badge credit">{creditEntries.length}</span>
          </button>
        </div>

        {/* Desktop Dual-Column View (Visible >= 768px) */}
        <div className="erp-dc-dual-grid d-none d-md-grid">
          {/* Purchase Debit Panel */}
          <PurchaseDebitPanel
            entries={debitEntries}
            loading={loading}
            onAdd={() => setShowDebitModal(true)}
            onEdit={(row) => handleEdit('debit', row)}
            onDelete={(id) => handleDelete('debit', id)}
          />

          {/* Sales Credit Panel */}
          <SalesCreditPanel
            entries={creditEntries}
            loading={loading}
            onAdd={() => setShowCreditModal(true)}
            onEdit={(row) => handleEdit('credit', row)}
            onDelete={(id) => handleDelete('credit', id)}
          />
        </div>

        {/* Mobile Tabbed View (Visible < 768px) */}
        <div className="d-md-none">
          {activeMobileTab === 'debit' ? (
            <PurchaseDebitPanel
              entries={debitEntries}
              loading={loading}
              onAdd={() => setShowDebitModal(true)}
              onEdit={(row) => handleEdit('debit', row)}
              onDelete={(id) => handleDelete('debit', id)}
            />
          ) : (
            <SalesCreditPanel
              entries={creditEntries}
              loading={loading}
              onAdd={() => setShowCreditModal(true)}
              onEdit={(row) => handleEdit('credit', row)}
              onDelete={(id) => handleDelete('credit', id)}
            />
          )}
        </div>

        {/* Add Debit Modal */}
        <DebitCreditEntryModal
          type="debit"
          show={showDebitModal}
          onHide={() => setShowDebitModal(false)}
          onSubmit={() => loadData(true)}
          date={date}
          tamilDateInfo={tamilDateInfo}
        />

        {/* Add Credit Modal */}
        <DebitCreditEntryModal
          type="credit"
          show={showCreditModal}
          onHide={() => setShowCreditModal(false)}
          onSubmit={() => loadData(true)}
          date={date}
          tamilDateInfo={tamilDateInfo}
        />

        {/* Update Amount Modal */}
        <DebitCreditAmountModal
          show={showUpdateModal}
          onHide={() => setShowUpdateModal(false)}
          type={updateType}
          editData={editItem}
          onSuccess={() => loadData(true)}
        />
      </div>
    </ERPLayout>
  );
};

export default DebitCreditPage;