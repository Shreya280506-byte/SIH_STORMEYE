import React from 'react';

const Thermometer3D = ({ temp }) => {
  const percent = Math.min(Math.max((temp / 50) * 100, 15), 90);
  return (
    <div className="relative w-12 h-32 flex flex-col items-center justify-end">
      <div className="w-4 h-full bg-white/5 rounded-t-full border border-white/20 backdrop-blur-sm relative overflow-hidden z-10 shadow-inner">
          <div className="absolute top-0 left-1 w-1 h-full bg-white/20 blur-[1px] z-20"></div>
          <div 
              className="absolute bottom-0 w-full bg-gradient-to-t from-red-700 via-red-500 to-red-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(239,68,68,0.6)]"
              style={{ height: `${percent}%` }}
          >
              <div className="w-full h-1 bg-red-300 rounded-full opacity-80 absolute top-0"></div>
          </div>
      </div>
      <div className="w-10 h-10 -mt-3 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-800 border border-red-400/30 shadow-[0_0_20px_rgba(220,38,38,0.5)] z-20 relative flex items-center justify-center">
           <div className="absolute top-2 left-2 w-3 h-3 bg-white/40 rounded-full blur-[2px]"></div>
      </div>
      <div className="absolute right-0 top-2 bottom-10 w-1 flex flex-col justify-between py-1 pointer-events-none">
          {[50, 40, 30, 20, 10].map((t) => (
              <div key={t} className="flex items-center gap-1">
                  <div className="w-1.5 h-[1px] bg-white/30"></div>
              </div>
          ))}
      </div>
    </div>
  );
};

export { Thermometer3D };