import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faTimes,
  faFilter,
  faRotateRight
} from '@fortawesome/free-solid-svg-icons';
import './SupplierControls.css';

const SupplierFilterBar = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  cityFilter,
  onCityChange,
  availableCities = [],
  sortBy,
  onSortChange,
  onReset,
  isFiltered = false
}) => {
  const { t } = useTranslation();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  return (
    <div className="supplier-filter-container">
      {/* Desktop Filter Layout */}
      <div className="desktop-filter-bar">
        {/* Search Box */}
        <div className="filter-search-wrapper">
          <FontAwesomeIcon icon={faSearch} className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder={t('search_supplier_placeholder') || 'பெயர், குறியீடு, ஊர் அல்லது எண் மூலம் தேடுக...'}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              className="filter-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by balance status"
        >
          <option value="all">{t('status_all') || 'அனைத்து நிலைகள்'}</option>
          <option value="has_balance">{t('status_has_balance') || 'பாக்கி உள்ளவர்கள்'}</option>
          <option value="settled">{t('status_settled') || 'பாக்கி இல்லாதவர்கள்'}</option>
        </select>

        {/* City Filter (Derived from addresses) */}
        {availableCities.length > 0 && (
          <select
            className="filter-select"
            value={cityFilter}
            onChange={(e) => onCityChange(e.target.value)}
            aria-label="Filter by city"
          >
            <option value="all">{t('col_city') || 'நகரம்'}: {t('all') || 'அனைத்து'}</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        )}

        {/* Sorting Dropdown */}
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort records"
        >
          <option value="name">பெயர் (அ-ஔ)</option>
          <option value="code">குறியீடு எண்</option>
          <option value="balance_desc">பாக்கி (அதிகம் → குறைவு)</option>
          <option value="purchase_desc">மொத்த கொள்முதல் (அதிகம்)</option>
          <option value="commission_desc">கமிஷன் விகிதம் (அதிகம்)</option>
        </select>

        {/* Reset Button */}
        {isFiltered && (
          <button
            className="btn-erp-secondary text-danger"
            onClick={onReset}
            title={t('reset_filter') || 'மீட்டமை'}
          >
            <FontAwesomeIcon icon={faRotateRight} />
            <span>{t('reset_filter') || 'மீட்டமை'}</span>
          </button>
        )}
      </div>

      {/* Mobile Filter Bar (Search + Filter Trigger) */}
      <div className="mobile-filter-bar">
        <div className="filter-search-wrapper" style={{ flex: 1 }}>
          <FontAwesomeIcon icon={faSearch} className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder={t('search_supplier_placeholder') || 'பெயர், எண் அல்லது ஊர்...'}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              className="filter-clear-btn"
              onClick={() => onSearchChange('')}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        <button
          className={`btn-erp-secondary ${isFiltered ? 'border-primary text-primary fw-bold' : ''}`}
          onClick={() => setMobileSheetOpen(true)}
          aria-label="Open filters"
        >
          <FontAwesomeIcon icon={faFilter} />
          <span>{t('filter') || 'வடிகட்டு'}</span>
        </button>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <div className={`mobile-filter-bottom-sheet ${mobileSheetOpen ? 'open' : ''}`}>
        <div className="bottom-sheet-content">
          <div className="bottom-sheet-header">
            <span className="bottom-sheet-title">{t('filter_drawer_title') || 'வடிகட்டி விருப்பங்கள்'}</span>
            <button
              className="erp-icon-btn border-0"
              onClick={() => setMobileSheetOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="bottom-sheet-body">
            <div>
              <label className="form-label small fw-bold text-muted mb-1">
                {t('reports.type') || 'நிலை'}
              </label>
              <select
                className="filter-select w-100"
                value={statusFilter}
                onChange={(e) => onStatusChange(e.target.value)}
              >
                <option value="all">{t('status_all') || 'அனைத்து நிலைகள்'}</option>
                <option value="has_balance">{t('status_has_balance') || 'பாக்கி உள்ளவர்கள்'}</option>
                <option value="settled">{t('status_settled') || 'பாக்கி இல்லாதவர்கள்'}</option>
              </select>
            </div>

            {availableCities.length > 0 && (
              <div>
                <label className="form-label small fw-bold text-muted mb-1">
                  {t('col_city') || 'நகரம்'}
                </label>
                <select
                  className="filter-select w-100"
                  value={cityFilter}
                  onChange={(e) => onCityChange(e.target.value)}
                >
                  <option value="all">{t('all') || 'அனைத்து'}</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="form-label small fw-bold text-muted mb-1">வரிசைப்படுத்துதல்</label>
              <select
                className="filter-select w-100"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
              >
                <option value="name">பெயர் (அ-ஔ)</option>
                <option value="code">குறியீடு எண்</option>
                <option value="balance_desc">பாக்கி (அதிகம் → குறைவு)</option>
                <option value="purchase_desc">மொத்த கொள்முதல் (அதிகம்)</option>
                <option value="commission_desc">கமிஷன் விகிதம் (அதிகம்)</option>
              </select>
            </div>

            <div className="bottom-sheet-actions">
              <button
                className="btn-erp-secondary w-50"
                onClick={() => {
                  onReset();
                  setMobileSheetOpen(false);
                }}
              >
                {t('reset_filter') || 'மீட்டமை'}
              </button>
              <button
                className="btn-erp-primary w-50"
                onClick={() => setMobileSheetOpen(false)}
              >
                சரி (முடிந்தது)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierFilterBar;
