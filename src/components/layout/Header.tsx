import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useSearch } from '@/lib/contexts/SearchContext';
import { Bell, Search, User, Settings, LogOut, X } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const { logout } = useAuth();
  const { t, loading } = useLanguage();
  const { searchQuery, setSearchQuery, clearSearch } = useSearch();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  // Si les traductions sont en cours de chargement, afficher un loader
  if (loading) {
    return (
      <header className={cn('theme-bg-elevated shadow-sm border-b theme-border-primary theme-transition', className)}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-48 rounded"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-8 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={cn('theme-bg-elevated shadow-sm border-b theme-border-primary theme-transition', className)}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et titre */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold theme-text-primary">
                {t('header', 'title')}
              </h1>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 theme-text-tertiary" />
              </div>
              <input
                type="text"
                placeholder={t('header', 'search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border rounded-md leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm theme-transition theme-border-primary theme-bg-elevated theme-text-primary dark:placeholder-slate-400"
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setIsSearchOpen(false)}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:theme-text-primary transition-colors"
                >
                  <X className="h-4 w-4 theme-text-tertiary" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle size="sm" />

            {/* Notifications */}
            <button className="relative p-2 theme-text-tertiary hover:theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md theme-transition">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

            {/* Menu utilisateur */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 theme-text-primary hover:theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md theme-transition"
              >
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {t('header', 'admin')}
                </span>
              </button>

              {/* Dropdown menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 theme-bg-elevated rounded-md shadow-lg py-1 z-50 border theme-border-primary">
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm theme-text-primary hover:theme-bg-secondary theme-transition"
                  >
                    <User className="h-4 w-4 mr-3" />
                    {t('header', 'profile')}
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm theme-text-primary hover:theme-bg-secondary theme-transition"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    {t('header', 'settings')}
                  </a>
                  <hr className="my-1 theme-border-primary" />
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm theme-text-primary hover:theme-bg-secondary theme-transition"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    {t('header', 'logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export { Header };
export default Header;
