import { useQuery } from '@tanstack/react-query';
import { historiqueBonCommandeService, HistoriqueBonDeCommande, HistoriqueBonDeCommandeStats } from '@/lib/api/historiqueBonCommandeService';

// Hook pour récupérer l'historique d'un bon de commande
export const useHistoriqueBonCommande = (bonId: number) => {
  return useQuery({
    queryKey: ['historique-bon-commande', bonId],
    queryFn: () => historiqueBonCommandeService.getHistorique(bonId),
    enabled: !!bonId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour récupérer les détails d'une entrée d'historique
export const useHistoriqueBonCommandeDetail = (bonId: number, historiqueId: number) => {
  return useQuery({
    queryKey: ['historique-bon-commande-detail', bonId, historiqueId],
    queryFn: () => historiqueBonCommandeService.getHistoriqueDetail(bonId, historiqueId),
    enabled: !!bonId && !!historiqueId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour récupérer les statistiques de l'historique
export const useHistoriqueBonCommandeStats = (bonId: number) => {
  return useQuery({
    queryKey: ['historique-bon-commande-stats', bonId],
    queryFn: () => historiqueBonCommandeService.getHistoriqueStats(bonId),
    enabled: !!bonId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
