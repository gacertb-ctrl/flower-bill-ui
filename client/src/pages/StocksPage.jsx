import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ERPLayout from '../components/layout/ERPLayout';
import StockKPIs from '../components/stock/StockKPIs';
import StockHeader from '../components/stock/StockHeader';
import StockFilterBar from '../components/stock/StockFilterBar';
import StockTable from '../components/stock/StockTable';
import StockDetailDrawer from '../components/stock/StockDetailDrawer';
import { fetchStocks } from '../api/stockAPI';
import { fetchProducts } from '../api/productAPI';

const StocksPage = () => {
  const { t } = useTranslation();

  // Selected date state
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // Raw API data
  const [rawStocks, setRawStocks] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Drawer state
  const [selectedStock, setSelectedStock] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');

  // Load stock and product data
  const loadData = useCallback(async (dateToFetch, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMessage(null);

    try {
      const [stocksRes, productsRes] = await Promise.all([
        fetchStocks(dateToFetch),
        fetchProducts().catch(() => [])
      ]);

      setRawStocks(Array.isArray(stocksRes) ? stocksRes : []);
      setProductsList(Array.isArray(productsRes) ? productsRes : []);
    } catch (err) {
      console.error('Error fetching stock records:', err);
      setErrorMessage(t('error_loading_data') || 'தகவலை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  // Initial and date change fetch
  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate, loadData]);

  // Create product master lookup map
  const productMap = useMemo(() => {
    const map = {};
    productsList.forEach((p) => {
      const code = (p.code || p.product_code || '').trim().toUpperCase();
      const name = (p.name || p.product_name || '').trim();
      if (code) map[code] = p;
      if (name) map[name] = p;
    });
    return map;
  }, [productsList]);

  // Enrich stock items with price and unit from product master
  const enrichedStocks = useMemo(() => {
    return rawStocks.map((item) => {
      const code = (item.product_code || '').trim().toUpperCase();
      const name = (item.product_name || '').trim();
      const master = productMap[code] || productMap[name] || {};

      const unit = item.unit || master.unit || 'kg';
      const price = parseFloat(item.price || master.price || 0);
      const purchases = parseFloat(item.total_purchase_quality || 0);
      const sales = parseFloat(item.total_sales_quality || 0);
      const balance = purchases - sales;

      return {
        ...item,
        unit,
        price,
        total_purchase_quality: purchases,
        total_sales_quality: sales,
        balance,
        valuation: balance > 0 ? balance * price : 0
      };
    });
  }, [rawStocks, productMap]);

  // Calculate high-level KPIs
  const kpiMetrics = useMemo(() => {
    let totalStockQty = 0;
    let todayPurchaseQty = 0;
    let todaySalesQty = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalStockValue = 0;

    enrichedStocks.forEach((item) => {
      const purchases = item.total_purchase_quality;
      const sales = item.total_sales_quality;
      const balance = item.balance;

      todayPurchaseQty += purchases;
      todaySalesQty += sales;

      if (balance > 0) {
        totalStockQty += balance;
        totalStockValue += item.valuation;
      }

      if (balance <= 0) {
        outOfStockCount += 1;
      } else if (balance <= 5) {
        lowStockCount += 1;
      }
    });

    return {
      totalStockQty,
      todayPurchaseQty,
      todaySalesQty,
      lowStockCount,
      outOfStockCount,
      totalStockValue
    };
  }, [enrichedStocks]);

  // Filtered stocks
  const filteredStocks = useMemo(() => {
    return enrichedStocks.filter((item) => {
      // Search query (flower name or code)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (item.product_name || '').toLowerCase();
        const code = (item.product_code || '').toLowerCase();
        if (!name.includes(q) && !code.includes(q)) return false;
      }

      // Stock status filter
      if (statusFilter !== 'all') {
        const bal = item.balance;
        if (statusFilter === 'sufficient' && bal <= 5) return false;
        if (statusFilter === 'low' && (bal <= 0 || bal > 5)) return false;
        if (statusFilter === 'out' && bal > 0) return false;
      }

      // Unit filter
      if (unitFilter !== 'all') {
        if (item.unit !== unitFilter) return false;
      }

      return true;
    });
  }, [enrichedStocks, searchQuery, statusFilter, unitFilter]);

  // Quick detail drawer handler
  const handleViewStock = (stock) => {
    setSelectedStock(stock);
    setDrawerOpen(true);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setUnitFilter('all');
  };

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    if (filteredStocks.length === 0) return;

    const headers = [
      'வ.எண் (S.No)',
      'பொருள் குறியீடு (Code)',
      'பொருள் பெயர் (Name)',
      'அலகு (Unit)',
      'விலை (Price)',
      'கொள்முதல் (Purchase)',
      'விற்பனை (Sales)',
      'இருப்பு (Balance)',
      'மதிப்பு (Valuation)',
      'நிலை (Status)'
    ];

    const rows = filteredStocks.map((item, idx) => {
      const bal = item.balance;
      const statusText = bal > 5 ? 'போதுமானது' : bal > 0 ? 'குறைவு' : 'இல்லை';
      return [
        idx + 1,
        `"${item.product_code || ''}"`,
        `"${item.product_name || ''}"`,
        `"${item.unit || ''}"`,
        item.price.toFixed(2),
        item.total_purchase_quality.toFixed(2),
        item.total_sales_quality.toFixed(2),
        bal.toFixed(2),
        item.valuation.toFixed(2),
        `"${statusText}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = selectedDate instanceof Date
      ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
      : selectedDate;
    link.setAttribute('href', url);
    link.setAttribute('download', `flower_stock_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <ERPLayout
      totalStocks={enrichedStocks.length}
      pageTitle={t('inventory_title') || 'இருப்பு'}
      breadcrumbCurrent={t('inventory_title') || 'இருப்பு'}
    >
      <div className="erp-page-container">
        {/* Page Header */}
        <StockHeader
          onRefresh={() => loadData(selectedDate, true)}
          onExport={handleExportCSV}
          onPrint={handlePrint}
          refreshing={refreshing}
        />

        {/* Error Alert with Retry */}
        {errorMessage && (
          <div className="erp-alert erp-alert-danger mb-4" role="alert">
            <div className="d-flex align-items-center justify-content-between">
              <span>{errorMessage}</span>
              <button
                className="btn-erp-secondary btn-sm"
                onClick={() => loadData(selectedDate)}
              >
                {t('retry') || 'மீண்டும் முயற்சி'}
              </button>
            </div>
          </div>
        )}

        {/* KPI Section */}
        <StockKPIs
          totalStockQty={kpiMetrics.totalStockQty}
          todayPurchaseQty={kpiMetrics.todayPurchaseQty}
          todaySalesQty={kpiMetrics.todaySalesQty}
          lowStockCount={kpiMetrics.lowStockCount}
          outOfStockCount={kpiMetrics.outOfStockCount}
          totalStockValue={kpiMetrics.totalStockValue}
          loading={loading}
        />

        {/* Filter Bar */}
        <StockFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          unitFilter={unitFilter}
          onUnitChange={setUnitFilter}
          onReset={handleResetFilters}
          totalResults={filteredStocks.length}
        />

        {/* Dense ERP Inventory Table */}
        <StockTable
          data={filteredStocks}
          loading={loading}
          onViewStock={handleViewStock}
        />

        {/* Stock Quick Detail Drawer */}
        <StockDetailDrawer
          stock={selectedStock}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </div>
    </ERPLayout>
  );
};

export default StocksPage;