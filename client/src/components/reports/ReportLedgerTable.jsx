import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faTimes,
  faCloudDownload,
  faFileInvoice
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import './ReportLedgerTable.css';

const ReportLedgerTable = ({
  tableData = [],
  reportType = 'purchase',
  period = 'date',
  loading = false,
  loadingWa = false,
  onDownloadSingle,
  onSendWhatsApp
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Filter rows with active financial balance
  const activeRows = useMemo(() => {
    return tableData.filter(
      r => parseFloat(r.credit_amount || 0) > 0 || parseFloat(r.debit_amount || 0) > 0
    );
  }, [tableData]);

  // 2. Real-time text search filter
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return activeRows;
    const term = searchTerm.toLowerCase().trim();
    return activeRows.filter(r => {
      const name = (r.customer_supplier_name || r.name || '').toLowerCase();
      const code = (r.customer_supplier_code || r.code || '').toLowerCase();
      return name.includes(term) || code.includes(term);
    });
  }, [activeRows, searchTerm]);

  // 3. Totals
  const totalCredit = useMemo(() => {
    return filteredRows.reduce((sum, r) => sum + parseFloat(r.credit_amount || 0), 0);
  }, [filteredRows]);

  const totalDebit = useMemo(() => {
    return filteredRows.reduce((sum, r) => sum + parseFloat(r.debit_amount || 0), 0);
  }, [filteredRows]);

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isPurchase = reportType === 'purchase';
  const partyHeader = isPurchase ? (t('supplier.name') || 'விநியோகஸ்தர் பெயர்') : (t('customer.name') || 'வாடிக்கையாளர் பெயர்');
  const valuesHeader = isPurchase
    ? (t('reports.creditDebit') || 'வரவு / பற்று')
    : (t('reports.debitCredit') || 'பற்று / வரவு');

  return (
    <div className="erp-report-table-card">
      {/* Table Toolbar */}
      <div className="report-table-toolbar">
        <div className="report-search-wrap">
          <FontAwesomeIcon icon={faSearch} className="report-search-icon" />
          <input
            type="text"
            className="report-search-input"
            placeholder={t('reports_search_placeholder') || 'பெயர் அல்லது குறியீடு மூலம் தேடுக...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="input-report-search"
          />
          {searchTerm && (
            <button
              type="button"
              className="report-clear-search"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>

        <div className="report-table-meta">
          <span>{t('reports_active_records') || 'செயலில் உள்ள பதிவுகள்'}:</span>
          <span className="report-count-badge">
            {filteredRows.length} / {activeRows.length}
          </span>
        </div>
      </div>

      {/* Desktop Dense Table */}
      <div className="report-table-container d-none d-md-block">
        <table className="report-table">
          <thead>
            <tr>
              <th className="col-sno-report">{t('S.No') || 'வ.எண்'}</th>
              <th>{partyHeader}</th>
              <th className="text-end">{valuesHeader}</th>
              <th className="text-end" style={{ width: '100px' }}>{t('action') || 'செயல்கள்'}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`skel-${idx}`}>
                  <td className="text-center"><div className="report-skeleton-line" style={{ width: '20px', margin: '0 auto' }}></div></td>
                  <td><div className="report-skeleton-line" style={{ width: '160px' }}></div></td>
                  <td><div className="report-skeleton-line" style={{ width: '120px', marginLeft: 'auto' }}></div></td>
                  <td><div className="report-skeleton-line" style={{ width: '60px', marginLeft: 'auto' }}></div></td>
                </tr>
              ))
            ) : filteredRows.length > 0 ? (
              filteredRows.map((row, index) => {
                const name = row.customer_supplier_name || row.name || '';
                const code = row.customer_supplier_code || row.code || '';
                const creditAmt = parseFloat(row.credit_amount || 0);
                const debitAmt = parseFloat(row.debit_amount || 0);

                return (
                  <tr key={row.customer_supplier_id || index} className="report-row">
                    <td className="col-sno-report">{index + 1}</td>
                    <td>
                      <div className="party-name-box">
                        <span className="party-name-bold">{name}</span>
                        {code && <span className="party-code-tag">{code}</span>}
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="report-financial-values">
                        {isPurchase ? (
                          <>
                            <span className="amount-credit">{formatCurrency(creditAmt)}</span>
                            <span className="amount-slash">/</span>
                            <span className="amount-debit">{formatCurrency(debitAmt)}</span>
                          </>
                        ) : (
                          <>
                            <span className="amount-debit">{formatCurrency(debitAmt)}</span>
                            <span className="amount-slash">/</span>
                            <span className="amount-credit">{formatCurrency(creditAmt)}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="report-actions-cell">
                        <button
                          type="button"
                          className="btn-report-action print"
                          onClick={() => onDownloadSingle(code)}
                          title={t('reports_download_tooltip') || 'அறிக்கை பதிவிறக்கம்'}
                          aria-label={`Print ${name}`}
                        >
                          <FontAwesomeIcon icon={faCloudDownload} />
                        </button>
                        <button
                          type="button"
                          className="btn-report-action whatsapp"
                          onClick={() => onSendWhatsApp(row)}
                          title={t('reports_whatsapp_tooltip') || 'வாட்ஸ்அப் மூலம் அனுப்புக'}
                          disabled={loadingWa}
                          aria-label={`WhatsApp ${name}`}
                        >
                          <FontAwesomeIcon icon={faWhatsapp} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4">
                  <div className="erp-report-empty">
                    <div className="report-empty-icon">
                      <FontAwesomeIcon icon={faFileInvoice} />
                    </div>
                    <div className="report-empty-title">
                      {searchTerm
                        ? (t('reports_no_records_search') || 'தேடல் நிபந்தனைக்கு ஏற்ப பதிவுகள் இல்லை')
                        : (t('reports_no_records_period') || 'தேர்ந்தெடுத்த காலத்திற்கு பதிவுகள் இல்லை')}
                    </div>
                    <div className="report-empty-desc">
                      {searchTerm
                        ? t('tryDifferentSearch') || 'வேறு பெயரில் தேட முயற்சிக்கவும்'
                        : t('changePeriodMsg') || 'வேறு தேதி அல்லது மாதத்தை தேர்ந்தெடுக்கவும்'}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
          {filteredRows.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan="2" className="text-end">{t('reports.total') || 'மொத்தம்'}:</td>
                <td className="text-end">
                  {isPurchase ? (
                    <>
                      <span className="amount-credit">{formatCurrency(totalCredit)}</span>
                      <span className="amount-slash">/</span>
                      <span className="amount-debit">{formatCurrency(totalDebit)}</span>
                    </>
                  ) : (
                    <>
                      <span className="amount-debit">{formatCurrency(totalDebit)}</span>
                      <span className="amount-slash">/</span>
                      <span className="amount-credit">{formatCurrency(totalCredit)}</span>
                    </>
                  )}
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Mobile Card List View (d-md-none) */}
      <div className="report-mobile-list d-md-none">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={`mob-skel-${idx}`} className="report-mobile-card p-3">
              <div className="report-skeleton-line mb-2" style={{ width: '65%' }}></div>
              <div className="report-skeleton-line" style={{ width: '45%' }}></div>
            </div>
          ))
        ) : filteredRows.length > 0 ? (
          filteredRows.map((row, index) => {
            const name = row.customer_supplier_name || row.name || '';
            const code = row.customer_supplier_code || row.code || '';
            const creditAmt = parseFloat(row.credit_amount || 0);
            const debitAmt = parseFloat(row.debit_amount || 0);

            return (
              <div key={row.customer_supplier_id || index} className="report-mobile-card">
                <div className="mobile-card-top-row">
                  <div className="d-flex align-items-center gap-2">
                    <span className="mobile-sno-chip">{index + 1}</span>
                    <div>
                      <div className="party-name-bold">{name}</div>
                      {code && <span className="party-code-tag">{code}</span>}
                    </div>
                  </div>
                  <div className="report-actions-cell">
                    <button
                      type="button"
                      className="btn-report-action print"
                      onClick={() => onDownloadSingle(code)}
                      aria-label="Download"
                    >
                      <FontAwesomeIcon icon={faCloudDownload} />
                    </button>
                    <button
                      type="button"
                      className="btn-report-action whatsapp"
                      onClick={() => onSendWhatsApp(row)}
                      disabled={loadingWa}
                      aria-label="WhatsApp"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} />
                    </button>
                  </div>
                </div>

                <div className="mobile-card-amounts-row">
                  <span className="text-muted small">{valuesHeader}:</span>
                  <div className="report-financial-values">
                    {isPurchase ? (
                      <>
                        <span className="amount-credit">{formatCurrency(creditAmt)}</span>
                        <span className="amount-slash">/</span>
                        <span className="amount-debit">{formatCurrency(debitAmt)}</span>
                      </>
                    ) : (
                      <>
                        <span className="amount-debit">{formatCurrency(debitAmt)}</span>
                        <span className="amount-slash">/</span>
                        <span className="amount-credit">{formatCurrency(creditAmt)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="erp-report-empty p-4">
            <div className="report-empty-icon">
              <FontAwesomeIcon icon={faFileInvoice} />
            </div>
            <div className="report-empty-title">
              {searchTerm
                ? (t('reports_no_records_search') || 'தேடல் நிபந்தனைக்கு ஏற்ப பதிவுகள் இல்லை')
                : (t('reports_no_records_period') || 'தேர்ந்தெடுத்த காலத்திற்கு பதிவுகள் இல்லை')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportLedgerTable;
