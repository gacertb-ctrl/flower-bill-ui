import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUpRightFromSquare,
  faPlus,
  faRotateLeft,
  faSearch,
  faPen,
  faTrash,
  faReceipt
} from '@fortawesome/free-solid-svg-icons';
import './SalesLedgerCard.css';

const SalesLedgerCard = ({
  data = [],
  loading = false,
  onAddSales,
  onEditSales,
  onDeleteSales
}) => {
  const { t } = useTranslation();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique customers and products for dropdown filters
  const customerOptions = useMemo(() => {
    const list = data
      .map((item) => item.customer_supplier_name)
      .filter(Boolean);
    return [...new Set(list)].sort();
  }, [data]);

  const productOptions = useMemo(() => {
    const list = data.map((item) => item.product_name).filter(Boolean);
    return [...new Set(list)].sort();
  }, [data]);

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Customer dropdown
      if (selectedCustomer && item.customer_supplier_name !== selectedCustomer) {
        return false;
      }
      // Product dropdown
      if (selectedProduct && item.product_name !== selectedProduct) {
        return false;
      }
      // Search query (matches customer name, flower name, or code)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const party = (item.customer_supplier_name || '').toLowerCase();
        const prod = (item.product_name || '').toLowerCase();
        const code = (item.customer_supplier_code || item.customer_code || '').toLowerCase();
        if (!party.includes(q) && !prod.includes(q) && !code.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [data, selectedCustomer, selectedProduct, searchQuery]);

  // Calculations for totals
  const totalQty = useMemo(() => {
    return filteredData.reduce((acc, row) => acc + (parseFloat(row.sales_quality) || 0), 0);
  }, [filteredData]);

  const totalAmount = useMemo(() => {
    return filteredData.reduce((acc, row) => acc + (parseFloat(row.sales_total) || 0), 0);
  }, [filteredData]);

  const formatRupee = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amt || 0);
  };

  const clearFilters = () => {
    setSelectedCustomer('');
    setSelectedProduct('');
    setSearchQuery('');
  };

  return (
    <div className="erp-ledger-card sales-ledger-card">
      {/* Card Header */}
      <div className="erp-ledger-header">
        <div className="d-flex align-items-center gap-2">
          <div className="ledger-header-icon sales-icon-badge">
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h3 className="ledger-header-title">
                {t('sales_ledger') || 'விற்பனை பதிவேடு'}
              </h3>
              <span className="erp-badge erp-badge-emerald font-numeric">
                {filteredData.length}
              </span>
            </div>
            <span className="ledger-header-subtitle">
              வாடிக்கையாளர் பூ விற்பனை மற்றும் பட்டுவாடா பட்டியல்
            </span>
          </div>
        </div>

        <button
          className="btn-sales-primary ledger-add-btn"
          onClick={onAddSales}
          title="F8 - விற்பனை பதிவு"
          id="btn-add-sales"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>{t('btn_add_sales') || '+ விற்பனை'}</span>
          <span className="shortcut-badge">F8</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="erp-ledger-filter-bar">
        <div className="erp-ledger-search-wrap">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            className="erp-ledger-search-input"
            placeholder={t('search_ledger_placeholder') || 'வாடிக்கையாளர் அல்லது பூ பெயர்...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              type="button"
            >
              ×
            </button>
          )}
        </div>

        <div className="erp-ledger-selects">
          <select
            className="erp-ledger-select"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">{t('all_customers') || 'அனைத்து வாடிக்கையாளர்கள்'}</option>
            {customerOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            className="erp-ledger-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">{t('all_products') || 'அனைத்து பொருட்கள்'}</option>
            {productOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          {(selectedCustomer || selectedProduct || searchQuery) && (
            <button
              className="btn-erp-filter-reset"
              onClick={clearFilters}
              title="Reset Filters"
            >
              <FontAwesomeIcon icon={faRotateLeft} />
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="ledger-skeleton-wrapper">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="ledger-skeleton-row">
              <div className="skeleton-cell w-10"></div>
              <div className="skeleton-cell w-30"></div>
              <div className="skeleton-cell w-20"></div>
              <div className="skeleton-cell w-15"></div>
              <div className="skeleton-cell w-15"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredData.length === 0 && (
        <div className="erp-empty-container py-5">
          <div className="erp-empty-icon text-muted">
            <FontAwesomeIcon icon={faReceipt} size="2x" />
          </div>
          <h4 className="erp-empty-title mt-3">
            {data.length === 0
              ? t('no_sales_records') || 'இன்னும் விற்பனை பதிவுகள் இல்லை'
              : t('no_ledger_search_results') || 'தேடலுக்கு பொருந்தும் பதிவுகள் இல்லை'}
          </h4>
          <p className="erp-empty-desc">
            {data.length === 0
              ? 'புதிய விற்பனை பதிவு செய்ய மேலே உள்ள "+ விற்பனை" பொத்தானை அழுத்தவும் (F8).'
              : 'வடிகட்டி சொற்களை மாற்றி அல்லது மீட்டமைத்து மீண்டும் முயற்சிக்கவும்.'}
          </p>
        </div>
      )}

      {/* Desktop Dense ERP Table */}
      {!loading && filteredData.length > 0 && (
        <>
          <div className="table-responsive d-none d-md-block ledger-table-container">
            <table className="erp-table ledger-table" aria-label="விற்பனை பட்டியல்">
              <thead>
                <tr>
                  <th className="col-sno text-center">{t('s_no') || 'வ.எண்'}</th>
                  <th className="col-party">{t('customer_name') || 'வாடிக்கையாளர்'}</th>
                  <th className="col-flower">{t('product_name') || 'பூ வகை'}</th>
                  <th className="col-rate text-end">{t('unit_rate') || 'விலை'}</th>
                  <th className="col-qty text-end">{t('quantity') || 'அளவு'}</th>
                  <th className="col-unit text-center">{t('unit') || 'அலகு'}</th>
                  <th className="col-total text-end">{t('line_total') || 'மொத்தம்'}</th>
                  <th className="col-actions text-end">{t('action') || 'செயல்கள்'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => {
                  const rate = parseFloat(row.sales_rate || 0);
                  const qty = parseFloat(row.sales_quality || 0);
                  const total = parseFloat(row.sales_total || 0);
                  const partyCode = row.customer_supplier_code || row.customer_code;

                  return (
                    <tr key={row.sales_id || index} className="erp-table-row">
                      <td className="col-sno font-numeric text-center text-muted">
                        {index + 1}
                      </td>
                      <td className="col-party">
                        <div className="party-name-cell">
                          <span className="party-name-tamil font-tamil fw-semibold">
                            {row.customer_supplier_name}
                          </span>
                          {partyCode && (
                            <span className="party-code-pill customer-code-pill font-numeric">
                              {partyCode}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="col-flower">
                        <span className="flower-badge font-tamil">
                          {row.product_name}
                        </span>
                      </td>
                      <td className="col-rate font-numeric text-end text-muted">
                        {rate > 0 ? formatRupee(rate) : '—'}
                      </td>
                      <td className="col-qty font-numeric text-end fw-semibold text-emerald">
                        {qty.toFixed(2)}
                      </td>
                      <td className="col-unit text-center">
                        <span className="ledger-unit-pill">
                          {t(row.sales_unit) || row.sales_unit || 'kg'}
                        </span>
                      </td>
                      <td className="col-total font-numeric text-end fw-bold text-dark">
                        {formatRupee(total)}
                      </td>
                      <td className="col-actions text-end">
                        <div className="ledger-actions-cell justify-content-end">
                          <button
                            className="btn-ledger-action edit"
                            onClick={() => onEditSales(row)}
                            title={t('action_edit') || 'திருத்து'}
                            aria-label={`Edit ${row.product_name}`}
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            className="btn-ledger-action delete"
                            onClick={() => onDeleteSales(row.sales_id)}
                            title={t('action_delete') || 'நீக்கு'}
                            aria-label={`Delete ${row.product_name}`}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile ERP Cards View */}
          <div className="mobile-ledger-cards d-md-none">
            {filteredData.map((row, index) => {
              const rate = parseFloat(row.sales_rate || 0);
              const qty = parseFloat(row.sales_quality || 0);
              const total = parseFloat(row.sales_total || 0);
              const partyCode = row.customer_supplier_code || row.customer_code;

              return (
                <div key={row.sales_id || index} className="mobile-ledger-card">
                  <div className="mobile-card-top">
                    <div className="d-flex align-items-center gap-2">
                      <span className="mobile-card-index font-numeric">#{index + 1}</span>
                      <span className="mobile-party-name font-tamil fw-bold">
                        {row.customer_supplier_name}
                      </span>
                      {partyCode && (
                        <span className="party-code-pill customer-code-pill font-numeric">{partyCode}</span>
                      )}
                    </div>
                    <span className="flower-badge font-tamil">{row.product_name}</span>
                  </div>

                  <div className="mobile-card-metrics">
                    <div className="mobile-metric-item">
                      <span className="metric-label">{t('unit_rate') || 'விலை'}</span>
                      <span className="metric-val font-numeric">{formatRupee(rate)}</span>
                    </div>
                    <div className="mobile-metric-item">
                      <span className="metric-label">{t('quantity') || 'அளவு'}</span>
                      <span className="metric-val font-numeric text-emerald">
                        {qty.toFixed(2)} {t(row.sales_unit) || row.sales_unit || 'kg'}
                      </span>
                    </div>
                    <div className="mobile-metric-item">
                      <span className="metric-label">{t('line_total') || 'மொத்தம்'}</span>
                      <span className="metric-val font-numeric fw-bold text-dark">
                        {formatRupee(total)}
                      </span>
                    </div>
                  </div>

                  <div className="mobile-card-actions">
                    <button
                      className="btn-erp-secondary w-50"
                      onClick={() => onEditSales(row)}
                    >
                      <FontAwesomeIcon icon={faPen} className="me-1" />
                      <span>{t('action_edit') || 'திருத்து'}</span>
                    </button>
                    <button
                      className="btn-ledger-action-delete-full w-50"
                      onClick={() => onDeleteSales(row.sales_id)}
                    >
                      <FontAwesomeIcon icon={faTrash} className="me-1" />
                      <span>{t('action_delete') || 'நீக்கு'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Summary Footer */}
          <div className="erp-ledger-summary-footer">
            <div className="summary-col">
              <span className="summary-label">மொத்த உருப்படிகள்:</span>
              <strong className="summary-val font-numeric">{filteredData.length}</strong>
            </div>
            <div className="summary-col">
              <span className="summary-label">மொத்த அளவு:</span>
              <strong className="summary-val font-numeric text-emerald">
                {totalQty.toFixed(2)} kg/அலகு
              </strong>
            </div>
            <div className="summary-col text-end">
              <span className="summary-label">மொத்த விற்பனை:</span>
              <strong className="summary-val font-numeric total-amount-val text-emerald">
                {formatRupee(totalAmount)}
              </strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesLedgerCard;
