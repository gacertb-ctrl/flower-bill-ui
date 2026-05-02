import React, { useState, useEffect, useCallback } from 'react';
import Table from '../components/Table';
import CustomerSupplierModal from '../components/modals/CustomerSupplierModal';
import LastTransactionModal from '../components/modals/LastTransactionModal';
import { useTranslation } from 'react-i18next';
import { fetchSuppliers, createSupplier, updateSupplier, getLastSupplierTransactions, deleteSupplier } from '../api/supplierAPI';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';

const SupplierPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [supplierData, setSupplierData] = useState([]);
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);

  const page = 'supplier';

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchSuppliers();
      setSupplierData(data);
    } catch (error) {
      console.error("Error fetching supplier data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (formData) => {
    try {
      let response;
      if (editData) {
        response = await updateSupplier(formData);
      } else {
        response = await createSupplier(formData);
      }

      const updatedSuppliers = await fetchSuppliers();
      setSupplierData(updatedSuppliers);

      setShowModal(false);
      setEditData(null);

      alert(t(response.data?.message || 'Operation successful'));
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const loadLastTransaction = async (id) => {
    try {
      const response = await getLastSupplierTransactions(id);
      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading last transaction:', error);
    }
  };

  const deleteSupplierdata = async (id) => {
    try {
      const confirmed = window.confirm(t('confirm.delete'));
      if (confirmed) {
        await deleteSupplier(id);
        fetchData();
        alert(t('Supplier Deleted'));
      }
      const updatedSuppliers = await fetchSuppliers();
      setSupplierData(updatedSuppliers);
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-nature-800 dark:text-nature-100">{t(`${page}.title`) || 'Supplier List'}</h2>
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
            data={supplierData}
            setShowModal={setShowModal}
            setEditData={setEditData}
            loadLastTransaction={loadLastTransaction}
            deleteData={deleteSupplierdata}
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
        page={page}
        transactions={transactions}
        show={transactions.length > 0}
        onHide={() => setTransactions([])}
        reportType="purchase"
      />
    </div>
  );
};

export default SupplierPage;