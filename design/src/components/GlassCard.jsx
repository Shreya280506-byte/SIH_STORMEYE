import React from 'react';

const GlassCard = ({ children, className = "", hover = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-black/40 backdrop-blur-md 
        border border-white/10 
        shadow-2xl rounded-3xl p-6 
        transition-all duration-300
        ${hover ? 'hover:bg-black/50 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export { GlassCard };