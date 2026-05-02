import React from 'react';
import { useTranslation } from 'react-i18next';

const ReportTable = ({ reportData, reportType, reportPeriod, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nature-600 dark:border-nature-400"></div>
        <span className="sr-only">{t('loading')}</span>
      </div>
    );
  }

  if (!reportData || reportData.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-4 rounded-xl text-center my-6 border border-blue-100 dark:border-blue-800/50">
        {t('reports.noData')}
      </div>
    );
  }

  // Calculate totals
  const totalDebit = reportData.reduce((sum, item) => sum + parseFloat(item.debit_amount || 0), 0);
  const totalCredit = reportData.reduce((sum, item) => sum + parseFloat(item.credit_amount || 0), 0);

  return (
    <div className="overflow-x-auto bg-white/60 dark:bg-nature-900/60 rounded-xl border border-nature-200 dark:border-nature-700/50 shadow-sm mt-4">
      <table className="min-w-full divide-y divide-nature-200 dark:divide-nature-700/50">
        <thead className="bg-nature-100/80 dark:bg-nature-800/80">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-nature-600 dark:text-nature-300 uppercase tracking-wider">
              {t('S.No')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-nature-600 dark:text-nature-300 uppercase tracking-wider">
              {reportType === 'purchase'
                ? t('supplier')
                : t('customer')}
              {' '}{t('name')}
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-nature-600 dark:text-nature-300 uppercase tracking-wider">
              {reportPeriod === 'month' && reportType === 'purchase'
                ? `${t('reports.totalOutstanding')}/${t('reports.totalDebit')}`
                : reportPeriod === 'month' && reportType === 'sales'
                  ? `${t('reports.totalDebit')}/${t('reports.totalOutstanding')}`
                  : reportPeriod === 'date' && reportType === 'purchase'
                    ? `${t('reports.todayCredit')}/${t('reports.todayDebit')}`
                    : `${t('reports.todayDebit')}/${t('reports.todayCredit')}`}
            </th>
          </tr>
        </thead>
        <tbody className="bg-transparent divide-y divide-nature-200/50 dark:divide-nature-700/30">
          {reportData.map((row, index) => (
            <tr key={index} className="hover:bg-white/40 dark:hover:bg-nature-800/40 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-nature-600 dark:text-nature-300">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-nature-800 dark:text-nature-100">
                {row.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-nature-800 dark:text-nature-100">
                {reportType === 'purchase'
                  ? `${parseFloat(row.credit_amount || 0).toFixed(2)} / ${parseFloat(row.debit_amount || 0).toFixed(2)}`
                  : `${parseFloat(row.debit_amount || 0).toFixed(2)} / ${parseFloat(row.credit_amount || 0).toFixed(2)}`}
              </td>
            </tr>
          ))}
          <tr className="bg-nature-50 dark:bg-nature-800/60 border-t-2 border-nature-200 dark:border-nature-700">
            <td colSpan="2" className="px-6 py-4 whitespace-nowrap text-sm font-bold text-nature-800 dark:text-nature-100 uppercase">
              {t('reports.total')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-nature-800 dark:text-nature-100">
              {reportType === 'purchase'
                ? `${totalCredit.toFixed(2)} / ${totalDebit.toFixed(2)}`
                : `${totalDebit.toFixed(2)} / ${totalCredit.toFixed(2)}`}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;