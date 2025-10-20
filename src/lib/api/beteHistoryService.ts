import { djangoApi } from './djangoAuthService';

export interface BeteHistoryChange {
    field: string;
    label: string;
    old_value: string | null;
    new_value: string | null;
}

export interface BeteHistoryUser {
    id: number;
    username: string;
    full_name: string;
}

export interface BeteHistoryRecord {
    history_id: number;
    history_date: string;
    history_type: '+' | '~' | '-'; // + = création, ~ = modification, - = suppression
    history_user: BeteHistoryUser | null;

    // Données de la bête à ce moment-là
    num_boucle: string;
    num_boucle_post_abattage: string;
    espece_nom: string;
    sexe: string;
    sexe_display: string;
    poids_vif: number | null;
    poids_a_chaud: number | null;
    poids_a_froid: number | null;
    statut: string;
    statut_display: string;
    etat_sante: string;
    etat_sante_display: string;
    abattage_urgence: boolean;
    abattoir_nom: string | null;

    // Changements par rapport à la version précédente
    changes: BeteHistoryChange[] | null;
}

export interface BeteHistoryResponse {
    bete: {
        id: number;
        num_boucle: string;
        espece_nom: string;
    };
    history: BeteHistoryRecord[];
    pagination: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
        has_next: boolean;
        has_previous: boolean;
    };
}

/**
 * Récupère l'historique complet des modifications d'une bête
 */
export const getBeteHistory = async (
    beteId: number,
    page: number = 1,
    pageSize: number = 20
): Promise<BeteHistoryResponse> => {
    try {
        const response = await djangoApi.get(`/betes/${beteId}/history/`, {
            params: {
                page,
                page_size: pageSize,
            },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error fetching bete history:', error);
        throw new Error(
            error.response?.data?.error ||
            error.response?.data?.detail ||
            'Erreur lors de la récupération de l\'historique'
        );
    }
};

/**
 * Récupère le type d'action en français
 */
export const getHistoryTypeLabel = (type: string, isRTL: boolean = false): string => {
    const labels: Record<string, { fr: string; ar: string }> = {
        'C': { fr: 'Création', ar: 'إنشاء' },
        'U': { fr: 'Modification', ar: 'تعديل' },
        'D': { fr: 'Suppression', ar: 'حذف' },
        '+': { fr: 'Création', ar: 'إنشاء' },
        '~': { fr: 'Modification', ar: 'تعديل' },
        '-': { fr: 'Suppression', ar: 'حذف' },
    };
    return isRTL ? labels[type]?.ar || type : labels[type]?.fr || type;
};

/**
 * Récupère la couleur associée au type d'action
 */
export const getHistoryTypeColor = (type: string): { bg: string; text: string; border: string } => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
        'C': {
            bg: 'bg-green-100 dark:bg-green-900/30',
            text: 'text-green-800 dark:text-green-200',
            border: 'border-green-300 dark:border-green-700',
        },
        'U': {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-800 dark:text-blue-200',
            border: 'border-blue-300 dark:border-blue-700',
        },
        'D': {
            bg: 'bg-red-100 dark:bg-red-900/30',
            text: 'text-red-800 dark:text-red-200',
            border: 'border-red-300 dark:border-red-700',
        },
        '+': {
            bg: 'bg-green-100 dark:bg-green-900/30',
            text: 'text-green-800 dark:text-green-200',
            border: 'border-green-300 dark:border-green-700',
        },
        '~': {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-800 dark:text-blue-200',
            border: 'border-blue-300 dark:border-blue-700',
        },
        '-': {
            bg: 'bg-red-100 dark:bg-red-900/30',
            text: 'text-red-800 dark:text-red-200',
            border: 'border-red-300 dark:border-red-700',
        },
    };
    return colors[type] || colors['U'];
};

