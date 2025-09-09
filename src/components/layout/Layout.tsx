import React from 'react';
import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SearchProvider } from '@/lib/contexts/SearchContext';

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
  return (
    <SearchProvider>
      <div className="min-h-screen theme-bg-primary theme-transition">
        <div className="flex">
          {/* Sidebar */}
          {showSidebar && (
            <div className="hidden md:flex md:w-64 md:flex-col">
              <Sidebar />
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <Header />

            {/* Page content */}
            <main className={cn('flex-1 p-6 theme-bg-primary', className)}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </SearchProvider>
  );
};

export { Layout };
export default Layout;
