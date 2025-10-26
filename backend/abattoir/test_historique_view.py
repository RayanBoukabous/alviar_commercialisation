from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def test_historique_view(request):
    """Vue de test pour l'historique"""
    return Response({
        'message': 'Test historique view works!',
        'user': request.user.username
    })
