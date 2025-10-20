from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count, Sum
from .models import BonDeCommande
from .serializers import (
    BonDeCommandeSerializer,
    BonDeCommandeCreateSerializer,
    BonDeCommandeUpdateStatusSerializer
)


class BonDeCommandeListCreateView(generics.ListCreateAPIView):
    """
    Liste et création des bons de commande
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = BonDeCommande.objects.select_related(
            'abattoir', 'client', 'created_by'
        )
        
        # Si l'utilisateur n'est pas superuser, filtrer par son abattoir
        if not user.is_superuser and user.abattoir:
            queryset = queryset.filter(abattoir=user.abattoir)
        
        # Filtres optionnels
        statut = self.request.GET.get('statut', None)
        if statut:
            queryset = queryset.filter(statut=statut)
        
        client_id = self.request.GET.get('client_id', None)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        abattoir_id = self.request.GET.get('abattoir_id', None)
        if abattoir_id:
            queryset = queryset.filter(abattoir_id=abattoir_id)
        
        # Recherche
        search = self.request.GET.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(numero_bon__icontains=search) |
                Q(client__nom__icontains=search) |
                Q(notes__icontains=search)
            )
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BonDeCommandeCreateSerializer
        return BonDeCommandeSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class BonDeCommandeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détail, mise à jour et suppression d'un bon de commande
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = BonDeCommande.objects.select_related(
            'abattoir', 'client', 'created_by'
        )
        
        if not user.is_superuser and user.abattoir:
            queryset = queryset.filter(abattoir=user.abattoir)
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return BonDeCommandeCreateSerializer
        return BonDeCommandeSerializer
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Vérifier si le bon est modifiable
        if not instance.est_modifiable:
            return Response(
                {'error': 'Ce bon de commande ne peut plus être modifié.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Seuls les brouillons peuvent être supprimés
        if instance.statut != 'BROUILLON':
            return Response(
                {'error': 'Seuls les bons en brouillon peuvent être supprimés.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_bon_status(request, pk):
    """Mettre à jour le statut d'un bon de commande"""
    try:
        user = request.user
        bon = BonDeCommande.objects.select_related('abattoir', 'client').get(pk=pk)
        
        # Vérifier les permissions
        if not user.is_superuser and user.abattoir != bon.abattoir:
            return Response(
                {'error': 'Vous n\'avez pas la permission de modifier ce bon.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = BonDeCommandeUpdateStatusSerializer(
            bon, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            # Retourner le bon complet avec toutes les infos
            full_serializer = BonDeCommandeSerializer(bon)
            return Response(full_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except BonDeCommande.DoesNotExist:
        return Response(
            {'error': 'Bon de commande non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def annuler_bon(request, pk):
    """Annuler un bon de commande"""
    try:
        user = request.user
        bon = BonDeCommande.objects.get(pk=pk)
        
        # Vérifier les permissions
        if not user.is_superuser and user.abattoir != bon.abattoir:
            return Response(
                {'error': 'Vous n\'avez pas la permission de modifier ce bon.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier si le bon peut être annulé
        if not bon.est_annulable:
            return Response(
                {'error': 'Ce bon de commande ne peut pas être annulé.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        bon.statut = 'ANNULE'
        bon.save()
        
        serializer = BonDeCommandeSerializer(bon)
        return Response(serializer.data)
    
    except BonDeCommande.DoesNotExist:
        return Response(
            {'error': 'Bon de commande non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def bon_commande_stats(request):
    """Statistiques sur les bons de commande"""
    user = request.user
    
    # Base queryset
    queryset = BonDeCommande.objects.all()
    
    if not user.is_superuser and user.abattoir:
        queryset = queryset.filter(abattoir=user.abattoir)
    
    # Statistiques par statut
    stats_by_status = queryset.values('statut').annotate(
        count=Count('id'),
        total_quantite=Sum('quantite')
    )
    
    # Statistiques par type de bête
    stats_by_type_bete = queryset.values('type_bete').annotate(
        count=Count('id')
    )
    
    # Statistiques globales
    total_bons = queryset.count()
    bons_en_cours = queryset.filter(statut__in=['CONFIRME', 'EN_COURS']).count()
    bons_livres = queryset.filter(statut='LIVRE').count()
    
    return Response({
        'total_bons': total_bons,
        'bons_en_cours': bons_en_cours,
        'bons_livres': bons_livres,
        'stats_by_status': list(stats_by_status),
        'stats_by_type_bete': list(stats_by_type_bete),
    })
