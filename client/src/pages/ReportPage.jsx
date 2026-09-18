import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import ERPLayout from '../components/layout/ERPLayout';
import ReportControls from '../components/reports/ReportControls';
import ReportFinancialKPIs from '../components/reports/ReportFinancialKPIs';
import ReportLedgerTable from '../components/reports/ReportLedgerTable';
import { getReportSummary, getTamilMonths, updateSupplierOD } from '../api/reportAPI.jsx';
import { fetchTamilDate } from '../api/entryAPI';
import { getWhatsAppStatus, sendReportWhatsApp } from '../api/whatsappAPI';
import './ReportPage.css';

const ReportPage = () => {
  const { t } = useTranslation();

  // URL query params or realistic initial defaults
  const queryParams = new URLSearchParams(window.location.search);
  const initialPeriod = queryParams.get('period') || 'date';
  const initialType = queryParams.get('type') || 'purchase';
  const initialDate = queryParams.get('date') || '2024-10-30';
  const initialMonth = queryParams.get('month') || 'Aippasi';
  const initialYear = parseInt(queryParams.get('year'), 10) || 2024;

  const [period, setPeriod] = useState(initialPeriod);
  const [reportType, setReportType] = useState(initialType);
  const [tamilMonths, setTamilMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [tamilDateInfo, setTamilDateInfo] = useState('');

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUpdatingOD, setIsUpdatingOD] = useState(false);
  const [loadingWa, setLoadingWa] = useState(false);

  // Load Tamil Months list on mount
  useEffect(() => {
    const fetchMonths = async () => {
      try {
        const data = await getTamilMonths();
        setTamilMonths(data || []);
      } catch (e) {
        console.error("Failed to load tamil months", e);
      }
    };
    fetchMonths();
  }, []);

  // Fetch Tamil date name dynamically whenever selectedDate changes
  useEffect(() => {
    if (period === 'date' && selectedDate) {
      const loadTamilDate = async () => {
        try {
          const res = await fetchTamilDate(selectedDate);
          if (res) {
            const m = res.tamil_month_name_ta || res.tamil_month || '';
            const d = res.tamil_date || '';
            if (m && d) {
              setTamilDateInfo(`${m} ${d}`);
            } else {
              setTamilDateInfo('');
            }
          }
        } catch (err) {
          console.error("Error fetching tamil date:", err);
          setTamilDateInfo('');
        }
      };
      loadTamilDate();
    } else {
      setTamilDateInfo('');
    }
  }, [period, selectedDate]);

  // Load Report Table Data
  const loadReportTable = useCallback(async () => {
    if (!period || !reportType) return;
    if (period === 'month' && (!selectedMonth || !selectedYear)) return;
    if (period === 'date' && !selectedDate) return;

    const params = {
      period_type: period,
      report_type: reportType,
      month: selectedMonth,
      year: selectedYear,
      date: selectedDate
    };

    setLoading(true);
    try {
      const data = await getReportSummary(params);
      setTableData(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load report summary", e);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  }, [period, reportType, selectedMonth, selectedYear, selectedDate]);

  useEffect(() => {
    loadReportTable();
  }, [loadReportTable]);

  // Update Monthly OD maintenance action
  const handleUpdateOD = async () => {
    if (!selectedMonth || !selectedYear) return;

    const confirmMsg = t('reports_update_od_confirm') || 'மாதாந்திர நிலுவையை புதுப்பிக்க உறுதிப்படுத்துகிறீர்களா?';
    if (window.confirm(confirmMsg)) {
      setIsUpdatingOD(true);
      try {
        await updateSupplierOD({ month: selectedMonth, year: selectedYear });
        alert(t('reports_update_od_success') || t('Success') || 'மாதாந்திர நிலுவை வெற்றிகரமாக புதுப்பிக்கப்பட்டது');
        loadReportTable();
      } catch (e) {
        console.error("Error updating monthly OD:", e);
        alert(t('messages.failedToSaveEntry') || 'நிலுவை புதுப்பித்தல் தோல்வியடைந்தது');
      } finally {
        setIsUpdatingOD(false);
      }
    }
  };

  // Open /print-report view in a new tab
  const handleDownload = (customerCode = '') => {
    let url = `/print-report?period=${period}&type=${reportType}`;
    if (period === 'month') {
      url += `&month=${selectedMonth}&year=${selectedYear}`;
    } else {
      url += `&date=${selectedDate}`;
    }

    if (customerCode) {
      url += `&code=${encodeURIComponent(customerCode)}`;
    }

    window.open(url, '_blank');
  };

  // Send single WhatsApp report
  const handleSendWhatsAppSingle = async (row) => {
    try {
      setLoadingWa(true);
      const st = await getWhatsAppStatus();
      if (st?.instance?.state !== 'open') {
        alert(t('reports_whatsapp_not_connected') || 'Please connect WhatsApp in Settings');
        setLoadingWa(false);
        return;
      }

      const payload = {
        period_type: period,
        report_type: reportType,
        code: row.customer_supplier_code || row.code,
        number: row.customer_supplier_contact_no || row.contact
      };

      if (period === 'date') {
        payload.date = selectedDate;
      } else if (period === 'month') {
        payload.month = selectedMonth;
        payload.year = selectedYear;
      }

      await sendReportWhatsApp(payload);
      alert(t('reports_whatsapp_success') || 'WhatsApp report sent successfully');
    } catch (error) {
      console.error('Error sending whatsapp:', error);
      alert(t('reports_whatsapp_failed') || 'Failed to send WhatsApp report. Please check your connection in Settings.');
    } finally {
      setLoadingWa(false);
    }
  };

  return (
    <ERPLayout
      pageTitle={t('reports_page_title') || t('reports.title') || 'அறிக்கைகள்'}
      breadcrumbCurrent={t('reports.title') || 'அறிக்கைகள்'}
    >
      <div className="erp-reports-page">
        {/* Page Header */}
        <div className="erp-reports-header">
          <h1 className="reports-header-title">
            {t('reports_page_title') || t('reports.title') || 'அறிக்கைகள் மேலாண்மை'}
          </h1>
          <div className="reports-header-subtitle">
            {t('reports_page_subtitle') || 'கொள்முதல் மற்றும் விற்பனை வணிக நிதி அறிக்கைகள்'}
          </div>
        </div>

        {/* 1. Report Controls Bar */}
        <ReportControls
          period={period}
          setPeriod={(p) => {
            setPeriod(p);
            setTableData([]);
          }}
          reportType={reportType}
          setReportType={(rt) => {
            setReportType(rt);
            setTableData([]);
          }}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          tamilMonths={tamilMonths}
          tamilDateInfo={tamilDateInfo}
          onDownloadAll={() => handleDownload()}
          onUpdateOD={handleUpdateOD}
          isUpdatingOD={isUpdatingOD}
          hasData={tableData.length > 0}
        />

        {/* 2. Financial Summary KPIs */}
        <ReportFinancialKPIs
          tableData={tableData}
          reportType={reportType}
          period={period}
        />

        {/* 3. Accounting Ledger Table */}
        <ReportLedgerTable
          tableData={tableData}
          reportType={reportType}
          period={period}
          loading={loading}
          loadingWa={loadingWa}
          onDownloadSingle={handleDownload}
          onSendWhatsApp={handleSendWhatsAppSingle}
        />

        {/* Processing Overlays */}
        {isUpdatingOD && (
          <div className="erp-processing-overlay" role="dialog" aria-modal="true">
            <div className="processing-card">
              <div className="processing-spinner-box amber">
                <FontAwesomeIcon icon={faSync} spin />
              </div>
              <h3 className="processing-title">
                {t('reports_updating_od') || 'நிலுவை புதுப்பிக்கப்படுகிறது...'}
              </h3>
              <p className="processing-subtitle">
                {t('reports_calculating_od') || 'மாதாந்திர நிலுவை கணக்கிடப்படுகிறது'}
              </p>
            </div>
          </div>
        )}

        {loadingWa && (
          <div className="erp-processing-overlay" role="dialog" aria-modal="true">
            <div className="processing-card">
              <div className="processing-spinner-box green">
                <FontAwesomeIcon icon={faWhatsapp} />
              </div>
              <h3 className="processing-title">
                {t('WhatsApp') || 'வாட்ஸ்அப்'}
              </h3>
              <p className="processing-subtitle">
                {t('reports_whatsapp_sending') || 'வாட்ஸ்அப் அறிக்கை அனுப்பப்படுகிறது...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </ERPLayout>
  );
};

export default ReportPage;