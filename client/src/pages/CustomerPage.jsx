import React, { useState, useCallback, useEffect } from 'react';
import Table from '../components/Table';
import CustomerSupplierModal from '../components/modals/CustomerSupplierModal';
import LastTransactionModal from '../components/modals/LastTransactionModal';
import { useTranslation } from 'react-i18next';
import { fetchCustomers, createCustomer, updateCustomer, getLastCustomerTransactions, deleteCustomer } from '../api/customerAPI';

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

      // ✅ Backend returned error (400, 422, etc.)
      if (error.response) {
        console.error("Backend error:", error.response.data);
        alert(t(error.response.data?.error) || "Something went wrong");
      }
      // ✅ Network error (server not running, CORS, etc.)
      else if (error.request) {
        alert("Server not responding");
      }
      // ✅ Other error
      else {
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
        fetchData()
        alert(t('Customer Deleted')); // Ensure this key exists or change to 'messages.customerDeleted'
      }
      const updatedCustomers = await fetchCustomers();
      setCustomerData(updatedCustomers);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 text-primary mb-0 fw-bold">{t('customer.management')}</h2>
        <button
          className="btn btn-primary shadow-sm rounded-pill"
          onClick={() => {
            setEditData(null);
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-1"></i> {t(`${page}.add`)}
        </button>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="saas-card">
            <div className="saas-card-body p-0">
              <Table
                page={page}
                data={customerData}
                setShowModal={setShowModal}
                setEditData={setEditData}
                loadLastTransaction={loadLastTransaction}
                deleteData={deleteCustomerdata}
              />
            </div>
          </div>
        </div>
      </div>

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

      <LastTransactionModal show={transactions.length > 0} onHide={() => setTransactions([])} transactions={transactions} reportType="sales" />
    </div>
  );
};

export default CustomerPage;