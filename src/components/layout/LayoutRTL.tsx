import React from 'react';
import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SearchProvider } from '@/lib/contexts/SearchContext';

interface LayoutRTLProps {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
}

const LayoutRTL: React.FC<LayoutRTLProps> = ({
  children,
  className,
  showSidebar = true,
}) => {
  console.log('🔄 LayoutRTL rendu - Sidebar à DROITE');
  
  return (
    <SearchProvider>
      <div className="min-h-screen theme-bg-primary theme-transition" dir="rtl">
        <div className="flex relative">
          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0" style={{ marginRight: showSidebar ? '16rem' : '0' }}>
            <Header />
            <main className={cn('flex-1 p-6 theme-bg-primary', className)}>
              {children}
            </main>
          </div>

          {/* Sidebar à DROITE - Position absolue */}
          {showSidebar && (
            <div 
              className="hidden md:flex md:w-64 md:flex-col"
              style={{ 
                position: 'absolute',
                top: 0,
                right: 0,
                height: '100vh',
                zIndex: 10
              }}
            >
              <Sidebar />
            </div>
          )}
        </div>
      </div>
    </SearchProvider>
  );
};

export { LayoutRTL };
export default LayoutRTL;
