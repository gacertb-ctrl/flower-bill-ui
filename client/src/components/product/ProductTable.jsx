import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faEllipsisV,
  faPen,
  faPrint,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faExclamationTriangle,
  faInbox,
  faRotateRight
} from '@fortawesome/free-solid-svg-icons';
import { formatRupee } from './ProductKPIs';
import './ProductTable.css';

const ProductTable = ({
  data = [],
  loading = false,
  error = null,
  onRetry,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
  user,
  searchTerm = ''
}) => {
  const { t } = useTranslation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Active row dropdown menu tracking
  const [activeMenuCode, setActiveMenuCode] = useState(null);

  const toggleActionMenu = (code, e) => {
    e.stopPropagation();
    setActiveMenuCode(prev => (prev === code ? null : code));
  };

  // Close action menu when clicking outside
  React.useEffect(() => {
    const handleDocumentClick = () => setActiveMenuCode(null);
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  // Pagination calculations
  const totalRecords = data.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  // Adjust page if data length shrinks
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Print single product details / label
  const handlePrintProduct = (row) => {
    window.print();
  };

  // Helper for stock status calculation
  const getStockStatus = (quality) => {
    const q = parseFloat(quality || 0);
    if (q > 5) {
      return { label: t('stock_sufficient') || 'போதுமானது', className: 'sufficient', dot: '🟢' };
    }
    if (q > 0) {
      return { label: t('stock_low') || 'குறைந்த இருப்பு', className: 'low', dot: '🟡' };
    }
    return { label: t('stock_out') || 'இருப்பு இல்லை', className: 'out', dot: '🔴' };
  };

  // Helper for unit translation
  const getUnitDisplay = (unit) => {
    if (!unit) return '-';
    if (unit === 'kg') return t('kg') || 'கிலோ';
    if (unit === 'g') return t('g') || 'கிராம்';
    if (unit === 'படி') return t('padi') || 'படி';
    if (unit === 'pie') return t('pieces') || 'எண்ணிக்கை';
    return unit;
  };

  // 1. Error state
  if (error) {
    return (
      <div className="product-table-container">
        <div className="erp-table-error">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger empty-icon" />
          <div className="empty-title text-danger">{error}</div>
          {onRetry && (
            <button className="btn-erp-primary" onClick={onRetry}>
              <FontAwesomeIcon icon={faRotateRight} />
              <span>{t('retry_loading') || 'மீண்டும் முயற்சிக்கவும்'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. Loading state (Skeleton)
  if (loading && data.length === 0) {
    return (
      <div className="product-table-container">
        <div className="desktop-table-scroll">
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>{t('S.No') || 'வ.எண்'}</th>
                <th>{t('col_product') || 'பொருள்'}</th>
                <th>{t('col_unit') || 'அலகு'}</th>
                <th className="text-right">{t('col_price') || 'விலை'}</th>
                <th className="text-right">{t('col_stock') || 'இருப்பு'}</th>
                <th className="text-center">{t('col_stock_status') || 'இருப்பு நிலை'}</th>
                <th className="text-right">{t('col_stock_value') || 'மதிப்பு'}</th>
                <th className="text-right">{t('col_actions') || 'செயல்கள்'}</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="skeleton-row">
                  <td><div className="skeleton-box" style={{ width: '25px' }} /></td>
                  <td><div className="skeleton-box" style={{ width: '130px' }} /></td>
                  <td><div className="skeleton-box" style={{ width: '60px' }} /></td>
                  <td><div className="skeleton-box ms-auto" style={{ width: '70px' }} /></td>
                  <td><div className="skeleton-box ms-auto" style={{ width: '80px' }} /></td>
                  <td><div className="skeleton-box mx-auto" style={{ width: '90px' }} /></td>
                  <td><div className="skeleton-box ms-auto" style={{ width: '75px' }} /></td>
                  <td><div className="skeleton-box ms-auto" style={{ width: '70px' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 3. Empty state
  if (data.length === 0) {
    return (
      <div className="product-table-container">
        <div className="erp-table-empty">
          <FontAwesomeIcon icon={faInbox} className="empty-icon" />
          <div className="empty-title">
            {searchTerm
              ? (t('no_product_search_results') || 'தேடலுக்குரிய பொருள் விவரங்கள் கிடைக்கவில்லை')
              : (t('no_products_found') || 'பொருட்கள் எதுவும் பதிவு செய்யப்படவில்லை')}
          </div>
          <div className="empty-desc">
            {searchTerm
              ? 'வேறு பெயரோ குறியீடோ உள்ளிட்டு தேடவும் அல்லது வடிகட்டிகளை மீட்டமைக்கவும்.'
              : '+ புதிய பொருள் பொத்தானைப் பயன்படுத்தி பொருளை சேர்க்கவும்.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-table-container">
      {/* Desktop View: Full ERP Table */}
      <div className="desktop-table-scroll">
        <table className="erp-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>{t('S.No') || 'வ.எண்'}</th>
              <th>{t('col_product') || 'பொருள்'}</th>
              <th>{t('col_unit') || 'அலகு'}</th>
              <th className="text-right">{t('col_price') || 'விலை'}</th>
              <th className="text-right">{t('col_stock') || 'இருப்பு'}</th>
              <th className="text-center">{t('col_stock_status') || 'இருப்பு நிலை'}</th>
              <th className="text-right">{t('col_stock_value') || 'மதிப்பு'}</th>
              <th className="text-right" style={{ width: '130px' }}>
                {t('col_actions') || 'செயல்கள்'}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => {
              const serialNo = (currentPage - 1) * pageSize + index + 1;
              const price = parseFloat(row.price || 0);
              const quality = parseFloat(row.quality || 0);
              const status = getStockStatus(quality);
              const stockValue = quality > 0 ? (quality * price) : 0;
              const unitText = getUnitDisplay(row.unit);
              const isMenuOpen = activeMenuCode === row.code;

              return (
                <tr key={row.code || index}>
                  {/* S.No */}
                  <td className="text-muted font-numeric">{serialNo}</td>

                  {/* Product Name & Code */}
                  <td>
                    <div className="product-cell-main">
                      <span className="product-name-text">{row.name}</span>
                      <span className="product-code-pill font-numeric">{row.code}</span>
                    </div>
                  </td>

                  {/* Unit */}
                  <td>
                    <span className="unit-badge">{unitText}</span>
                  </td>

                  {/* Price */}
                  <td className="text-right font-numeric fw-semibold" style={{ color: '#1F2937' }}>
                    {formatRupee(price)}
                  </td>

                  {/* Stock Quantity */}
                  <td className="text-right font-numeric fw-semibold">
                    <span className={quality <= 0 ? 'text-danger' : 'text-primary'}>
                      {quality.toFixed(2)} {row.unit || ''}
                    </span>
                  </td>

                  {/* Stock Status */}
                  <td className="text-center">
                    <span className={`stock-status-pill ${status.className}`}>
                      <span>{status.dot}</span>
                      <span>{status.label}</span>
                    </span>
                  </td>

                  {/* Stock Value */}
                  <td className="text-right font-numeric text-muted">
                    {formatRupee(stockValue)}
                  </td>

                  {/* Actions */}
                  <td className="text-right">
                    <div className="table-actions-cell">
                      {/* Primary Quick View Button */}
                      <button
                        className="btn-action-view"
                        onClick={() => onViewProduct(row)}
                        title={t('action_view') || 'பார்'}
                      >
                        {t('action_view') || 'பார்'}
                      </button>

                      {/* ⋮ More Menu Button */}
                      <div style={{ position: 'relative' }}>
                        <button
                          className="btn-action-more"
                          onClick={(e) => toggleActionMenu(row.code, e)}
                          title={t('action_more') || 'மேலும்'}
                          aria-label="More actions"
                        >
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div className="action-dropdown-menu">
                            <button
                              className="action-dropdown-item"
                              onClick={() => {
                                onViewProduct(row);
                                setActiveMenuCode(null);
                              }}
                            >
                              <FontAwesomeIcon icon={faEye} />
                              <span>{t('action_view') || 'பார்'}</span>
                            </button>

                            <button
                              className="action-dropdown-item"
                              onClick={() => {
                                onEditProduct(row);
                                setActiveMenuCode(null);
                              }}
                            >
                              <FontAwesomeIcon icon={faPen} />
                              <span>{t('edit') || 'திருத்த'}</span>
                            </button>

                            <button
                              className="action-dropdown-item"
                              onClick={() => {
                                handlePrintProduct(row);
                                setActiveMenuCode(null);
                              }}
                            >
                              <FontAwesomeIcon icon={faPrint} />
                              <span>{t('action_print') || 'அச்சிடு'}</span>
                            </button>

                            {user?.role === 'admin' && (
                              <button
                                className="action-dropdown-item danger"
                                onClick={() => {
                                  onDeleteProduct(row.code);
                                  setActiveMenuCode(null);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                                <span>{t('action_delete') || 'நீக்கு'}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View: Genuine Mobile ERP Cards */}
      <div className="mobile-card-list">
        {paginatedData.map((row) => {
          const price = parseFloat(row.price || 0);
          const quality = parseFloat(row.quality || 0);
          const status = getStockStatus(quality);
          const stockValue = quality > 0 ? (quality * price) : 0;
          const unitText = getUnitDisplay(row.unit);

          return (
            <div key={row.code} className="mobile-product-card">
              <div className="mobile-card-top">
                <div className="mobile-card-name-group">
                  <span className="mobile-card-name">{row.name}</span>
                  <div className="mobile-card-meta">
                    <span className="erp-badge erp-badge-violet font-numeric">{row.code}</span>
                    <span className="unit-badge">{unitText}</span>
                  </div>
                </div>

                <span className={`stock-status-pill ${status.className}`}>
                  <span>{status.dot}</span>
                  <span>{status.label}</span>
                </span>
              </div>

              {/* Financial & Stock Box */}
              <div className="mobile-card-financials">
                <div className="fin-item">
                  <span className="fin-label">{t('col_price') || 'விலை'}</span>
                  <span className="fin-value font-numeric text-primary">{formatRupee(price)}</span>
                </div>
                <div className="fin-item">
                  <span className="fin-label">{t('col_stock') || 'இருப்பு'}</span>
                  <span className={`fin-value font-numeric ${quality <= 0 ? 'text-danger' : 'text-success'}`}>
                    {quality.toFixed(2)} {row.unit || ''}
                  </span>
                </div>
                <div className="fin-item">
                  <span className="fin-label">{t('col_stock_value') || 'மதிப்பு'}</span>
                  <span className="fin-value font-numeric">{formatRupee(stockValue)}</span>
                </div>
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="mobile-card-actions">
                <button
                  className="btn-erp-secondary w-50"
                  onClick={() => onViewProduct(row)}
                >
                  <FontAwesomeIcon icon={faEye} />
                  <span>{t('action_view') || 'பார்'}</span>
                </button>
                <button
                  className="btn-erp-primary w-50"
                  onClick={() => onEditProduct(row)}
                >
                  <FontAwesomeIcon icon={faPen} />
                  <span>{t('edit') || 'திருத்த'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Pagination Footer */}
      <div className="table-pagination-footer">
        <div className="d-flex align-items-center gap-2">
          <span>
            {t('records_count') || 'மொத்த பதிவுகள்'}: <strong className="font-numeric">{totalRecords}</strong>
          </span>
          <span className="text-muted">|</span>
          <div className="d-flex align-items-center gap-1">
            <span className="small">{t('items_per_page') || 'பக்கத்திற்கு'}:</span>
            <select
              className="filter-select py-1 px-2"
              style={{ minWidth: '70px', fontSize: '0.75rem' }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Pagination Page Controls */}
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <span className="px-2 font-numeric small">
            {currentPage} / {totalPages}
          </span>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
