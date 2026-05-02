import React from 'react';

const GlassCard = ({ children, className = '', hoverEffect = true, ...props }) => {
  const baseClasses = "bg-white/70 dark:bg-nature-800/70 backdrop-blur-md border border-white/40 dark:border-nature-700/50 rounded-2xl shadow-floating transition-all duration-300";
  const hoverClasses = hoverEffect ? "hover:-translate-y-1 hover:shadow-floating-hover" : "";

  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
