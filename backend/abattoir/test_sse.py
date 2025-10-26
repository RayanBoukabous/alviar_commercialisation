"""
Test simple pour vérifier que SSE fonctionne
"""
from django.http import StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import time

@csrf_exempt
@require_http_methods(["GET"])
def test_sse_simple(request):
    """
    Test SSE simple pour vérifier la connexion
    """
    def event_stream():
        try:
            # Envoyer un événement de connexion
            yield f"event: connected\n"
            yield f"data: {json.dumps({'message': 'Test SSE connection successful'})}\n\n"
            
            # Envoyer des événements de test toutes les 5 secondes
            for i in range(10):
                time.sleep(5)
                yield f"event: test\n"
                yield f"data: {json.dumps({'message': f'Test event {i+1}', 'timestamp': time.time()})}\n\n"
                
        except Exception as e:
            yield f"event: error\n"
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    response = StreamingHttpResponse(
        event_stream(),
        content_type='text/event-stream'
    )
    
    response['Cache-Control'] = 'no-cache'
    response['Connection'] = 'keep-alive'
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Headers'] = 'Cache-Control'
    
    return response
