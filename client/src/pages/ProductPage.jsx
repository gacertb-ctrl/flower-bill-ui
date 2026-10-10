import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ERPLayout from '../components/layout/ERPLayout';
import ProductKPIs from '../components/product/ProductKPIs';
import ProductHeader from '../components/product/ProductHeader';
import ProductFilterBar from '../components/product/ProductFilterBar';
import ProductTable from '../components/product/ProductTable';
import ProductDetailDrawer from '../components/product/ProductDetailDrawer';
import ProductModal from '../components/modals/ProductModal';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../api/productAPI';
import { fetchStocks } from '../api/stockAPI';

const ProductPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Date State for Inventory Tracking
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // API State
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Drawers State
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [drawerProduct, setDrawerProduct] = useState(null);

  // Search, Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'sufficient' | 'low' | 'out'
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Fetch product list & stock records concurrently and merge them
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, stockRes] = await Promise.all([
        fetchProducts().catch(err => {
          console.error("Error fetching products:", err);
          return [];
        }),
        fetchStocks(selectedDate).catch(err => {
          console.error("Error fetching stocks for date:", err);
          return [];
        })
      ]);

      const rawProducts = Array.isArray(prodRes) ? prodRes : (prodRes?.products || []);
      const rawStocks = Array.isArray(stockRes) ? stockRes : [];

      // Create stock lookup map by trimmed code and name
      const stockMap = {};
      rawStocks.forEach((s) => {
        const code = (s.product_code || s.code || '').trim().toUpperCase();
        const name = (s.product_name || s.name || '').trim();
        if (code) stockMap[code] = s;
        if (name && !stockMap[name]) stockMap[name] = s;
      });

      const seenCodes = new Set();
      const combined = [];

      // 1. Enrich catalog products with daily stock inward & outward transactions
      rawProducts.forEach((p) => {
        const code = (p.code || p.product_code || '').trim().toUpperCase();
        const name = (p.name || p.product_name || '').trim();
        if (code) seenCodes.add(code);
        if (name) seenCodes.add(name);

        const stock = stockMap[code] || stockMap[name];
        const purchases = parseFloat(stock?.total_purchase_quality || 0);
        const sales = parseFloat(stock?.total_sales_quality || 0);
        const balance = stock !== undefined
          ? (purchases - sales)
          : parseFloat(p.quality !== undefined ? p.quality : (p.balance || 0));
        const price = parseFloat(p.price || stock?.price || 0);
        const unit = p.unit || stock?.unit || 'kg';
        const valuation = balance > 0 ? balance * price : 0;

        combined.push({
          ...p,
          id: p.id || p._id || code,
          code: p.code || code,
          name: p.name || name,
          unit,
          price,
          total_purchase_quality: purchases,
          total_sales_quality: sales,
          balance,
          quality: balance, // for backward compatibility
          valuation
        });
      });

      // 2. Include any stock transactions not present in catalog
      rawStocks.forEach((s) => {
        const code = (s.product_code || s.code || '').trim().toUpperCase();
        const name = (s.product_name || s.name || '').trim();
        if ((code && seenCodes.has(code)) || (name && seenCodes.has(name))) {
          return;
        }
        const purchases = parseFloat(s.total_purchase_quality || 0);
        const sales = parseFloat(s.total_sales_quality || 0);
        const balance = purchases - sales;
        const price = parseFloat(s.price || 0);
        const unit = s.unit || 'kg';
        const valuation = balance > 0 ? balance * price : 0;

        combined.push({
          id: code || name,
          code: code || s.product_code,
          name: name || s.product_name,
          unit,
          price,
          total_purchase_quality: purchases,
          total_sales_quality: sales,
          balance,
          quality: balance,
          valuation
        });
      });

      setProductData(combined);
    } catch (err) {
      console.error("Error fetching consolidated product & stock data:", err);
      setError(t('reports.noData') || 'பொருள் மற்றும் இருப்பு தரவை ஏற்றுவதில் பிழை ஏற்பட்டது');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle column header sort clicks
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted Consolidated Product List
  const filteredProducts = useMemo(() => {
    let result = [...productData];

    // 1. Text Search across name and code
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(item => {
        const nameMatch = item.name && String(item.name).toLowerCase().includes(query);
        const codeMatch = item.code && String(item.code).toLowerCase().includes(query);
        return nameMatch || codeMatch;
      });
    }

    // 2. Unit Filter
    if (unitFilter !== 'all') {
      result = result.filter(item => item.unit === unitFilter);
    }

    // 3. Stock Status Filter
    if (stockFilter === 'sufficient') {
      result = result.filter(item => parseFloat(item.balance !== undefined ? item.balance : item.quality || 0) > 5);
    } else if (stockFilter === 'low') {
      result = result.filter(item => {
        const b = parseFloat(item.balance !== undefined ? item.balance : item.quality || 0);
        return b > 0 && b <= 5;
      });
    } else if (stockFilter === 'out') {
      result = result.filter(item => parseFloat(item.balance !== undefined ? item.balance : item.quality || 0) <= 0);
    }

    // 4. Sort
    result.sort((a, b) => {
      let isDesc = sortDirection === 'desc';
      let sortKey = sortBy;

      if (sortBy === 'price_desc') {
        sortKey = 'price';
        isDesc = true;
      } else if (sortBy === 'stock_desc') {
        sortKey = 'balance';
        isDesc = true;
      } else if (sortBy === 'purchases_desc') {
        sortKey = 'purchases';
        isDesc = true;
      } else if (sortBy === 'sales_desc') {
        sortKey = 'sales';
        isDesc = true;
      }

      let diff = 0;
      if (sortKey === 'name') {
        diff = String(a.name || '').localeCompare(String(b.name || ''), 'ta');
      } else if (sortKey === 'code') {
        diff = String(a.code || '').localeCompare(String(b.code || ''));
      } else if (sortKey === 'price') {
        diff = parseFloat(a.price || 0) - parseFloat(b.price || 0);
      } else if (sortKey === 'purchases') {
        diff = parseFloat(a.total_purchase_quality || 0) - parseFloat(b.total_purchase_quality || 0);
      } else if (sortKey === 'sales') {
        diff = parseFloat(a.total_sales_quality || 0) - parseFloat(b.total_sales_quality || 0);
      } else if (sortKey === 'balance' || sortKey === 'stock') {
        const balA = parseFloat(a.balance !== undefined ? a.balance : a.quality || 0);
        const balB = parseFloat(b.balance !== undefined ? b.balance : b.quality || 0);
        diff = balA - balB;
      } else if (sortKey === 'valuation') {
        diff = parseFloat(a.valuation || 0) - parseFloat(b.valuation || 0);
      }

      return isDesc ? -diff : diff;
    });

    return result;
  }, [productData, searchTerm, unitFilter, stockFilter, sortBy, sortDirection]);

  const isFiltered = Boolean(
    searchTerm.trim() || unitFilter !== 'all' || stockFilter !== 'all' || sortBy !== 'name'
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setUnitFilter('all');
    setStockFilter('all');
    setSortBy('name');
    setSortDirection('asc');
  };

  // Submit Handler for Add / Update Modal
  const handleSubmit = async (formData) => {
    try {
      let response;
      if (editData) {
        response = await updateProduct(formData);
      } else {
        response = await createProduct(formData);
      }

      await fetchData();
      setShowModal(false);
      setEditData(null);

      // If drawer had the edited product, update it
      if (drawerProduct && drawerProduct.code === formData.product_code) {
        setDrawerProduct(prev => ({
          ...prev,
          name: formData.product_name,
          quality: formData.product_quality,
          unit: formData.product_unit,
          price: formData.product_price
        }));
      }

      alert(t(response?.message || 'product_saved_success'));
    } catch (error) {
      console.error("Product submit error:", error);
      if (error.response) {
        alert(t(error.response.data?.error) || "Something went wrong");
      } else if (error.request) {
        alert("Server not responding");
      } else {
        alert("Unexpected error occurred");
      }
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (code) => {
    try {
      const confirmed = window.confirm(t('confirm_delete_product') || 'இந்த பொருளை நீக்க விரும்புகிறீர்களா?');
      if (confirmed) {
        await deleteProduct(code);
        alert(t('product_deleted_success') || 'பொருள் வெற்றிகரமாக நீக்கப்பட்டது');
        if (drawerProduct?.code === code) {
          setDrawerProduct(null);
        }
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  // Export to CSV with UTF-8 BOM for Excel (Consolidated Columns)
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      alert(t('noDataAvailable') || 'தரவு இல்லை');
      return;
    }

    const headers = [
      'வ.எண்',
      'பொருள் பெயர்',
      'குறியீடு',
      'அலகு',
      'விலை (₹)',
      'இன்றைய வரத்து (கொள்முதல்)',
      'இன்றைய விற்பனை',
      'தற்போதைய இருப்பு',
      'இருப்பு நிலை',
      'இருப்பு மதிப்பு (₹)'
    ];

    const rows = filteredProducts.map((p, idx) => {
      const purchases = parseFloat(p.total_purchase_quality || 0);
      const sales = parseFloat(p.total_sales_quality || 0);
      const balance = parseFloat(p.balance !== undefined ? p.balance : p.quality || 0);
      const pr = parseFloat(p.price || 0);
      const statusText = balance > 5 ? 'போதுமானது' : (balance > 0 ? 'குறைந்த இருப்பு' : 'இருப்பு இல்லை');
      const val = balance > 0 ? (balance * pr).toFixed(2) : '0.00';

      return [
        idx + 1,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${p.code || ''}"`,
        `"${p.unit || ''}"`,
        pr.toFixed(2),
        purchases.toFixed(2),
        sales.toFixed(2),
        balance.toFixed(2),
        `"${statusText}"`,
        val
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateTag = selectedDate instanceof Date ? selectedDate.toISOString().slice(0, 10) : 'all';
    link.setAttribute('download', `products_stocks_${dateTag}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ERPLayout
      totalProducts={productData.length}
      breadcrumbCurrent={t('products_title') || 'பொருட்கள் & இருப்பு'}
    >
      {/* 1. Header with Add, Refresh, Export */}
      <ProductHeader
        onAddNew={() => {
          setEditData(null);
          setShowModal(true);
        }}
        onRefresh={fetchData}
        onExport={handleExportCSV}
        loading={loading}
      />

      {/* 2. Four Consolidated KPI Metric Cards */}
      <ProductKPIs productData={productData} />

      {/* 3. Filter Bar (Search, Date Picker, Unit, Stock Status, Sort) */}
      <ProductFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        unitFilter={unitFilter}
        onUnitChange={setUnitFilter}
        stockFilter={stockFilter}
        onStockChange={setStockFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* 4. ERP Desktop Consolidated Table + Responsive Mobile Cards */}
      <ProductTable
        data={filteredProducts}
        loading={loading}
        error={error}
        onRetry={fetchData}
        onViewProduct={(product) => setDrawerProduct(product)}
        onEditProduct={(product) => {
          setEditData(product);
          setShowModal(true);
        }}
        onDeleteProduct={handleDeleteProduct}
        user={user}
        searchTerm={searchTerm}
        sortField={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
      />

      {/* 5. Slide-in Consolidated Detail Drawer */}
      {drawerProduct && (
        <ProductDetailDrawer
          product={drawerProduct}
          onClose={() => setDrawerProduct(null)}
          onEdit={(product) => {
            setEditData(product);
            setShowModal(true);
          }}
          onDelete={handleDeleteProduct}
          user={user}
        />
      )}

      {/* 6. Add / Edit Product Modal */}
      <ProductModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditData(null);
        }}
        mode={editData ? 'update' : 'add'}
        initialData={editData}
        onSubmit={handleSubmit}
      />
    </ERPLayout>
  );
};

export default ProductPage;