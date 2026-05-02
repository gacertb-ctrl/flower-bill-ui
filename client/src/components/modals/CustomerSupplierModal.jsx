import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FloatingModal from '../ui/FloatingModal';
import GlassButton from '../ui/GlassButton';

const CustomerSupplierModal = ({
  show,
  onHide,
  type,
  mode,
  initialData,
  onSubmit
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    number: '',
    address: '',
    commission: type === 'supplier' ? '12.5' : ''
  });

  // Initialize form with data when editing
  useEffect(() => {
    if (mode === 'update' && initialData) {
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        number: initialData.contact || '',
        address: initialData.address || '',
        commission: initialData.commission || (type === 'supplier' ? '12.5' : '')
      });
    } else {
      // Reset form for new entry
      setFormData({
        code: '',
        name: '',
        number: '',
        address: '',
        commission: type === 'supplier' ? '12.5' : ''
      });
    }
  }, [mode, initialData, type]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      onSubmit(formData);
    } catch (error) {
      console.error('Error updating customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const actionText = mode === 'add' ? t('add') : t('update'); // Generic add/update keys

  return (
    <FloatingModal 
        show={show} 
        onHide={onHide} 
        title={`${t(`${type}`)} ${actionText}`}
        size="lg"
    >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1">
                <input
                    type="text"
                    className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                    id="code"
                    placeholder={t(`${type}.code`)}
                    value={formData.code}
                    onChange={handleChange}
                    required
                    disabled={mode === 'update'}
                />
            </div>
            <div className="col-span-1">
                <input
                    type="text"
                    className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                    id="name"
                    placeholder={t(`${type}.name`)}
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="col-span-1">
                <input
                    type="text"
                    className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                    id="number"
                    placeholder={t(`${type}.contact no`)}
                    value={formData.number}
                    onChange={handleChange}
                />
            </div>

            {type === 'supplier' && (
                <div className="md:col-span-1">
                    <input
                        type="text"
                        className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all"
                        id="commission"
                        placeholder={t('Commission')}
                        value={formData.commission}
                        onChange={handleChange}
                    />
                </div>
            )}

            <div className={`md:col-span-3 ${type === 'supplier' ? 'mt-2' : ''}`}>
                <textarea
                    className="w-full px-4 py-2 bg-white/60 dark:bg-nature-900/60 border border-nature-200 dark:border-nature-700/50 rounded-xl focus:ring-2 focus:ring-nature-400 outline-none text-nature-800 dark:text-nature-100 transition-all resize-none"
                    id="address"
                    rows={4}
                    placeholder={t(`${type}.address`)}
                    value={formData.address}
                    onChange={handleChange}
                />
            </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-nature-200 dark:border-nature-700/50">
            <GlassButton variant="secondary" onClick={onHide}>
                {t('close')}
            </GlassButton>
            <GlassButton variant="primary" onClick={handleSubmit} disabled={loading}>
                {t(`${type}`)} {actionText}
            </GlassButton>
        </div>
    </FloatingModal>
  );
};

export default CustomerSupplierModal;