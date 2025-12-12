import React from 'react';

const Aerostat = () => (
  <div className="absolute right-4 top-0 w-48 h-full pointer-events-none z-0 opacity-100 overflow-visible">
     <div className="w-full h-full animate-aerostat-deploy">
        <div className="w-full h-full animate-aerostat-float flex flex-col items-center pt-8">
           <svg viewBox="0 0 200 600" className="w-full h-[600px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              <defs>
                <radialGradient id="cloudGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
              </defs>
              <g className="animate-cloud-drift-1">
                  <path d="M10,80 Q30,60 50,80 T90,80" fill="url(#cloudGrad)" opacity="0.3" />
                  <path d="M120,60 Q140,40 160,60 T200,60" fill="url(#cloudGrad)" opacity="0.2" />
              </g>
              <line x1="100" y1="180" x2="100" y2="1000" stroke="#94a3b8" strokeWidth="2" />
              <g>
                  <ellipse cx="100" cy="100" rx="80" ry="45" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
                  <path d="M20,100 Q100,50 180,100" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                  <path d="M20,100 L0,125 L30,125 Z" fill="#334155" stroke="#1e293b" strokeWidth="1"/>
                  <path d="M180,100 L200,125 L170,125 Z" fill="#334155" stroke="#1e293b" strokeWidth="1"/>
                  <rect x="75" y="140" width="50" height="20" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                  <circle cx="100" cy="150" r="3" fill="#ef4444">
                      <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
                  </circle>
              </g>
              <g className="animate-cloud-drift-2">
                  <path d="M-20,130 Q10,110 40,130 T100,130" fill="url(#cloudGrad)" opacity="0.4" />
                  <path d="M150,110 Q180,90 210,110" fill="url(#cloudGrad)" opacity="0.3" />
              </g>
           </svg>
        </div>
     </div>
  </div>
);

export { Aerostat };