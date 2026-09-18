import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSync,
  faDownload,
  faPrint
} from '@fortawesome/free-solid-svg-icons';
import './CustomerControls.css';

const CustomerHeader = ({
  onAddNew,
  onRefresh,
  onExport,
  onPrint,
  loading = false
}) => {
  const { t } = useTranslation();

  return (
    <div className="customer-page-header">
      <div className="customer-title-group">
        <h1 className="customer-main-title">
          {t('customers_title') || 'வாடிக்கையாளர்கள்'}
        </h1>
        <span className="customer-subtitle">
          {t('customer_management_desc') || 'வாடிக்கையாளர் மேலாண்மை மற்றும் கணக்கு விவரங்கள்'}
        </span>
      </div>

      <div className="customer-header-actions">
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

        {/* Primary: + Add Customer */}
        <button className="btn-erp-primary" onClick={onAddNew}>
          <FontAwesomeIcon icon={faPlus} />
          <span>{t('add_new_customer') || '+ புதிய வாடிக்கையாளர்'}</span>
        </button>
      </div>
    </div>
  );
};

export default CustomerHeader;
