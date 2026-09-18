import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSync,
  faDownload,
  faPrint
} from '@fortawesome/free-solid-svg-icons';
import './SupplierControls.css';

const SupplierHeader = ({
  onAddNew,
  onRefresh,
  onExport,
  onPrint,
  loading = false
}) => {
  const { t } = useTranslation();

  return (
    <div className="supplier-page-header">
      <div className="supplier-title-group">
        <h1 className="supplier-main-title">
          {t('suppliers_title') || 'சப்ளையர்கள்'}
        </h1>
        <span className="supplier-subtitle">
          {t('supplier_management_desc') || 'பூ மார்க்கெட் சப்ளையர் கணக்குகள், கொள்முதல் மற்றும் பட்டுவாடா விபரம்'}
        </span>
      </div>

      <div className="supplier-header-actions">
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

        {/* Secondary: Print */}
        <button
          className="btn-erp-secondary"
          onClick={onPrint}
          title={t('print_records') || 'அச்சிடு'}
        >
          <FontAwesomeIcon icon={faPrint} />
          <span className="d-none d-sm-inline">{t('print_records') || 'அச்சிடு'}</span>
        </button>

        {/* Primary: + Add Supplier */}
        <button className="btn-erp-primary" onClick={onAddNew}>
          <FontAwesomeIcon icon={faPlus} />
          <span>{t('add_new_supplier') || '+ புதிய சப்ளையர்'}</span>
        </button>
      </div>
    </div>
  );
};

export default SupplierHeader;
