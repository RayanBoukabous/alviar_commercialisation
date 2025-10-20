from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Espece
from .serializers import EspeceSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def espece_list(request):
    """Récupérer la liste des espèces"""
    try:
        especes = Espece.objects.all().order_by('nom')
        serializer = EspeceSerializer(especes, many=True)
        return Response({
            'results': serializer.data,
            'count': especes.count()
        })
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de la récupération des espèces: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

