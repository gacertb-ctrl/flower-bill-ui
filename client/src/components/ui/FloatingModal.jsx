import React, { useEffect, useState } from 'react';
import GlassCard from './GlassCard';

const FloatingModal = ({ isOpen, onClose, title, children, className = '' }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      setTimeout(() => setShow(false), 300); // Wait for exit animation
    }
  }, [isOpen]);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-nature-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-2xl transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <GlassCard className={`p-6 ${className}`} hoverEffect={false}>
          <div className="flex justify-between items-center mb-6">
            {title && <h3 className="text-xl font-semibold text-nature-800 dark:text-nature-100">{title}</h3>}
            <button 
              onClick={onClose}
              className="text-nature-500 hover:text-nature-700 dark:text-nature-300 dark:hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-nature-700 dark:text-nature-200">
            {children}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default FloatingModal;
