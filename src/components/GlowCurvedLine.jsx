import React, { useId } from 'react';

const GlowCurvedLine = ({ className = "", color = "purple" }) => {
  const id = useId();
  const gradientId = `glow-gradient-${id}`;
  const filterId = `glow-filter-${id}`;

  const colors = {
    purple: {
      stop1: "#9333EA", // purple-600
      stop2: "#E879F9", // fuchsia-400
      stop3: "#9333EA"
    },
    cyan: {
      stop1: "#0891B2", // cyan-600
      stop2: "#22D3EE", // cyan-400
      stop3: "#0891B2"
    },
    green: {
      stop1: "#16A34A", // green-600
      stop2: "#4ADE80", // green-400
      stop3: "#16A34A"
    },
    emerald: {
      stop1: "#059669", // emerald-600
      stop2: "#34D399", // emerald-400
      stop3: "#059669"
    }
  };

  const selectedColor = colors[color] || colors.purple;

  return (
    <div className={`pointer-events-none absolute ${className}`}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 800" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        preserveAspectRatio="none"
      >
        {/* Core Line */}
        <path 
          d="M-20 0C-20 0 50 400 -20 800" 
          stroke={`url(#${gradientId})`} 
          strokeWidth="3" 
          strokeLinecap="round"
          className="animate-pulse"
        />
        {/* Glow Effect */}
        <path 
          d="M-20 0C-20 0 50 400 -20 800" 
          stroke={`url(#${gradientId})`} 
          strokeWidth="15" 
          strokeOpacity="0.6"
          strokeLinecap="round"
          filter={`url(#${filterId})`}
          className="animate-pulse"
        />
        
        <defs>
          <filter id={filterId} x="-60" y="-60" width="220" height="920" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
            <feGaussianBlur stdDeviation="20" result="effect1_foregroundBlur"/>
          </filter>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="800" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={selectedColor.stop1} stopOpacity="0"/>
            <stop offset="0.5" stopColor={selectedColor.stop2} />
            <stop offset="1" stopColor={selectedColor.stop3} stopOpacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default GlowCurvedLine;
