'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, Locale } from '@/lib/contexts/LanguageContext';

const languages = [
  { code: 'fr' as Locale, name: 'Français', flag: '🇫🇷' },
  { code: 'en' as Locale, name: 'English', flag: '🇺🇸' },
  { code: 'sr' as Locale, name: 'Српски', flag: '🇷🇸' },
];

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { currentLocale, changeLanguage, t } = useLanguage();
  const currentLanguage = languages.find(lang => lang.code === currentLocale);

  if (compact) {
    return (
      <div className="relative group">
        <button className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:theme-bg-secondary theme-text-secondary hover:theme-text-primary transition-all duration-200 text-xs">
          <span className="text-sm">{currentLanguage?.flag}</span>
          <span className="font-medium">{currentLanguage?.name}</span>
          <svg className="w-3 h-3 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Dropdown compact */}
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border theme-border-primary opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
          <div className="py-2">
            <div className="px-3 py-1 text-xs font-semibold theme-text-tertiary uppercase tracking-wider border-b theme-border-primary">
              {t('common', 'language')}
            </div>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`w-full flex items-center space-x-2 px-3 py-2 text-xs transition-all duration-200 hover:theme-bg-secondary ${
                  currentLocale === language.code
                    ? 'theme-text-primary bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500'
                    : 'theme-text-secondary hover:theme-text-primary'
                }`}
              >
                <span className="text-sm">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
                {currentLocale === language.code && (
                  <span className="ml-auto text-primary-500 font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 transition-all duration-200">
        <Globe className="h-4 w-4" />
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className="text-sm font-medium">{currentLanguage?.name}</span>
        <svg className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown */}
      <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-emerald-200 dark:border-slate-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 backdrop-blur-sm">
        <div className="py-3">
          <div className="px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border-b border-emerald-100 dark:border-slate-700">
            {t('common', 'language')}
          </div>
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 ${
                currentLocale === language.code
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-r-2 border-emerald-500'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="font-medium">{language.name}</span>
              {currentLocale === language.code && (
                <span className="ml-auto text-emerald-500 font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
