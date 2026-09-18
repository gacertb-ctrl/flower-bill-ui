import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faCalendarDay,
  faCloudDownload,
  faSync,
  faChevronLeft,
  faChevronRight,
  faBoxesStacked,
  faCoins,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './ReportControls.css';

const ReportControls = ({
  period = 'date',
  setPeriod,
  reportType = 'purchase',
  setReportType,
  selectedDate,
  setSelectedDate,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  tamilMonths = [],
  tamilDateInfo = '',
  onDownloadAll,
  onUpdateOD,
  isUpdatingOD = false,
  hasData = false
}) => {
  const { t } = useTranslation();

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  return (
    <div className="erp-report-controls-card">
      {/* Top Row: Period Segmented Switcher + Report Type Pills */}
      <div className="report-controls-top-row">
        <div className="report-mode-group">
          {/* Period Segmented Switcher */}
          <div className="erp-period-segmented-switch">
            <button
              type="button"
              className={`period-segment-btn ${period === 'date' ? 'active' : ''}`}
              onClick={() => setPeriod('date')}
              id="btn-period-sittai"
            >
              <FontAwesomeIcon icon={faCalendarDay} />
              <span>{t('reports_sittai_label') || t('reports.sittai') || 'சிட்டை (தேதி)'}</span>
            </button>
            <button
              type="button"
              className={`period-segment-btn ${period === 'month' ? 'active' : ''}`}
              onClick={() => setPeriod('month')}
              id="btn-period-patta"
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>{t('reports_patta_label') || t('reports.patta') || 'பட்டா (மாதம்)'}</span>
            </button>
          </div>

          {/* Report Type Pills */}
          <div className="erp-type-pill-group">
            <span className="type-pill-label">{t('reports.type') || 'வகை'}:</span>
            <button
              type="button"
              className={`type-pill-btn purchase ${reportType === 'purchase' ? 'active purchase' : ''}`}
              onClick={() => setReportType('purchase')}
              id="btn-type-purchase"
            >
              <FontAwesomeIcon icon={faBoxesStacked} />
              <span>{t('reports_purchase_label') || t('purchase') || 'கொள்முதல்'}</span>
            </button>
            <button
              type="button"
              className={`type-pill-btn sales ${reportType === 'sales' ? 'active sales' : ''}`}
              onClick={() => setReportType('sales')}
              id="btn-type-sales"
            >
              <FontAwesomeIcon icon={faCoins} />
              <span>{t('reports_sales_label') || t('sales') || 'விற்பனை'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="report-actions-group">
          {hasData && (
            <button
              type="button"
              className="btn-download-all"
              onClick={onDownloadAll}
              id="btn-download-all-reports"
              title={t('reports.downloadAll') || 'அனைத்தையும் பதிவிறக்கு'}
            >
              <FontAwesomeIcon icon={faCloudDownload} />
              <span>{t('reports_download_all_btn') || t('reports.downloadAll') || 'அனைத்தையும் பதிவிறக்கு'}</span>
            </button>
          )}

          {period === 'month' && reportType === 'purchase' && hasData && (
            <button
              type="button"
              className="btn-update-od"
              onClick={onUpdateOD}
              disabled={isUpdatingOD}
              id="btn-update-monthly-od"
              title={t('reports_update_od_btn') || 'மாதாந்திர நிலுவை புதுப்பித்தல்'}
            >
              {isUpdatingOD ? (
                <>
                  <FontAwesomeIcon icon={faSync} spin />
                  <span>{t('reports_updating_od') || 'நிலுவை புதுப்பிக்கப்படுகிறது...'}</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>{t('reports_update_od_btn') || 'Update Monthly OD'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Date Picker / Month Selector */}
      <div className="report-controls-bottom-row">
        {period === 'date' ? (
          <div className="report-date-filter-wrap">
            <button
              type="button"
              className="date-step-btn"
              onClick={handlePrevDay}
              title={t('prevDay') || 'முந்தைய நாள்'}
              aria-label="Previous day"
              id="btn-report-prev-day"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <input
              type="date"
              className="report-date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              id="input-report-date"
              aria-label="Report Date"
            />

            <button
              type="button"
              className="date-step-btn"
              onClick={handleNextDay}
              title={t('nextDay') || 'அடுத்த நாள்'}
              aria-label="Next day"
              id="btn-report-next-day"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>

            <button
              type="button"
              className="report-today-pill"
              onClick={handleToday}
              id="btn-report-today"
            >
              {t('today') || 'இன்று'}
            </button>

            {tamilDateInfo && (
              <div className="report-tamil-badge" title="தமிழ் தேதி">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>{tamilDateInfo}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="report-date-filter-wrap">
            {/* Tamil Month Selector */}
            <select
              className="report-select-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              id="select-report-tamil-month"
            >
              <option value="">{t('reports.selectMonth') || 'தமிழ் மாதம் தேர்ந்தெடுக்கவும்'}</option>
              {tamilMonths.map((m, i) => (
                <option key={i} value={m.tamil_month_name_en}>
                  {m.tamil_month_name_ta} ({m.tamil_month_name_en})
                </option>
              ))}
            </select>

            {/* Year Input */}
            <input
              type="number"
              className="report-year-input"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              min="2000"
              max="2100"
              id="input-report-year"
              aria-label="Report Year"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportControls;
