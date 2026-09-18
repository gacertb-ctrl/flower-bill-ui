import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faEye,
  faEllipsisV,
  faPen,
  faHistory,
  faMoneyBillWave,
  faPrint,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faExclamationTriangle,
  faInbox,
  faRotateRight
} from '@fortawesome/free-solid-svg-icons';
import { formatRupee } from './CustomerKPIs';
import './CustomerTable.css';

const CustomerTable = ({
  data = [],
  loading = false,
  error = null,
  onRetry,
  onViewCustomer,
  onEditCustomer,
  onOpenLedger,
  onDeleteCustomer,
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

  // Print single customer statement or dispatch
  const handlePrintCustomer = (row) => {
    window.open(`/print-report?period=date&type=sales&code=${row.code}`, '_blank');
  };

  // 1. Error state
  if (error) {
    return (
      <div className="customer-table-container">
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
      <div className="customer-table-container">
        <div className="desktop-table-scroll">
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>{t('S.No') || 'வ.எண்'}</th>
                <th>{t('col_customer') || 'வாடிக்கையாளர்'}</th>
                <th>{t('col_mobile') || 'மொபைல்'}</th>
                <th>{t('col_city') || 'நகரம்'}</th>
                <th className="text-right">{t('col_total_purchase') || 'மொத்த கொள்முதல்'}</th>
                <th className="text-right">{t('col_paid') || 'செலுத்தியது'}</th>
                <th className="text-right">{t('col_balance') || 'பாக்கி'}</th>
                <th>{t('col_last_tx') || 'கடைசி பரிவர்த்தனை'}</th>
                <th className="text-right">{t('col_actions') || 'செயல்கள்'}</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="skeleton-row">
                  <td><div className="skeleton-box" style={{ width: '25px' }} /></td>
                  <td><div className="skeleton-box" style={{ width: '140px' }} /></td>
                  <td><div className="skeleton-box" style={{ width: '100px' }} /></td>
                  <td><div className="skeleton-box" style={{ width: '90px' }} /></td>
                  <td><div className="skeleton-box ms-auto" style={{ width: '80px' }} /></td>
                  <td><div className="skeleton-box ms-auto" style={{ width: '80px' }} /></td>
                  <td><div className="skeleton-box ms-auto" style={{ width: '90px' }} /></td>
                  <td><div className="skeleton-box" style={{ width: '70px' }} /></td>
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
      <div className="customer-table-container">
        <div className="erp-table-empty">
          <FontAwesomeIcon icon={faInbox} className="empty-icon" />
          <div className="empty-title">
            {searchTerm
              ? (t('no_search_results') || 'தேடலுக்குரிய வாடிக்கையாளர் விவரங்கள் கிடைக்கவில்லை')
              : (t('no_customers_found') || 'வாடிக்கையாளர்கள் எவரும் பதிவு செய்யப்படவில்லை')}
          </div>
          <div className="empty-desc">
            {searchTerm
              ? 'வேறு பெயரோ குறியீடோ உள்ளிட்டு தேடவும் அல்லது வடிகட்டிகளை மீட்டமைக்கவும்.'
              : '+ புதிய வாடிக்கையாளர் பொத்தானைப் பயன்படுத்தி வாடிக்கையாளரை சேர்க்கவும்.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-table-container">
      {/* Desktop View: Full ERP Table */}
      <div className="desktop-table-scroll">
        <table className="erp-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>{t('S.No') || 'வ.எண்'}</th>
              <th>{t('col_customer') || 'வாடிக்கையாளர்'}</th>
              <th>{t('col_mobile') || 'மொபைல்'}</th>
              <th>{t('col_city') || 'நகரம்'}</th>
              <th className="text-right">{t('col_total_purchase') || 'மொத்த கொள்முதல்'}</th>
              <th className="text-right">{t('col_paid') || 'செலுத்தியது'}</th>
              <th className="text-right">{t('col_balance') || 'பாக்கி'}</th>
              <th>{t('col_last_tx') || 'கடைசி பரிவர்த்தனை'}</th>
              <th className="text-right" style={{ width: '130px' }}>
                {t('col_actions') || 'செயல்கள்'}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => {
              const serialNo = (currentPage - 1) * pageSize + index + 1;
              const debit = parseFloat(row.debit_amount || 0);
              const credit = parseFloat(row.credit_amount || 0);
              const balance = debit - credit;
              const hasBalance = balance > 0;
              const isMenuOpen = activeMenuCode === row.code;

              return (
                <tr key={row.code || index}>
                  {/* S.No */}
                  <td className="text-muted font-numeric">{serialNo}</td>

                  {/* Customer Name & Code */}
                  <td>
                    <div className="customer-cell-main">
                      <span className="customer-name-text">{row.name}</span>
                      <span className="customer-code-pill font-numeric">{row.code}</span>
                    </div>
                  </td>

                  {/* Mobile Contact */}
                  <td>
                    {row.contact ? (
                      <a href={`tel:${row.contact}`} className="customer-phone-link font-numeric">
                        <FontAwesomeIcon icon={faPhone} style={{ fontSize: '0.75rem', opacity: 0.7 }} />
                        <span>{row.contact}</span>
                      </a>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>

                  {/* Address / City */}
                  <td>
                    <span className="text-secondary small">{row.address || '-'}</span>
                  </td>

                  {/* Total Purchase (Debit) */}
                  <td className="text-right font-numeric fw-semibold">
                    {formatRupee(debit)}
                  </td>

                  {/* Paid (Credit) */}
                  <td className="text-right font-numeric text-muted">
                    {formatRupee(credit)}
                  </td>

                  {/* Outstanding Balance */}
                  <td className="text-right font-numeric">
                    {hasBalance ? (
                      <span className="erp-badge erp-badge-rose font-numeric">
                        {formatRupee(balance)}
                      </span>
                    ) : (
                      <span className="erp-badge erp-badge-green">
                        {t('badge_settled') || 'செலுத்தப்பட்டது'}
                      </span>
                    )}
                  </td>

                  {/* Last Transaction */}
                  <td>
                    <span className="small text-muted font-numeric">
                      {row.last_transaction_date ? row.last_transaction_date.split('T')[0] : '-'}
                    </span>
                  </td>

                  {/* Row Actions */}
                  <td className="text-right">
                    <div className="table-actions-cell">
                      {/* Primary Quick View Button */}
                      <button
                        className="btn-action-view"
                        onClick={() => onViewCustomer(row)}
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
                                onViewCustomer(row);
                                setActiveMenuCode(null);
                              }}
                            >
                              <FontAwesomeIcon icon={faEye} />
                              <span>{t('action_view') || 'பார்'}</span>
                            </button>

                            <button
                              className="action-dropdown-item"
                              onClick={() => {
                                onEditCustomer(row);
                                setActiveMenuCode(null);
                              }}
                            >
                              <FontAwesomeIcon icon={faPen} />
                              <span>{t('edit') || 'திருத்த'}</span>
                            </button>

                            <button
                              className="action-dropdown-item"
                              onClick={() => {
                                onOpenLedger(row.code);
                                setActiveMenuCode(null);
                              }}
                            >
                              <FontAwesomeIcon icon={faHistory} />
                              <span>{t('action_ledger') || 'லெட்ஜர்'}</span>
                            </button>

                            <button
                              className="action-dropdown-item"
                              onClick={() => {
                                window.location.href = `/debit-credit?code=${row.code}`;
                                setActiveMenuCode(null);
                              }}
                            >
                              <FontAwesomeIcon icon={faMoneyBillWave} />
                              <span>{t('action_payment') || 'பணம் பெறுதல்'}</span>
                            </button>

                            <button
                              className="action-dropdown-item"
                              onClick={() => {
                                handlePrintCustomer(row);
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
                                  onDeleteCustomer(row.code);
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
          const debit = parseFloat(row.debit_amount || 0);
          const credit = parseFloat(row.credit_amount || 0);
          const balance = debit - credit;
          const hasBalance = balance > 0;

          return (
            <div key={row.code} className="mobile-customer-card">
              <div className="mobile-card-top">
                <div className="mobile-card-name-group">
                  <span className="mobile-card-name">{row.name}</span>
                  <div className="mobile-card-meta">
                    <span className="erp-badge erp-badge-violet font-numeric">{row.code}</span>
                    {row.address && <span>{row.address}</span>}
                  </div>
                </div>

                {hasBalance ? (
                  <span className="erp-badge erp-badge-rose font-numeric">
                    {formatRupee(balance)}
                  </span>
                ) : (
                  <span className="erp-badge erp-badge-green">
                    {t('badge_settled') || 'செலுத்தப்பட்டது'}
                  </span>
                )}
              </div>

              {row.contact && (
                <div>
                  <a href={`tel:${row.contact}`} className="customer-phone-link font-numeric">
                    <FontAwesomeIcon icon={faPhone} />
                    <span>{row.contact}</span>
                  </a>
                </div>
              )}

              {/* Financial Summary Box */}
              <div className="mobile-card-financials">
                <div className="fin-item">
                  <span className="fin-label">{t('col_total_purchase') || 'மொத்த கொள்முதல்'}</span>
                  <span className="fin-value font-numeric text-primary">{formatRupee(debit)}</span>
                </div>
                <div className="fin-item">
                  <span className="fin-label">{t('col_paid') || 'செலுத்தியது'}</span>
                  <span className="fin-value font-numeric text-success">{formatRupee(credit)}</span>
                </div>
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="mobile-card-actions">
                <button
                  className="btn-erp-secondary w-50"
                  onClick={() => onViewCustomer(row)}
                >
                  <FontAwesomeIcon icon={faEye} />
                  <span>{t('action_view') || 'பார்'}</span>
                </button>
                <button
                  className="btn-erp-primary w-50"
                  onClick={() => {
                    window.location.href = `/debit-credit?code=${row.code}`;
                  }}
                >
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                  <span>{t('action_payment') || 'பணம் பெறு'}</span>
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

export default CustomerTable;
