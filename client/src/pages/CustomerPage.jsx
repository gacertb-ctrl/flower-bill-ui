import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ERPLayout from '../components/layout/ERPLayout';
import CustomerKPIs from '../components/customer/CustomerKPIs';
import CustomerHeader from '../components/customer/CustomerHeader';
import CustomerFilterBar from '../components/customer/CustomerFilterBar';
import CustomerTable from '../components/customer/CustomerTable';
import CustomerDetailDrawer from '../components/customer/CustomerDetailDrawer';
import CustomerSupplierModal from '../components/modals/CustomerSupplierModal';
import LastTransactionModal from '../components/modals/LastTransactionModal';
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  getLastCustomerTransactions,
  deleteCustomer
} from '../api/customerAPI';

const CustomerPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const page = 'customer';

  // API State
  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Drawers State
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [drawerCustomer, setDrawerCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Search, Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'has_balance' | 'settled'
  const [cityFilter, setCityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'code' | 'balance_desc' | 'purchase_desc'

  // Fetch customer list from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomers();
      if (Array.isArray(data)) {
        setCustomerData(data);
      } else if (data && Array.isArray(data.customers)) {
        setCustomerData(data.customers);
      } else {
        setCustomerData([]);
      }
    } catch (err) {
      console.error("Error fetching customer data:", err);
      // Helpful fallback if API token not present or server offline
      setError(t('reports.noData') || 'வாடிக்கையாளர் தரவை ஏற்றுவதில் பிழை ஏற்பட்டது');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extract unique cities from customer addresses for filter dropdown
  const availableCities = useMemo(() => {
    const citiesSet = new Set();
    customerData.forEach(c => {
      if (c.address && typeof c.address === 'string') {
        const parts = c.address.split(',').map(s => s.trim());
        const cityCandidate = parts[parts.length - 1] || parts[0];
        if (cityCandidate && cityCandidate.length > 1) {
          citiesSet.add(cityCandidate);
        }
      }
    });
    return Array.from(citiesSet);
  }, [customerData]);

  // Filtered & Sorted Customer List
  const filteredCustomers = useMemo(() => {
    let result = [...customerData];

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
    if (statusFilter === 'has_balance') {
      result = result.filter(item => {
        const debit = parseFloat(item.debit_amount || 0);
        const credit = parseFloat(item.credit_amount || 0);
        return (debit - credit) > 0;
      });
    } else if (statusFilter === 'settled') {
      result = result.filter(item => {
        const debit = parseFloat(item.debit_amount || 0);
        const credit = parseFloat(item.credit_amount || 0);
        return (debit - credit) <= 0;
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
        const balA = parseFloat(a.debit_amount || 0) - parseFloat(a.credit_amount || 0);
        const balB = parseFloat(b.debit_amount || 0) - parseFloat(b.credit_amount || 0);
        return balB - balA;
      }
      if (sortBy === 'purchase_desc') {
        const purA = parseFloat(a.debit_amount || 0);
        const purB = parseFloat(b.debit_amount || 0);
        return purB - purA;
      }
      return 0;
    });

    return result;
  }, [customerData, searchTerm, statusFilter, cityFilter, sortBy]);

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
        response = await updateCustomer(formData);
      } else {
        response = await createCustomer(formData);
      }

      await fetchData();
      setShowModal(false);
      setEditData(null);

      // If drawer had the edited customer, update it
      if (drawerCustomer && drawerCustomer.code === formData.code) {
        setDrawerCustomer(prev => ({ ...prev, ...formData, contact: formData.number }));
      }

      alert(t(response.data?.message || (editData ? 'Customer updated successfully' : 'Customer Added Successfully')));
    } catch (error) {
      console.error("Customer submit error:", error);
      if (error.response) {
        alert(t(error.response.data?.error) || "Something went wrong");
      } else if (error.request) {
        alert("Server not responding");
      } else {
        alert("Unexpected error occurred");
      }
    }
  };

  // Load Transactions for a Customer
  const loadLastTransaction = async (id) => {
    try {
      const data = { cus_sup_code: id };
      const response = await getLastCustomerTransactions(data);
      if (response?.data) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('Error loading last transaction:', error);
    }
  };

  // Delete Customer Handler
  const deleteCustomerdata = async (code) => {
    try {
      const confirmed = window.confirm(t('confirm.delete') || 'இதை நீக்க விரும்புகிறீர்களா?');
      if (confirmed) {
        await deleteCustomer(code);
        alert(t('Customer Deleted') || 'வாடிக்கையாளர் நீக்கப்பட்டது');
        if (drawerCustomer?.code === code) {
          setDrawerCustomer(null);
        }
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error deleting customer');
    }
  };

  // Export to CSV with UTF-8 BOM for Excel
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      alert(t('noDataAvailable') || 'தரவு இல்லை');
      return;
    }

    const headers = [
      'வ.எண்',
      'வாடிக்கையாளர் பெயர்',
      'குறியீடு',
      'மொபைல் எண்',
      'முகவரி',
      'மொத்த கொள்முதல்',
      'செலுத்தியது',
      'பாக்கி'
    ];

    const rows = filteredCustomers.map((c, idx) => [
      idx + 1,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.code || ''}"`,
      `"${c.contact || ''}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      parseFloat(c.debit_amount || 0).toFixed(2),
      parseFloat(c.credit_amount || 0).toFixed(2),
      (parseFloat(c.debit_amount || 0) - parseFloat(c.credit_amount || 0)).toFixed(2)
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `flower_market_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Customer List
  const handlePrintList = () => {
    window.print();
  };

  return (
    <ERPLayout totalCustomers={customerData.length}>
      {/* 1. Page Header */}
      <CustomerHeader
        onAddNew={() => {
          setEditData(null);
          setShowModal(true);
        }}
        onRefresh={fetchData}
        onExport={handleExportCSV}
        onPrint={handlePrintList}
        loading={loading}
      />

      {/* 2. KPI Section (4 Semantic Financial Cards) */}
      <CustomerKPIs customerData={customerData} />

      {/* 3. Search & Filter Bar (Desktop & Mobile Bottom Sheet) */}
      <CustomerFilterBar
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

      {/* 4. Customer Data Table & Mobile Ergonomic Cards */}
      <CustomerTable
        data={filteredCustomers}
        loading={loading}
        error={error}
        onRetry={fetchData}
        onViewCustomer={(customer) => setDrawerCustomer(customer)}
        onEditCustomer={(customer) => {
          setEditData(customer);
          setShowModal(true);
        }}
        onOpenLedger={(code) => loadLastTransaction(code)}
        onDeleteCustomer={deleteCustomerdata}
        user={user}
        searchTerm={searchTerm}
      />

      {/* 5. Quick Detail Drawer (Slide-in on Desktop / Bottom Sheet on Mobile) */}
      <CustomerDetailDrawer
        customer={drawerCustomer}
        onClose={() => setDrawerCustomer(null)}
        onEdit={(customer) => {
          setEditData(customer);
          setShowModal(true);
        }}
      />

      {/* 6. Existing Customer Add/Edit Modal */}
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

      {/* 7. Existing Last Transaction / Ledger Modal */}
      <LastTransactionModal
        show={transactions.length > 0}
        onHide={() => setTransactions([])}
        transactions={transactions}
        reportType="sales"
      />
    </ERPLayout>
  );
};

export default CustomerPage;