
import React from 'react';

const SmartTechLogo: React.FC<{ className?: string; light?: boolean }> = ({ className = "h-12", light = false }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    {/* Icon: Red rounded box with stylized S/T */}
    <div className="relative w-12 h-12 bg-[#E30613] rounded-[10px] flex items-center justify-center overflow-hidden flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-[75%] h-[75%]">
        {/* White T shape */}
        <rect x="20" y="25" width="60" height="12" fill="white" />
        <rect x="44" y="25" width="12" height="50" fill="white" />
        {/* Black S stylized shape integrated */}
        <path 
          d="M30 45 H70 V55 H42 V65 H70 V75 H30 V45 Z" 
          fill="black" 
          opacity="1"
          className="mix-blend-normal"
        />
        {/* Fine-tuning to match the image's specific look of S and T overlapping */}
        <path d="M25 45 H75 V52 H25 V45 Z" fill="black" />
        <path d="M25 68 H75 V75 H25 V68 Z" fill="black" />
        <path d="M68 45 V75 H75 V45 H68 Z" fill="black" />
        <path d="M25 45 V52 H32 V45 H25 Z" fill="black" />
      </svg>
    </div>

    {/* Text: SMART TECH */}
    <div className="flex flex-col justify-center">
      <div 
        className={`text-3xl font-black leading-none tracking-[-0.05em] font-sans ${light ? 'text-white' : 'text-black'}`}
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        SMART
      </div>
      <div 
        className="text-[14px] font-bold leading-none tracking-[0.45em] text-[#E30613] mt-0.5"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        TECH
      </div>
    </div>
  </div>
);

export default SmartTechLogo;
