from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import BonDeCommande, HistoriqueBonDeCommande
from .serializers import HistoriqueBonDeCommandeSerializer, HistoriqueBonDeCommandeListSerializer


class HistoriqueBonDeCommandeListView(generics.ListAPIView):
    """
    Vue pour lister l'historique d'un bon de commande
    """
    serializer_class = HistoriqueBonDeCommandeListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        bon_id = self.kwargs['pk']
        return HistoriqueBonDeCommande.objects.filter(
            bon_commande_id=bon_id
        ).select_related('user', 'bon_commande').order_by('-created_at')


class HistoriqueBonDeCommandeDetailView(generics.RetrieveAPIView):
    """
    Vue pour récupérer les détails d'une entrée d'historique
    """
    serializer_class = HistoriqueBonDeCommandeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        bon_id = self.kwargs['pk']
        return HistoriqueBonDeCommande.objects.filter(
            bon_commande_id=bon_id
        ).select_related('user', 'bon_commande')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def historique_bon_commande_stats(request, pk):
    """
    Vue pour récupérer les statistiques de l'historique d'un bon de commande
    """
    try:
        bon = BonDeCommande.objects.get(id=pk)
        
        # Vérifier que l'utilisateur a accès à ce bon de commande
        if not request.user.is_superuser and bon.abattoir != request.user.abattoir:
            return Response(
                {'error': 'Accès non autorisé à ce bon de commande'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Statistiques de l'historique
        historique = HistoriqueBonDeCommande.objects.filter(bon_commande=bon)
        
        stats = {
            'total_actions': historique.count(),
            'actions_par_type': {},
            'derniere_action': None,
            'premiere_action': None,
            'actions_par_utilisateur': {},
            'changements_statut': historique.filter(
                type_action='STATUS_CHANGED'
            ).count(),
            'modifications': historique.filter(
                type_action='UPDATED'
            ).count(),
        }
        
        # Actions par type
        for action_type in HistoriqueBonDeCommande.TYPE_ACTION_CHOICES:
            count = historique.filter(type_action=action_type[0]).count()
            if count > 0:
                stats['actions_par_type'][action_type[1]] = count
        
        # Dernière et première action
        derniere = historique.first()
        premiere = historique.last()
        
        if derniere:
            stats['derniere_action'] = {
                'type': derniere.get_type_action_display(),
                'user': derniere.user.get_full_name() if derniere.user else 'Système',
                'date': derniere.created_at
            }
        
        if premiere:
            stats['premiere_action'] = {
                'type': premiere.get_type_action_display(),
                'user': premiere.user.get_full_name() if premiere.user else 'Système',
                'date': premiere.created_at
            }
        
        # Actions par utilisateur
        for entry in historique.select_related('user'):
            user_name = entry.user.get_full_name() if entry.user else 'Système'
            if user_name not in stats['actions_par_utilisateur']:
                stats['actions_par_utilisateur'][user_name] = 0
            stats['actions_par_utilisateur'][user_name] += 1
        
        return Response(stats)
        
    except BonDeCommande.DoesNotExist:
        return Response(
            {'error': 'Bon de commande non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Erreur lors du calcul des statistiques: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
