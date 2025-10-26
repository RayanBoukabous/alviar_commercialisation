'use client';

import React from 'react';
import Image from 'next/image';

interface AlviarLogoProps {
  width?: number;
  height?: number;
  className?: string;
  whiteLogo?: string;
  darkLogo?: string;
}

export default function AlviarLogo({ 
  width = 120, 
  height = 40, 
  className = '',
  whiteLogo = '/logo_complet_white.png',
  darkLogo = '/logo_complet_dark.png'
}: AlviarLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo pour le mode sombre */}
      <Image
        src={whiteLogo}
        alt="ALVIAR Logo"
        width={width}
        height={height}
        priority
        className="object-contain dark:block hidden"
      />
      {/* Logo pour le mode clair */}
      <Image
        src={darkLogo}
        alt="ALVIAR Logo"
        width={width}
        height={height}
        priority
        className="object-contain dark:hidden block"
      />
    </div>
  );
}
