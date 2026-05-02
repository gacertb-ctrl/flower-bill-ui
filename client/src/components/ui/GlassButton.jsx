import React from 'react';

const GlassButton = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = "relative px-6 py-2 rounded-full font-medium transition-all duration-300 overflow-hidden flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-nature-500 text-white hover:bg-nature-400 hover:shadow-glow",
    secondary: "bg-white/80 dark:bg-nature-700/80 text-nature-800 dark:text-nature-100 hover:bg-white dark:hover:bg-nature-600 border border-nature-200 dark:border-nature-600",
    accent: "bg-accent-gold text-nature-900 hover:bg-yellow-400 hover:shadow-glow",
    danger: "bg-red-500/90 text-white hover:bg-red-400",
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default GlassButton;
