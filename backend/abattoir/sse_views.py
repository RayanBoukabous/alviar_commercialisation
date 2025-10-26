"""
Server-Sent Events (SSE) pour la synchronisation temps réel des stabulations
Architecture optimisée pour éviter la saturation serveur
"""
import json
import time
import threading
from django.http import StreamingHttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.cache import cache
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Stabulation
from .serializers import StabulationSerializer
import logging

logger = logging.getLogger(__name__)

# Store des connexions SSE actives
SSE_CONNECTIONS = {}
SSE_LOCK = threading.Lock()

class SSEManager:
    """Gestionnaire professionnel des connexions SSE"""
    
    @staticmethod
    def add_connection(user_id, abattoir_id, connection):
        """Ajouter une connexion SSE"""
        with SSE_LOCK:
            if user_id not in SSE_CONNECTIONS:
                SSE_CONNECTIONS[user_id] = {}
            SSE_CONNECTIONS[user_id][abattoir_id] = {
                'connection': connection,
                'last_ping': time.time(),
                'user_id': user_id,
                'abattoir_id': abattoir_id
            }
            logger.info(f"SSE connection added for user {user_id}, abattoir {abattoir_id}")
    
    @staticmethod
    def remove_connection(user_id, abattoir_id):
        """Supprimer une connexion SSE"""
        with SSE_LOCK:
            if user_id in SSE_CONNECTIONS and abattoir_id in SSE_CONNECTIONS[user_id]:
                del SSE_CONNECTIONS[user_id][abattoir_id]
                if not SSE_CONNECTIONS[user_id]:
                    del SSE_CONNECTIONS[user_id]
                logger.info(f"SSE connection removed for user {user_id}, abattoir {abattoir_id}")
    
    @staticmethod
    def broadcast_to_abattoir(abattoir_id, event_type, data):
        """Diffuser un événement à tous les clients d'un abattoir"""
        with SSE_LOCK:
            connections_to_notify = []
            for user_id, user_connections in SSE_CONNECTIONS.items():
                for conn_abattoir_id, conn_data in user_connections.items():
                    if conn_abattoir_id == abattoir_id or conn_abattoir_id == 'global':
                        connections_to_notify.append(conn_data['connection'])
            
            # Envoyer l'événement à toutes les connexions concernées
            for connection in connections_to_notify:
                try:
                    SSEManager._send_sse_event(connection, event_type, data)
                except Exception as e:
                    logger.error(f"Error sending SSE event: {e}")
    
    @staticmethod
    def broadcast_to_superusers(event_type, data):
        """Diffuser un événement aux superusers uniquement"""
        with SSE_LOCK:
            for user_id, user_connections in SSE_CONNECTIONS.items():
                for conn_abattoir_id, conn_data in user_connections.items():
                    if conn_abattoir_id == 'global':  # Superusers
                        try:
                            SSEManager._send_sse_event(conn_data['connection'], event_type, data)
                        except Exception as e:
                            logger.error(f"Error sending SSE to superuser: {e}")
    
    @staticmethod
    def _send_sse_event(connection, event_type, data):
        """Envoyer un événement SSE formaté"""
        event_data = {
            'type': event_type,
            'data': data,
            'timestamp': time.time()
        }
        
        # Format SSE standard
        sse_message = f"event: {event_type}\n"
        sse_message += f"data: {json.dumps(event_data)}\n\n"
        
        connection.write(sse_message.encode('utf-8'))
        connection.flush()
    
    @staticmethod
    def cleanup_stale_connections():
        """Nettoyer les connexions inactives (appelé périodiquement)"""
        current_time = time.time()
        stale_timeout = 300  # 5 minutes
        
        with SSE_LOCK:
            to_remove = []
            for user_id, user_connections in SSE_CONNECTIONS.items():
                for abattoir_id, conn_data in user_connections.items():
                    if current_time - conn_data['last_ping'] > stale_timeout:
                        to_remove.append((user_id, abattoir_id))
            
            for user_id, abattoir_id in to_remove:
                SSEManager.remove_connection(user_id, abattoir_id)

