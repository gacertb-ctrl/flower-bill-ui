import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays,
  faMoon,
  faRotateRight,
  faShoppingCart,
  faArrowUpRightFromSquare,
  faScaleBalanced
} from '@fortawesome/free-solid-svg-icons';
import ERPLayout from '../components/layout/ERPLayout.jsx';
import PurchaseLedgerCard from '../components/entry/PurchaseLedgerCard.jsx';
import SalesLedgerCard from '../components/entry/SalesLedgerCard.jsx';
import EntryModal from '../components/entry/EntryModal.jsx';
import EntryUpdateModal from '../components/entry/EntryUpdateModal.jsx';
import {
  getAllPurchaseEntries,
  getAllSalesEntries,
  deletePurchaseEntry,
  deleteSalesEntry,
  fetchTamilDate
} from '../api/entryAPI';
import { useAuth } from '../context/AuthContext';
import './EntryPage.css';

const EntryPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Date State - Defaults to 2026-02-18 (latest active market transaction date) or query param
  const [date, setDate] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('date') || '2026-02-18';
  });
  const [tamilDateInfo, setTamilDateInfo] = useState({
    tamil_date: '',
    tamil_month_name_ta: ''
  });

  // Modal State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Data & Loading State
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mobile Active Tab: 'purchase' or 'sales'
  const [mobileTab, setMobileTab] = useState('purchase');

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [purchasesData, salesData] = await Promise.all([
        getAllPurchaseEntries(date),
        getAllSalesEntries(date)
      ]);
      setPurchases(Array.isArray(purchasesData) ? purchasesData : []);
      setSales(Array.isArray(salesData) ? salesData : []);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  // Load Tamil Date
  useEffect(() => {
    let isMounted = true;
    const getTamilInfo = async () => {
      try {
        const data = await fetchTamilDate(date);
        if (isMounted) setTamilDateInfo(data || {});
      } catch (error) {
        if (isMounted) setTamilDateInfo({ tamil_date: '', tamil_month_name_ta: '' });
      }
    };
    getTamilInfo();
    return () => {
      isMounted = false;
    };
  }, [date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Global Keyboard Shortcuts (F9 for Purchase, F8 for Sales)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F9') {
        e.preventDefault();
        setShowPurchaseModal(true);
      }
      if (e.key === 'F8') {
        e.preventDefault();
        setShowSalesModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const purchaseQty = purchases.reduce(
      (acc, row) => acc + (parseFloat(row.purchase_quality) || 0),
      0
    );
    const purchaseTotal = purchases.reduce(
      (acc, row) => acc + (parseFloat(row.purchase_total) || 0),
      0
    );
    const salesQty = sales.reduce(
      (acc, row) => acc + (parseFloat(row.sales_quality) || 0),
      0
    );
    const salesTotal = sales.reduce(
      (acc, row) => acc + (parseFloat(row.sales_total) || 0),
      0
    );
    const netQty = purchaseQty - salesQty;

    return {
      purchaseQty,
      purchaseTotal,
      salesQty,
      salesTotal,
      netQty
    };
  }, [purchases, sales]);

  const formatRupee = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amt || 0);
  };

  // Format float numbers cleanly without floating inaccuracies (e.g., 0.30000001192092896 -> 0.3)
  const cleanFloat = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    return Number(Math.round(num * 10000) / 10000).toString();
  };

  // --- Purchase Handlers ---
  const handlePurchaseEdit = (row) => {
    setEditItem({
      id: row.purchase_id,
      customer_supplier_code: row.customer_supplier_code || row.supplier_code,
      product_code: row.product_code,
      quantity: cleanFloat(row.purchase_quality),
      price: cleanFloat(row.purchase_rate),
      unit: row.purchase_unit,
      type: 'purchase'
    });
    setShowUpdateModal(true);
  };

  const handlePurchaseDelete = async (id) => {
    if (window.confirm(t('confirm_delete_entry') || 'இந்த பதிவை நீக்க விரும்புகிறீர்களா?')) {
      try {
        await deletePurchaseEntry({ purchase_id: id });
        loadData();
      } catch (e) {
        console.error('Delete error:', e);
      }
    }
  };

  // --- Sales Handlers ---
  const handleSalesEdit = (row) => {
    setEditItem({
      id: row.sales_id,
      customer_supplier_code: row.customer_supplier_code || row.customer_code,
      product_code: row.product_code,
      quantity: cleanFloat(row.sales_quality),
      price: cleanFloat(row.sales_rate),
      unit: row.sales_unit,
      type: 'sales'
    });
    setShowUpdateModal(true);
  };

  const handleSalesDelete = async (id) => {
    if (window.confirm(t('confirm_delete_entry') || 'இந்த பதிவை நீக்க விரும்புகிறீர்களா?')) {
      try {
        await deleteSalesEntry({ sales_id: id });
        loadData();
      } catch (e) {
        console.error('Delete error:', e);
      }
    }
  };

  return (
    <ERPLayout breadcrumbCurrent={t('daily_entries_title') || 'நாள் பதிவுகள்'}>
      <div className="erp-entries-container">
        {/* Page Header */}
        <div className="erp-entries-header-card">
          <div className="erp-page-title-group">
            <h1 className="erp-entries-title">
              {t('daily_entries_title') || 'நாள் பதிவுகள்'}
            </h1>
            <p className="erp-entries-subtitle">
              {t('daily_entries_subtitle') ||
                'தினசரி பூ வரத்து, கொள்முதல் மற்றும் விற்பனை பதிவுகள்'}
            </p>
          </div>

          <div className="erp-entries-controls">
            {/* Tamil Date Chip */}
            {tamilDateInfo?.tamil_date && (
              <div className="erp-tamil-date-chip">
                <FontAwesomeIcon icon={faMoon} className="tamil-moon-icon" />
                <span>
                  {tamilDateInfo.tamil_month_name_ta} {tamilDateInfo.tamil_date}
                </span>
              </div>
            )}

            {/* Gregorian Date Selector */}
            <div className="erp-gregorian-date-wrap">
              <FontAwesomeIcon icon={faCalendarDays} className="text-primary" />
              <input
                type="date"
                className="erp-date-input font-numeric"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={!isAdmin}
                title={isAdmin ? 'தேதியை மாற்றவும்' : 'நிர்வாகிகளுக்கு மட்டுமே அனுமதி'}
              />
            </div>

            {/* Refresh Button */}
            <button
              className="btn-erp-secondary"
              onClick={loadData}
              title="Refresh Entries"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faRotateRight} spin={loading} />
              <span className="d-none d-sm-inline">
                {t('refresh') || 'புதுப்பி'}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Stats Ribbon */}
        <div className="erp-entries-stats-ribbon">
          {/* Today Purchases */}
          <div className="entries-stat-card">
            <div className="stat-icon-wrapper purchase">
              <FontAwesomeIcon icon={faShoppingCart} />
            </div>
            <div className="stat-content">
              <span className="stat-content-title">
                {t('kpi_total_purchases_today') || 'இன்றைய கொள்முதல்'}
              </span>
              <span className="stat-content-val font-numeric text-primary">
                {formatRupee(metrics.purchaseTotal)}
              </span>
              <span className="stat-content-sub font-numeric">
                {metrics.purchaseQty.toFixed(2)} kg / {purchases.length} பதிவுகள்
              </span>
            </div>
          </div>

          {/* Today Sales */}
          <div className="entries-stat-card">
            <div className="stat-icon-wrapper sales">
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </div>
            <div className="stat-content">
              <span className="stat-content-title">
                {t('kpi_total_sales_today') || 'இன்றைய விற்பனை'}
              </span>
              <span className="stat-content-val font-numeric text-emerald">
                {formatRupee(metrics.salesTotal)}
              </span>
              <span className="stat-content-sub font-numeric">
                {metrics.salesQty.toFixed(2)} kg / {sales.length} பதிவுகள்
              </span>
            </div>
          </div>

          {/* Net Movement */}
          <div className="entries-stat-card">
            <div className="stat-icon-wrapper net">
              <FontAwesomeIcon icon={faScaleBalanced} />
            </div>
            <div className="stat-content">
              <span className="stat-content-title">
                {t('kpi_net_movement_today') || 'இன்றைய வரத்து நிகரம்'}
              </span>
              <span
                className={`stat-content-val font-numeric ${
                  metrics.netQty >= 0 ? 'text-blue' : 'text-danger'
                }`}
              >
                {metrics.netQty >= 0 ? `+${metrics.netQty.toFixed(2)}` : metrics.netQty.toFixed(2)} kg
              </span>
              <span className="stat-content-sub font-numeric">
                கொள்முதல் − விற்பனை இருப்பு
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Segmented Toggle (Visible only on screens < 1200px) */}
        <div className="d-xl-none mb-2">
          <div className="erp-mobile-tab-switch">
            <button
              type="button"
              className={`erp-mobile-tab-btn ${
                mobileTab === 'purchase' ? 'active purchase' : ''
              }`}
              onClick={() => setMobileTab('purchase')}
            >
              <FontAwesomeIcon icon={faShoppingCart} />
              <span>{t('tab_purchase_view') || 'கொள்முதல்'}</span>
              <span className="badge bg-white text-dark rounded-pill ms-1 font-numeric">
                {purchases.length}
              </span>
            </button>
            <button
              type="button"
              className={`erp-mobile-tab-btn ${
                mobileTab === 'sales' ? 'active sales' : ''
              }`}
              onClick={() => setMobileTab('sales')}
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
              <span>{t('tab_sales_view') || 'விற்பனை'}</span>
              <span className="badge bg-white text-dark rounded-pill ms-1 font-numeric">
                {sales.length}
              </span>
            </button>
          </div>
        </div>

        {/* Dual Ledger Grid: 2-Column on Desktop (>=1200px), Tabbed on Mobile */}
        <div className="erp-dual-ledger-grid">
          {/* Purchase Ledger Panel */}
          <div
            className={`ledger-grid-col ${
              mobileTab === 'purchase' ? 'd-block' : 'd-none d-xl-block'
            }`}
          >
            <PurchaseLedgerCard
              data={purchases}
              loading={loading}
              onAddPurchase={() => setShowPurchaseModal(true)}
              onEditPurchase={handlePurchaseEdit}
              onDeletePurchase={handlePurchaseDelete}
            />
          </div>

          {/* Sales Ledger Panel */}
          <div
            className={`ledger-grid-col ${
              mobileTab === 'sales' ? 'd-block' : 'd-none d-xl-block'
            }`}
          >
            <SalesLedgerCard
              data={sales}
              loading={loading}
              onAddSales={() => setShowSalesModal(true)}
              onEditSales={handleSalesEdit}
              onDeleteSales={handleSalesDelete}
            />
          </div>
        </div>

        {/* Purchase Creation Modal */}
        <EntryModal
          type="purchase"
          show={showPurchaseModal}
          onHide={() => setShowPurchaseModal(false)}
          onSubmit={() => {
            setShowPurchaseModal(false);
            loadData();
          }}
          date={date}
          tamilDateInfo={tamilDateInfo}
        />

        {/* Sales Creation Modal */}
        <EntryModal
          type="sales"
          show={showSalesModal}
          onHide={() => setShowSalesModal(false)}
          onSubmit={() => {
            setShowSalesModal(false);
            loadData();
          }}
          date={date}
          tamilDateInfo={tamilDateInfo}
        />

        {/* Edit Entry Modal */}
        <EntryUpdateModal
          show={showUpdateModal}
          onHide={() => {
            setShowUpdateModal(false);
            setEditItem(null);
          }}
          type={editItem?.type}
          editData={editItem}
          onSuccess={loadData}
        />
      </div>
    </ERPLayout>
  );
};

export default EntryPage;