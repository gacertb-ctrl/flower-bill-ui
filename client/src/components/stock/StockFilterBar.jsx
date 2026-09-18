import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faCalendarDay,
  faSliders,
  faTimes,
  faRotateLeft
} from '@fortawesome/free-solid-svg-icons';
import './StockControls.css';

const StockFilterBar = ({
  searchQuery,
  onSearchChange,
  selectedDate,
  onDateChange,
  statusFilter,
  onStatusChange,
  unitFilter,
  onUnitChange,
  onReset,
  totalResults = 0
}) => {
  const { t } = useTranslation();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const activeFilterCount =
    (statusFilter !== 'all' ? 1 : 0) +
    (unitFilter !== 'all' ? 1 : 0) +
    (searchQuery ? 1 : 0);

  // Convert Date object to YYYY-MM-DD for input[type="date"]
  const dateStr = selectedDate instanceof Date
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : selectedDate || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  const handleDateInputChange = (e) => {
    const val = e.target.value;
    if (val) {
      const [year, month, day] = val.split('-').map(Number);
      const newDate = new Date(year, month - 1, day);
      onDateChange(newDate);
    }
  };

  return (
    <div className="erp-filter-container">
      {/* Desktop Filter Bar */}
      <div className="erp-filter-bar d-none d-md-flex">
        {/* Search Input */}
        <div className="erp-search-input-wrap">
          <FontAwesomeIcon icon={faSearch} className="erp-search-icon" />
          <input
            type="text"
            className="erp-search-input"
            placeholder={t('search_stock_placeholder') || 'பொருள் பெயர் அல்லது குறியீடு தேடுக...'}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search stock"
          />
          {searchQuery && (
            <button
              className="erp-clear-search-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        {/* Date Selector */}
        <div className="erp-filter-dropdown-wrap" style={{ minWidth: '170px' }}>
          <div className="d-flex align-items-center gap-2 px-2 py-1 bg-white rounded border">
            <FontAwesomeIcon icon={faCalendarDay} className="text-primary" />
            <input
              type="date"
              className="border-0 bg-transparent font-numeric fw-semibold"
              style={{ outline: 'none', fontSize: '0.875rem' }}
              value={dateStr}
              onChange={handleDateInputChange}
              aria-label="Filter by date"
            />
          </div>
        </div>

        {/* Stock Status Dropdown */}
        <div className="erp-filter-dropdown-wrap">
          <select
            className="erp-filter-select"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by stock status"
          >
            <option value="all">{t('status_all_stock') || 'அனைத்து இருப்பு நிலைகள்'}</option>
            <option value="sufficient">🟢 {t('stock_status_sufficient') || 'போதுமானது'}</option>
            <option value="low">🟡 {t('stock_status_low') || 'குறைவு'}</option>
            <option value="out">🔴 {t('stock_status_out') || 'இல்லை'}</option>
          </select>
        </div>

        {/* Unit Dropdown */}
        <div className="erp-filter-dropdown-wrap">
          <select
            className="erp-filter-select"
            value={unitFilter}
            onChange={(e) => onUnitChange(e.target.value)}
            aria-label="Filter by unit"
          >
            <option value="all">{t('unit_all') || 'அனைத்து அலகுகள்'}</option>
            <option value="kg">kg (கிலோ)</option>
            <option value="g">g (கிராம்)</option>
            <option value="படி">படி</option>
            <option value="pie">pie (எண்ணிக்கை)</option>
          </select>
        </div>

        {/* Reset Filters */}
        {activeFilterCount > 0 && (
          <button
            className="btn-erp-ghost"
            onClick={onReset}
            title={t('reset_filters') || 'வடிகட்டிகளை மீட்டமை'}
          >
            <FontAwesomeIcon icon={faRotateLeft} />
            <span>{t('reset') || 'மீட்டமை'}</span>
          </button>
        )}

        {/* Live Count Pill */}
        <div className="ms-auto erp-filter-count-badge font-numeric">
          {totalResults} {t('products_title') || 'பொருட்கள்'}
        </div>
      </div>

      {/* Mobile Filter Row & Trigger */}
      <div className="erp-mobile-filter-row d-md-none">
        <div className="erp-search-input-wrap flex-grow-1">
          <FontAwesomeIcon icon={faSearch} className="erp-search-icon" />
          <input
            type="text"
            className="erp-search-input"
            placeholder={t('search_product_placeholder') || 'பொருள் தேடுக...'}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <button
          className={`btn-erp-filter-trigger ${activeFilterCount > 0 ? 'has-active' : ''}`}
          onClick={() => setMobileSheetOpen(true)}
          aria-label="Open filter sheet"
        >
          <FontAwesomeIcon icon={faSliders} />
          {activeFilterCount > 0 && (
            <span className="filter-badge font-numeric">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Mobile Filter Slide-up Bottom Sheet */}
      <div
        className={`erp-mobile-sheet-backdrop ${mobileSheetOpen ? 'open' : ''}`}
        onClick={() => setMobileSheetOpen(false)}
        aria-hidden="true"
      />
      <div
        className={`erp-mobile-filter-sheet ${mobileSheetOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-filter-sheet-title"
      >
        <div className="erp-sheet-header">
          <h3 id="mobile-filter-sheet-title" className="erp-sheet-title">
            {t('filters') || 'வடிகட்டிகள்'}
          </h3>
          <button
            className="erp-icon-btn"
            onClick={() => setMobileSheetOpen(false)}
            aria-label="Close filter sheet"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="erp-sheet-body">
          {/* Date Picker */}
          <div className="erp-filter-group">
            <label className="erp-filter-label">{t('date') || 'தேதி'}</label>
            <input
              type="date"
              className="erp-filter-select font-numeric"
              value={dateStr}
              onChange={handleDateInputChange}
            />
          </div>

          {/* Stock Status */}
          <div className="erp-filter-group">
            <label className="erp-filter-label">{t('col_stock_status') || 'இருப்பு நிலை'}</label>
            <select
              className="erp-filter-select"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <option value="all">{t('status_all_stock') || 'அனைத்து நிலைகள்'}</option>
              <option value="sufficient">🟢 {t('stock_status_sufficient') || 'போதுமானது'}</option>
              <option value="low">🟡 {t('stock_status_low') || 'குறைவு'}</option>
              <option value="out">🔴 {t('stock_status_out') || 'இல்லை'}</option>
            </select>
          </div>

          {/* Measuring Unit */}
          <div className="erp-filter-group">
            <label className="erp-filter-label">{t('col_unit') || 'அலகு'}</label>
            <select
              className="erp-filter-select"
              value={unitFilter}
              onChange={(e) => onUnitChange(e.target.value)}
            >
              <option value="all">{t('unit_all') || 'அனைத்து அலகுகள்'}</option>
              <option value="kg">kg (கிலோ)</option>
              <option value="g">g (கிராம்)</option>
              <option value="படி">படி</option>
              <option value="pie">pie (எண்ணிக்கை)</option>
            </select>
          </div>
        </div>

        <div className="erp-sheet-footer">
          <button
            className="btn-erp-secondary w-50"
            onClick={() => {
              onReset();
              setMobileSheetOpen(false);
            }}
          >
            {t('reset') || 'மீட்டமை'}
          </button>
          <button
            className="btn-erp-primary w-50"
            onClick={() => setMobileSheetOpen(false)}
          >
            {t('apply') || 'பயன்படுத்து'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockFilterBar;
