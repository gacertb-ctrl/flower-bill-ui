import React, { useState, useEffect, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faSearch, faCalendarAlt, faHistory, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { getLastSupplierTransactions } from '../../api/supplierAPI';
import { getLastCustomerTransactions } from '../../api/customerAPI';
import FloatingModal from '../ui/FloatingModal';
import GlassButton from '../ui/GlassButton';

const LastTransactionModal = ({ show, onHide, transactions: initialTransactions, reportType }) => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);

  const getCode = () => initialTransactions.length > 0 ? initialTransactions[0].customer_supplier_code : '';

  useEffect(() => {
    setData(initialTransactions);
  }, [initialTransactions]);

  const handleFilter = async () => {
    const code = getCode();
    if (!code) return;
    setLoading(true);
    try {
      let response;
      if (reportType === 'supplier') {
        response = await getLastSupplierTransactions(code, fromDate, toDate);
      } else {
        response = await getLastCustomerTransactions({ cus_sup_code: code, fromDate, toDate });
      }
      setData(response.data);
    } catch (error) {
      console.error("Filter failed", error);
    } finally {
      setLoading(false);
    }
  };

  // Custom styles for DataTable matching tailwind antigravity theme
  const customStyles = {
    header: {
        style: {
            backgroundColor: 'transparent',
            color: 'inherit',
        },
    },
    headRow: {
        style: {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderBottomColor: 'rgba(122, 184, 122, 0.3)',
            borderTopColor: 'transparent',
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
        },
    },
    headCells: {
        style: {
            color: 'inherit',
            fontSize: '0.875rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
        },
    },
    rows: {
        style: {
            backgroundColor: 'transparent',
            color: 'inherit',
            borderBottomColor: 'rgba(122, 184, 122, 0.2)',
            '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transition: 'background-color 0.2s ease',
            },
        },
    },
    cells: {
        style: {
            color: 'inherit',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
        },
    },
    pagination: {
        style: {
            backgroundColor: 'transparent',
            borderTopColor: 'rgba(122, 184, 122, 0.2)',
            color: 'inherit',
        },
    },
  };

  const columns = useMemo(() => [
    {
      name: t('date'),
      selector: row => row.date ? row.date.split('T')[0] : '',
      sortable: true,
      grow: 1,
    },
    {
      name: t('type'),
      sortable: true,
      grow: 1,
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            row.type === 'purchase' || row.type === 'sales'
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          }`}
        >
          <FontAwesomeIcon icon={faExchangeAlt} className="mr-1.5" />
          {t(row.type).toUpperCase()}
        </span>
      ),
    },
    {
      name: t('total'),
      selector: row => parseFloat(row.total).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      sortable: true,
      right: true,
      grow: 1,
      style: { fontWeight: '600' }
    },
    {
      name: t('action'),
      center: true,
      cell: (row) => (
        <button
          className="p-2 text-accent-blue hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-full transition-colors w-8 h-8 flex items-center justify-center shadow-sm"
          onClick={() => window.open(`/print-report?period=date&type=${row.type}&code=${row.customer_supplier_code}&date=${row.date.split('T')[0]}`, '_blank')}
        >
          <FontAwesomeIcon icon={faDownload} />
        </button>
      ),
      button: true,
    },
  ], [t]);

  return (
    <FloatingModal 
        show={show} 
        onHide={onHide} 
        title={
            <div className="flex items-center">
                <FontAwesomeIcon icon={faHistory} className="mr-2 text-nature-600 dark:text-nature-300" />
                {t('transaction history')}
            </div>
        } 
        size="xl"
    >
        {/* Filter Card */}
        <div className="bg-white/60 dark:bg-nature-900/60 p-4 rounded-xl shadow-sm mb-6 border border-nature-200 dark:border-nature-700/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label className="block text-xs font-bold text-nature-500 dark:text-nature-400 mb-2 uppercase tracking-wider">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" /> {t('from date')}
                    </label>
                    <input
                        type="date"
                        className="w-full px-3 py-2 bg-white/80 dark:bg-nature-800/80 border border-nature-200 dark:border-nature-700/50 rounded-lg focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 text-sm"
                        value={fromDate}
                        onChange={e => setFromDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-nature-500 dark:text-nature-400 mb-2 uppercase tracking-wider">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" /> {t('to date')}
                    </label>
                    <input
                        type="date"
                        className="w-full px-3 py-2 bg-white/80 dark:bg-nature-800/80 border border-nature-200 dark:border-nature-700/50 rounded-lg focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 text-sm"
                        value={toDate}
                        onChange={e => setToDate(e.target.value)}
                    />
                </div>
                <div>
                    <GlassButton
                        variant="primary"
                        className="w-full justify-center py-2"
                        onClick={handleFilter}
                        disabled={loading}
                    >
                        {loading ? '...' : <><FontAwesomeIcon icon={faSearch} className="mr-2" /> {t('filter')}</>}
                    </GlassButton>
                </div>
            </div>
        </div>

        {/* Table Container */}
        <div className="bg-white/40 dark:bg-nature-900/40 rounded-xl overflow-hidden border border-nature-200 dark:border-nature-700/50">
            <div className="react-data-table-container">
                <DataTable
                    columns={columns}
                    data={data}
                    progressPending={loading}
                    pagination
                    paginationPerPage={5}
                    paginationRowsPerPageOptions={[5, 10, 15]}
                    highlightOnHover
                    customStyles={customStyles}
                    noDataComponent={
                        <div className="p-8 text-center text-nature-400 dark:text-nature-500">
                            <FontAwesomeIcon icon={faHistory} size="3x" className="mb-4 opacity-30" />
                            <p className="text-sm font-medium">{t('no transactions found')}</p>
                        </div>
                    }
                />
            </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-nature-200 dark:border-nature-700/50">
            <GlassButton variant="secondary" onClick={onHide}>
                {t('close')}
            </GlassButton>
        </div>
    </FloatingModal>
  );
};

export default LastTransactionModal;