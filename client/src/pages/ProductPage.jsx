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

const ProductPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

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
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'code' | 'price_desc' | 'stock_desc'

  // Fetch product list from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      if (Array.isArray(data)) {
        setProductData(data);
      } else if (data && Array.isArray(data.products)) {
        setProductData(data.products);
      } else {
        setProductData([]);
      }
    } catch (err) {
      console.error("Error fetching product data:", err);
      setError(t('reports.noData') || 'பொருள் தரவை ஏற்றுவதில் பிழை ஏற்பட்டது');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered & Sorted Product List
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
      result = result.filter(item => parseFloat(item.quality || 0) > 5);
    } else if (stockFilter === 'low') {
      result = result.filter(item => {
        const q = parseFloat(item.quality || 0);
        return q > 0 && q <= 5;
      });
    } else if (stockFilter === 'out') {
      result = result.filter(item => parseFloat(item.quality || 0) <= 0);
    }

    // 4. Sort
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return String(a.name || '').localeCompare(String(b.name || ''), 'ta');
      }
      if (sortBy === 'code') {
        return String(a.code || '').localeCompare(String(b.code || ''));
      }
      if (sortBy === 'price_desc') {
        return parseFloat(b.price || 0) - parseFloat(a.price || 0);
      }
      if (sortBy === 'stock_desc') {
        return parseFloat(b.quality || 0) - parseFloat(a.quality || 0);
      }
      return 0;
    });

    return result;
  }, [productData, searchTerm, unitFilter, stockFilter, sortBy]);

  const isFiltered = Boolean(
    searchTerm.trim() || unitFilter !== 'all' || stockFilter !== 'all' || sortBy !== 'name'
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setUnitFilter('all');
    setStockFilter('all');
    setSortBy('name');
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

      alert(t(response?.message || (editData ? 'product_saved_success' : 'product_saved_success')));
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

  // Export to CSV with UTF-8 BOM for Excel
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
      'விலை',
      'இருப்பு',
      'இருப்பு நிலை',
      'இருப்பு மதிப்பு'
    ];

    const rows = filteredProducts.map((p, idx) => {
      const q = parseFloat(p.quality || 0);
      const pr = parseFloat(p.price || 0);
      const statusText = q > 5 ? 'போதுமானது' : (q > 0 ? 'குறைந்த இருப்பு' : 'இருப்பு இல்லை');
      const val = q > 0 ? (q * pr).toFixed(2) : '0.00';

      return [
        idx + 1,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${p.code || ''}"`,
        `"${p.unit || ''}"`,
        pr.toFixed(2),
        q.toFixed(2),
        `"${statusText}"`,
        val
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print records handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <ERPLayout totalProducts={productData.length} breadcrumbCurrent={t('products_title') || 'பொருட்கள்'}>
      {/* 1. Header with Add, Refresh, Export, Print */}
      <ProductHeader
        onAddNew={() => {
          setEditData(null);
          setShowModal(true);
        }}
        onRefresh={fetchData}
        onExport={handleExportCSV}
        onPrint={handlePrint}
        loading={loading}
      />

      {/* 2. Four KPI Metric Cards */}
      <ProductKPIs productData={productData} />

      {/* 3. Filter Bar (Search, Unit, Stock Status, Sort) */}
      <ProductFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        unitFilter={unitFilter}
        onUnitChange={setUnitFilter}
        stockFilter={stockFilter}
        onStockChange={setStockFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* 4. ERP Desktop Table + Responsive Mobile Cards */}
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
      />

      {/* 5. Slide-in Quick Detail Drawer */}
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

      {/* 6. Add / Edit Product Modal (Preserved existing component) */}
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