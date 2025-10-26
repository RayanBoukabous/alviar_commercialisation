'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  isRTL: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = React.memo(({ isRTL }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }

    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  if (!mounted) {
    return null;
  }

  const themes = [
    {
      value: 'light',
      label: isRTL ? 'فاتح' : 'Clair',
      icon: Sun,
      description: isRTL ? 'الوضع الفاتح' : 'Mode clair'
    },
    {
      value: 'dark',
      label: isRTL ? 'داكن' : 'Sombre',
      icon: Moon,
      description: isRTL ? 'الوضع الداكن' : 'Mode sombre'
    },
    {
      value: 'system',
      label: isRTL ? 'النظام' : 'Système',
      icon: Monitor,
      description: isRTL ? 'يتبع إعدادات النظام' : 'Suit les paramètres du système'
    }
  ];

  return (
    <div className="relative">
      <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {themes.map((themeOption) => {
          const IconComponent = themeOption.icon;
          const isActive = theme === themeOption.value;
          
          return (
            <button
              key={themeOption.value}
              onClick={() => handleThemeChange(themeOption.value as 'light' | 'dark' | 'system')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={themeOption.description}
            >
              <IconComponent className="h-4 w-4" />
              <span className="hidden sm:inline">{themeOption.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

ThemeToggle.displayName = 'ThemeToggle';
