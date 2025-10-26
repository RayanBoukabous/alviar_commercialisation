import { api } from './apiService';

// Types pour les données de stock
export interface StockData {
  bêtes_vivantes: number;
  bêtes_en_stabulation: number;
  carcasses_en_stock: number;
  transferts_en_cours: number;
}

export interface StockResponse {
  stock_data: StockData;
  user_type: 'superuser' | 'regular';
  abattoir_name: string;
  last_updated: string;
}

// Service pour les données de stock
export const stockService = {
  // Obtenir les données de stock pour le dashboard
  async getStockData(abattoirId?: number): Promise<StockResponse> {
    try {
      const params = new URLSearchParams();
      if (abattoirId) {
        params.append('abattoir_id', abattoirId.toString());
      }

      const url = `/abattoirs/stock-data/${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des données de stock:', error);
      throw new Error('Erreur lors de la récupération des données de stock');
    }
  }
};
