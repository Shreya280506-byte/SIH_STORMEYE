import React from 'react';

const MultiLineChart = ({ datasets, timestamps, className }) => {
  if (!datasets || datasets.length === 0) return null;
  const length = datasets[0].data.length;
  if (length < 2) return null;

  const normalize = (val, min, max) => {
      const range = max - min || 1;
      return ((val - min) / range) * 65; 
  };

  return (
      <div className={`w-full ${className}`}>
          <div className="flex justify-center gap-6 mb-4">
              {datasets.map((ds, i) => (
                  <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ds.color }}></div>
                      <span className="text-xs font-bold text-white/70 uppercase tracking-wide">{ds.label}</span>
                  </div>
              ))}
          </div>

          <div className="h-48 w-full overflow-visible">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  {Array.from({ length }).map((_, i) => {
                      const x = (i / (length - 1)) * 100;
                      const isStart = i === 0;
                      const isEnd = i === length - 1;
                      const isInterval = i % 5 === 0;

                      if (isStart || isEnd || isInterval) {
                          let textAnchor = "middle";
                          if (isStart) textAnchor = "start";
                          if (isEnd) textAnchor = "end";

                          return (
                              <g key={i}>
                                  <line x1={x} y1="0" x2={x} y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="2" />
                                  {timestamps && timestamps[i] && (
                                      <text x={x} y="95" fontSize="3.5" fill="rgba(255,255,255,0.3)" textAnchor={textAnchor} className="font-mono font-medium">
                                          {timestamps[i]}
                                      </text>
                                  )}
                              </g>
                          );
                      }
                      return null;
                  })}

                  {datasets.map((ds, idx) => {
                      const min = Math.min(...ds.data);
                      const max = Math.max(...ds.data);
                      
                      const points = ds.data.map((val, i) => {
                          const x = (i / (length - 1)) * 100;
                          const y = 75 - normalize(val, min, max); 
                          return `${x},${y}`;
                      }).join(' ');

                      return (
                          <polyline
                              key={idx}
                              fill="none"
                              stroke={ds.color}
                              strokeWidth="2"
                              points={points}
                              vectorEffect="non-scaling-stroke"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="drop-shadow-lg"
                          />
                      );
                  })}
              </svg>
          </div>
      </div>
  );
};

export { MultiLineChart };