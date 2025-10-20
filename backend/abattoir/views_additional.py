from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Stabulation


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def ajouter_betes_stabulation(request, pk):
    """Ajouter des bêtes à une stabulation"""
    try:
        stabulation = Stabulation.objects.get(pk=pk)
        
        # Vérifier que l'utilisateur a le droit de modifier cette stabulation
        if not request.user.is_superuser and stabulation.abattoir != request.user.abattoir:
            return Response(
                {'error': 'Vous n\'avez pas le droit de modifier cette stabulation'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        betes_ids = request.data.get('betes_ids', [])
        if not betes_ids:
            return Response(
                {'error': 'Aucune bête spécifiée'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier que les bêtes existent et sont disponibles
        from bete.models import Bete
        betes = Bete.objects.filter(id__in=betes_ids, statut='VIVANT')
        
        if betes.count() != len(betes_ids):
            return Response(
                {'error': 'Certaines bêtes ne sont pas disponibles'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ajouter les bêtes à la stabulation
        stabulation.betes.add(*betes)
        
        # Mettre à jour le statut des bêtes
        betes.update(statut='EN_STABULATION')
        
        return Response({
            'message': f'{len(betes_ids)} bêtes ajoutées avec succès',
            'stabulation': {
                'id': stabulation.id,
                'nombre_betes_actuelles': stabulation.betes.count()
            }
        })
        
    except Stabulation.DoesNotExist:
        return Response(
            {'error': 'Stabulation non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def retirer_betes_stabulation(request, pk):
    """Retirer des bêtes d'une stabulation"""
    try:
        stabulation = Stabulation.objects.get(pk=pk)
        
        # Vérifier que l'utilisateur a le droit de modifier cette stabulation
        if not request.user.is_superuser and stabulation.abattoir != request.user.abattoir:
            return Response(
                {'error': 'Vous n\'avez pas le droit de modifier cette stabulation'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        betes_ids = request.data.get('betes_ids', [])
        if not betes_ids:
            return Response(
                {'error': 'Aucune bête spécifiée'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier que les bêtes sont dans cette stabulation
        betes_dans_stabulation = stabulation.betes.filter(id__in=betes_ids)
        
        if betes_dans_stabulation.count() != len(betes_ids):
            return Response(
                {'error': 'Certaines bêtes ne sont pas dans cette stabulation'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Retirer les bêtes de la stabulation
        stabulation.betes.remove(*betes_dans_stabulation)
        
        # Remettre les bêtes au statut VIVANT
        from bete.models import Bete
        Bete.objects.filter(id__in=betes_ids).update(statut='VIVANT')
        
        return Response({
            'message': f'{len(betes_ids)} bêtes retirées avec succès',
            'stabulation': {
                'id': stabulation.id,
                'nombre_betes_actuelles': stabulation.betes.count()
            }
        })
        
    except Stabulation.DoesNotExist:
        return Response(
            {'error': 'Stabulation non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )



