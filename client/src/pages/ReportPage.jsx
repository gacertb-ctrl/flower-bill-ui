import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getReportSummary, getTamilMonths, updateSupplierOD } from '../api/reportAPI.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudDownload, faSync } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { sendWhatsAppReport } from '../api/whatsappAPI';
import '../styles/bootstrap.min.css';

const ReportPage = () => {
    const { t } = useTranslation();
    const [period, setPeriod] = useState('');
    const [reportType, setReportType] = useState('');
    const [tamilMonths, setTamilMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [tableData, setTableData] = useState([]);
    const [isUpdatingOD, setIsUpdatingOD] = useState(false);
    const [isSendingWS, setIsSendingWS] = useState(null); // Will store row index or 'all'

    useEffect(() => {
        const fetchMonths = async () => {
            try {
                const data = await getTamilMonths();
                setTamilMonths(data);
            } catch (e) {
                console.error("Failed to load months", e);
            }
        };
        fetchMonths();
    }, []);

    const handleUpdateOD = async () => {
        // 1. Validation first
        if (!selectedMonth || !selectedYear) return;

        if (window.confirm(t('Are you sure?'))) {
            // 2. SET LOADING TO TRUE BEFORE TRY BLOCK
            setIsUpdatingOD(true);

            try {
                await updateSupplierOD({ month: selectedMonth, year: selectedYear });
                alert(t('Success'));
            } catch (e) {
                console.error(e);
            } finally {
                // 3. SET LOADING TO FALSE ONLY AFTER FINISHED
                setIsUpdatingOD(false);
            }
        }
    };

    const loadReportTable = async () => {
        if (!period || !reportType) return;

        const params = {
            period_type: period,
            report_type: reportType,
            month: selectedMonth,
            year: selectedYear,
            date: selectedDate
        };

        try {
            const data = await getReportSummary(params);
            setTableData(data);
        } catch (e) {
            console.error("Failed to load table", e);
        }
    };

    useEffect(() => {
        if (period === 'month' && (!selectedMonth || !selectedYear)) return;
        if (period === 'date' && !selectedDate) return;
        loadReportTable();
    }, [period, reportType, selectedMonth, selectedYear, selectedDate]);

    const handleDownload = (customerCode = '') => {
        let url = `/print-report?period=${period}&type=${reportType}`;
        if (period === 'month') url += `&month=${selectedMonth}&year=${selectedYear}`;
        else url += `&date=${selectedDate}`;

        if (customerCode) url += `&code=${customerCode}`;

        // Open in new tab
        window.open(url, '_blank');
    };

    const handleSendWhatsApp = async (row, index) => {
        const contactNo = row.customer_supplier_contact_no;
        if (!contactNo) {
            alert(t('No contact number found for this customer'));
            return;
        }

        setIsSendingWS(index);
        try {
            const params = {
                period_type: period,
                report_type: reportType,
                date: selectedDate,
                month: selectedMonth,
                year: selectedYear,
                code: row.customer_supplier_code,
                number: contactNo
            };
            await sendWhatsAppReport(params);
            alert(t('Report sent successfully!'));
        } catch (error) {
            console.error('WhatsApp send error', error);
            alert(t('Failed to send WhatsApp. Please check if WhatsApp is connected in Settings.'));
        } finally {
            setIsSendingWS(null);
        }
    };

    return (
        <div className="container-fluid py-4" style={{ minHeight: '100vh' }}>
            <div className="saas-card mb-4 p-3 border-0">
                <div>
                    <h2 className="fw-bold text-primary mb-0">{t('reports.title') || 'Reports'}</h2>
                    <p className="text-muted small mb-0">{t('Manage your business reports')}</p>
                </div>
            </div>

            <div className="saas-card">
                <div className="saas-card-body">
                    <div className="row mb-4 align-items-end">
                        <div className="col-12 col-md-3 mb-3 mb-md-0">
                            <label className="fw-bold text-muted small">{t('reports.period')}</label>
                            <select className="form-select form-control" value={period} onChange={(e) => { setPeriod(e.target.value); setTableData([]); }}>
                                <option value="" disabled>{t('reports.selectPeriod')}</option>
                                <option value="month">{t('reports.patta')}</option>
                                <option value="date">{t('reports.sittai')}</option>
                            </select>
                        </div>

                        {period === 'month' && (
                            <>
                                <div className="col-12 col-md-3 mb-3 mb-md-0 fade-in">
                                    <label className="fw-bold text-muted small">{t('reports.type')}</label>
                                    <select className="form-select form-control" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                                        <option value="">{t('selectPlaceholder')}</option>
                                        <option value="purchase">{t('purchase')}</option>
                                        <option value="sales">{t('sales')}</option>
                                    </select>
                                </div>
                                <div className="col-12 col-md-3 mb-3 mb-md-0 fade-in">
                                    <label className="fw-bold text-muted small">{t('reports.month')}</label>
                                    <select className="form-select form-control" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                                        <option value="">{t('reports.selectMonth')}</option>
                                        {tamilMonths.map((m, i) => (
                                            <option key={i} value={m.tamil_month_name_en}>{m.tamil_month_name_ta}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12 col-md-3 mb-3 mb-md-0 fade-in">
                                    <label className="fw-bold text-muted small">{t('reports.year')}</label>
                                    <input type="number" className="form-control" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} />
                                </div>
                            </>
                        )}

                        {period === 'date' && (
                            <>
                                <div className="col-12 col-md-3 mb-3 mb-md-0 fade-in">
                                    <label className="fw-bold text-muted small">{t('reports.type')}</label>
                                    <select className="form-select form-control" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                                        <option value="">{t('selectPlaceholder')}</option>
                                        <option value="purchase">{t('purchase')}</option>
                                        <option value="sales">{t('sales')}</option>
                                    </select>
                                </div>
                                <div className="col-12 col-md-3 mb-3 mb-md-0 fade-in">
                                    <label className="fw-bold text-muted small">{t('date')}</label>
                                    <input type="date" className="form-control" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                                </div>
                            </>
                        )}
                    </div>

                    {tableData.length > 0 && (
                        <div className="d-flex justify-content-end mb-3 gap-2">
                            {period === 'month' && reportType === 'purchase' && (
                                <button
                                    className="btn btn-warning shadow-sm fw-bold px-4"
                                    onClick={handleUpdateOD}
                                    disabled={isUpdatingOD}
                                >
                                    {isUpdatingOD ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>{t('Updating...')}</>
                                    ) : (
                                        <><FontAwesomeIcon icon={faSync} className="me-2" />{t('Update Monthly OD')}</>
                                    )}
                                </button>
                            )}
                            <button className="btn btn-primary shadow-sm" onClick={() => handleDownload()}>
                                <FontAwesomeIcon icon={faCloudDownload} className="me-2" /> {t('reports.downloadAll')}
                            </button>
                        </div>
                    )}

                    <div className="table-responsive rounded border-0">
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th className="text-secondary text-uppercase" style={{ fontSize: '0.8rem' }}>{t('S.No')}</th>
                                    <th className="text-secondary text-uppercase" style={{ fontSize: '0.8rem' }}>{reportType === 'purchase' ? t('supplier.name') : t('customer.name')}</th>
                                    <th className="text-secondary text-uppercase" style={{ fontSize: '0.8rem' }}>
                                        {reportType === 'purchase' ? t('reports.creditDebit') : t('reports.debitCredit')}
                                    </th>
                                    <th className="text-secondary text-uppercase" style={{ fontSize: '0.8rem' }}>{t('action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData
                                    .filter(row =>
                                        parseFloat(row.credit_amount) > 0 ||
                                        parseFloat(row.debit_amount) > 0
                                    ).map((row, index) => {
                                        let displayAmt = "";
                                        if (reportType === 'purchase') {
                                            displayAmt = `${row.credit_amount} / ${row.debit_amount}`;
                                        } else {
                                            displayAmt = `${row.debit_amount} / ${row.credit_amount}`;
                                        }
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{row.customer_supplier_name}</td>
                                                <td className="fw-bold text-dark">{displayAmt}</td>
                                                <td>
                                                    <button className="btn btn-outline-primary btn-sm rounded-circle shadow-sm me-2" onClick={() => handleDownload(row.customer_supplier_code)}>
                                                        <FontAwesomeIcon icon={faCloudDownload} />
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-success btn-sm rounded-circle shadow-sm"
                                                        onClick={() => handleSendWhatsApp(row, index)}
                                                        disabled={isSendingWS === index}
                                                    >
                                                        {isSendingWS === index ? (
                                                            <span className="spinner-border spinner-border-sm"></span>
                                                        ) : (
                                                            <FontAwesomeIcon icon={faWhatsapp} />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                            <tfoot style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>
                                <tr className="fw-bold">
                                    <td colSpan="2" className="text-end text-primary">{t('reports.total')}:</td>
                                    <td className="text-primary">
                                        {reportType === 'purchase' ? (
                                            <>
                                                {tableData.reduce((acc, curr) => acc + parseFloat(curr.credit_amount || 0), 0).toFixed(2)}
                                                {" / "}
                                                {tableData.reduce((acc, curr) => acc + parseFloat(curr.debit_amount || 0), 0).toFixed(2)}
                                            </>
                                        ) : (
                                            <>
                                                {tableData.reduce((acc, curr) => acc + parseFloat(curr.debit_amount || 0), 0).toFixed(2)}
                                                {" / "}
                                                {tableData.reduce((acc, curr) => acc + parseFloat(curr.credit_amount || 0), 0).toFixed(2)}
                                            </>
                                        )}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
            {/* --- PLACE THE LOADER HERE (AT THE VERY END) --- */}
            {isUpdatingOD && (
                <div className="d-flex flex-column justify-content-center align-items-center"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        zIndex: 10000,
                        backdropFilter: 'blur(4px)'
                    }}>
                    <div className="bg-white p-4 rounded-4 shadow-lg text-center" style={{ minWidth: '250px' }}>
                        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h5 className="fw-bold mb-1">{t('Processing...')}</h5>
                        <p className="text-muted small mb-0">{t('Calculating Monthly OD')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportPage;