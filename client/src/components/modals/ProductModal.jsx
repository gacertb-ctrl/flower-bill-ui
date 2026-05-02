import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FloatingModal from '../ui/FloatingModal';
import GlassButton from '../ui/GlassButton';

const ProductModal = ({
    show,
    onHide,
    mode,
    onSubmit,
    initialData = null
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        product_code: "",
        product_name: "",
        product_quality: "",
        product_unit: "",
        product_price: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        onSubmit(formData);
        onHide();
    };

    useEffect(() => {
        setFormData({
            product_code: initialData?.product_code || initialData?.code || '',
            product_name: initialData?.product_name || initialData?.name || '',
            product_quality: initialData?.product_quality || initialData?.quality || '',
            product_unit: initialData?.product_unit || initialData?.unit || '',
            product_price: initialData?.product_price || initialData?.price || ''
        });
    }, [initialData]);

    const titleAction = mode === 'add' ? t('add') : t('update');

    return (
        <FloatingModal show={show} onHide={onHide} title={`${t('product')} ${titleAction}`} size="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-nature-700 dark:text-nature-300 mb-1">{t('product.code')}</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                        id="product_code"
                        placeholder={t('product.code')}
                        value={formData.product_code}
                        onChange={handleChange}
                        required
                        disabled={mode === 'update'}
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-nature-700 dark:text-nature-300 mb-1">{t('product.name')}</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                        id="product_name"
                        placeholder={t('product.name')}
                        value={formData.product_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="col-span-1 md:col-span-1">
                    <label className="block text-sm font-medium text-nature-700 dark:text-nature-300 mb-1">{t('product.quality')}</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                        id="product_quality"
                        placeholder={t('product.quality')}
                        value={formData.product_quality}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-span-1 md:col-span-1">
                    <label className="block text-sm font-medium text-nature-700 dark:text-nature-300 mb-1">{t('select.unit')}</label>
                    <select
                        className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                        name="product_unit"
                        value={formData.product_unit}
                        onChange={handleSelectChange}
                    >
                        <option value="">{t('select.unit')}</option>
                        <option value="kg">{t('kg')}</option>
                        <option value="g">{t('g')}</option>
                        <option value="படி">{t('padi')}</option>
                        <option value="pie">{t('pieces')}</option>
                    </select>
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-nature-700 dark:text-nature-300 mb-1">{t('product.price')}</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                        id="product_price"
                        placeholder={t('product.price')}
                        value={formData.product_price}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-nature-200 dark:border-nature-700/50">
                <GlassButton variant="secondary" onClick={onHide}>
                    {t('close')}
                </GlassButton>
                <GlassButton variant="primary" onClick={handleSubmit}>
                    {t('product')} {titleAction}
                </GlassButton>
            </div>
        </FloatingModal>
    );
};

export default ProductModal;