import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faPen,
  faTrash,
  faSearch,
  faRotateRight,
  faArrowUp,
  faTimes,
  faFileInvoiceDollar
} from '@fortawesome/free-solid-svg-icons';
import './PurchaseDebitPanel.css';

const PurchaseDebitPanel = ({
  entries = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('ALL');

  // Derive unique suppliers from entries for filter dropdown
  const supplierOptions = useMemo(() => {
    const map = new Map();
    entries.forEach(e => {
      const code = e.customer_supplier_code || e.code || '';
      const name = e.customer_supplier_name || e.name || '';
      if (code && !map.has(code)) {
        map.set(code, name);
      }
    });
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter(item => {
      const code = (item.customer_supplier_code || item.code || '').toLowerCase();
      const name = (item.customer_supplier_name || item.name || '').toLowerCase();
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch = !term || name.includes(term) || code.includes(term);
      const matchesSupplier = selectedSupplier === 'ALL' || (item.customer_supplier_code || item.code) === selectedSupplier;

      return matchesSearch && matchesSupplier;
    });
  }, [entries, searchTerm, selectedSupplier]);

  // Total amount
  const totalAmount = useMemo(() => {
    return filteredEntries.reduce((sum, item) => sum + (parseFloat(item.debit_amount) || 0), 0);
  }, [filteredEntries]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSupplier('ALL');
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="erp-financial-panel debit-panel">
      {/* Header */}
      <div className="erp-financial-header">
        <div className="financial-header-left">
          <div className="financial-header-icon debit-icon-badge">
            <FontAwesomeIcon icon={faArrowUp} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h2 className="financial-header-title">{t('purchaseDebit')}</h2>
              <span className="erp-count-pill debit">
                {entries.length}
              </span>
            </div>
            <div className="financial-header-subtitle">
              {t('debitSubtitle') || 'சப்ளையர் பற்று தொகைகள்'}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="financial-add-btn btn-debit-primary"
          onClick={onAdd}
          id="btn-add-purchase-debit"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>{t('addDebit')}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="erp-financial-filter-bar">
        <div className="financial-search-wrap">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            className="financial-search-input"
            placeholder={t('searchPlaceholder') || 'சப்ளையர் தேடுக...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="input-search-debit"
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        <div className="financial-selects">
          <select
            className="financial-select"
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            id="select-filter-supplier"
          >
            <option value="ALL">{t('allSuppliers') || 'அனைத்து சப்ளையர்கள்'}</option>
            {supplierOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.name} ({opt.code})
              </option>
            ))}
          </select>

          {(searchTerm || selectedSupplier !== 'ALL') && (
            <button
              type="button"
              className="btn-filter-reset"
              onClick={handleResetFilters}
              title={t('resetFilters') || 'மீட்டமைக்க'}
            >
              <FontAwesomeIcon icon={faRotateRight} />
            </button>
          )}
        </div>
      </div>

      {/* Desktop Ledger Table */}
      <div className="financial-table-container d-none d-md-block">
        <table className="financial-table">
          <thead>
            <tr>
              <th className="col-sno">{t('S.No')}</th>
              <th>{t('supplier.name')}</th>
              <th className="text-end">{t('amount')}</th>
              <th className="text-end" style={{ width: '90px' }}>{t('action')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`}>
                  <td className="text-center"><div className="skeleton-line" style={{ width: '20px', margin: '0 auto' }}></div></td>
                  <td><div className="skeleton-line" style={{ width: '140px' }}></div></td>
                  <td><div className="skeleton-line" style={{ width: '70px', marginLeft: 'auto' }}></div></td>
                  <td><div className="skeleton-line" style={{ width: '50px', marginLeft: 'auto' }}></div></td>
                </tr>
              ))
            ) : filteredEntries.length > 0 ? (
              filteredEntries.map((row, index) => {
                const id = row.debit_id || row.id;
                const code = row.customer_supplier_code || row.code;
                const name = row.customer_supplier_name || row.name;
                const amount = row.debit_amount;

                return (
                  <tr key={id || index} className="financial-row">
                    <td className="col-sno text-center">{index + 1}</td>
                    <td>
                      <div className="party-name-cell">
                        <span className="party-name-text">{name}</span>
                        {code && (
                          <span className="party-code-pill debit">
                            {code}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-end">
                      <span className="financial-amount debit">
                        {formatCurrency(amount)}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="financial-actions-cell">
                        <button
                          type="button"
                          className="btn-action-round edit"
                          onClick={() => onEdit(row)}
                          title={t('edit') || 'திருத்துக'}
                          aria-label={`Edit ${name}`}
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button
                          type="button"
                          className="btn-action-round delete"
                          onClick={() => onDelete(id)}
                          title={t('delete') || 'நீக்குக'}
                          aria-label={`Delete ${name}`}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4">
                  <div className="erp-empty-financial">
                    <div className="empty-icon-wrap debit">
                      <FontAwesomeIcon icon={faFileInvoiceDollar} />
                    </div>
                    <div className="empty-title">{t('noEntriesFound')}</div>
                    <div className="empty-desc">
                      {searchTerm || selectedSupplier !== 'ALL'
                        ? (t('noMatchFilter') || 'தேடல் நிபந்தனைக்கு ஏற்ப பதிவுகள் இல்லை')
                        : (t('noDebitsRecorded') || 'இத்தேதிக்கு கொள்முதல் பற்று பதிவுகள் இல்லை')}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (d-md-none) */}
      <div className="financial-mobile-list d-md-none">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={`m-skel-${idx}`} className="mobile-financial-card p-3">
              <div className="skeleton-line mb-2" style={{ width: '60%' }}></div>
              <div className="skeleton-line" style={{ width: '40%' }}></div>
            </div>
          ))
        ) : filteredEntries.length > 0 ? (
          filteredEntries.map((row, index) => {
            const id = row.debit_id || row.id;
            const code = row.customer_supplier_code || row.code;
            const name = row.customer_supplier_name || row.name;
            const amount = row.debit_amount;

            return (
              <div key={id || index} className="mobile-financial-card mobile-card-debit">
                <div className="mobile-card-top">
                  <div className="d-flex align-items-center gap-2">
                    <span className="mobile-sno-badge">{index + 1}</span>
                    <div>
                      <div className="mobile-party-name">{name}</div>
                      {code && <span className="party-code-pill debit">{code}</span>}
                    </div>
                  </div>
                  <div className="mobile-actions">
                    <button
                      type="button"
                      className="btn-action-round edit"
                      onClick={() => onEdit(row)}
                      aria-label="Edit"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      type="button"
                      className="btn-action-round delete"
                      onClick={() => onDelete(id)}
                      aria-label="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>

                <div className="mobile-card-bottom">
                  <span className="mobile-amount-label">{t('amount')}:</span>
                  <span className="amount-badge debit">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="erp-empty-financial p-4">
            <div className="empty-icon-wrap debit">
              <FontAwesomeIcon icon={faFileInvoiceDollar} />
            </div>
            <div className="empty-title">{t('noEntriesFound')}</div>
            <div className="empty-desc">
              {searchTerm || selectedSupplier !== 'ALL'
                ? (t('noMatchFilter') || 'தேடல் நிபந்தனைக்கு ஏற்ப பதிவுகள் இல்லை')
                : (t('noDebitsRecorded') || 'இத்தேதிக்கு கொள்முதல் பற்று பதிவுகள் இல்லை')}
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="financial-summary-footer">
        <div className="financial-summary-col">
          <span className="summary-label">{t('entriesCount') || 'பதிவுகள்'}:</span>
          <span className="summary-val">{filteredEntries.length}</span>
        </div>
        <div className="financial-summary-col">
          <span className="summary-label">{t('totalDebit')}:</span>
          <span className="summary-amount-badge debit">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDebitPanel;
