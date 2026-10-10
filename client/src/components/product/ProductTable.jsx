import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faEllipsisV,
  faPen,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faExclamationTriangle,
  faInbox,
  faRotateRight,
  faCartPlus,
  faSort,
  faSortUp,
  faSortDown
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
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
  searchTerm = '',
  sortField = '',
  sortDirection = 'asc',
  onSortChange
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const handleSort = (field) => {
    if (onSortChange) {
      onSortChange(field);
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <FontAwesomeIcon icon={faSort} className="sort-icon-inactive ms-1" />;
    }
    return sortDirection === 'asc' ? (
      <FontAwesomeIcon icon={faSortUp} className="sort-icon-active ms-1" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="sort-icon-active ms-1" />
    );
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
                <th style={{ width: '55px' }}>{t('S.No') || 'வ.எண்'}</th>
                <th>{t('col_product') || 'பொருள்'}</th>
                <th style={{ width: '85px' }}>{t('col_unit') || 'அலகு'}</th>
                <th className="text-right">{t('col_price') || 'விலை'}</th>
                <th className="text-right">{t('col_incoming') || 'வரத்து'}</th>
                <th className="text-right">{t('col_outgoing') || 'விற்பனை'}</th>
                <th className="text-right">{t('col_stock') || 'இருப்பு'}</th>
                <th className="text-center" style={{ width: '120px' }}>{t('col_stock_status') || 'நிலை'}</th>
                <th className="text-right">{t('col_stock_value') || 'மதிப்பு'}</th>
                <th className="text-right" style={{ width: '125px' }}>{t('col_actions') || 'செயல்கள்'}</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="skeleton-row">
                  <td><div className="skeleton-box" style={{ width: '25px' }} /></td>
                  <td><div className="skeleton-box" style={{ width: '130px' }} /></td>
                  <td><div className="skeleton-box" style={{ width: '50px' }} /></td>
                  <td><div className="skeleton-box ms-auto" style={{ width: '60px' }} /></td>
                  <td><div className="skeleton-box ms-auto" style={{ width: '60px' }} /></td>
                  <td><div className="skeleton-box ms-auto" style={{ width: '60px' }} /></td>
                  <td><div className="skeleton-box ms-auto" style={{ width: '60px' }} /></td>
                  <td><div className="skeleton-box mx-auto" style={{ width: '80px' }} /></td>
                  <td><div className="skeleton-box ms-auto" style={{ width: '70px' }} /></td>
                  <td><div className="skeleton-box ms-auto" style={{ width: '80px' }} /></td>
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
      {/* Desktop View: Full ERP Consolidated Table */}
      <div className="desktop-table-scroll">
        <table className="erp-table">
          <thead>
            <tr>
              <th style={{ width: '55px' }}>{t('S.No') || 'வ.எண்'}</th>
              <th className="cursor-pointer" onClick={() => handleSort('name')}>
                <div className="th-sortable">
                  <span>{t('col_product') || 'பொருள்'}</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th style={{ width: '85px' }}>{t('col_unit') || 'அலகு'}</th>
              <th className="text-right cursor-pointer" onClick={() => handleSort('price')}>
                <div className="th-sortable justify-content-end">
                  <span>{t('col_price') || 'விலை'}</span>
                  {renderSortIcon('price')}
                </div>
              </th>
              <th className="text-right cursor-pointer" onClick={() => handleSort('purchases')}>
                <div className="th-sortable justify-content-end">
                  <span className="text-blue">{t('col_incoming') || 'வரத்து (கொள்முதல்)'}</span>
                  {renderSortIcon('purchases')}
                </div>
              </th>
              <th className="text-right cursor-pointer" onClick={() => handleSort('sales')}>
                <div className="th-sortable justify-content-end">
                  <span className="text-emerald">{t('col_outgoing') || 'விற்பனை'}</span>
                  {renderSortIcon('sales')}
                </div>
              </th>
              <th className="text-right cursor-pointer" onClick={() => handleSort('balance')}>
                <div className="th-sortable justify-content-end">
                  <span>{t('col_stock') || 'தற்போதைய இருப்பு'}</span>
                  {renderSortIcon('balance')}
                </div>
              </th>
              <th className="text-center" style={{ width: '120px' }}>
                {t('col_stock_status') || 'நிலை'}
              </th>
              <th className="text-right cursor-pointer" onClick={() => handleSort('valuation')}>
                <div className="th-sortable justify-content-end">
                  <span>{t('col_stock_value') || 'மதிப்பு'}</span>
                  {renderSortIcon('valuation')}
                </div>
              </th>
              <th className="text-right" style={{ width: '125px' }}>
                {t('col_actions') || 'செயல்கள்'}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => {
              const serialNo = (currentPage - 1) * pageSize + index + 1;
              const purchases = parseFloat(row.total_purchase_quality || 0);
              const sales = parseFloat(row.total_sales_quality || 0);
              const balance = row.balance !== undefined ? parseFloat(row.balance) : parseFloat(row.quality || 0);
              const price = parseFloat(row.price || 0);
              const valuation = row.valuation !== undefined ? parseFloat(row.valuation) : (balance > 0 ? balance * price : 0);
              const status = getStockStatus(balance);
              const unitText = getUnitDisplay(row.unit);
              const rowCode = row.code || row.product_code || `prod-${index}`;
              const isMenuOpen = activeMenuCode === rowCode;

              return (
                <tr key={rowCode}>
                  {/* S.No */}
                  <td className="text-muted font-numeric">{serialNo}</td>

                  {/* Product Name & Code */}
                  <td>
                    <div className="product-cell-main">
                      <span className="product-name-text">{row.name || row.product_name}</span>
                      <span className="product-code-pill font-numeric">{row.code || row.product_code}</span>
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

                  {/* Incoming Purchases */}
                  <td className="text-right font-numeric">
                    <span className={purchases > 0 ? 'text-blue fw-semibold' : 'text-muted'}>
                      {purchases > 0 ? `+${purchases.toFixed(2)}` : '0.00'}
                    </span>
                  </td>

                  {/* Outgoing Sales */}
                  <td className="text-right font-numeric">
                    <span className={sales > 0 ? 'text-emerald fw-semibold' : 'text-muted'}>
                      {sales > 0 ? `-${sales.toFixed(2)}` : '0.00'}
                    </span>
                  </td>

                  {/* Current Balance */}
                  <td className="text-right font-numeric fw-bold">
                    <span className={balance <= 0 ? 'text-danger' : balance <= 5 ? 'text-amber' : 'text-primary'}>
                      {balance.toFixed(2)}
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
                    {formatRupee(valuation)}
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
                          onClick={(e) => toggleActionMenu(rowCode, e)}
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
                                navigate('/entries');
                                setActiveMenuCode(null);
                              }}
                            >
                              <FontAwesomeIcon icon={faCartPlus} />
                              <span>{t('quick_nav_entries') || 'நாள் பதிவு'}</span>
                            </button>


                            {user?.role === 'admin' && (
                              <button
                                className="action-dropdown-item danger"
                                onClick={() => {
                                  onDeleteProduct(row.code || row.product_code);
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
        {paginatedData.map((row, index) => {
          const purchases = parseFloat(row.total_purchase_quality || 0);
          const sales = parseFloat(row.total_sales_quality || 0);
          const balance = row.balance !== undefined ? parseFloat(row.balance) : parseFloat(row.quality || 0);
          const price = parseFloat(row.price || 0);
          const valuation = row.valuation !== undefined ? parseFloat(row.valuation) : (balance > 0 ? balance * price : 0);
          const status = getStockStatus(balance);
          const unitText = getUnitDisplay(row.unit);
          const rowCode = row.code || row.product_code || `mob-${index}`;

          return (
            <div key={rowCode} className="mobile-product-card">
              <div className="mobile-card-top">
                <div className="mobile-card-name-group">
                  <span className="mobile-card-name">{row.name || row.product_name}</span>
                  <div className="mobile-card-meta">
                    <span className="erp-badge erp-badge-violet font-numeric">{row.code || row.product_code}</span>
                    <span className="unit-badge">{unitText}</span>
                  </div>
                </div>

                <span className={`stock-status-pill ${status.className}`}>
                  <span>{status.dot}</span>
                  <span>{status.label}</span>
                </span>
              </div>

              {/* Financial & Stock Grid (Consolidated metrics) */}
              <div className="mobile-card-financials-grid">
                <div className="fin-item">
                  <span className="fin-label">{t('col_price') || 'விலை'}</span>
                  <span className="fin-value font-numeric text-primary">{formatRupee(price)}</span>
                </div>
                <div className="fin-item">
                  <span className="fin-label">{t('col_incoming') || 'வரத்து'}</span>
                  <span className={`fin-value font-numeric ${purchases > 0 ? 'text-blue' : 'text-muted'}`}>
                    +{purchases.toFixed(2)}
                  </span>
                </div>
                <div className="fin-item">
                  <span className="fin-label">{t('col_outgoing') || 'விற்பனை'}</span>
                  <span className={`fin-value font-numeric ${sales > 0 ? 'text-emerald' : 'text-muted'}`}>
                    -{sales.toFixed(2)}
                  </span>
                </div>
                <div className="fin-item">
                  <span className="fin-label">{t('col_stock') || 'இருப்பு'}</span>
                  <span className={`fin-value font-numeric fw-bold ${balance <= 0 ? 'text-danger' : balance <= 5 ? 'text-amber' : 'text-primary'}`}>
                    {balance.toFixed(2)} {row.unit || ''}
                  </span>
                </div>
                <div className="fin-item col-span-2">
                  <span className="fin-label">{t('col_stock_value') || 'இருப்பு மதிப்பு'}</span>
                  <span className="fin-value font-numeric text-muted">{formatRupee(valuation)}</span>
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
