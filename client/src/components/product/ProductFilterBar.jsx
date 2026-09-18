import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faTimes,
  faFilter,
  faRotateRight
} from '@fortawesome/free-solid-svg-icons';
import './ProductControls.css';

const ProductFilterBar = ({
  searchTerm,
  onSearchChange,
  unitFilter,
  onUnitChange,
  stockFilter,
  onStockChange,
  sortBy,
  onSortChange,
  onReset,
  isFiltered = false
}) => {
  const { t } = useTranslation();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  return (
    <div className="product-filter-container">
      {/* Desktop Filter Layout */}
      <div className="desktop-filter-bar">
        {/* Search Box */}
        <div className="filter-search-wrapper">
          <FontAwesomeIcon icon={faSearch} className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder={t('search_product_placeholder') || 'பொருள் பெயர் அல்லது குறியீடு தேடுக...'}
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

        {/* Unit Dropdown */}
        <select
          className="filter-select"
          value={unitFilter}
          onChange={(e) => onUnitChange(e.target.value)}
          aria-label="Filter by unit"
        >
          <option value="all">{t('unit_all') || 'அனைத்து அலகுகள்'}</option>
          <option value="kg">{t('kg') || 'கிலோ'}</option>
          <option value="g">{t('g') || 'கிராம்'}</option>
          <option value="படி">{t('padi') || 'படி'}</option>
          <option value="pie">{t('pieces') || 'எண்ணிக்கை'}</option>
        </select>

        {/* Stock Status Dropdown */}
        <select
          className="filter-select"
          value={stockFilter}
          onChange={(e) => onStockChange(e.target.value)}
          aria-label="Filter by stock status"
        >
          <option value="all">{t('status_all_stock') || 'அனைத்து இருப்பு நிலைகள்'}</option>
          <option value="sufficient">🟢 {t('stock_sufficient') || 'போதுமானது'}</option>
          <option value="low">🟡 {t('stock_low') || 'குறைந்த இருப்பு'}</option>
          <option value="out">🔴 {t('stock_out') || 'இருப்பு இல்லை'}</option>
        </select>

        {/* Sorting Dropdown */}
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort products"
        >
          <option value="name">பெயர் (அ-ஔ)</option>
          <option value="code">குறியீடு எண்</option>
          <option value="price_desc">விலை (அதிகம் → குறைவு)</option>
          <option value="stock_desc">இருப்பு (அதிகம் → குறைவு)</option>
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
            placeholder={t('search_product_placeholder') || 'பொருள் தேடுக...'}
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
                {t('col_unit') || 'அலகு'}
              </label>
              <select
                className="filter-select w-100"
                value={unitFilter}
                onChange={(e) => onUnitChange(e.target.value)}
              >
                <option value="all">{t('unit_all') || 'அனைத்து அலகுகள்'}</option>
                <option value="kg">{t('kg') || 'கிலோ'}</option>
                <option value="g">{t('g') || 'கிராம்'}</option>
                <option value="படி">{t('padi') || 'படி'}</option>
                <option value="pie">{t('pieces') || 'எண்ணிக்கை'}</option>
              </select>
            </div>

            <div>
              <label className="form-label small fw-bold text-muted mb-1">
                {t('col_stock_status') || 'இருப்பு நிலை'}
              </label>
              <select
                className="filter-select w-100"
                value={stockFilter}
                onChange={(e) => onStockChange(e.target.value)}
              >
                <option value="all">{t('status_all_stock') || 'அனைத்து இருப்பு நிலைகள்'}</option>
                <option value="sufficient">🟢 {t('stock_sufficient') || 'போதுமானது'}</option>
                <option value="low">🟡 {t('stock_low') || 'குறைந்த இருப்பு'}</option>
                <option value="out">🔴 {t('stock_out') || 'இருப்பு இல்லை'}</option>
              </select>
            </div>

            <div>
              <label className="form-label small fw-bold text-muted mb-1">வரிசைப்படுத்துதல்</label>
              <select
                className="filter-select w-100"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
              >
                <option value="name">பெயர் (அ-ஔ)</option>
                <option value="code">குறியீடு எண்</option>
                <option value="price_desc">விலை (அதிகம் → குறைவு)</option>
                <option value="stock_desc">இருப்பு (அதிகம் → குறைவு)</option>
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

export default ProductFilterBar;
