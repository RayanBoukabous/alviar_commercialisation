import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface SyncMessage {
  type: 'DATA_UPDATED' | 'STABULATION_CREATED' | 'STABULATION_UPDATED' | 'STABULATION_DELETED' |
  'STABULATION_TERMINATED' | 'STABULATION_CANCELLED' | 'BETE_CREATED' | 'BETE_UPDATED' |
  'BETE_DELETED' | 'TRANSFERT_CREATED' | 'TRANSFERT_UPDATED' | 'TRANSFERT_DELETED' |
  'STOCK_UPDATED' | 'DASHBOARD_STATS_UPDATED' | 'LIVESTOCK_UPDATED';
  data: any;
  timestamp: number;
}

export const useCrossTabSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Créer un canal de communication entre onglets
    const channel = new BroadcastChannel('alviar-sync');

    // Écouter les messages des autres onglets
    const handleMessage = (event: MessageEvent<SyncMessage>) => {
      const { type, data, timestamp } = event.data;

      // Vérifier que le message n'est pas trop ancien (max 5 secondes)
      if (Date.now() - timestamp > 5000) return;

      console.log(`🔄 Synchronisation cross-tab: ${type}`, data);

      switch (type) {
        case 'STABULATION_CREATED':
        case 'STABULATION_UPDATED':
        case 'STABULATION_DELETED':
        case 'STABULATION_TERMINATED':
        case 'STABULATION_CANCELLED':
          // Invalider toutes les requêtes liées aux stabulations
          queryClient.invalidateQueries({
            predicate: (query) => {
              const queryKey = query.queryKey;
              return queryKey.some(key =>
                typeof key === 'string' &&
                (key.includes('stabulation') || key.includes('stabulations'))
              );
            }
          });

          // Invalider aussi les données de bêtes et stock
          queryClient.invalidateQueries({ queryKey: ['betes'] });
          queryClient.invalidateQueries({ queryKey: ['betes-disponibles'] });
          queryClient.invalidateQueries({ queryKey: ['livestock'] });
          queryClient.invalidateQueries({ queryKey: ['stock'] });
          queryClient.invalidateQueries({ queryKey: ['abattoir-stats'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          break;

        case 'BETE_CREATED':
        case 'BETE_UPDATED':
        case 'BETE_DELETED':
          // Invalider les données de bêtes et stock
          queryClient.invalidateQueries({ queryKey: ['betes'] });
          queryClient.invalidateQueries({ queryKey: ['betes-disponibles'] });
          queryClient.invalidateQueries({ queryKey: ['livestock'] });
          queryClient.invalidateQueries({ queryKey: ['stock'] });
          queryClient.invalidateQueries({ queryKey: ['abattoir-stats'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          break;

        case 'TRANSFERT_CREATED':
        case 'TRANSFERT_UPDATED':
        case 'TRANSFERT_DELETED':
          // Invalider les données de transferts et stock
          queryClient.invalidateQueries({ queryKey: ['transferts'] });
          queryClient.invalidateQueries({ queryKey: ['stock'] });
          queryClient.invalidateQueries({ queryKey: ['abattoir-stats'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          break;

        case 'STOCK_UPDATED':
        case 'DASHBOARD_STATS_UPDATED':
        case 'LIVESTOCK_UPDATED':
          // Invalider toutes les données du dashboard
          queryClient.invalidateQueries({ queryKey: ['stock'] });
          queryClient.invalidateQueries({ queryKey: ['abattoir-stats'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['livestock'] });
          queryClient.invalidateQueries({ queryKey: ['betes'] });
          queryClient.invalidateQueries({ queryKey: ['stabulations'] });
          break;

        case 'DATA_UPDATED':
          // Invalider toutes les requêtes
          queryClient.invalidateQueries();
          break;
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [queryClient]);

  // Fonction pour notifier les autres onglets
  const notifyOtherTabs = useCallback((type: SyncMessage['type'], data: any) => {
    const channel = new BroadcastChannel('alviar-sync');
    const message: SyncMessage = {
      type,
      data,
      timestamp: Date.now()
    };

    channel.postMessage(message);
    channel.close();
  }, []);

  return { notifyOtherTabs };
};
