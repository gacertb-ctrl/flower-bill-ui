import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRotateRight,
  faFileExport,
  faPrint,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import './StockControls.css';

const StockHeader = ({
  onRefresh,
  onExport,
  onPrint,
  refreshing = false
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <header className="erp-page-header">
      <div className="erp-header-title-block">
        <h1 className="erp-page-title">{t('inventory_title') || 'இருப்பு'}</h1>
        <p className="erp-page-desc">
          {t('inventory_desc') || 'தினசரி பூ வரத்து, விற்பனை மற்றும் இருப்பு இருப்புநிலை'}
        </p>
      </div>

      <div className="erp-header-actions">
        {/* Refresh */}
        <button
          className={`btn-erp-secondary ${refreshing ? 'erp-spinning' : ''}`}
          onClick={onRefresh}
          title={t('refresh') || 'புதுப்பி'}
          aria-label="Refresh stock data"
        >
          <FontAwesomeIcon icon={faRotateRight} />
          <span className="d-none d-sm-inline">{t('refresh') || 'புதுப்பி'}</span>
        </button>

        {/* Export CSV */}
        <button
          className="btn-erp-secondary"
          onClick={onExport}
          title={t('export') || 'ஏற்றுமதி'}
          aria-label="Export stock data to CSV"
        >
          <FontAwesomeIcon icon={faFileExport} />
          <span className="d-none d-sm-inline">{t('export') || 'ஏற்றுமதி'}</span>
        </button>

        {/* Print */}
        <button
          className="btn-erp-secondary"
          onClick={onPrint}
          title={t('print') || 'அச்சிடு'}
          aria-label="Print stock records"
        >
          <FontAwesomeIcon icon={faPrint} />
          <span className="d-none d-sm-inline">{t('print') || 'அச்சிடு'}</span>
        </button>

        {/* New Entry / Adjustment */}
        <button
          className="btn-erp-primary"
          onClick={() => navigate('/entries')}
          title={t('btn_adjust_stock') || '+ இருப்பு சரிசெய்தல்'}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>{t('btn_adjust_stock') || '+ இருப்பு சரிசெய்தல்'}</span>
        </button>
      </div>
    </header>
  );
};

export default StockHeader;
