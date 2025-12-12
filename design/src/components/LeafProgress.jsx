import React from 'react';

const LeafProgress = ({ value, color }) => {
  const leafPath = "M50 5 C50 5 90 40 90 70 C90 90 75 100 50 100 C25 100 10 90 10 70 C10 40 50 5 50 5 Z";
  return (
    <div className="relative flex items-center justify-center">
      <div className={`absolute inset-0 rounded-full blur-3xl opacity-30`} style={{ backgroundColor: color }}></div>
      <svg className="w-40 h-40 relative z-10" viewBox="0 0 100 105">
        <defs>
          <linearGradient id="leafFill" x1="0" x2="0" y1="1" y2="0">
            <stop offset={`${value}%`} stopColor={color} />
            <stop offset={`${value}%`} stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path d={leafPath} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
        <path d={leafPath} fill="url(#leafFill)" className="transition-all duration-1000 ease-in-out" filter="url(#glow)" />
        <path d="M50 20 L50 90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-white z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
        <span className="text-3xl font-bold tracking-tighter drop-shadow-md">{value}%</span>
      </div>
    </div>
  );
};

export { LeafProgress };