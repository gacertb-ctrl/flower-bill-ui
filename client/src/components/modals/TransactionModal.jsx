import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import FloatingModal from '../ui/FloatingModal';
import GlassButton from '../ui/GlassButton';

const TransactionModal = ({
    show,
    onHide,
    type,
    onSubmit,
    options,
    entityType
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        entity: null,
        product: null,
        quality: '',
        unit: '',
        price: '',
        total: ''
    });

    useEffect(() => {
        if (formData.quality && formData.price && formData.unit) {
            calculateTotal();
        }
    }, [formData.quality, formData.price, formData.unit]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSelectChange = (name, selectedOption) => {
        setFormData({ ...formData, [name]: selectedOption });
    };

    const calculateTotal = () => {
        const quality = parseFloat(formData.quality) || 0;
        const price = parseFloat(formData.price) || 0;
        setFormData({ ...formData, total: (quality * price).toFixed(2) });
    };

    const handleSubmit = () => {
        onSubmit({
            entityCode: formData.entity.value,
            productCode: formData.product.value,
            quality: formData.quality,
            unit: formData.unit,
            price: formData.price,
            total: formData.total
        });
        onHide();
    };

    // Custom styles for react-select to match tailwind theme
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderColor: state.isFocused ? '#9ca3af' : '#e5e7eb',
            borderRadius: '0.75rem',
            padding: '0.125rem',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(156, 163, 175, 0.2)' : 'none',
            '&:hover': {
                borderColor: '#d1d5db'
            }
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#e5e7eb' : state.isFocused ? '#f3f4f6' : 'transparent',
            color: '#1f2937',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#d1d5db'
            }
        })
    };

    return (
        <FloatingModal show={show} onHide={onHide} title={t(`add ${type}`)} size="lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-nature-700 dark:text-nature-300 mb-1">
                        {t(`select.${entityType?.toLowerCase()}`) || t('selectPlaceholder')}
                    </label>
                    <Select
                        options={options.entities}
                        onChange={(selected) => handleSelectChange('entity', selected)}
                        placeholder={t(`select.${entityType?.toLowerCase()}`) || t('selectPlaceholder')}
                        isSearchable
                        styles={selectStyles}
                        className="text-sm"
                    />
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-nature-700 dark:text-nature-300 mb-1">
                        {t('select.product')}
                    </label>
                    <Select
                        options={options.products}
                        onChange={(selected) => handleSelectChange('product', selected)}
                        placeholder={t('select.product')}
                        isSearchable
                        styles={selectStyles}
                        className="text-sm"
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-nature-700 dark:text-nature-300 mb-1">
                        {`${t(type)} ${t('quantity')}`}
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                        id="quality"
                        placeholder={`${t(type)} ${t('quantity')}`}
                        value={formData.quality}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-nature-700 dark:text-nature-300 mb-1">
                        {t('select.unit')}
                    </label>
                    <select
                        className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                    >
                        <option value="">{t('select.unit')}</option>
                        <option value="kg">{t('kg')}</option>
                        <option value="g">{t('g')}</option>
                        <option value="படி">{t('padi')}</option>
                        <option value="pie">{t('pieces')}</option>
                    </select>
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-nature-700 dark:text-nature-300 mb-1">
                        {`${t(type)} ${t('price')}`}
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                        id="price"
                        placeholder={`${t(type)} ${t('price')}`}
                        value={formData.price}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-nature-700 dark:text-nature-300 mb-1">
                        {t('total')}
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 bg-nature-100/60 dark:bg-nature-800/60 border border-nature-200 dark:border-nature-700/50 rounded-xl outline-none text-nature-800 dark:text-nature-100 font-semibold"
                        id="total"
                        placeholder={t('total')}
                        value={formData.total}
                        readOnly
                    />
                </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-nature-200 dark:border-nature-700/50">
                <GlassButton variant="secondary" onClick={onHide}>
                    {t('close')}
                </GlassButton>
                <GlassButton variant="primary" onClick={handleSubmit}>
                    {t(`add ${type}`)}
                </GlassButton>
            </div>
        </FloatingModal>
    );
};

export default TransactionModal;