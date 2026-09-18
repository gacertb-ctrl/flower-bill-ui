import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faSort,
  faSortUp,
  faSortDown,
  faChevronLeft,
  faChevronRight,
  faCartPlus,
  faBoxOpen,
  faArrowDown,
  faArrowUp
} from '@fortawesome/free-solid-svg-icons';
import './StockTable.css';

const StockTable = ({
  data = [],
  loading = false,
  onViewStock
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Sorting
  const [sortField, setSortField] = useState('product_name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return [...data].sort((a, b) => {
      let valA, valB;
      if (sortField === 'product_name') {
        valA = a.product_name || '';
        valB = b.product_name || '';
        return sortDirection === 'asc'
          ? valA.localeCompare(valB, 'ta')
          : valB.localeCompare(valA, 'ta');
      } else if (sortField === 'product_code') {
        valA = a.product_code || '';
        valB = b.product_code || '';
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else if (sortField === 'purchases') {
        valA = parseFloat(a.total_purchase_quality || 0);
        valB = parseFloat(b.total_purchase_quality || 0);
      } else if (sortField === 'sales') {
        valA = parseFloat(a.total_sales_quality || 0);
        valB = parseFloat(b.total_sales_quality || 0);
      } else if (sortField === 'balance') {
        valA = parseFloat(a.total_purchase_quality || 0) - parseFloat(a.total_sales_quality || 0);
        valB = parseFloat(b.total_purchase_quality || 0) - parseFloat(b.total_sales_quality || 0);
      } else if (sortField === 'valuation') {
        const balA = parseFloat(a.total_purchase_quality || 0) - parseFloat(a.total_sales_quality || 0);
        const balB = parseFloat(b.total_purchase_quality || 0) - parseFloat(b.total_sales_quality || 0);
        valA = balA > 0 ? balA * parseFloat(a.price || 0) : 0;
        valB = balB > 0 ? balB * parseFloat(b.price || 0) : 0;
      } else {
        valA = parseFloat(a[sortField] || 0);
        valB = parseFloat(b[sortField] || 0);
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [data, sortField, sortDirection]);

  // Paginated records
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const formatRupee = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amt || 0);
  };

  const getStockStatus = (balance) => {
    if (balance > 5) {
      return { label: t('stock_status_sufficient') || 'போதுமானது', className: 'status-sufficient', dot: '🟢' };
    }
    if (balance > 0 && balance <= 5) {
      return { label: t('stock_status_low') || 'குறைவு', className: 'status-low', dot: '🟡' };
    }
    return { label: t('stock_status_out') || 'இல்லை', className: 'status-out', dot: '🔴' };
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <FontAwesomeIcon icon={faSort} className="sort-icon-inactive" />;
    }
    return sortDirection === 'asc' ? (
      <FontAwesomeIcon icon={faSortUp} className="sort-icon-active" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="sort-icon-active" />
    );
  };

  if (loading) {
    return (
      <div className="erp-table-wrapper">
        <div className="erp-skeleton-table">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="erp-skeleton-row">
              <div className="skeleton-cell w-10"></div>
              <div className="skeleton-cell w-30"></div>
              <div className="skeleton-cell w-15"></div>
              <div className="skeleton-cell w-15"></div>
              <div className="skeleton-cell w-15"></div>
              <div className="skeleton-cell w-15"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!loading && sortedData.length === 0) {
    return (
      <div className="erp-empty-container">
        <div className="erp-empty-icon">
          <FontAwesomeIcon icon={faBoxOpen} />
        </div>
        <h3 className="erp-empty-title">{t('no_stock_search_results') || 'தேடலுக்கு பொருந்தும் இருப்பு தகவல்கள் இல்லை'}</h3>
        <p className="erp-empty-desc">
          வேறு தேதி அல்லது வடிகட்டி சொற்களைப் பயன்படுத்தி மீண்டும் முயற்சிக்கவும்.
        </p>
      </div>
    );
  }

  return (
    <div className="erp-table-wrapper">
      {/* Desktop ERP Dense Table */}
      <div className="table-responsive d-none d-md-block">
        <table className="erp-table stock-erp-table" aria-label="சரக்கு இருப்பு பட்டியல்">
          <thead>
            <tr>
              <th className="col-sno">{t('s_no') || 'வ.எண்'}</th>
              <th className="col-product-name cursor-pointer" onClick={() => handleSort('product_name')}>
                <div className="th-content">
                  <span>{t('col_product') || 'பொருள்'}</span>
                  {renderSortIcon('product_name')}
                </div>
              </th>
              <th className="col-unit">{t('col_unit') || 'அலகு'}</th>
              <th className="col-price text-end cursor-pointer" onClick={() => handleSort('price')}>
                <div className="th-content justify-content-end">
                  <span>{t('col_price') || 'விலை'}</span>
                  {renderSortIcon('price')}
                </div>
              </th>
              <th className="col-incoming text-end cursor-pointer" onClick={() => handleSort('purchases')}>
                <div className="th-content justify-content-end">
                  <span>{t('col_incoming') || 'கொள்முதல்'}</span>
                  {renderSortIcon('purchases')}
                </div>
              </th>
              <th className="col-outgoing text-end cursor-pointer" onClick={() => handleSort('sales')}>
                <div className="th-content justify-content-end">
                  <span>{t('col_outgoing') || 'விற்பனை'}</span>
                  {renderSortIcon('sales')}
                </div>
              </th>
              <th className="col-balance text-end cursor-pointer" onClick={() => handleSort('balance')}>
                <div className="th-content justify-content-end">
                  <span>{t('col_current_balance') || 'தற்போதைய இருப்பு'}</span>
                  {renderSortIcon('balance')}
                </div>
              </th>
              <th className="col-val text-end cursor-pointer" onClick={() => handleSort('valuation')}>
                <div className="th-content justify-content-end">
                  <span>{t('col_stock_valuation') || 'இருப்பு மதிப்பு'}</span>
                  {renderSortIcon('valuation')}
                </div>
              </th>
              <th className="col-status text-center">{t('col_stock_status') || 'நிலை'}</th>
              <th className="col-actions text-end">{t('actions') || 'செயல்கள்'}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => {
              const purchases = parseFloat(row.total_purchase_quality || 0);
              const sales = parseFloat(row.total_sales_quality || 0);
              const balance = purchases - sales;
              const price = parseFloat(row.price || 0);
              const valuation = balance > 0 ? balance * price : 0;
              const status = getStockStatus(balance);
              const sNo = (currentPage - 1) * pageSize + index + 1;

              return (
                <tr key={row.product_code || index} className="erp-table-row">
                  {/* S.No */}
                  <td className="col-sno font-numeric text-muted">{sNo}</td>

                  {/* Product Name & Code Badge */}
                  <td className="col-product-name">
                    <div className="product-identity-cell">
                      <span className="product-name-tamil">{row.product_name}</span>
                      <span className="erp-badge erp-badge-violet font-numeric">{row.product_code}</span>
                    </div>
                  </td>

                  {/* Unit */}
                  <td className="col-unit">
                    <span className="unit-pill">{row.unit || 'kg'}</span>
                  </td>

                  {/* Price */}
                  <td className="col-price text-end font-numeric">
                    {price > 0 ? formatRupee(price) : '—'}
                  </td>

                  {/* Incoming Purchases */}
                  <td className="col-incoming text-end font-numeric text-blue">
                    {purchases > 0 ? (
                      <span className="d-inline-flex align-items-center gap-1">
                        <FontAwesomeIcon icon={faArrowDown} style={{ fontSize: '0.7rem' }} />
                        {purchases.toFixed(2)}
                      </span>
                    ) : (
                      '0.00'
                    )}
                  </td>

                  {/* Outgoing Sales */}
                  <td className="col-outgoing text-end font-numeric text-emerald">
                    {sales > 0 ? (
                      <span className="d-inline-flex align-items-center gap-1">
                        <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: '0.7rem' }} />
                        {sales.toFixed(2)}
                      </span>
                    ) : (
                      '0.00'
                    )}
                  </td>

                  {/* Current Balance */}
                  <td className={`col-balance text-end font-numeric fw-bold ${balance <= 0 ? 'text-danger' : 'text-primary'}`}>
                    {balance.toFixed(2)} {row.unit || 'kg'}
                  </td>

                  {/* Valuation */}
                  <td className="col-val text-end font-numeric fw-semibold">
                    {valuation > 0 ? formatRupee(valuation) : '₹0.00'}
                  </td>

                  {/* Status */}
                  <td className="col-status text-center">
                    <span className={`stock-status-pill ${status.className}`}>
                      <span className="status-dot-symbol">{status.dot}</span>
                      <span>{status.label}</span>
                    </span>
                  </td>

                  {/* Row Actions */}
                  <td className="col-actions text-end">
                    <div className="table-actions-cell justify-content-end">
                      <button
                        className="btn-action-view"
                        title={t('action_view') || 'பார்'}
                        onClick={() => onViewStock(row)}
                        aria-label={`View details for ${row.product_name}`}
                      >
                        <FontAwesomeIcon icon={faEye} />
                        <span>{t('action_view') || 'பார்'}</span>
                      </button>
                      <button
                        className="btn-action-more"
                        title={t('action_entry_purchase') || 'கொள்முதல் பதிவு'}
                        onClick={() => navigate('/entries')}
                        aria-label="Record Purchase"
                      >
                        <FontAwesomeIcon icon={faCartPlus} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View: Genuine Mobile ERP Cards */}
      <div className="mobile-card-list d-md-none">
        {paginatedData.map((row) => {
          const purchases = parseFloat(row.total_purchase_quality || 0);
          const sales = parseFloat(row.total_sales_quality || 0);
          const balance = purchases - sales;
          const price = parseFloat(row.price || 0);
          const valuation = balance > 0 ? balance * price : 0;
          const status = getStockStatus(balance);

          return (
            <div key={row.product_code} className="mobile-stock-card">
              <div className="mobile-card-top">
                <div className="mobile-card-name-group">
                  <span className="mobile-card-name">{row.product_name}</span>
                  <div className="mobile-card-meta">
                    <span className="erp-badge erp-badge-violet font-numeric">{row.product_code}</span>
                    <span className="unit-pill">{row.unit || 'kg'}</span>
                    {price > 0 && (
                      <span className="mobile-price-tag font-numeric">{formatRupee(price)}</span>
                    )}
                  </div>
                </div>

                <span className={`stock-status-pill ${status.className}`}>
                  <span>{status.dot}</span>
                  <span>{status.label}</span>
                </span>
              </div>

              {/* 4-Item Stock Financials */}
              <div className="mobile-stock-metrics">
                <div className="fin-item">
                  <span className="fin-label">{t('col_incoming') || 'கொள்முதல்'}</span>
                  <span className="fin-value font-numeric text-blue">
                    {purchases.toFixed(2)}
                  </span>
                </div>
                <div className="fin-item">
                  <span className="fin-label">{t('col_outgoing') || 'விற்பனை'}</span>
                  <span className="fin-value font-numeric text-emerald">
                    {sales.toFixed(2)}
                  </span>
                </div>
                <div className="fin-item">
                  <span className="fin-label">{t('col_current_balance') || 'இருப்பு'}</span>
                  <span className={`fin-value font-numeric ${balance <= 0 ? 'text-danger' : 'text-primary'}`}>
                    {balance.toFixed(2)}
                  </span>
                </div>
                <div className="fin-item">
                  <span className="fin-label">{t('col_stock_valuation') || 'மதிப்பு'}</span>
                  <span className="fin-value font-numeric">
                    {formatRupee(valuation)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mobile-card-actions">
                <button
                  className="btn-erp-secondary w-50"
                  onClick={() => onViewStock(row)}
                >
                  <FontAwesomeIcon icon={faEye} />
                  <span>{t('action_view') || 'பார்'}</span>
                </button>
                <button
                  className="btn-erp-primary w-50"
                  onClick={() => navigate('/entries')}
                >
                  <FontAwesomeIcon icon={faCartPlus} />
                  <span>{t('action_entry_purchase') || 'பதிவு செய்'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      <div className="erp-pagination-bar">
        <div className="erp-pagination-info font-numeric">
          {sortedData.length > 0 ? (
            <>
              {(currentPage - 1) * pageSize + 1} –{' '}
              {Math.min(currentPage * pageSize, sortedData.length)} /{' '}
              <strong>{sortedData.length}</strong>
            </>
          ) : (
            '0 பொருட்கள்'
          )}
        </div>

        <div className="erp-pagination-controls">
          <div className="erp-pagesize-select-wrap">
            <span className="erp-pagesize-label">{t('rows_per_page') || 'வரிசைகள்'}:</span>
            <select
              className="erp-pagesize-select font-numeric"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="erp-pagination-nav">
            <button
              className="erp-page-nav-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              aria-label="Previous page"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <span className="erp-page-indicator font-numeric">
              {currentPage} / {totalPages}
            </span>
            <button
              className="erp-page-nav-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              aria-label="Next page"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockTable;
