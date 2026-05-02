import React, { useState, useCallback, useEffect } from 'react';
import Table from '../components/Table';
import CustomerSupplierModal from '../components/modals/CustomerSupplierModal';
import LastTransactionModal from '../components/modals/LastTransactionModal';
import { useTranslation } from 'react-i18next';
import { fetchCustomers, createCustomer, updateCustomer, getLastCustomerTransactions, deleteCustomer } from '../api/customerAPI';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';

const CustomerPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [customerData, setCustomerData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const { t } = useTranslation();
  const page = 'customer';

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchCustomers();
      setCustomerData(data);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (formData) => {
    try {
      let response;
      if (editData) {
        response = await updateCustomer(formData);
      } else {
        response = await createCustomer(formData);
      }

      const updatedCustomers = await fetchCustomers();
      setCustomerData(updatedCustomers);

      setShowModal(false);
      setEditData(null);

      alert(t(response.data?.message || 'Operation successful'));

    } catch (error) {
      console.error("Full error:", error);
      if (error.response) {
        alert(t(error.response.data?.error) || "Something went wrong");
      } else if (error.request) {
        alert("Server not responding");
      } else {
        alert("Unexpected error occurred");
      }
    }
  };

  const loadLastTransaction = async (id) => {
    try {
      const data = { cus_sup_code: id }
      const response = await getLastCustomerTransactions(data);
      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading last transaction:', error);
    }
  };

  const deleteCustomerdata = async (id) => {
    try {
      const confirmed = window.confirm(t('confirm.delete'));
      if (confirmed) {
        await deleteCustomer(id);
        fetchData();
        alert(t('Customer Deleted'));
      }
      const updatedCustomers = await fetchCustomers();
      setCustomerData(updatedCustomers);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-nature-800 dark:text-nature-100">{t(`${page}.title`) || 'Customer List'}</h2>
          <GlassButton
            variant="primary"
            onClick={() => {
              setEditData(null);
              setShowModal(true);
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            {t(`${page}.add`)}
          </GlassButton>
        </div>

        <div className="overflow-x-auto w-full">
          <Table
            page={page}
            data={customerData}
            setShowModal={setShowModal}
            setEditData={setEditData}
            loadLastTransaction={loadLastTransaction}
            deleteData={deleteCustomerdata}
          />
        </div>
      </GlassCard>

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

      <LastTransactionModal 
        show={transactions.length > 0} 
        onHide={() => setTransactions([])} 
        transactions={transactions} 
        reportType="sales" 
      />
    </div>
  );
};

export default CustomerPage;