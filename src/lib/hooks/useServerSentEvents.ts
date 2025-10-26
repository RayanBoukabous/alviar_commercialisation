/**
 * Hook professionnel pour Server-Sent Events (SSE)
 * Optimisé pour éviter la saturation serveur et garantir la synchronisation temps réel
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useDjangoAuth';

interface SSEEvent {
    type: string;
    data: any;
    timestamp: number;
}

interface SSEConnection {
    eventSource: EventSource | null;
    isConnected: boolean;
    reconnectAttempts: number;
    lastPing: number;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 secondes
const PING_TIMEOUT = 60000; // 1 minute

export const useServerSentEvents = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

    const connectionRef = useRef<SSEConnection>({
        eventSource: null,
        isConnected: false,
        reconnectAttempts: 0,
        lastPing: Date.now()
    });

    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Fonction pour nettoyer les timeouts
    const clearTimeouts = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (pingTimeoutRef.current) {
            clearTimeout(pingTimeoutRef.current);
            pingTimeoutRef.current = null;
        }
    }, []);

    // Fonction pour gérer les événements SSE
    const handleSSEEvent = useCallback((event: MessageEvent) => {
        try {
            console.log('📡 Raw SSE Event:', event.type, event.data);
            console.log('📡 Event details:', {
                type: event.type,
                data: event.data,
                origin: event.origin,
                lastEventId: event.lastEventId
            });

            const sseEvent: SSEEvent = JSON.parse(event.data);

            console.log('🔄 SSE Event received:', sseEvent.type, sseEvent.data);

            // Mettre à jour le timestamp du dernier ping
            connectionRef.current.lastPing = Date.now();

            // Traiter les événements selon le type
            switch (sseEvent.type) {
                case 'STABULATION_CREATED':
                case 'STABULATION_UPDATED':
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

                    // Invalider aussi les données de bêtes et dashboard
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
                    // Invalider les données de bêtes et dashboard
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
                    // Invalider les données de transferts et dashboard
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

                case 'ping':
                    // Répondre au ping pour maintenir la connexion
                    console.log('🏓 SSE Ping received');
                    break;

                case 'connected':
                    console.log('✅ SSE Connected successfully');
                    console.log('✅ Connection details:', {
                        abattoirId: sseEvent.data?.abattoir_id,
                        message: sseEvent.data?.message,
                        timestamp: sseEvent.timestamp
                    });
                    setConnectionStatus('connected');
                    setIsConnected(true);
                    connectionRef.current.isConnected = true;
                    connectionRef.current.reconnectAttempts = 0;
                    break;

                default:
                    console.log('📡 Unknown SSE event:', sseEvent.type);
            }
        } catch (error) {
            console.error('❌ Error parsing SSE event:', error);
        }
    }, [queryClient]);

    // Fonction pour gérer les erreurs SSE
    const handleSSEError = useCallback((error: Event) => {
        console.error('❌ SSE Error:', error);
        console.error('❌ SSE Error details:', {
            type: error.type,
            target: error.target,
            currentTarget: error.currentTarget,
            isTrusted: error.isTrusted
        });
        setConnectionStatus('error');
        setIsConnected(false);
        connectionRef.current.isConnected = false;

        // Nettoyer la connexion actuelle
        if (connectionRef.current.eventSource) {
            connectionRef.current.eventSource.close();
            connectionRef.current.eventSource = null;
        }

        // Tentative de reconnexion si pas trop d'échecs
        if (connectionRef.current.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            connectionRef.current.reconnectAttempts++;
            console.log(`🔄 Attempting to reconnect (${connectionRef.current.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);

            setConnectionStatus('connecting');

            reconnectTimeoutRef.current = setTimeout(() => {
                connectSSE();
            }, RECONNECT_DELAY * connectionRef.current.reconnectAttempts);
        } else {
            console.error('❌ Max reconnection attempts reached');
            setConnectionStatus('disconnected');
        }
    }, []);

    // Fonction pour se connecter au SSE
    const connectSSE = useCallback(() => {
        if (!user) return;

        // Nettoyer les timeouts précédents
        clearTimeouts();

        // Fermer la connexion existante
        if (connectionRef.current.eventSource) {
            connectionRef.current.eventSource.close();
        }

        // Déterminer l'abattoir pour le SSE
        const abattoirId = user.is_superuser ? 'global' : (user.abattoir?.id || 'global');

        // Créer la connexion SSE avec authentification
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const sseUrl = `${apiUrl}/api/abattoirs/events/stabulations/?abattoir_id=${abattoirId}`;

        console.log(`🔌 Connecting to SSE: ${sseUrl}`);
        console.log(`🔌 User:`, user);
        console.log(`🔌 Abattoir ID:`, abattoirId);

        console.log('🔌 Creating EventSource with URL:', sseUrl);
        console.log('🔌 EventSource options:', { withCredentials: true });

        // L'EventSource ne peut pas envoyer de headers personnalisés
        // On doit utiliser une approche différente pour l'authentification
        const eventSource = new EventSource(sseUrl, {
            withCredentials: true
        });

        console.log('🔌 EventSource created:', eventSource);
        console.log('🔌 EventSource readyState:', eventSource.readyState);
        console.log('🔌 EventSource URL:', eventSource.url);

        connectionRef.current.eventSource = eventSource;
        setConnectionStatus('connecting');

        // Écouter les événements
        console.log('🔌 Adding event listeners...');
        eventSource.addEventListener('message', handleSSEEvent);
        eventSource.addEventListener('connected', handleSSEEvent);
        eventSource.addEventListener('ping', handleSSEEvent);
        eventSource.addEventListener('STABULATION_CREATED', handleSSEEvent);
        eventSource.addEventListener('STABULATION_UPDATED', handleSSEEvent);
        eventSource.addEventListener('STABULATION_TERMINATED', handleSSEEvent);
        eventSource.addEventListener('STABULATION_CANCELLED', handleSSEEvent);
        eventSource.addEventListener('BETE_CREATED', handleSSEEvent);
        eventSource.addEventListener('BETE_UPDATED', handleSSEEvent);
        eventSource.addEventListener('BETE_DELETED', handleSSEEvent);
        eventSource.addEventListener('TRANSFERT_CREATED', handleSSEEvent);
        eventSource.addEventListener('TRANSFERT_UPDATED', handleSSEEvent);
        eventSource.addEventListener('TRANSFERT_DELETED', handleSSEEvent);
        eventSource.addEventListener('STOCK_UPDATED', handleSSEEvent);
        eventSource.addEventListener('DASHBOARD_STATS_UPDATED', handleSSEEvent);
        eventSource.addEventListener('LIVESTOCK_UPDATED', handleSSEEvent);

        // Gérer les erreurs
        eventSource.onerror = handleSSEError;

        // Ajouter des listeners pour les états de connexion
        eventSource.onopen = () => {
            console.log('🔌 EventSource onopen triggered');
            console.log('🔌 EventSource readyState after open:', eventSource.readyState);
        };

        console.log('🔌 Event listeners added successfully');

        // Timeout pour détecter les connexions mortes
        pingTimeoutRef.current = setTimeout(() => {
            const timeSinceLastPing = Date.now() - connectionRef.current.lastPing;
            if (timeSinceLastPing > PING_TIMEOUT) {
                console.warn('⚠️ SSE connection timeout - no ping received');
                handleSSEError(new Event('timeout'));
            }
        }, PING_TIMEOUT);

        console.log(`🔌 Connecting to SSE for abattoir: ${abattoirId}`);
    }, [user, handleSSEEvent, handleSSEError, clearTimeouts]);

    // Fonction pour déconnecter le SSE
    const disconnectSSE = useCallback(() => {
        clearTimeouts();

        if (connectionRef.current.eventSource) {
            connectionRef.current.eventSource.close();
            connectionRef.current.eventSource = null;
        }

        setIsConnected(false);
        setConnectionStatus('disconnected');
        connectionRef.current.isConnected = false;

        console.log('🔌 SSE Disconnected');
    }, [clearTimeouts]);

    // Connexion automatique au montage
    useEffect(() => {
        if (user) {
            connectSSE();
        }

        return () => {
            disconnectSSE();
        };
    }, [user, connectSSE, disconnectSSE]);

    // Reconnexion automatique en cas de perte de focus
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user && !connectionRef.current.isConnected) {
                console.log('🔄 Page became visible - reconnecting SSE');
                connectSSE();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user, connectSSE]);

    return {
        isConnected,
        connectionStatus,
        connect: connectSSE,
        disconnect: disconnectSSE
    };
};
