import React from 'react';
import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SearchProvider } from '@/lib/contexts/SearchContext';

interface LayoutLTRProps {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
}

const LayoutLTR: React.FC<LayoutLTRProps> = ({
  children,
  className,
  showSidebar = true,
}) => {
  console.log('🔄 LayoutLTR rendu - Sidebar à GAUCHE');
  
  return (
    <SearchProvider>
      <div className="min-h-screen theme-bg-primary theme-transition" dir="ltr">
        <div className="flex">
          {/* Sidebar à GAUCHE */}
          {showSidebar && (
            <div className="hidden md:flex md:w-64 md:flex-col print:hidden">
              <Sidebar />
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header className="print:hidden" />
            <main className={cn('flex-1 p-6 theme-bg-primary print:p-0', className)}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </SearchProvider>
  );
};

export { LayoutLTR };
export default LayoutLTR;

