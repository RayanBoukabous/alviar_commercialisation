import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useSearch } from '@/lib/contexts/SearchContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { 
  Home, 
  Users, 
  ChevronRight,
  Activity,
  Building2,
  Cog,
  User,
  Shield,
  Key,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

// Fonction pour créer les éléments de navigation avec traductions
const createNavigationItems = (t: (namespace: 'sidebar' | 'common', key: string) => string): NavItem[] => [
  {
    id: 'dashboard',
    label: t('sidebar', 'dashboard'),
    href: '/dashboard',
    icon: Home,
  },
  {
    id: 'clients',
    label: t('sidebar', 'clients'),
    href: '/dashboard/clients',
    icon: Building2,
  },
  {
    id: 'configs',
    label: t('sidebar', 'configurations'),
    href: '/dashboard/configs',
    icon: Cog,
  },
  {
    id: 'users',
    label: t('sidebar', 'users'),
    href: '#',
    icon: Users,
    children: [
      {
        id: 'admins',
        label: t('sidebar', 'admin'),
        href: '/dashboard/users/admins',
        icon: User,
      },
      {
        id: 'users-list',
        label: t('sidebar', 'user'),
        href: '/dashboard/users/list',
        icon: User,
      },
    ],
  },
  {
    id: 'roles-permissions',
    label: t('sidebar', 'roles_permissions'),
    href: '#',
    icon: Shield,
    children: [
      {
        id: 'roles',
        label: t('sidebar', 'roles'),
        href: '/dashboard/roles-permissions/roles',
        icon: Shield,
      },
      {
        id: 'permissions',
        label: t('sidebar', 'permissions'),
        href: '/dashboard/roles-permissions/permissions',
        icon: Key,
      },
    ],
  },
  {
    id: 'payment-plans',
    label: t('sidebar', 'payment_plans'),
    href: '/dashboard/payment-plans',
    icon: CreditCard,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const { t, loading } = useLanguage();
  const { searchQuery } = useSearch();

  // Déterminer l'item actif basé sur l'URL actuelle
  const getActiveItem = () => {
    if (pathname.startsWith('/dashboard/clients')) return 'clients';
    if (pathname.startsWith('/dashboard/users/admins')) return 'admins';
    if (pathname.startsWith('/dashboard/users/list')) return 'users-list';
    if (pathname.startsWith('/dashboard/users')) return 'users';
    if (pathname.startsWith('/dashboard/roles-permissions/roles')) return 'roles';
    if (pathname.startsWith('/dashboard/roles-permissions/permissions')) return 'permissions';
    if (pathname.startsWith('/dashboard/roles-permissions')) return 'roles-permissions';
    if (pathname.startsWith('/dashboard/payment-plans')) return 'payment-plans';
    return 'dashboard';
  };

  const activeItem = getActiveItem();
  
  // Créer les éléments de navigation avec les traductions
  const allNavigationItems = createNavigationItems(t);

  // Fonction pour filtrer les éléments de navigation
  const filterNavigationItems = (items: NavItem[], query: string): NavItem[] => {
    if (!query.trim()) return items;
    
    const lowercaseQuery = query.toLowerCase();
    
    return items.map(item => {
      // Vérifier si l'item principal correspond
      const itemMatches = item.label.toLowerCase().includes(lowercaseQuery);
      
      // Si l'item a des enfants, filtrer les enfants
      if (item.children) {
        const filteredChildren = item.children.filter(child => 
          child.label.toLowerCase().includes(lowercaseQuery)
        );
        
        // Si l'item principal correspond OU qu'il y a des enfants qui correspondent
        if (itemMatches || filteredChildren.length > 0) {
          return {
            ...item,
            children: itemMatches ? item.children : filteredChildren
          };
        }
        
        // Si ni l'item ni ses enfants ne correspondent, exclure l'item
        return null;
      }
      
      // Si l'item n'a pas d'enfants, vérifier seulement l'item principal
      return itemMatches ? item : null;
    }).filter((item): item is NavItem => item !== null);
  };

  // Filtrer les éléments de navigation basé sur la recherche
  const navigationItems = filterNavigationItems(allNavigationItems, searchQuery);

  const handleItemClick = (item: NavItem) => {
    // Gestion des sous-éléments
    if (item.children) {
      setExpandedItems(prev => 
        prev.includes(item.id) 
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    }
    
    // Navigation vers la page seulement si ce n'est pas un parent avec des enfants
    if (item.href !== '#' && !item.children) {
      router.push(item.href);
    }
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const Icon = item.icon;
    const isActive = activeItem === item.id;
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors theme-transition text-left',
            level > 0 && 'ml-4',
            isActive
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
              : 'theme-text-secondary hover:theme-bg-secondary hover:theme-text-primary'
          )}
        >
          <div className="flex items-center">
            {Icon && (
              <Icon className={cn(
                'h-5 w-5 mr-3',
                isActive ? 'text-primary-500' : 'theme-text-tertiary'
              )} />
            )}
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-red-900 dark:text-red-200">
                {item.badge}
              </span>
            )}
          </div>
          {hasChildren && (
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform theme-text-tertiary',
                isExpanded && 'rotate-90'
              )}
            />
          )}
        </button>
        
        {/* Sous-éléments */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col w-64 theme-bg-elevated border-r theme-border-primary theme-transition', className)}>
      {/* Logo */}
      <div className="flex items-center h-24 px-4 border-b theme-border-primary">
        <div className="flex items-center">
          <div className="h-35 w-35 relative">
            <Image
              src="/MainLogo.png"
              alt="Liveness Dashboard"
              fill
              className="object-contain"
            />
          </div>

        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : searchQuery && navigationItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-4xl mb-2">🔍</div>
            <div className="text-sm theme-text-tertiary mb-1">
              {t('sidebar', 'no_results') || 'Aucun résultat'}
            </div>
            <div className="text-xs theme-text-tertiary">
              "{searchQuery}"
            </div>
          </div>
        ) : (
          navigationItems.map(item => renderNavItem(item))
        )}
      </nav>

      {/* Footer */}
      <div className="border-t theme-border-primary">
        {/* Sélecteur de langue */}
        <div className="p-3 border-b theme-border-primary">
          <div className="flex justify-center">
            <LanguageSelector compact />
          </div>
        </div>
        
        {/* Informations de version et développeur */}
        <div className="p-4 space-y-3">
          {/* Version */}
          <div className="text-center">
            <div className="text-xs theme-text-tertiary font-medium">
              {t('sidebar', 'version')}
            </div>
          </div>
          
          {/* Développeur */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 relative">
                <Image
                  src="/aiunivers.png"
                  alt="AIUNIVERS"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold theme-text-primary">
                  AIUNIVERS
                </div>
                <div className="text-xs theme-text-tertiary">
                  {t('sidebar', 'developed_by')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Sidebar };
export default Sidebar;
