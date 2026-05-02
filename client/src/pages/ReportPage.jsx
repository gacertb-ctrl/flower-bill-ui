import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getReportSummary, getTamilMonths, updateSupplierOD } from '../api/reportAPI.jsx';
import { getWhatsAppStatus, sendReportWhatsApp } from '../api/whatsappAPI';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudDownload, faSync, faFileLines } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';

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
    const [loadingWa, setLoadingWa] = useState(false);

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
        if (!selectedMonth || !selectedYear) return;

        if (window.confirm(t('Are you sure?'))) {
            setIsUpdatingOD(true);
            try {
                await updateSupplierOD({ month: selectedMonth, year: selectedYear });
                alert(t('Success'));
            } catch (e) {
                console.error(e);
            } finally {
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

        window.open(url, '_blank');
    };

    const handleSendWhatsAppSingle = async (row) => {
        try {
            setLoadingWa(true);
            const st = await getWhatsAppStatus();
            if (st.instance?.state !== 'open') {
                 alert(t('Please connect WhatsApp in Settings'));
                 setLoadingWa(false);
                 return;
            }

            const payload = {
                period_type: period,
                report_type: reportType,
                code: row.customer_supplier_code,
                number: row.customer_supplier_contact_no
            };
            
            if (period === 'date') {
                payload.date = selectedDate;
            } else if (period === 'month') {
                payload.month = selectedMonth;
                payload.year = selectedYear;
            }
            
            await sendReportWhatsApp(payload);
            alert(`WhatsApp report sent successfully`);
        } catch (error) {
            console.error('Error sending whatsapp:', error);
            alert('Failed to send WhatsApp report. Please check your connection in Settings.');
        } finally {
            setLoadingWa(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-nature-100 dark:bg-nature-800 rounded-2xl flex items-center justify-center mr-4 shadow-sm border border-nature-200 dark:border-nature-700">
                    <FontAwesomeIcon icon={faFileLines} className="text-2xl text-nature-600 dark:text-nature-300" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-nature-800 dark:text-nature-100">{t('Reports')}</h2>
                    <p className="text-nature-500 dark:text-nature-400 text-sm mt-1">Generate and manage system reports</p>
                </div>
            </div>

            <GlassCard className="p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                        <select 
                            className="w-full px-4 py-2.5 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 shadow-sm" 
                            value={period} 
                            onChange={(e) => { setPeriod(e.target.value); setTableData([]); }}
                        >
                            <option value="" disabled>{t('reports.period')}</option>
                            <option value="month">{t('reports.patta')}</option>
                            <option value="date">{t('reports.sittai')}</option>
                        </select>
                    </div>

                    {period === 'month' && (
                        <>
                            <div className="md:col-span-1 animate-fade-in">
                                <select 
                                    className="w-full px-4 py-2.5 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 shadow-sm" 
                                    value={reportType} 
                                    onChange={(e) => setReportType(e.target.value)}
                                >
                                    <option value="">{t('reports.type')}</option>
                                    <option value="purchase">{t('purchase')}</option>
                                    <option value="sales">{t('sales')}</option>
                                </select>
                            </div>
                            <div className="md:col-span-1 animate-fade-in">
                                <select 
                                    className="w-full px-4 py-2.5 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 shadow-sm" 
                                    value={selectedMonth} 
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                >
                                    <option value="">{t('reports.selectMonth')}</option>
                                    {tamilMonths.map((m, i) => (
                                        <option key={i} value={m.tamil_month_name_en}>{m.tamil_month_name_ta}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-1 animate-fade-in">
                                <input 
                                    type="number" 
                                    className="w-full px-4 py-2.5 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 shadow-sm" 
                                    value={selectedYear} 
                                    onChange={(e) => setSelectedYear(e.target.value)} 
                                />
                            </div>
                        </>
                    )}

                    {period === 'date' && (
                        <>
                            <div className="md:col-span-1 animate-fade-in">
                                <select 
                                    className="w-full px-4 py-2.5 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 shadow-sm" 
                                    value={reportType} 
                                    onChange={(e) => setReportType(e.target.value)}
                                >
                                    <option value="">{t('reports.type')}</option>
                                    <option value="purchase">{t('purchase')}</option>
                                    <option value="sales">{t('sales')}</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 animate-fade-in">
                                <input 
                                    type="date" 
                                    className="w-full px-4 py-2.5 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 shadow-sm" 
                                    value={selectedDate} 
                                    onChange={(e) => setSelectedDate(e.target.value)} 
                                />
                            </div>
                        </>
                    )}
                </div>
            </GlassCard>

            {tableData.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-4 justify-end">
                    {period === 'month' && reportType === 'purchase' && (
                        <GlassButton
                            variant="secondary"
                            className="bg-accent-gold/20 text-yellow-700 border border-accent-gold/50 hover:bg-accent-gold/30 dark:text-yellow-400"
                            onClick={handleUpdateOD}
                            disabled={isUpdatingOD}
                        >
                            {isUpdatingOD ? (
                                <><FontAwesomeIcon icon={faSync} spin className="mr-2" /> {t('Updating...')}</>
                            ) : (
                                <><FontAwesomeIcon icon={faSync} className="mr-2" /> {t('Update Monthly OD')}</>
                            )}
                        </GlassButton>
                    )}
                    <GlassButton variant="primary" onClick={() => handleDownload()}>
                        <FontAwesomeIcon icon={faCloudDownload} className="mr-2" /> {t('reports.downloadAll')}
                    </GlassButton>
                </div>
            )}

            {tableData.length > 0 && (
                <GlassCard className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-nature-100/50 dark:bg-nature-800/50 border-b border-nature-200 dark:border-nature-700">
                                <tr className="text-nature-600 dark:text-nature-300">
                                    <th className="py-4 px-6 font-semibold">{t('S.No')}</th>
                                    <th className="py-4 px-6 font-semibold">{reportType === 'purchase' ? t('supplier.name') : t('customer.name')}</th>
                                    <th className="py-4 px-6 font-semibold">
                                        {reportType === 'purchase' ? t('reports.creditDebit') : t('reports.debitCredit')}
                                    </th>
                                    <th className="py-4 px-6 font-semibold text-right">{t('action')}</th>
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
                                            <tr key={index} className="border-b border-nature-100 dark:border-nature-700/30 hover:bg-nature-50/50 dark:hover:bg-nature-800/50 transition-colors">
                                                <td className="py-4 px-6 text-nature-600 dark:text-nature-400">{index + 1}</td>
                                                <td className="py-4 px-6 font-medium text-nature-800 dark:text-nature-100">{row.customer_supplier_name}</td>
                                                <td className="py-4 px-6 text-nature-800 dark:text-nature-100">{displayAmt}</td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            className="p-2 text-nature-600 hover:text-nature-800 bg-nature-100 hover:bg-nature-200 dark:bg-nature-800 dark:text-nature-300 dark:hover:bg-nature-700 rounded-lg transition-colors" 
                                                            onClick={() => handleDownload(row.customer_supplier_code)} 
                                                            title="Download/Print"
                                                        >
                                                            <FontAwesomeIcon icon={faCloudDownload} />
                                                        </button>
                                                        <button 
                                                            className="p-2 text-white bg-[#25D366] hover:bg-[#128C7E] rounded-lg transition-colors shadow-sm" 
                                                            onClick={() => handleSendWhatsAppSingle(row)} 
                                                            title="Send WhatsApp" 
                                                            disabled={loadingWa}
                                                        >
                                                            <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );                                    
                                })}
                            </tbody>
                            <tfoot className="bg-nature-50 dark:bg-nature-800/30 border-t-2 border-nature-200 dark:border-nature-700">
                                <tr className="font-bold text-nature-800 dark:text-nature-100">
                                    <td colSpan="2" className="py-4 px-6 text-right">{t('reports.total')}:</td>
                                    <td className="py-4 px-6">
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
                </GlassCard>
            )}

            {/* Loaders */}
            {(isUpdatingOD || loadingWa) && (
                <div className="fixed inset-0 bg-nature-900/40 backdrop-blur-sm z-50 flex flex-col justify-center items-center">
                    <GlassCard className="p-8 text-center min-w-[250px] shadow-2xl border border-white/40 flex flex-col items-center">
                        <FontAwesomeIcon 
                            icon={loadingWa ? faWhatsapp : faSync} 
                            spin={!loadingWa} 
                            className={`text-4xl mb-4 ${loadingWa ? 'text-[#25D366] animate-bounce' : 'text-nature-600 dark:text-nature-400'}`} 
                        />
                        <h5 className="text-xl font-bold text-nature-800 dark:text-nature-100 mb-2">
                            {loadingWa ? 'WhatsApp' : t('Processing...')}
                        </h5>
                        <p className="text-nature-600 dark:text-nature-400 text-sm">
                            {loadingWa ? t('Sending report, please wait...') : t('Calculating Monthly OD')}
                        </p>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default ReportPage;