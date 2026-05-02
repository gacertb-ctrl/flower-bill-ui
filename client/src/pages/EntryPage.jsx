import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCalendarDays, faShoppingCart, faArrowUpRightFromSquare, faMoon } from '@fortawesome/free-solid-svg-icons';
import PurchaseTable from '../components/entry/PurchaseTable.jsx';
import SalesTable from '../components/entry/SalesTable.jsx';
import EntryModal from '../components/entry/EntryModal.jsx';
import EntryUpdateModal from '../components/entry/EntryUpdateModal.jsx';
import { getAllPurchaseEntries, getAllSalesEntries, deletePurchaseEntry, deleteSalesEntry, fetchTamilDate } from '../api/entryAPI';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';

const EntryPage = () => {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tamilDateInfo, setTamilDateInfo] = useState({ tamil_date: '', tamil_month_name_ta: '' });
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  // Modal State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Data & Edit State
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [editItem, setEditItem] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [purchasesData, salesData] = await Promise.all([
        getAllPurchaseEntries(date),
        getAllSalesEntries(date)
      ]);
      setPurchases(purchasesData);
      setSales(salesData);
    } catch (error) { console.error('Error loading data:', error); }
  }, [date]);

  useEffect(() => {
    const getTamilInfo = async () => {
      try {
        const data = await fetchTamilDate(date);
        setTamilDateInfo(data);
      } catch (error) {
        setTamilDateInfo({ tamil_date: '', tamil_month_name_ta: '' });
      }
    };
    getTamilInfo();
  }, [date]); 

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F9') { e.preventDefault(); setShowPurchaseModal(true); }
      if (e.key === 'F8') { e.preventDefault(); setShowSalesModal(true); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => { setIsAdmin(user?.role === 'admin'); }, [user]);


  // --- Purchase Handlers ---
  const handlePurchaseEdit = (row, type) => {
    setEditItem({
      id: row.purchase_id,
      customer_supplier_code: row.customer_supplier_code || row.supplier_code,
      product_code: row.product_code,
      quantity: row.purchase_quality,
      price: row.purchase_rate,
      unit: row.purchase_unit,
      type: "purchase"
    });
    setShowUpdateModal(true);
  };

  const handlePurchaseSubmit = (data) => {
    setShowPurchaseModal(false);
    setEditItem(null);
    loadData();
  };

  const handlePurchaseDelete = async (id) => {
    if (window.confirm(t('confirm.delete'))) {
      await deletePurchaseEntry({ purchase_id: id });
      loadData();
    }
  };

  // --- Sales Handlers ---
  const handleSalesEdit = (row) => {
    setEditItem({
      id: row.sales_id,
      customer_supplier_code: row.customer_supplier_code || row.customer_code,
      product_code: row.product_code,
      quantity: row.sales_quality,
      price: row.sales_rate,
      unit: row.sales_unit,
      type: "sales"
    });
    setShowUpdateModal(true);
  };

  const handleSalesSubmit = (data) => {
    setShowSalesModal(false);
    setEditItem(null);
    loadData();
  };

  const handleSalesDelete = async (id) => {
    if (window.confirm(t('confirm.delete'))) {
      await deleteSalesEntry({ sales_id: id });
      loadData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Top Header Section */}
      <GlassCard className="p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-nature-800 dark:text-nature-100">{t('Daily Entries')}</h2>
          <p className="text-nature-500 dark:text-nature-400 text-sm mt-1">{t('Manage your daily stock movement')}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Tamil Date Display Card */}
          {tamilDateInfo.tamil_date && (
            <div className="flex items-center bg-accent-gold/20 px-4 py-2 rounded-xl border border-accent-gold/30">
              <FontAwesomeIcon icon={faMoon} className="text-yellow-600 mr-3" />
              <div>
                <span className="font-semibold text-nature-800 dark:text-nature-100 block text-sm">
                  {tamilDateInfo.tamil_month_name_ta} {tamilDateInfo.tamil_date}
                </span>
                <span className="text-nature-600 dark:text-nature-400 text-xs">தமிழ் தேதி</span>
              </div>
            </div>
          )}

          {/* Standard Date Picker */}
          <div className="flex items-center bg-white/50 dark:bg-nature-900/50 px-4 py-2 rounded-xl shadow-sm border border-nature-200 dark:border-nature-700/50">
            <FontAwesomeIcon icon={faCalendarDays} className="text-nature-500 mr-3" />
            <input
              type="date"
              className="bg-transparent border-none text-nature-800 dark:text-nature-100 font-semibold focus:outline-none focus:ring-0"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={!isAdmin}
              onClick={(e) => {
                if (isAdmin && e.target.showPicker) {
                  e.target.showPicker();
                }
              }}
            />
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Purchase Card */}
        <div className="flex flex-col">
          <GlassCard className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-nature-200 dark:border-nature-700/50">
              <div className="flex items-center">
                <div className="bg-nature-100 dark:bg-nature-800 p-3 rounded-xl mr-4 text-nature-600 dark:text-nature-300">
                  <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                </div>
                <h4 className="text-xl font-bold text-nature-800 dark:text-nature-100">{t('purchase')} {t('ledger')}</h4>
              </div>
              <GlassButton
                variant="primary"
                onClick={() => { setEditItem(null); setShowPurchaseModal(true); }}
                className="text-sm px-4"
              >
                <FontAwesomeIcon icon={faPlus} /> {t('purchase')} 
                <span className="ml-2 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded">F9</span>
              </GlassButton>
            </div>
            <div className="flex-1 overflow-x-auto">
              <PurchaseTable data={purchases} handleEdit={handlePurchaseEdit} handleDelete={handlePurchaseDelete} />
            </div>
          </GlassCard>
        </div>

        {/* Sales Card */}
        <div className="flex flex-col">
          <GlassCard className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-nature-200 dark:border-nature-700/50">
              <div className="flex items-center">
                <div className="bg-accent-blue/20 dark:bg-accent-blue/10 p-3 rounded-xl mr-4 text-accent-blue">
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="lg" />
                </div>
                <h4 className="text-xl font-bold text-nature-800 dark:text-nature-100">{t('sales')} {t('ledger')}</h4>
              </div>
              <GlassButton
                className="bg-accent-blue text-white hover:bg-blue-500 shadow-glow text-sm px-4"
                onClick={() => { setEditItem(null); setShowSalesModal(true); }}
              >
                <FontAwesomeIcon icon={faPlus} /> {t('sales')} 
                <span className="ml-2 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded">F8</span>
              </GlassButton>
            </div>
            <div className="flex-1 overflow-x-auto">
              <SalesTable data={sales} handleEdit={handleSalesEdit} handleDelete={handleSalesDelete} />
            </div>
          </GlassCard>
        </div>
      </div>

      <EntryModal 
        type="purchase" 
        show={showPurchaseModal} 
        onHide={() => setShowPurchaseModal(false)} 
        onSubmit={handlePurchaseSubmit} 
        date={date}
        tamilDateInfo={tamilDateInfo}
        />

      <EntryModal 
        type="sales" 
        show={showSalesModal} 
        onHide={() => setShowSalesModal(false)} 
        onSubmit={handleSalesSubmit} 
        date={date}
        tamilDateInfo={tamilDateInfo} 
        />

      <EntryUpdateModal 
        show={showUpdateModal} 
        onHide={() => setShowUpdateModal(false)} 
        type={editItem?.type} 
        editData={editItem} 
        onSuccess={loadData} 
      />
    </div>
  );
};

export default EntryPage;