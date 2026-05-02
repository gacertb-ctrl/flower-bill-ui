import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateDebitEntry, updateCreditEntry } from '../../api/debitCreditAPI';
import FloatingModal from '../ui/FloatingModal';
import GlassButton from '../ui/GlassButton';

const DebitCreditUpdateModal = ({ show, onHide, type, editData, onSuccess }) => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (editData) {
            setAmount(editData.amount);
        }
    }, [editData]);

    const handleSubmit = async () => {
        const payload = {
            id: editData.id,
            amount
        };

        if (type === 'debit') {
            await updateDebitEntry(payload);
        } else {
            await updateCreditEntry(payload);
        }

        onSuccess();
        onHide();
    };

    return (
        <FloatingModal show={show} onHide={onHide} title={t('update amount')}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-nature-700 dark:text-nature-300 mb-1">
                        {t('amount')}
                    </label>
                    <input
                        type="number"
                        className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-nature-200 dark:border-nature-700/50">
                <GlassButton variant="secondary" onClick={onHide}>
                    {t('close')}
                </GlassButton>
                <GlassButton variant="primary" onClick={handleSubmit}>
                    {t('update')}
                </GlassButton>
            </div>
        </FloatingModal>
    );
};

export default DebitCreditUpdateModal;
