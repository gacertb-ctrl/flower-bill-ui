import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import ProductModal from '../components/modals/ProductModal';
import { useTranslation } from 'react-i18next';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../api/productAPI';

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
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 text-primary mb-0 fw-bold">{t('product.management') || 'Product Management'}</h2>
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
                data={productData}
                setShowModal={setShowModal}
                setEditData={setEditData}
                deleteData={deleteData}
              />
            </div>
          </div>
        </div>
      </div>

      <ProductModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditData(null);
        }}
        mode={editData ? 'update' : 'add'}
        initialData={editData}
        onSubmit={handleSubmit}
      // t and lang props removed, Modal uses useTranslation internally
      />
    </div>
  );
};

export default ProductPage;