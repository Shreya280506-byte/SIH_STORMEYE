import React from 'react';

const HumidityDroplet = ({ humidity }) => {
  const fillHeight = Math.min(Math.max(humidity, 0), 100);
  return (
    <div className="relative w-12 h-24 flex items-center justify-center -mt-2">
      <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-xl">
          <defs>
              <linearGradient id="waterGradient" x1="0" x2="0" y1="1" y2="0">
                  <stop offset="0%" stopColor="#1e40af" /> 
                  <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
              <clipPath id="dropClip">
                   <path d="M50 0 C50 0 100 80 100 110 C100 137.6 77.6 160 50 160 C22.4 160 0 137.6 0 110 C0 80 50 0 50 0 Z" />
              </clipPath>
          </defs>
          <path d="M50 0 C50 0 100 80 100 110 C100 137.6 77.6 160 50 160 C22.4 160 0 137.6 0 110 C0 80 50 0 50 0 Z" 
                fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
          <g clipPath="url(#dropClip)">
              <rect x="0" y={160 - (1.6 * fillHeight)} width="100" height="160" fill="url(#waterGradient)" className="transition-all duration-1000 ease-out" />
              <path d={`M0 ${160 - (1.6 * fillHeight)} Q 50 ${160 - (1.6 * fillHeight) + 10} 100 ${160 - (1.6 * fillHeight)}`} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          </g>
          <path d="M30 40 Q 15 80 15 120" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export { HumidityDroplet };