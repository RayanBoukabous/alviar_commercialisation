'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Locale = 'fr' | 'en' | 'sr';

interface Translations {
  [key: string]: string;
}

interface TranslationData {
  sidebar: Translations;
  common: Translations;
  header: Translations;
  dashboard: Translations;
  clients: Translations;
  users: Translations;
  configs: Translations;
  admins: Translations;
  roles: Translations;
  permissions: Translations;
  paymentPlans: Translations;
  login: Translations;
  logs: Translations;
}

interface LanguageContextType {
  currentLocale: Locale;
  changeLanguage: (locale: Locale) => void;
  t: (namespace: 'sidebar' | 'common' | 'header' | 'dashboard' | 'clients' | 'users' | 'configs' | 'admins' | 'roles' | 'permissions' | 'paymentPlans' | 'login' | 'logs', key: string) => string | object;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLocale, setCurrentLocale] = useState<Locale>('fr');
  const [translations, setTranslations] = useState<TranslationData>({
    sidebar: {},
    common: {},
    header: {},
    dashboard: {},
    clients: {},
    users: {},
    configs: {},
    admins: {},
    roles: {},
    permissions: {},
    paymentPlans: {},
    login: {},
    logs: {}
  });
  const [loading, setLoading] = useState(true);

  // Charger les traductions
  const loadTranslations = async (locale: Locale) => {
    try {
      setLoading(true);
      console.log(`🌍 Chargement des traductions pour: ${locale}`);
      
      const [sidebarRes, commonRes, headerRes, dashboardRes, clientsRes, usersRes, configsRes, adminsRes, rolesRes, permissionsRes, paymentPlansRes, loginRes, logsRes] = await Promise.all([
        fetch(`/locales/${locale}/sidebar.json`),
        fetch(`/locales/${locale}/common.json`),
        fetch(`/locales/${locale}/header.json`),
        fetch(`/locales/${locale}/dashboard.json`),
        fetch(`/locales/${locale}/clients.json`),
        fetch(`/locales/${locale}/users.json`),
        fetch(`/locales/${locale}/configs.json`),
        fetch(`/locales/${locale}/admins.json`),
        fetch(`/locales/${locale}/roles.json`),
        fetch(`/locales/${locale}/permissions.json`),
        fetch(`/locales/${locale}/paymentPlans.json`),
        fetch(`/locales/${locale}/login.json`),
        fetch(`/locales/${locale}/logs.json`)
      ]);

      if (!sidebarRes.ok || !commonRes.ok || !headerRes.ok || !dashboardRes.ok || !clientsRes.ok || !usersRes.ok || !configsRes.ok || !adminsRes.ok || !rolesRes.ok || !permissionsRes.ok || !paymentPlansRes.ok || !loginRes.ok || !logsRes.ok) {
        throw new Error(`Failed to load translations for ${locale}`);
      }

      const [sidebar, common, header, dashboard, clients, users, configs, admins, roles, permissions, paymentPlans, login, logs] = await Promise.all([
        sidebarRes.json(),
        commonRes.json(),
        headerRes.json(),
        dashboardRes.json(),
        clientsRes.json(),
        usersRes.json(),
        configsRes.json(),
        adminsRes.json(),
        rolesRes.json(),
        permissionsRes.json(),
        paymentPlansRes.json(),
        loginRes.json(),
        logsRes.json()
      ]);

      console.log(`✅ Traductions chargées pour ${locale}:`, { sidebar, common, header, dashboard, clients, users, configs, admins, roles, permissions, paymentPlans, login, logs });
      setTranslations({ sidebar, common, header, dashboard, clients, users, configs, admins, roles, permissions, paymentPlans, login, logs });
    } catch (error) {
      console.error(`❌ Erreur lors du chargement des traductions pour ${locale}:`, error);
      
      // Fallback vers le français si ce n'est pas déjà le français
      if (locale !== 'fr') {
        console.log('🔄 Fallback vers le français...');
        try {
          const [sidebarRes, commonRes, headerRes, dashboardRes, clientsRes, usersRes, configsRes, adminsRes, rolesRes, permissionsRes, paymentPlansRes, loginRes, logsRes] = await Promise.all([
            fetch('/locales/fr/sidebar.json'),
            fetch('/locales/fr/common.json'),
            fetch('/locales/fr/header.json'),
            fetch('/locales/fr/dashboard.json'),
            fetch('/locales/fr/clients.json'),
            fetch('/locales/fr/users.json'),
            fetch('/locales/fr/configs.json'),
            fetch('/locales/fr/admins.json'),
            fetch('/locales/fr/roles.json'),
            fetch('/locales/fr/permissions.json'),
            fetch('/locales/fr/paymentPlans.json'),
            fetch('/locales/fr/login.json'),
            fetch('/locales/fr/logs.json')
          ]);
          const [sidebar, common, header, dashboard, clients, users, configs, admins, roles, permissions, paymentPlans, login, logs] = await Promise.all([
            sidebarRes.json(),
            commonRes.json(),
            headerRes.json(),
            dashboardRes.json(),
            clientsRes.json(),
            usersRes.json(),
            configsRes.json(),
            adminsRes.json(),
            rolesRes.json(),
            permissionsRes.json(),
            paymentPlansRes.json(),
            loginRes.json(),
            logsRes.json()
          ]);
          setTranslations({ sidebar, common, header, dashboard, clients, users, configs, admins, roles, permissions, paymentPlans, login, logs });
        } catch (fallbackError) {
          console.error('❌ Erreur lors du fallback:', fallbackError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Charger la langue préférée au démarrage
  useEffect(() => {
    const savedLocale = localStorage.getItem('preferred-language') as Locale;
    const initialLocale = savedLocale && ['fr', 'en', 'sr'].includes(savedLocale) ? savedLocale : 'fr';
    setCurrentLocale(initialLocale);
    loadTranslations(initialLocale);
  }, []);

  // Charger les traductions quand la langue change
  useEffect(() => {
    if (currentLocale) {
      loadTranslations(currentLocale);
    }
  }, [currentLocale]);

  const changeLanguage = (locale: Locale) => {
    console.log(`🔄 Changement de langue vers: ${locale}`);
    setCurrentLocale(locale);
    localStorage.setItem('preferred-language', locale);
  };

  const t = (namespace: 'sidebar' | 'common' | 'header' | 'dashboard' | 'clients' | 'users' | 'configs' | 'admins' | 'roles' | 'permissions' | 'paymentPlans' | 'login' | 'logs', key: string): string | object => {
    const translation = translations[namespace]?.[key];
    if (!translation) {
      console.warn(`⚠️ Traduction manquante: ${namespace}.${key} pour la langue ${currentLocale}`);
      return key; // Retourner la clé si la traduction n'existe pas
    }
    return translation;
  };

  const value: LanguageContextType = {
    currentLocale,
    changeLanguage,
    t,
    loading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
