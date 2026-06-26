import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center select-none group transition-all duration-300 ${className}`}>
      <div className="relative w-16 h-14 md:w-24 md:h-20 flex items-center justify-center">
        <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Bottom Horizon Bar - Light Emerald */}
          <rect x="5" y="75" width="110" height="8" rx="1" fill="#f2fff0" />
          
          {/* Sun Rays - Emerald (#40dc3a) */}
          {/* Middle Left */}
          <rect x="10" y="55" width="28" height="10" rx="1" fill="#40dc3a" />
          {/* Middle Right */}
          <rect x="82" y="55" width="28" height="10" rx="1" fill="#40dc3a" />
          
          {/* Top Center */}
          <rect x="57" y="15" width="7" height="30" rx="1" fill="#40dc3a" />
          
          {/* Top Left Angled */}
          <rect x="32" y="25" width="7" height="30" rx="1" fill="#40dc3a" transform="rotate(-45 35.5 40)" />
          
          {/* Top Right Angled */}
          <rect x="82" y="25" width="7" height="30" rx="1" fill="#40dc3a" transform="rotate(45 85.5 40)" />
        </svg>
      </div>
    </div>
  );
};

export default Logo;
