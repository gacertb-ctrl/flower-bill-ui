import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ERPLayout from '../components/layout/ERPLayout';
import SupplierKPIs from '../components/supplier/SupplierKPIs';
import SupplierHeader from '../components/supplier/SupplierHeader';
import SupplierFilterBar from '../components/supplier/SupplierFilterBar';
import SupplierTable from '../components/supplier/SupplierTable';
import SupplierDetailDrawer from '../components/supplier/SupplierDetailDrawer';
import CustomerSupplierModal from '../components/modals/CustomerSupplierModal';
import LastTransactionModal from '../components/modals/LastTransactionModal';
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  getLastSupplierTransactions,
  deleteSupplier
} from '../api/supplierAPI';

const SupplierPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const page = 'supplier';

  // API State
  const [supplierData, setSupplierData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Drawers State
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [drawerSupplier, setDrawerSupplier] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Search, Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'has_balance' | 'settled'
  const [cityFilter, setCityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'code' | 'balance_desc' | 'purchase_desc' | 'commission_desc'

  // Fetch supplier list from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSuppliers();
      if (Array.isArray(data)) {
        setSupplierData(data);
      } else if (data && Array.isArray(data.suppliers)) {
        setSupplierData(data.suppliers);
      } else {
        setSupplierData([]);
      }
    } catch (err) {
      console.error("Error fetching supplier data:", err);
      setError(t('reports.noData') || 'சப்ளையர் தரவை ஏற்றுவதில் பிழை ஏற்பட்டது');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extract unique cities from supplier addresses for filter dropdown
  const availableCities = useMemo(() => {
    const citiesSet = new Set();
    supplierData.forEach(s => {
      if (s.address && typeof s.address === 'string') {
        const parts = s.address.split(',').map(str => str.trim());
        const cityCandidate = parts[parts.length - 1] || parts[0];
        if (cityCandidate && cityCandidate.length > 1) {
          citiesSet.add(cityCandidate);
        }
      }
    });
    return Array.from(citiesSet);
  }, [supplierData]);

  // Filtered & Sorted Supplier List
  const filteredSuppliers = useMemo(() => {
    let result = [...supplierData];

    // 1. Text Search across name, code, contact, address
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(item => {
        const nameMatch = item.name && String(item.name).toLowerCase().includes(query);
        const codeMatch = item.code && String(item.code).toLowerCase().includes(query);
        const phoneMatch = item.contact && String(item.contact).includes(query);
        const addressMatch = item.address && String(item.address).toLowerCase().includes(query);
        return nameMatch || codeMatch || phoneMatch || addressMatch;
      });
    }

    // 2. Status Filter
    // Accounting for flower market supplier:
    // credit_amount = total purchases received
    // debit_amount = payouts made
    // payable = credit_amount - debit_amount
    if (statusFilter === 'has_balance') {
      result = result.filter(item => {
        const credit = parseFloat(item.credit_amount || 0);
        const debit = parseFloat(item.debit_amount || 0);
        return (credit - debit) > 0;
      });
    } else if (statusFilter === 'settled') {
      result = result.filter(item => {
        const credit = parseFloat(item.credit_amount || 0);
        const debit = parseFloat(item.debit_amount || 0);
        return (credit - debit) <= 0;
      });
    }

    // 3. City Filter
    if (cityFilter !== 'all') {
      result = result.filter(item =>
        item.address && String(item.address).includes(cityFilter)
      );
    }

    // 4. Sort
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return String(a.name || '').localeCompare(String(b.name || ''), 'ta');
      }
      if (sortBy === 'code') {
        return String(a.code || '').localeCompare(String(b.code || ''));
      }
      if (sortBy === 'balance_desc') {
        const balA = parseFloat(a.credit_amount || 0) - parseFloat(a.debit_amount || 0);
        const balB = parseFloat(b.credit_amount || 0) - parseFloat(b.debit_amount || 0);
        return balB - balA;
      }
      if (sortBy === 'purchase_desc') {
        const purA = parseFloat(a.credit_amount || 0);
        const purB = parseFloat(b.credit_amount || 0);
        return purB - purA;
      }
      if (sortBy === 'commission_desc') {
        const commA = parseFloat(a.commission || 12.5);
        const commB = parseFloat(b.commission || 12.5);
        return commB - commA;
      }
      return 0;
    });

    return result;
  }, [supplierData, searchTerm, statusFilter, cityFilter, sortBy]);

  const isFiltered = Boolean(
    searchTerm.trim() || statusFilter !== 'all' || cityFilter !== 'all' || sortBy !== 'name'
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCityFilter('all');
    setSortBy('name');
  };

  // Submit Handler for Add / Update Modal
  const handleSubmit = async (formData) => {
    try {
      let response;
      if (editData) {
        response = await updateSupplier(formData);
      } else {
        response = await createSupplier(formData);
      }

      await fetchData();
      setShowModal(false);
      setEditData(null);

      // If drawer had the edited supplier, update it
      if (drawerSupplier && drawerSupplier.code === formData.code) {
        setDrawerSupplier(prev => ({ ...prev, ...formData, contact: formData.number }));
      }

      alert(t(response.data?.message || (editData ? 'Supplier updated successfully' : 'Supplier Added Successfully')));
    } catch (error) {
      console.error("Supplier submit error:", error);
      if (error.response) {
        alert(t(error.response.data?.error) || "Something went wrong");
      } else if (error.request) {
        alert("Server not responding");
      } else {
        alert("Unexpected error occurred");
      }
    }
  };

  // Load Transactions for a Supplier
  const loadLastTransaction = async (id) => {
    try {
      const response = await getLastSupplierTransactions(id);
      if (response?.data) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('Error loading last transaction:', error);
    }
  };

  // Delete Supplier Handler
  const deleteSupplierdata = async (code) => {
    try {
      const confirmed = window.confirm(t('confirm_delete_supplier') || 'இந்த சப்ளையரை நீக்க விரும்புகிறீர்களா?');
      if (confirmed) {
        await deleteSupplier(code);
        alert(t('Supplier Deleted') || 'சப்ளையர் நீக்கப்பட்டது');
        if (drawerSupplier?.code === code) {
          setDrawerSupplier(null);
        }
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Error deleting supplier');
    }
  };

  // Export to CSV with UTF-8 BOM for Excel
  const handleExportCSV = () => {
    if (filteredSuppliers.length === 0) {
      alert(t('noDataAvailable') || 'தரவு இல்லை');
      return;
    }

    const headers = [
      'வ.எண்',
      'சப்ளையர் பெயர்',
      'குறியீடு',
      'மொபைல் எண்',
      'முகவரி',
      'கமிஷன் %',
      'மொத்த கொள்முதல்',
      'செலுத்தியது',
      'செலுத்த வேண்டியது'
    ];

    const rows = filteredSuppliers.map((s, idx) => [
      idx + 1,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${s.code || ''}"`,
      `"${s.contact || ''}"`,
      `"${(s.address || '').replace(/"/g, '""')}"`,
      `"${s.commission ? s.commission + '%' : '12.5%'}"`,
      parseFloat(s.credit_amount || 0).toFixed(2),
      parseFloat(s.debit_amount || 0).toFixed(2),
      (parseFloat(s.credit_amount || 0) - parseFloat(s.debit_amount || 0)).toFixed(2)
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `suppliers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print records handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <ERPLayout totalSuppliers={supplierData.length} breadcrumbCurrent={t('suppliers_title') || 'சப்ளையர்கள்'}>
      {/* 1. Header with Add, Refresh, Export, Print */}
      <SupplierHeader
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
      <SupplierKPIs supplierData={supplierData} />

      {/* 3. Filter Bar (Search, Status, City, Sort) */}
      <SupplierFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        cityFilter={cityFilter}
        onCityChange={setCityFilter}
        availableCities={availableCities}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* 4. ERP Desktop Table + Responsive Mobile Cards */}
      <SupplierTable
        data={filteredSuppliers}
        loading={loading}
        error={error}
        onRetry={fetchData}
        onViewSupplier={(supplier) => setDrawerSupplier(supplier)}
        onEditSupplier={(supplier) => {
          setEditData(supplier);
          setShowModal(true);
        }}
        onOpenLedger={(code) => loadLastTransaction(code)}
        onDeleteSupplier={deleteSupplierdata}
        user={user}
        searchTerm={searchTerm}
      />

      {/* 5. Slide-in Quick Detail Drawer */}
      {drawerSupplier && (
        <SupplierDetailDrawer
          supplier={drawerSupplier}
          onClose={() => setDrawerSupplier(null)}
          onEdit={(supplier) => {
            setEditData(supplier);
            setShowModal(true);
          }}
        />
      )}

      {/* 6. Add / Edit Supplier Modal (Preserved existing component) */}
      <CustomerSupplierModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditData(null);
        }}
        type={page}
        mode={editData ? 'update' : 'add'}
        initialData={editData}
        onSubmit={handleSubmit}
      />

      {/* 7. Last Transaction / Ledger Modal (Preserved existing component) */}
      <LastTransactionModal
        page={page}
        transactions={transactions}
        show={transactions.length > 0}
        onHide={() => setTransactions([])}
        reportType="supplier"
      />
    </ERPLayout>
  );
};

export default SupplierPage;