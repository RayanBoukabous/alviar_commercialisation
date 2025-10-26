import { djangoApi } from './djangoAuthService';

// Types pour les statistiques d'abattoir
export interface AbattoirStats {
    total_users: number;
    total_clients: number;
    total_superusers: number;
    total_betes: number;
    abattoir_info: {
        id: number;
        nom: string;
        wilaya: string;
        commune: string;
        actif: boolean;
    };
}

export interface DashboardStats {
    users_count: number;
    clients_count: number;
    superusers_count: number;
    betes_count: number;
    abattoir_name: string;
    abattoir_location: string;
}

export interface AbattoirForChart {
    id: number;
    nom: string;
    wilaya: string;
    commune: string;
    location: string;
}

export interface AbattoirsForChartsResponse {
    abattoirs: AbattoirForChart[];
    user_type: 'superuser' | 'regular';
    total_count: number;
}

export interface Abattoir {
    id: number;
    nom: string;
    wilaya: string;
    commune: string;
    actif: boolean;
}

// Types pour les statistiques détaillées du bétail d'un abattoir
export interface AbattoirLivestockStats {
    abattoir_id: number;
    abattoir_name: string;
    total_count: number;
    healthy_count: number;
    sick_count: number;
    slaughtered_today: number;
    species_breakdown: {
        [species: string]: {
            total: number;
            healthy: number;
            sick: number;
        };
    };
    health_breakdown: {
        BON: number;
        MOYEN: number;
        MAUVAIS: number;
    };
    status_breakdown: {
        VIVANT: number;
        ABATTU: number;
        MALADE: number;
        MORT: number;
    };
}

// Service pour les statistiques d'abattoir
export const abattoirStatsService = {
    // Obtenir les statistiques de l'abattoir de l'utilisateur connecté
    async getMyAbattoirStats(): Promise<AbattoirStats> {
        try {
            const response = await djangoApi.get('/abattoirs/my-stats/');
            return response.data;
        } catch (error: any) {
            throw new Error('Erreur lors de la récupération des statistiques d\'abattoir');
        }
    },

    // Obtenir les statistiques globales (pour les superviseurs)
    async getGlobalStats(): Promise<AbattoirStats> {
        try {
            const response = await djangoApi.get('/abattoirs/global-stats/');
            return response.data;
        } catch (error: any) {
            throw new Error('Erreur lors de la récupération des statistiques globales');
        }
    },

    // Obtenir les statistiques selon le type d'utilisateur
    async getDashboardStats(): Promise<DashboardStats> {
        try {
            const response = await djangoApi.get('/abattoirs/dashboard-stats/');
            return response.data;
        } catch (error: any) {
            throw new Error('Erreur lors de la récupération des statistiques du dashboard');
        }
    },

    // Obtenir la liste des abattoirs pour les graphiques
    async getAbattoirsForCharts(): Promise<AbattoirsForChartsResponse> {
        try {
            const response = await djangoApi.get('/abattoirs/abattoirs-for-charts/');
            return response.data;
        } catch (error: any) {
            throw new Error('Erreur lors de la récupération des abattoirs pour les graphiques');
        }
    },

    // Obtenir la liste des abattoirs pour les filtres
    async getAbattoirsList(): Promise<Abattoir[]> {
        try {
            const response = await djangoApi.get('/abattoirs/?page_size=100'); // Récupérer tous les abattoirs
            console.log('🔍 API Response:', response.data);
            return response.data.results || response.data;
        } catch (error: any) {
            console.error('❌ Erreur API abattoirs:', error);
            throw new Error('Erreur lors de la récupération de la liste des abattoirs');
        }
    },

    // Obtenir les statistiques détaillées du bétail d'un abattoir spécifique
    async getAbattoirLivestockStats(abattoirId: number): Promise<AbattoirLivestockStats> {
        try {
            const response = await djangoApi.get(`/abattoirs/${abattoirId}/livestock-stats/`);
            return response.data;
        } catch (error: any) {
            throw new Error('Erreur lors de la récupération des statistiques du bétail de l\'abattoir');
        }
    }
};
