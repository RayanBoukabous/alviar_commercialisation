import { djangoApi } from './djangoAuthService';

// Types pour les bêtes
export interface Bete {
  id: number;
  numero_identification: string;
  num_boucle_post_abattage?: string; // Numéro post-abattage
  nom?: string;
  espece: {
    id: number;
    nom: string;
  };
  espece_nom?: string; // Champ direct du sérialiseur
  race?: {
    id: number;
    nom: string;
  };
  sexe: 'M' | 'F';
  date_naissance?: string;
  poids_vif?: number;
  poids_a_chaud?: number;
  poids_a_froid?: number;
  statut: 'VIVANT' | 'EN_STABULATION' | 'ABATTU' | 'MALADE' | 'MORT';
  etat_sante: 'BON' | 'MALADE';
  abattage_urgence: boolean;
  abattoir?: {
    id: number;
    nom: string;
    wilaya: string;
    commune: string;
  };
  abattoir_nom?: string; // Champ direct du sérialiseur
  responsable?: {
    id: number;
    username: string;
    full_name: string;
  };
  created_by?: {
    id: number;
    username: string;
    full_name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface LivestockResponse {
  betes: Bete[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  statistics: {
    total_count: number;
    live_count: number;
    carcass_count: number;
    total_weight: number;
    average_weight: number;
    especes_stats: Array<{
      espece__nom: string;
      count: number;
    }>;
  };
  user_type: 'superuser' | 'regular';
  abattoir_name: string;
}

export interface LivestockFilters {
  statut?: 'VIVANT' | 'ABATTU' | 'MALADE' | 'MORT';
  espece_id?: number;
  espece_nom?: string;
  etat_sante?: 'BON' | 'MALADE';
  abattoir_id?: number;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface CarcassStatistics {
  statistics: {
    total_count: number;
    total_carcass_weight: number;
    total_live_weight: number;
    average_carcass_weight: number;
    average_live_weight: number;
    fresh_count: number;
    chilled_count: number;
    frozen_count: number;
  };
  quality_stats: Array<{
    etat_sante: string;
    count: number;
  }>;
  especes_stats: Array<{
    espece__nom: string;
    count: number;
    total_carcass_weight: number;
    total_live_weight: number;
  }>;
  user_type: 'superuser' | 'regular';
  abattoir_name: string;
}

// Service pour les bêtes
export const livestockService = {
  // Obtenir les bêtes pour la page livestock
  async getLivestock(filters: LivestockFilters = {}): Promise<LivestockResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.statut) params.append('statut', filters.statut);
      if (filters.espece_id) params.append('espece_id', filters.espece_id.toString());
      if (filters.espece_nom) params.append('espece_nom', filters.espece_nom);
      if (filters.etat_sante) params.append('etat_sante', filters.etat_sante);
      if (filters.abattoir_id) params.append('abattoir_id', filters.abattoir_id.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.page_size) params.append('page_size', filters.page_size.toString());

      const url = `/betes/livestock/?${params.toString()}`;
      console.log('API Call URL:', url);
      console.log('Filters passed:', filters);

      const response = await djangoApi.get(url);
      return response.data as LivestockResponse;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des bêtes');
    }
  },

  // Obtenir les détails d'une bête spécifique
  async getBeteDetails(id: number): Promise<Bete> {
    try {
      const response = await djangoApi.get(`/betes/${id}/`);
      return response.data as Bete;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des détails de la bête');
    }
  },

  // Mettre à jour une bête
  async updateBete(id: number, data: Partial<Bete>): Promise<Bete> {
    try {
      const response = await djangoApi.patch(`/betes/${id}/`, data);
      return response.data as Bete;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la mise à jour de la bête');
    }
  },

  // Obtenir les bêtes vivantes (inclut VIVANT et EN_STABULATION par défaut)
  async getLiveLivestock(filters: LivestockFilters = {}): Promise<LivestockResponse> {
    try {
      const params = new URLSearchParams();

      // Gérer le filtre statut : par défaut VIVANT et EN_STABULATION, sinon utiliser le filtre fourni
      if (filters.statut) {
        // Si un statut spécifique est demandé, l'utiliser
        params.append('statut', filters.statut);
      } else {
        // Par défaut, inclure les bêtes VIVANT et EN_STABULATION
        params.append('statut', 'VIVANT');
        params.append('statut', 'EN_STABULATION');
      }

      if (filters.espece_id) params.append('espece_id', filters.espece_id.toString());
      if (filters.espece_nom) params.append('espece_nom', filters.espece_nom);
      if (filters.etat_sante) params.append('etat_sante', filters.etat_sante);
      if (filters.abattoir_id) params.append('abattoir_id', filters.abattoir_id.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.page_size) params.append('page_size', filters.page_size.toString());

      const url = `/betes/livestock/?${params.toString()}`;
      console.log('API Call URL (getLiveLivestock):', url);
      console.log('Filters passed:', filters);

      const response = await djangoApi.get(url);
      return response.data as LivestockResponse;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des bêtes vivantes');
    }
  },

  // Obtenir les carcasses
  async getCarcasses(filters: Omit<LivestockFilters, 'statut'> = {}): Promise<LivestockResponse> {
    return this.getLivestock({ ...filters, statut: 'ABATTU' });
  },

  // Obtenir les statistiques générales
  async getLivestockStats(): Promise<LivestockResponse> {
    return this.getLivestock({ page_size: 1 }); // On récupère juste les stats
  },

  // Obtenir les statistiques des carcasses
  async getCarcassStatistics(filters: Omit<LivestockFilters, 'statut'> = {}): Promise<CarcassStatistics> {
    try {
      const params = new URLSearchParams();

      if (filters.espece_nom) params.append('espece_nom', filters.espece_nom);
      if (filters.etat_sante) params.append('etat_sante', filters.etat_sante);
      if (filters.search) params.append('search', filters.search);

      const url = `/betes/carcass-statistics/?${params.toString()}`;
      console.log('API Call URL:', url);

      const response = await djangoApi.get(url);
      return response.data as CarcassStatistics;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques des carcasses:', error);
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des statistiques des carcasses');
    }
  }
};
