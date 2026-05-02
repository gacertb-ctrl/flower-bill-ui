import React from 'react';
import { useTranslation } from 'react-i18next';

const ReportPeriodSelector = ({
  reportPeriod,
  reportType,
  setReportType,
  month,
  setMonth,
  year,
  setYear,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  tamilMonths
}) => {
  const { t } = useTranslation();

  if (!reportPeriod) return null;

  return (
    <>
      <div className="col-span-1">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-nature-700 dark:text-nature-300">{t('reports.type')}</label>
          <select
            className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="purchase">{t('purchase')}</option>
            <option value="sales">{t('sales')}</option>
          </select>
        </div>
      </div>

      {reportPeriod === 'month' ? (
        <>
          <div className="col-span-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-nature-700 dark:text-nature-300">{t('reports.month')}</label>
              <select
                className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">{t('reports.selectMonth')}</option>
                {tamilMonths && tamilMonths.months.map((m) => (
                  <option key={m.name_en} value={m.name_en}>
                    {m.name_ta}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-span-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-nature-700 dark:text-nature-300">{t('reports.year')}</label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="2000"
                max="2100"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="col-span-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-nature-700 dark:text-nature-300">{t('reports.startDate')}</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div className="col-span-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-nature-700 dark:text-nature-300">{t('reports.endDate')}</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ReportPeriodSelector;