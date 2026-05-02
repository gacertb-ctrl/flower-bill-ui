import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import ProductModal from '../components/modals/ProductModal';
import { useTranslation } from 'react-i18next';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../api/productAPI';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';

const ProductPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [productData, setProductData] = useState([]);
  const { t } = useTranslation();
  const page = 'product';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProducts();
        setProductData(data);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      let response;
      if (editData) {
        response = await updateProduct(formData);
      } else {
        response = await createProduct(formData);
      }

      if (!response.message || response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedProducts = await fetchProducts();
      setProductData(updatedProducts);

      setShowModal(false);
      setEditData(null);
    } catch (error) {
      console.error('Error submitting product form:', error);
    }
  };

  const deleteData = async (code) => {
    try {
      const response = await deleteProduct(code);
      if (!response.message || response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedProducts = await fetchProducts();
      setProductData(updatedProducts);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-nature-800 dark:text-nature-100">{t(`${page}.title`) || 'Product List'}</h2>
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
            data={productData}
            setShowModal={setShowModal}
            setEditData={setEditData}
            deleteData={deleteData}
          />
        </div>
      </GlassCard>

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
    </div>
  );
};

export default ProductPage;