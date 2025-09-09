import { useLanguage } from '@/lib/contexts/LanguageContext';

export const useTranslation = (namespace: string) => {
    const { t: contextT, loading, currentLocale } = useLanguage();

    const t = (key: string, params?: Record<string, unknown>): string => {
        // Handle nested keys (e.g., "createPlan.title")
        if (key.includes('.')) {
            const keys = key.split('.');
            const rootKey = keys[0];

            // Get the root object from the namespace
            const rootTranslation = contextT(namespace as 'sidebar' | 'common' | 'header' | 'dashboard' | 'clients' | 'configs' | 'admins' | 'roles' | 'permissions' | 'paymentPlans' | 'login', rootKey);

            if (typeof rootTranslation === 'object' && rootTranslation !== null) {
                // Navigate through nested keys
                let current = rootTranslation;
                for (let i = 1; i < keys.length; i++) {
                    const k = keys[i];
                    if (current && typeof current === 'object' && k in current) {
                        current = current[k];
                    } else {
                        console.warn(`⚠️ Traduction manquante: ${namespace}.${key} pour la langue ${currentLocale}`);
                        return key;
                    }
                }

                // Replace parameters if provided
                if (params && typeof current === 'string') {
                    Object.entries(params).forEach(([paramKey, paramValue]) => {
                        current = current.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
                    });
                }

                return typeof current === 'string' ? current : key;
            } else {
                console.warn(`⚠️ Traduction manquante: ${namespace}.${key} pour la langue ${currentLocale}`);
                return key;
            }
        } else {
            // Handle simple keys
            const translation = contextT(namespace as 'sidebar' | 'common' | 'header' | 'dashboard' | 'clients' | 'configs' | 'admins' | 'roles' | 'permissions' | 'paymentPlans' | 'login', key);

            // Replace parameters if provided
            if (params && typeof translation === 'string') {
                let result = translation;
                Object.entries(params).forEach(([paramKey, paramValue]) => {
                    result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
                });
                return result;
            }

            return typeof translation === 'string' ? translation : key;
        }
    };

    return { t, loading, locale: currentLocale };
};

