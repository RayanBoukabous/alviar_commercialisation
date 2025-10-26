'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Temps avant que les données soient considérées comme obsolètes
            staleTime: 60 * 1000, // 1 minute
            // Temps de cache des données
            gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
            // Retry automatique en cas d'erreur
            retry: (failureCount, error: any) => {
              // Ne pas retry pour les erreurs 401 (non autorisé)
              if (error?.response?.status === 401) {
                return false;
              }
              // Retry jusqu'à 3 fois pour les autres erreurs
              return failureCount < 3;
            },
            // Délai entre les retry
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch automatique quand la fenêtre reprend le focus
            refetchOnWindowFocus: false,
            // Refetch automatique lors de la reconnexion réseau
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry pour les mutations
            retry: (failureCount, error: any) => {
              // Ne pas retry pour les erreurs 4xx (erreurs client)
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools seulement en développement */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}








