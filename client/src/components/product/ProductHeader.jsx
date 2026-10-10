import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSync,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import './ProductControls.css';

const ProductHeader = ({
  onAddNew,
  onRefresh,
  onExport,
  loading = false
}) => {
  const { t } = useTranslation();

  return (
    <div className="product-page-header">
      <div className="product-title-group">
        <h1 className="product-main-title">
          {t('products_and_stock_title') || `${t('products_title') || 'பொருட்கள்'} & ${t('inventory_title') || 'இருப்பு'}`}
        </h1>
        <span className="product-subtitle">
          {t('product_stock_management_desc') || 'பூ வகைகள், விலை, தினசரி வரத்து, விற்பனை மற்றும் இருப்பு இருப்புநிலை மேலாண்மை'}
        </span>
      </div>

      <div className="product-header-actions">
        {/* Secondary: Refresh */}
        <button
          className="btn-erp-secondary"
          onClick={onRefresh}
          title={t('refresh') || 'புதுப்பி'}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faSync} spin={loading} />
          <span className="d-none d-sm-inline">{t('refresh') || 'புதுப்பி'}</span>
        </button>

        {/* Secondary: Export */}
        <button
          className="btn-erp-secondary"
          onClick={onExport}
          title={t('export') || 'ஏற்றுமதி'}
        >
          <FontAwesomeIcon icon={faDownload} />
          <span className="d-none d-sm-inline">{t('export') || 'ஏற்றுமதி'}</span>
        </button>

        {/* Primary: + Add Product */}
        <button className="btn-erp-primary" onClick={onAddNew}>
          <FontAwesomeIcon icon={faPlus} />
          <span>{t('add_new_product') || '+ புதிய பொருள்'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductHeader;
