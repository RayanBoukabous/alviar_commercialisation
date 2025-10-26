from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from django.db import transaction
from .models import Espece, Bete
from .serializers import (
    EspeceSerializer, BeteCreateSerializer, BeteSerializer, BeteHistorySerializer
)


class EspeceListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer des espèces"""
    
    queryset = Espece.objects.all()
    serializer_class = EspeceSerializer
    permission_classes = [permissions.IsAuthenticated]


class EspeceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer une espèce"""
    
    queryset = Espece.objects.all()
    serializer_class = EspeceSerializer
    permission_classes = [permissions.IsAuthenticated]



class BeteListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer des bêtes"""
    
    queryset = Bete.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BeteCreateSerializer
        return BeteSerializer
    
    def get_queryset(self):
        """Filtrage des bêtes"""
        queryset = Bete.objects.select_related('espece', 'race', 'responsable', 'created_by')
        
        # Filtrage par statut
        statut = self.request.query_params.get('statut', None)
        if statut:
            queryset = queryset.filter(statut=statut)
        
        # Filtrage par espèce
        espece_id = self.request.query_params.get('espece_id', None)
        if espece_id:
            queryset = queryset.filter(espece_id=espece_id)
        
        # Filtrage par race
        race_id = self.request.query_params.get('race_id', None)
        if race_id:
            queryset = queryset.filter(race_id=race_id)
        
        # Filtrage par sexe
        sexe = self.request.query_params.get('sexe', None)
        if sexe:
            queryset = queryset.filter(sexe=sexe)
        
        # Filtrage par recherche
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(numero_identification__icontains=search) |
                Q(nom__icontains=search) |
                Q(espece__nom__icontains=search) |
                Q(race__nom__icontains=search)
            )
        
        return queryset.order_by('-created_at')


class BeteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer une bête"""
    
    queryset = Bete.objects.select_related('espece', 'abattoir', 'created_by')
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return BeteCreateSerializer
        return BeteSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def betes_for_livestock(request):
    """Récupérer les bêtes pour la page livestock selon le type d'utilisateur"""
    user = request.user
    
    # Base queryset
    queryset = Bete.objects.select_related('espece', 'abattoir', 'created_by')
    
    # Filtrage selon le type d'utilisateur
    if user.is_superuser:
        # Superuser voit toutes les bêtes
        pass
    else:
        # Autres utilisateurs voient seulement les bêtes de leur abattoir
        if user.abattoir:
            queryset = queryset.filter(abattoir=user.abattoir)
        else:
            # Si pas d'abattoir assigné, retourner une liste vide
            queryset = Bete.objects.none()
    
    # Filtrage par statut (support de plusieurs statuts)
    statuts = request.query_params.getlist('statut')
    
    if statuts:
        # Normaliser la casse pour tous les statuts
        statuts_normalized = [statut.strip().upper() for statut in statuts]
        queryset = queryset.filter(statut__in=statuts_normalized)
    else:
        # Par défaut, montrer les bêtes vivantes et en stabulation
        queryset = queryset.filter(statut__in=['VIVANT', 'EN_STABULATION'])
    
    # Filtrage par espèce
    espece_id = request.query_params.get('espece_id', None)
    if espece_id:
        queryset = queryset.filter(espece_id=espece_id)
    
    # Filtrage par nom d'espèce
    espece_nom = request.query_params.get('espece_nom', None)
    if espece_nom:
        # Debug: afficher le filtre appliqué
        print(f"Debug - Filtre espece_nom appliqué: '{espece_nom}'")
        # Filtrage insensible à la casse avec correspondance exacte
        queryset = queryset.filter(espece__nom__iexact=espece_nom)
        print(f"Debug - Queryset count après filtre espèce: {queryset.count()}")
    
    # Filtrage par état de santé
    etat_sante = request.query_params.get('etat_sante', None)
    if etat_sante:
        # Normaliser la casse pour l'état de santé
        etat_sante_normalized = etat_sante.strip().upper()
        queryset = queryset.filter(etat_sante=etat_sante_normalized)
    
    # Filtrage par abattoir (seulement pour les superusers)
    abattoir_id = request.query_params.get('abattoir_id', None)
    if abattoir_id and user.is_superuser:
        queryset = queryset.filter(abattoir_id=abattoir_id)
    
    # Filtrage par recherche
    search = request.query_params.get('search', None)
    if search:
        queryset = queryset.filter(
            Q(num_boucle__icontains=search) |
            Q(espece__nom__icontains=search) |
            Q(abattoir__nom__icontains=search)
        )
    
    # Pagination
    page_size = int(request.query_params.get('page_size', 20))
    page = int(request.query_params.get('page', 1))
    
    start = (page - 1) * page_size
    end = start + page_size
    
    betes = queryset.order_by('-created_at')[start:end]
    
    # Sérialisation
    serializer = BeteSerializer(betes, many=True)
    
    # Statistiques
    total_count = queryset.count()
    live_count = queryset.filter(statut__in=['VIVANT', 'EN_STABULATION']).count()
    carcass_count = queryset.filter(statut='ABATTU').count()
    
    # Statistiques de poids
    from django.db.models import Sum, Avg
    weight_stats = queryset.aggregate(
        total_weight=Sum('poids_vif'),
        average_weight=Avg('poids_vif')
    )
    
    # Statistiques par espèce (grouper par nom normalisé)
    from django.db.models import Case, When, Value, CharField
    especes_stats = queryset.annotate(
        espece_nom_normalized=Case(
            When(espece__nom__iexact='ovin', then=Value('OVIN')),
            When(espece__nom__iexact='bovin', then=Value('BOVIN')),
            When(espece__nom__iexact='caprin', then=Value('CAPRIN')),
            default='espece__nom',
            output_field=CharField()
        )
    ).values('espece_nom_normalized').annotate(
        count=Count('id')
    ).order_by('-count')
    
    
    return Response({
        'betes': serializer.data,
        'pagination': {
            'page': page,
            'page_size': page_size,
            'total_count': total_count,
            'total_pages': (total_count + page_size - 1) // page_size,
            'has_next': end < total_count,
            'has_previous': page > 1
        },
        'statistics': {
            'total_count': total_count,
            'live_count': live_count,
            'carcass_count': carcass_count,
            'total_weight': float(weight_stats['total_weight'] or 0),
            'average_weight': float(weight_stats['average_weight'] or 0),
            'especes_stats': [{'espece__nom': item['espece_nom_normalized'], 'count': item['count']} for item in especes_stats]
        },
        'user_type': 'superuser' if user.is_superuser else 'regular',
        'abattoir_name': user.abattoir.nom if user.abattoir else 'Tous les abattoirs'
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def carcass_statistics(request):
    """Récupérer les statistiques des carcasses (bêtes abattues)"""
    user = request.user
    
    # Base queryset pour les bêtes abattues
    queryset = Bete.objects.filter(statut='ABATTU').select_related('espece', 'abattoir')
    
    # Filtrage selon le type d'utilisateur
    if not user.is_superuser and user.abattoir:
        queryset = queryset.filter(abattoir=user.abattoir)
    
    # Filtrage par espèce
    espece_nom = request.query_params.get('espece_nom', None)
    if espece_nom:
        queryset = queryset.filter(espece__nom__iexact=espece_nom)
    
    # Filtrage par état de santé
    etat_sante = request.query_params.get('etat_sante', None)
    if etat_sante:
        queryset = queryset.filter(etat_sante=etat_sante.upper())
    
    # Filtrage par recherche
    search = request.query_params.get('search', None)
    if search:
        queryset = queryset.filter(
            Q(num_boucle__icontains=search) |
            Q(espece__nom__icontains=search) |
            Q(abattoir__nom__icontains=search)
        )
    
    # Calcul des statistiques
    from django.db.models import Sum, Avg, Count
    
    # Statistiques de base
    total_count = queryset.count()
    
    # Statistiques de poids
    weight_stats = queryset.aggregate(
        total_carcass_weight=Sum('poids_a_chaud'),
        total_live_weight=Sum('poids_vif'),
        average_carcass_weight=Avg('poids_a_chaud'),
        average_live_weight=Avg('poids_vif')
    )
    
    # Statistiques par qualité (état de santé)
    quality_stats = queryset.values('etat_sante').annotate(
        count=Count('id')
    ).order_by('etat_sante')
    
    # Statistiques par espèce
    especes_stats = queryset.values('espece__nom').annotate(
        count=Count('id'),
        total_carcass_weight=Sum('poids_a_chaud'),
        total_live_weight=Sum('poids_vif')
    ).order_by('-count')
    
    # Statistiques par statut de fraîcheur (basé sur la date de mise à jour)
    from django.utils import timezone
    from datetime import timedelta
    
    now = timezone.now()
    fresh_count = queryset.filter(updated_at__gte=now - timedelta(days=7)).count()
    chilled_count = queryset.filter(
        updated_at__lt=now - timedelta(days=7),
        updated_at__gte=now - timedelta(days=30)
    ).count()
    frozen_count = queryset.filter(updated_at__lt=now - timedelta(days=30)).count()
    
    return Response({
        'statistics': {
            'total_count': total_count,
            'total_carcass_weight': float(weight_stats['total_carcass_weight'] or 0),
            'total_live_weight': float(weight_stats['total_live_weight'] or 0),
            'average_carcass_weight': round(float(weight_stats['average_carcass_weight'] or 0), 2),
            'average_live_weight': round(float(weight_stats['average_live_weight'] or 0), 2),
            'fresh_count': fresh_count,
            'chilled_count': chilled_count,
            'frozen_count': frozen_count
        },
        'quality_stats': list(quality_stats),
        'especes_stats': list(especes_stats),
        'user_type': 'superuser' if user.is_superuser else 'regular',
        'abattoir_name': user.abattoir.nom if user.abattoir else 'Tous les abattoirs'
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def bete_history(request, pk):
    """Récupérer l'historique complet des modifications d'une bête"""
    try:
        bete = Bete.objects.get(pk=pk)
    except Bete.DoesNotExist:
        return Response(
            {'error': 'Bête non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Vérifier les permissions
    user = request.user
    if not user.is_superuser and user.abattoir != bete.abattoir:
        return Response(
            {'error': 'Vous n\'avez pas la permission de voir l\'historique de cette bête'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Récupérer tout l'historique de la bête
    history_records = bete.history.all().order_by('-history_date')
    
    # Pagination
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 20))
    start = (page - 1) * page_size
    end = start + page_size
    
    total_count = history_records.count()
    paginated_records = history_records[start:end]
    
    # Sérialiser les données
    serializer = BeteHistorySerializer(paginated_records, many=True)
    
    return Response({
        'bete': {
            'id': bete.id,
            'num_boucle': bete.num_boucle,
            'espece_nom': bete.espece.nom if bete.espece else None,
        },
        'history': serializer.data,
        'pagination': {
            'page': page,
            'page_size': page_size,
            'total': total_count,
            'total_pages': (total_count + page_size - 1) // page_size,
            'has_next': end < total_count,
            'has_previous': page > 1
        }
    })


