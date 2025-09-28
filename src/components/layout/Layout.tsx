import React from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import LayoutLTR from './LayoutLTR';
import LayoutRTL from './LayoutRTL';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className,
  showSidebar = true,
}) => {
  const { currentLocale } = useLanguage();
  const isRTL = currentLocale === 'ar';
  
  console.log('🎯 Layout principal - currentLocale:', currentLocale, 'isRTL:', isRTL);
  
  // Utiliser des composants complètement séparés avec des clés uniques
  if (isRTL) {
    return (
      <LayoutRTL 
        key={`rtl-${currentLocale}`}
        className={className}
        showSidebar={showSidebar}
      >
        {children}
      </LayoutRTL>
    );
  }
  
  return (
    <LayoutLTR 
      key={`ltr-${currentLocale}`}
      className={className}
      showSidebar={showSidebar}
    >
      {children}
    </LayoutLTR>
  );
};

export { Layout };
export default Layout;
