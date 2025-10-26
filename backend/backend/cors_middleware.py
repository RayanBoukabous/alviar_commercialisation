"""
Middleware personnalisé pour gérer les requêtes CORS de manière plus robuste
"""
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin


class CustomCorsMiddleware(MiddlewareMixin):
    """
    Middleware personnalisé pour gérer les requêtes CORS
    """
    
    def process_request(self, request):
        """
        Traite les requêtes OPTIONS (preflight) pour CORS
        """
        if request.method == 'OPTIONS':
            response = JsonResponse({})
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
            response['Access-Control-Allow-Headers'] = (
                'accept, accept-encoding, authorization, content-type, '
                'dnt, origin, user-agent, x-csrftoken, x-requested-with, '
                'cache-control, pragma, expires'
            )
            response['Access-Control-Max-Age'] = '86400'
            response['Access-Control-Allow-Credentials'] = 'true'
            return response
        return None

    def process_response(self, request, response):
        """
        Ajoute les headers CORS à toutes les réponses
        """
        # Headers CORS pour toutes les réponses
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
        response['Access-Control-Allow-Headers'] = (
            'accept, accept-encoding, authorization, content-type, '
            'dnt, origin, user-agent, x-csrftoken, x-requested-with, '
            'cache-control, pragma, expires'
        )
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Max-Age'] = '86400'
        
        return response