def sse_stabulations_stream(request):
    """
    Endpoint SSE pour les événements de stabulations
    Optimisé pour éviter la saturation serveur
    """
    # Vérifier l'authentification par session Django ou token
    if not request.user.is_authenticated:
        # Essayer l'authentification par token
        from rest_framework.authtoken.models import Token
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Token '):
            token_key = auth_header.split(' ')[1]
            try:
                token = Token.objects.get(key=token_key)
                request.user = token.user
            except Token.DoesNotExist:
                from django.http import JsonResponse
                print(f"❌ SSE Token authentication failed")
                return JsonResponse({'error': 'Authentication required'}, status=401)
        else:
            from django.http import JsonResponse
            print(f"❌ SSE Authentication failed for user: {request.user}")
            return JsonResponse({'error': 'Authentication required'}, status=401)
    
    user = request.user
    abattoir_id = request.GET.get('abattoir_id', 'global')
    
    print(f"🔌 SSE Connection attempt from user: {user.username} (ID: {user.id})")
    print(f"🔌 SSE Abattoir ID: {abattoir_id}")
    print(f"🔌 SSE User is superuser: {user.is_superuser}")
    
    def event_stream():
        """Générateur d'événements SSE"""
        connection = None
        try:
            # Créer un objet de connexion pour stocker la référence
            class SSEConnection:
                def __init__(self):
                    self.buffer = []
                
                def write(self, data):
                    self.buffer.append(data)
                
                def flush(self):
                    pass
            
            connection = SSEConnection()
            
            # Ajouter la connexion
            SSEManager.add_connection(user.id, abattoir_id, connection)
            
            # Envoyer un événement de connexion
            yield f"event: connected\n"
            yield f"data: {json.dumps({'message': 'Connected to stabulation events', 'abattoir_id': abattoir_id})}\n\n"
            
            # Ping périodique pour maintenir la connexion
            last_ping = time.time()
            ping_interval = 30  # Ping toutes les 30 secondes
            
            # Envoyer un ping initial
            yield f"event: ping\n"
            yield f"data: {json.dumps({'timestamp': time.time()})}\n\n"
            
            # Boucle principale avec timeout plus court
            while True:
                try:
                    current_time = time.time()
                    
                    # Ping de maintien de connexion
                    if current_time - last_ping >= ping_interval:
                        yield f"event: ping\n"
                        yield f"data: {json.dumps({'timestamp': current_time})}\n\n"
                        last_ping = current_time
                    
                    # Vérifier les données en cache Redis
                    cache_key = f"stabulation_events_{abattoir_id}"
                    cached_events = cache.get(cache_key, [])
                    
                    if cached_events:
                        # Envoyer les événements en cache
                        for event in cached_events:
                            yield f"event: {event['type']}\n"
                            yield f"data: {json.dumps(event['data'])}\n\n"
                        
                        # Nettoyer le cache après envoi
                        cache.delete(cache_key)
                    
                    # Utiliser un timeout plus court pour éviter de bloquer le worker
                    import select
                    import sys
                    if hasattr(select, 'select'):
                        # Sur Unix, utiliser select pour un timeout non-bloquant
                        ready, _, _ = select.select([], [], [], 0.1)  # 100ms timeout
                    else:
                        # Sur Windows, utiliser un sleep plus court
                        time.sleep(0.1)
                        
                except Exception as e:
                    logger.error(f"SSE loop error: {e}")
                    break
                
        except GeneratorExit:
            # Connexion fermée par le client
            SSEManager.remove_connection(user.id, abattoir_id)
            logger.info(f"SSE connection closed for user {user.id}")
        except Exception as e:
            logger.error(f"SSE stream error: {e}")
            SSEManager.remove_connection(user.id, abattoir_id)
    
    response = StreamingHttpResponse(
        event_stream(),
        content_type='text/event-stream'
    )
    
    # Headers SSE optimisés
    response['Cache-Control'] = 'no-cache'
    response['Connection'] = 'keep-alive'
    # CORS sera géré par le middleware corsheaders
    response['Access-Control-Allow-Headers'] = 'Cache-Control'
    
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trigger_stabulation_event(request):
    """
    Déclencher un événement SSE pour une stabulation
    Utilisé par les mutations pour notifier les clients
    """
    try:
        event_type = request.data.get('event_type')
        stabulation_id = request.data.get('stabulation_id')
        abattoir_id = request.data.get('abattoir_id')
        
        if not all([event_type, stabulation_id, abattoir_id]):
            return Response(
                {'error': 'Missing required fields'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Récupérer les données de la stabulation
        try:
            stabulation = Stabulation.objects.get(id=stabulation_id)
            stabulation_data = StabulationSerializer(stabulation).data
        except Stabulation.DoesNotExist:
            return Response(
                {'error': 'Stabulation not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Préparer l'événement
        event_data = {
            'stabulation': stabulation_data,
            'abattoir_id': abattoir_id,
            'timestamp': time.time()
        }
        
        # Mettre en cache Redis pour diffusion
        cache_key = f"stabulation_events_{abattoir_id}"
        cached_events = cache.get(cache_key, [])
        cached_events.append({
            'type': event_type,
            'data': event_data
        })
        
        # TTL intelligent : 60 secondes pour les événements
        cache.set(cache_key, cached_events, 60)
        
        # Diffuser immédiatement aux connexions actives
        SSEManager.broadcast_to_abattoir(abattoir_id, event_type, event_data)
        
        # Si c'est un superuser, diffuser aussi globalement
        if request.user.is_superuser:
            SSEManager.broadcast_to_superusers(event_type, event_data)
        
        logger.info(f"SSE event triggered: {event_type} for stabulation {stabulation_id}")
        
        return Response({
            'message': 'Event triggered successfully',
            'event_type': event_type,
            'stabulation_id': stabulation_id
        })
        
    except Exception as e:
        logger.error(f"Error triggering SSE event: {e}")
        return Response(
            {'error': 'Internal server error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sse_connection_status(request):
    """Statut des connexions SSE actives"""
    with SSE_LOCK:
        active_connections = len(SSE_CONNECTIONS)
        total_connections = sum(len(connections) for connections in SSE_CONNECTIONS.values())
        
        return Response({
            'active_users': active_connections,
            'total_connections': total_connections,
            'connections': {
                user_id: list(connections.keys()) 
                for user_id, connections in SSE_CONNECTIONS.items()
            }
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_sse_auth(request):
    """Test simple pour vérifier l'authentification SSE"""
    return Response({
        'message': 'SSE Authentication successful',
        'user': request.user.username,
        'user_id': request.user.id,
        'is_superuser': request.user.is_superuser
    })

# Nettoyage périodique des connexions inactives
def cleanup_sse_connections():
    """Tâche périodique pour nettoyer les connexions SSE inactives"""
    SSEManager.cleanup_stale_connections()
