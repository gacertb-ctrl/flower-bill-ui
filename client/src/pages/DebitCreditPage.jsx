import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getDebitEntries, getCreditEntries, deleteDebitEntry, deleteCreditEntry } from '../api/debitCreditAPI';
import DebitCreditModal from '../components/entry/DebitCreditModal.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faPen, faCalendarDays, faMoneyBillTransfer, faHandHoldingDollar } from '@fortawesome/free-solid-svg-icons';
import DebitCreditUpdateModal from '../components/entry/DebitCreditUpdateModal.jsx';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';

const DebitCreditPage = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [debitEntries, setDebitEntries] = useState([]);
    const [creditEntries, setCreditEntries] = useState([]);

    const [showDebitModal, setShowDebitModal] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateType, setUpdateType] = useState(null);

    const loadData = useCallback(async () => {
        try {
            const debits = await getDebitEntries(date);
            const credits = await getCreditEntries(date);
            setDebitEntries(debits || []);
            setCreditEntries(credits || []);
        } catch (error) {
            console.error("Error loading data", error);
        }
    }, [date]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleDelete = async (type, id) => {
        if (window.confirm(t('confirm.deleteEntry'))) {
            try {
                if (type === 'debit') await deleteDebitEntry(id);
                else await deleteCreditEntry(id);
                loadData();
            } catch (error) {
                console.error("Error deleting entry", error);
            }
        }
    };

    const handleEdit = (type, row) => {
        setEditItem({
            id: type === 'debit' ? row.debit_id : row.credit_id,
            customer_supplier_code: row.customer_supplier_code || row.code,
            amount: type === 'debit' ? row.debit_amount : row.credit_amount
        });
        setUpdateType(type);
        setShowUpdateModal(true);
    };

    const closeModal = () => {
        setShowDebitModal(false);
        setShowCreditModal(false);
        setEditItem(null);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Header Section */}
            <GlassCard className="p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-nature-800 dark:text-nature-100">{t('Debit / Credit Tracking')}</h2>
                    <p className="text-nature-500 dark:text-nature-400 text-sm mt-1">{t('Manage your financial transactions')}</p>
                </div>

                <div className="flex items-center bg-white/50 dark:bg-nature-900/50 px-4 py-2 rounded-xl shadow-sm border border-nature-200 dark:border-nature-700/50">
                    <FontAwesomeIcon icon={faCalendarDays} className="text-nature-500 mr-3" />
                    <input
                        type="date"
                        className="bg-transparent border-none text-nature-800 dark:text-nature-100 font-semibold focus:outline-none focus:ring-0"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Debit Column */}
                <div className="flex flex-col">
                    <GlassCard className="p-6 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-nature-200 dark:border-nature-700/50">
                            <div className="flex items-center">
                                <div className="bg-nature-100 dark:bg-nature-800 p-3 rounded-xl mr-4 text-nature-600 dark:text-nature-300">
                                    <FontAwesomeIcon icon={faMoneyBillTransfer} size="lg" />
                                </div>
                                <h4 className="text-xl font-bold text-nature-800 dark:text-nature-100">{t('purchaseDebit')}</h4>
                            </div>
                            <GlassButton
                                variant="primary"
                                onClick={() => { setEditItem(null); setShowDebitModal(true); }}
                                className="text-sm px-4"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-2"/> {t('addDebit')}
                            </GlassButton>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white/90 dark:bg-nature-800/90 backdrop-blur-md z-10">
                                    <tr className="text-nature-500 dark:text-nature-400 border-b border-nature-200 dark:border-nature-700/50">
                                        <th className="py-3 px-2 font-medium">{t('S.No')}</th>
                                        <th className="py-3 px-2 font-medium">{t('supplier.name')}</th>
                                        <th className="py-3 px-2 font-medium">{t('amount')}</th>
                                        <th className="py-3 px-2 font-medium text-right">{t('action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {debitEntries.length > 0 ? (
                                        debitEntries.map((row, index) => (
                                            <tr key={row.debit_id} className="border-b border-nature-100 dark:border-nature-700/30 hover:bg-nature-50/50 dark:hover:bg-nature-800/50 transition-colors">
                                                <td className="py-3 px-2 text-nature-600 dark:text-nature-300">{index + 1}</td>
                                                <td className="py-3 px-2 text-nature-800 dark:text-nature-100">{row.customer_supplier_name}</td>
                                                <td className="py-3 px-2 font-medium text-nature-800 dark:text-nature-100">₹ {row.debit_amount}</td>
                                                <td className="py-3 px-2 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button className="p-2 text-nature-500 hover:text-nature-700 bg-nature-100 hover:bg-nature-200 dark:bg-nature-800 dark:hover:bg-nature-700 rounded-lg transition-colors" onClick={() => handleEdit('debit', row)}>
                                                            <FontAwesomeIcon icon={faPen} />
                                                        </button>
                                                        <button className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors" onClick={() => handleDelete('debit', row.debit_id)}>
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="py-8 text-center text-nature-500 dark:text-nature-400">{t('noEntriesFound')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>

                {/* Credit Column */}
                <div className="flex flex-col">
                    <GlassCard className="p-6 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-nature-200 dark:border-nature-700/50">
                            <div className="flex items-center">
                                <div className="bg-accent-blue/20 dark:bg-accent-blue/10 p-3 rounded-xl mr-4 text-accent-blue">
                                    <FontAwesomeIcon icon={faHandHoldingDollar} size="lg" />
                                </div>
                                <h4 className="text-xl font-bold text-nature-800 dark:text-nature-100">{t('salesCredit')}</h4>
                            </div>
                            <GlassButton
                                className="bg-accent-blue text-white hover:bg-blue-500 shadow-glow text-sm px-4"
                                onClick={() => { setEditItem(null); setShowCreditModal(true); }}
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-2"/> {t('addCredit')}
                            </GlassButton>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white/90 dark:bg-nature-800/90 backdrop-blur-md z-10">
                                    <tr className="text-nature-500 dark:text-nature-400 border-b border-nature-200 dark:border-nature-700/50">
                                        <th className="py-3 px-2 font-medium">{t('S.No')}</th>
                                        <th className="py-3 px-2 font-medium">{t('customer.name')}</th>
                                        <th className="py-3 px-2 font-medium">{t('amount')}</th>
                                        <th className="py-3 px-2 font-medium text-right">{t('action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {creditEntries.length > 0 ? (
                                        creditEntries.map((row, index) => (
                                            <tr key={row.credit_id} className="border-b border-nature-100 dark:border-nature-700/30 hover:bg-nature-50/50 dark:hover:bg-nature-800/50 transition-colors">
                                                <td className="py-3 px-2 text-nature-600 dark:text-nature-300">{index + 1}</td>
                                                <td className="py-3 px-2 text-nature-800 dark:text-nature-100">{row.customer_supplier_name}</td>
                                                <td className="py-3 px-2 font-medium text-nature-800 dark:text-nature-100">₹ {row.credit_amount}</td>
                                                <td className="py-3 px-2 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button className="p-2 text-nature-500 hover:text-nature-700 bg-nature-100 hover:bg-nature-200 dark:bg-nature-800 dark:hover:bg-nature-700 rounded-lg transition-colors" onClick={() => handleEdit('credit', row)}>
                                                            <FontAwesomeIcon icon={faPen} />
                                                        </button>
                                                        <button className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors" onClick={() => handleDelete('credit', row.credit_id)}>
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="py-8 text-center text-nature-500 dark:text-nature-400">{t('noEntriesFound')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>
            </div>

            <DebitCreditModal
                type="debit"
                show={showDebitModal}
                onHide={closeModal}
                onSubmit={loadData}
                date={date}
                editData={editItem}
            />

            <DebitCreditModal
                type="credit"
                show={showCreditModal}
                onHide={closeModal}
                onSubmit={loadData}
                date={date}
                editData={editItem}
            />

            <DebitCreditUpdateModal
                show={showUpdateModal}
                onHide={() => setShowUpdateModal(false)}
                type={updateType}
                editData={editItem}
                onSuccess={loadData}
            />

        </div>
    );
};

export default DebitCreditPage;