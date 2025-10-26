import { djangoApi } from './djangoAuthService';

// Interface pour les statistiques du dashboard
export interface DashboardStatistics {
    nombre_betes: number;
    nombre_carcasses: number;
    transferts_aujourdhui: number;
    animaux_stabulation: number;
    stats_supplementaires: {
        betes_par_statut: Array<{
            statut: string;
            count: number;
        }>;
        transferts_par_statut: Array<{
            statut: string;
            count: number;
        }>;
        betes_par_espece: Array<{
            espece__nom: string;
            count: number;
        }>;
        transferts_7_derniers_jours: number;
        betes_ajoutees_aujourdhui: number;
    };
    date_actualisation: string;
    abattoir_nom: string;
    abattoir_location: string;
}

// Service pour le dashboard
export const dashboardService = {
    // Récupérer les statistiques du dashboard
    async getDashboardStatistics(): Promise<DashboardStatistics> {
        const response = await djangoApi.get('/abattoirs/dashboard-statistics/');
        return response.data as DashboardStatistics;
    }
};

export default dashboardService;
