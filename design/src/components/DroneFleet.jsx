import React from 'react';

const DroneFleet = () => {
    const Drone = ({ className }) => (
        <svg viewBox="0 0 100 60" className={`w-16 h-10 ${className}`}>
            <defs>
                <filter id="droneGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <ellipse cx="50" cy="30" rx="15" ry="5" fill="#3b82f6" stroke="#60a5fa" filter="url(#droneGlow)" />
            <path d="M20,30 L80,30" stroke="#94a3b8" strokeWidth="2" />
            <path d="M50,30 L50,30" stroke="#94a3b8" strokeWidth="2" />
            <ellipse cx="20" cy="30" rx="12" ry="2" fill="rgba(255,255,255,0.5)" className="animate-spin-fast origin-[20px_30px]" />
            <ellipse cx="80" cy="30" rx="12" ry="2" fill="rgba(255,255,255,0.5)" className="animate-spin-fast origin-[80px_30px]" />
            <circle cx="50" cy="32" r="2" fill="#ef4444" className="animate-pulse" />
            <circle cx="20" cy="32" r="1" fill="#10b981" />
            <circle cx="80" cy="32" r="1" fill="#10b981" />
        </svg>
    );

    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute left-[40%] bottom-0 w-16 h-16 animate-drone-launch-1">
                 <div className="animate-drone-hover-1">
                     <Drone className="" />
                 </div>
            </div>
            <div className="absolute left-[15%] bottom-0 w-12 h-12 animate-drone-launch-2">
                 <div className="animate-drone-hover-2">
                    <Drone className="scale-75 opacity-80" />
                 </div>
            </div>
            <div className="absolute left-[65%] bottom-0 w-12 h-12 animate-drone-launch-3">
                 <div className="animate-drone-hover-3">
                    <Drone className="scale-75 opacity-80" />
                 </div>
            </div>
        </div>
    );
};

export { DroneFleet };