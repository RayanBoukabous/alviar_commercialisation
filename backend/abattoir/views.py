from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count, Sum
from django.utils import timezone
from .models import Abattoir, ChambreFroide, HistoriqueChambreFroide, Stabulation
from .views_additional import ajouter_betes_stabulation, retirer_betes_stabulation
from .serializers import (
    AbattoirSerializer, ChambreFroideSerializer, HistoriqueChambreFroideSerializer,
    AbattoirStatsSerializer, StabulationSerializer, StabulationCreateSerializer,
    StabulationUpdateSerializer, StabulationStatsSerializer
)


class AbattoirListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer des abattoirs"""
    
    queryset = Abattoir.objects.all()
    serializer_class = AbattoirSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtrage des abattoirs"""
        queryset = Abattoir.objects.select_related('responsable')
        
        # Filtrage par statut actif
        actif = self.request.query_params.get('actif', None)
        if actif is not None:
            queryset = queryset.filter(actif=actif.lower() == 'true')
        
        # Filtrage par wilaya
        wilaya = self.request.query_params.get('wilaya', None)
        if wilaya:
            queryset = queryset.filter(wilaya__icontains=wilaya)
        
        # Filtrage par commune
        commune = self.request.query_params.get('commune', None)
        if commune:
            queryset = queryset.filter(commune__icontains=commune)
        
        # Filtrage par capacité minimale
        capacite_min = self.request.query_params.get('capacite_min', None)
        if capacite_min:
            queryset = queryset.filter(
                Q(capacite_reception_ovin__gte=capacite_min) |
                Q(capacite_reception_bovin__gte=capacite_min)
            )
        
        # Filtrage par recherche
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) |
                Q(wilaya__icontains=search) |
                Q(commune__icontains=search)
            )
        
        return queryset.order_by('wilaya', 'commune', 'nom')


class AbattoirDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer un abattoir"""
    
    queryset = Abattoir.objects.all()
    serializer_class = AbattoirSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def abattoir_stats(request):
    """Statistiques des abattoirs"""
    
    # Statistiques générales
    total_abattoirs = Abattoir.objects.count()
    abattoirs_actifs = Abattoir.objects.filter(actif=True).count()
    
    # Statistiques par wilaya
    abattoirs_par_wilaya = Abattoir.objects.values('wilaya').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Capacités totales
    capacite_totale_ovin = Abattoir.objects.filter(actif=True).aggregate(
        total=Sum('capacite_reception_ovin')
    )['total'] or 0
    
    capacite_totale_bovin = Abattoir.objects.filter(actif=True).aggregate(
        total=Sum('capacite_reception_bovin')
    )['total'] or 0
    
    capacite_totale_stabulation = Abattoir.objects.filter(actif=True).aggregate(
        total=Sum('capacite_stabulation_ovin') + Sum('capacite_stabulation_bovin')
    )['total'] or 0
    
    stats = {
        'total_abattoirs': total_abattoirs,
        'abattoirs_actifs': abattoirs_actifs,
        'abattoirs_par_wilaya': {item['wilaya']: item['count'] for item in abattoirs_par_wilaya},
        'capacite_totale_ovin': capacite_totale_ovin,
        'capacite_totale_bovin': capacite_totale_bovin,
        'capacite_totale_stabulation': capacite_totale_stabulation
    }
    
    # Statistiques des chambres froides
    total_chambres_froides = ChambreFroide.objects.count()
    capacite_totale_chambres_froides = ChambreFroide.objects.aggregate(
        total=Sum('dimensions_m3')
    )['total'] or 0
    
    stats.update({
        'total_chambres_froides': total_chambres_froides,
        'capacite_totale_chambres_froides': round(capacite_totale_chambres_froides, 2)
    })
    
    serializer = AbattoirStatsSerializer(stats)
    return Response(serializer.data)


class ChambreFroideListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer des chambres froides"""
    
    queryset = ChambreFroide.objects.all()
    serializer_class = ChambreFroideSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtrage des chambres froides"""
        queryset = ChambreFroide.objects.select_related('abattoir')
        
        # Filtrage par abattoir
        abattoir_id = self.request.query_params.get('abattoir_id', None)
        if abattoir_id:
            queryset = queryset.filter(abattoir_id=abattoir_id)
        
        # Filtrage par recherche
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(numero__icontains=search) |
                Q(abattoir__nom__icontains=search) |
                Q(abattoir__wilaya__icontains=search) |
                Q(abattoir__commune__icontains=search)
            )
        
        return queryset.order_by('abattoir', 'numero')


class ChambreFroideDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer une chambre froide"""
    
    queryset = ChambreFroide.objects.all()
    serializer_class = ChambreFroideSerializer
    permission_classes = [permissions.IsAuthenticated]


class HistoriqueChambreFroideListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer des mesures de température"""
    
    queryset = HistoriqueChambreFroide.objects.all()
    serializer_class = HistoriqueChambreFroideSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtrage des mesures de température"""
        queryset = HistoriqueChambreFroide.objects.select_related(
            'chambre_froide', 'chambre_froide__abattoir', 'mesure_par'
        )
        
        # Filtrage par chambre froide
        chambre_froide_id = self.request.query_params.get('chambre_froide_id', None)
        if chambre_froide_id:
            queryset = queryset.filter(chambre_froide_id=chambre_froide_id)
        
        # Filtrage par abattoir
        abattoir_id = self.request.query_params.get('abattoir_id', None)
        if abattoir_id:
            queryset = queryset.filter(chambre_froide__abattoir_id=abattoir_id)
        
        # Filtrage par date
        date_debut = self.request.query_params.get('date_debut', None)
        date_fin = self.request.query_params.get('date_fin', None)
        if date_debut:
            queryset = queryset.filter(date_mesure__date__gte=date_debut)
        if date_fin:
            queryset = queryset.filter(date_mesure__date__lte=date_fin)
        
        return queryset.order_by('-date_mesure')
    
    def perform_create(self, serializer):
        """Associe automatiquement l'utilisateur connecté à la mesure"""
        serializer.save(mesure_par=self.request.user)


class HistoriqueChambreFroideDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer une mesure de température"""
    
    queryset = HistoriqueChambreFroide.objects.all()
    serializer_class = HistoriqueChambreFroideSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_abattoir_stats(request):
    """Statistiques de l'abattoir de l'utilisateur connecté"""
    user = request.user
    
    # Si l'utilisateur n'a pas d'abattoir assigné, retourner des statistiques vides
    if not user.abattoir:
        return Response({
            'total_users': 0,
            'total_clients': 0,
            'total_superusers': 0,
            'total_betes': 0,
            'abattoir_info': None
        })
    
    abattoir = user.abattoir
    
    # Compter les utilisateurs de cet abattoir
    from users.models import User
    total_users = User.objects.filter(abattoir=abattoir).count()
    total_superusers = User.objects.filter(abattoir=abattoir, user_type='SUPERVISEUR').count()
    
    # Les clients ne sont pas assignés à un abattoir spécifique
    # Pour les utilisateurs non-superviseurs, afficher 0
    total_clients = 0
    
    # Compter les bêtes de cet abattoir (si vous avez une relation)
    from bete.models import Bete
    total_betes = Bete.objects.filter(abattoir=abattoir).count()
    
    return Response({
        'total_users': total_users,
        'total_clients': total_clients,
        'total_superusers': total_superusers,
        'total_betes': total_betes,
        'abattoir_info': {
            'id': abattoir.id,
            'nom': abattoir.nom,
            'wilaya': abattoir.wilaya,
            'commune': abattoir.commune,
            'actif': abattoir.actif
        }
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def global_stats(request):
    """Statistiques globales (pour les superviseurs uniquement)"""
    user = request.user
    
    # Vérifier si l'utilisateur est un superviseur
    if not user.is_superviseur:
        return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
    
    # Compter tous les utilisateurs, clients et bêtes
    from users.models import User
    from client.models import Client
    from bete.models import Bete
    
    total_users = User.objects.count()
    total_superusers = User.objects.filter(user_type='SUPERVISEUR').count()
    total_clients = Client.objects.count()
    total_betes = Bete.objects.count()
    
    return Response({
        'total_users': total_users,
        'total_clients': total_clients,
        'total_superusers': total_superusers,
        'total_betes': total_betes,
        'abattoir_info': {
            'id': 0,
            'nom': 'Tous les abattoirs',
            'wilaya': 'Global',
            'commune': 'Global',
            'actif': True
        }
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def abattoirs_for_charts(request):
    """Récupérer la liste des abattoirs pour les graphiques selon le type d'utilisateur"""
    user = request.user
    
    if user.is_superuser:
        # Pour les superusers Django, retourner tous les abattoirs
        abattoirs = Abattoir.objects.filter(actif=True).order_by('nom')
    else:
        # Pour les autres utilisateurs, retourner seulement leur abattoir assigné
        if not user.abattoir:
            abattoirs = Abattoir.objects.none()
        else:
            abattoirs = Abattoir.objects.filter(id=user.abattoir.id, actif=True)
    
    abattoirs_data = []
    for abattoir in abattoirs:
        abattoirs_data.append({
            'id': abattoir.id,
            'nom': abattoir.nom,
            'wilaya': abattoir.wilaya,
            'commune': abattoir.commune,
            'location': f"{abattoir.commune}, {abattoir.wilaya}"
        })
    
    return Response({
        'abattoirs': abattoirs_data,
        'user_type': 'superuser' if user.is_superuser else 'regular',
        'total_count': len(abattoirs_data)
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """Statistiques du dashboard selon le type d'utilisateur"""
    user = request.user
    
    # Seuls les superusers Django voient les statistiques globales
    if user.is_superuser:
        # Pour les superusers Django, afficher les statistiques globales
        from users.models import User
        from client.models import Client
        from bete.models import Bete
        
        users_count = User.objects.count()
        clients_count = Client.objects.count()
        superusers_count = User.objects.filter(user_type='SUPERVISEUR').count()
        betes_count = Bete.objects.count()
        
        return Response({
            'users_count': users_count,
            'clients_count': clients_count,
            'superusers_count': superusers_count,
            'betes_count': betes_count,
            'abattoir_name': 'Tous les abattoirs',
            'abattoir_location': 'Vue globale'
        })
    else:
        # Pour tous les autres utilisateurs (y compris les superviseurs non-superuser), 
        # afficher les statistiques de leur abattoir assigné
        if not user.abattoir:
            return Response({
                'users_count': 0,
                'clients_count': 0,
                'superusers_count': 0,
                'betes_count': 0,
                'abattoir_name': 'Aucun abattoir assigné',
                'abattoir_location': 'Non défini'
            })
        
        abattoir = user.abattoir
        
        from users.models import User
        from client.models import Client
        from bete.models import Bete
        
        users_count = User.objects.filter(abattoir=abattoir).count()
        clients_count = 0  # Les clients ne sont pas assignés à un abattoir spécifique
        superusers_count = User.objects.filter(abattoir=abattoir, user_type='SUPERVISEUR').count()
        betes_count = Bete.objects.filter(abattoir=abattoir).count()
        
        return Response({
            'users_count': users_count,
            'clients_count': clients_count,
            'superusers_count': superusers_count,
            'betes_count': betes_count,
            'abattoir_name': abattoir.nom,
            'abattoir_location': f"{abattoir.commune}, {abattoir.wilaya}"
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def abattoirs_for_management(request):
    """Récupérer la liste des abattoirs pour la page de gestion selon le type d'utilisateur"""
    user = request.user
    
    # Base queryset avec annotation du nombre de bêtes
    queryset = Abattoir.objects.select_related('responsable').prefetch_related('chambres_froides').annotate(
        betes_count=Count('bete', distinct=True)
    )
    
    # Filtrage selon le type d'utilisateur
    if user.is_superuser:
        # Superuser voit tous les abattoirs
        pass
    else:
        # Autres utilisateurs voient seulement leur abattoir assigné
        if user.abattoir:
            queryset = queryset.filter(id=user.abattoir.id)
        else:
            # Si pas d'abattoir assigné, retourner une liste vide
            queryset = Abattoir.objects.none()
    
    # Filtrage par statut actif
    actif = request.query_params.get('actif', None)
    if actif is not None:
        queryset = queryset.filter(actif=actif.lower() == 'true')
    
    # Filtrage par wilaya
    wilaya = request.query_params.get('wilaya', None)
    if wilaya:
        queryset = queryset.filter(wilaya__icontains=wilaya)
    
    # Filtrage par commune
    commune = request.query_params.get('commune', None)
    if commune:
        queryset = queryset.filter(commune__icontains=commune)
    
    # Filtrage par recherche
    search = request.query_params.get('search', None)
    if search:
        queryset = queryset.filter(
            Q(nom__icontains=search) |
            Q(wilaya__icontains=search) |
            Q(commune__icontains=search) |
            Q(responsable__username__icontains=search) |
            Q(responsable__email__icontains=search)
        )
    
    # Pagination
    page_size = int(request.query_params.get('page_size', 20))
    page = int(request.query_params.get('page', 1))
    
    start = (page - 1) * page_size
    end = start + page_size
    
    total_count = queryset.count()
    abattoirs = queryset[start:end]
    
    # Sérialisation
    serializer = AbattoirSerializer(abattoirs, many=True)
    
    # Statistiques
    stats = {
        'total_count': total_count,
        'actifs_count': queryset.filter(actif=True).count(),
        'inactifs_count': queryset.filter(actif=False).count(),
        'par_wilaya': list(queryset.values('wilaya').annotate(count=Count('id')).order_by('-count')[:10]),
        'capacite_totale_ovin': queryset.aggregate(total=Sum('capacite_reception_ovin'))['total'] or 0,
        'capacite_totale_bovin': queryset.aggregate(total=Sum('capacite_reception_bovin'))['total'] or 0,
        'capacite_totale_stabulation': queryset.aggregate(
            total=Sum('capacite_stabulation_ovin') + Sum('capacite_stabulation_bovin')
        )['total'] or 0,
    }
    
    return Response({
        'abattoirs': serializer.data,
        'pagination': {
            'page': page,
            'page_size': page_size,
            'total_count': total_count,
            'total_pages': (total_count + page_size - 1) // page_size,
            'has_next': end < total_count,
            'has_previous': page > 1,
        },
        'statistics': stats,
        'user_type': 'superuser' if user.is_superuser else 'regular',
        'abattoir_name': user.abattoir.nom if user.abattoir else None
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def abattoir_detail_with_facilities(request, pk):
    """Récupérer les détails d'un abattoir avec ses chambres froides et historique"""
    user = request.user
    
    try:
        # Récupérer l'abattoir
        abattoir = Abattoir.objects.select_related('responsable').annotate(
            betes_count=Count('bete', distinct=True)
        ).get(pk=pk)
        
        # Vérifier les permissions
        if not user.is_superuser:
            if not user.abattoir or user.abattoir.id != abattoir.id:
                return Response(
                    {'error': 'Vous n\'avez pas accès à cet abattoir'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Récupérer les chambres froides avec leur historique récent
        chambres_froides = ChambreFroide.objects.filter(abattoir=abattoir).prefetch_related(
            'historique_temperatures'
        ).order_by('numero')
        
        # Sérialiser les données
        abattoir_serializer = AbattoirSerializer(abattoir)
        chambres_serializer = ChambreFroideSerializer(chambres_froides, many=True)
        
        # Statistiques supplémentaires
        from bete.models import Bete
        from users.models import User
        
        stats = {
            'betes_count': abattoir.betes_count,
            'betes_vivantes': Bete.objects.filter(abattoir=abattoir, statut='VIVANT').count(),
            'betes_abattues': Bete.objects.filter(abattoir=abattoir, statut='ABATTU').count(),
            'betes_mortes': Bete.objects.filter(abattoir=abattoir, statut='MORT').count(),
            'utilisateurs_count': User.objects.filter(abattoir=abattoir).count(),
            'chambres_froides_count': chambres_froides.count(),
            'capacite_utilisee': round((abattoir.betes_count / abattoir.capacite_totale_reception * 100), 2) if abattoir.capacite_totale_reception > 0 else 0
        }
        
        return Response({
            'abattoir': abattoir_serializer.data,
            'chambres_froides': chambres_serializer.data,
            'statistics': stats,
            'user_type': 'superuser' if user.is_superuser else 'regular'
        })
        
    except Abattoir.DoesNotExist:
        return Response(
            {'error': 'Abattoir non trouvé'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de la récupération des détails: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================================
# VUES POUR LES STABULATIONS
# ============================================================================

class StabulationListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer des stabulations"""
    
    queryset = Stabulation.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StabulationCreateSerializer
        return StabulationSerializer
    
    def get_queryset(self):
        """Filtrage des stabulations"""
        queryset = Stabulation.objects.select_related('abattoir', 'created_by').prefetch_related('betes')
        
        # Filtrage par abattoir
        abattoir_id = self.request.query_params.get('abattoir_id', None)
        if abattoir_id:
            queryset = queryset.filter(abattoir_id=abattoir_id)
        
        # Filtrage par type de bête
        type_bete = self.request.query_params.get('type_bete', None)
        if type_bete:
            queryset = queryset.filter(type_bete=type_bete)
        
        # Filtrage par statut
        statut = self.request.query_params.get('statut', None)
        if statut:
            queryset = queryset.filter(statut=statut)
        
        # Filtrage par date de début
        date_debut = self.request.query_params.get('date_debut', None)
        if date_debut:
            queryset = queryset.filter(date_debut__date__gte=date_debut)
        
        # Filtrage par date de fin
        date_fin = self.request.query_params.get('date_fin', None)
        if date_fin:
            queryset = queryset.filter(date_debut__date__lte=date_fin)
        
        # Filtrage par recherche
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(numero_stabulation__icontains=search) |
                Q(abattoir__nom__icontains=search) |
                Q(abattoir__wilaya__icontains=search) |
                Q(abattoir__commune__icontains=search) |
                Q(notes__icontains=search)
            )
        
        return queryset.order_by('-date_debut', 'abattoir', 'numero_stabulation')
    
    def perform_create(self, serializer):
        """Associe automatiquement l'utilisateur connecté à la stabulation et met à jour le statut des bêtes"""
        # Créer la stabulation
        stabulation = serializer.save(created_by=self.request.user)
        
        # Gérer la sélection des bêtes
        betes_ids = self.request.data.get('betes', [])
        automatic_count = getattr(stabulation, '_automatic_count', None)
        
        if betes_ids:
            # Sélection manuelle : utiliser les bêtes sélectionnées
            from bete.models import Bete
            Bete.objects.filter(id__in=betes_ids).update(statut='EN_STABULATION')
        elif automatic_count:
            # Sélection automatique : sélectionner aléatoirement des bêtes
            from bete.models import Bete
            from django.db.models import Q
            
            # Récupérer les bêtes disponibles pour l'abattoir et l'espèce
            available_betes = Bete.objects.filter(
                abattoir=stabulation.abattoir,
                espece__nom__iexact=stabulation.type_bete,
                statut='VIVANT'
            ).order_by('?')[:automatic_count]  # Sélection aléatoire
            
            if available_betes.exists():
                # Mettre à jour le statut des bêtes sélectionnées
                bete_ids = list(available_betes.values_list('id', flat=True))
                Bete.objects.filter(id__in=bete_ids).update(statut='EN_STABULATION')
                
                # Ajouter les bêtes à la stabulation
                stabulation.betes.set(bete_ids)
            else:
                # Aucune bête disponible, annuler la stabulation
                stabulation.statut = 'ANNULE'
                stabulation.save()
                from rest_framework import serializers
                raise serializers.ValidationError(
                    f"Aucune bête de type {stabulation.type_bete} disponible dans cet abattoir."
                )
        
        return stabulation


class StabulationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer une stabulation"""
    
    queryset = Stabulation.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return StabulationUpdateSerializer
        return StabulationSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def stabulation_stats(request):
    """Statistiques des stabulations"""
    
    # Filtrage par abattoir si spécifié
    abattoir_id = request.query_params.get('abattoir_id', None)
    queryset = Stabulation.objects.all()
    
    if abattoir_id:
        queryset = queryset.filter(abattoir_id=abattoir_id)
    
    # Statistiques générales
    total_stabulations = queryset.count()
    stabulations_en_cours = queryset.filter(statut='EN_COURS').count()
    stabulations_terminees = queryset.filter(statut='TERMINE').count()
    stabulations_annulees = queryset.filter(statut='ANNULE').count()
    
    # Statistiques par type
    stabulations_par_type = {}
    for type_bete in ['BOVIN', 'OVIN', 'CAPRIN', 'AUTRE']:
        count = queryset.filter(type_bete=type_bete).count()
        if count > 0:
            stabulations_par_type[type_bete] = count
    
    # Taux d'occupation moyen
    taux_occupation_moyen = 0
    if total_stabulations > 0:
        total_taux = sum(stab.taux_occupation for stab in queryset)
        taux_occupation_moyen = round(total_taux / total_stabulations, 1)
    
    # Total des bêtes en stabulation
    total_betes_en_stabulation = sum(stab.nombre_betes_actuelles for stab in queryset)
    
    stats = {
        'total_stabulations': total_stabulations,
        'stabulations_en_cours': stabulations_en_cours,
        'stabulations_terminees': stabulations_terminees,
        'stabulations_annulees': stabulations_annulees,
        'stabulations_par_type': stabulations_par_type,
        'taux_occupation_moyen': taux_occupation_moyen,
        'total_betes_en_stabulation': total_betes_en_stabulation
    }
    
    serializer = StabulationStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def terminer_stabulation(request, pk):
    """Terminer une stabulation"""
    try:
        stabulation = Stabulation.objects.get(pk=pk)
        
        if stabulation.statut != 'EN_COURS':
            return Response(
                {'error': 'Seules les stabulations en cours peuvent être terminées'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        stabulation.terminer_stabulation()
        
        serializer = StabulationSerializer(stabulation)
        return Response(serializer.data)
        
    except Stabulation.DoesNotExist:
        return Response(
            {'error': 'Stabulation non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def annuler_stabulation(request, pk):
    """Annuler une stabulation"""
    try:
        stabulation = Stabulation.objects.get(pk=pk)
        
        if stabulation.statut != 'EN_COURS':
            return Response(
                {'error': 'Seules les stabulations en cours peuvent être annulées'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        stabulation.annuler_stabulation()
        
        serializer = StabulationSerializer(stabulation)
        return Response(serializer.data)
        
    except Stabulation.DoesNotExist:
        return Response(
            {'error': 'Stabulation non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def ajouter_betes_stabulation(request, pk):
    """Ajouter des bêtes à une stabulation"""
    try:
        stabulation = Stabulation.objects.get(pk=pk)
        betes_ids = request.data.get('betes_ids', [])
        
        if not betes_ids:
            return Response(
                {'error': 'Aucune bête spécifiée'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Récupérer les bêtes
        from bete.models import Bete
        betes = Bete.objects.filter(id__in=betes_ids)
        
        if len(betes) != len(betes_ids):
            return Response(
                {'error': 'Certaines bêtes n\'ont pas été trouvées'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ajouter les bêtes
        success = stabulation.ajouter_betes(list(betes))
        
        if not success:
            return Response(
                {'error': 'Impossible d\'ajouter ces bêtes à la stabulation'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = StabulationSerializer(stabulation)
        return Response(serializer.data)
        
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
        betes_ids = request.data.get('betes_ids', [])
        
        if not betes_ids:
            return Response(
                {'error': 'Aucune bête spécifiée'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Récupérer les bêtes
        from bete.models import Bete
        betes = Bete.objects.filter(id__in=betes_ids)
        
        if len(betes) != len(betes_ids):
            return Response(
                {'error': 'Certaines bêtes n\'ont pas été trouvées'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Retirer les bêtes
        stabulation.retirer_betes(list(betes))
        
        serializer = StabulationSerializer(stabulation)
        return Response(serializer.data)
        
    except Stabulation.DoesNotExist:
        return Response(
            {'error': 'Stabulation non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def stabulations_abattoir(request, abattoir_id):
    """Récupérer toutes les stabulations d'un abattoir"""
    try:
        # Vérifier que l'abattoir existe
        abattoir = Abattoir.objects.get(pk=abattoir_id)
        
        # Récupérer les stabulations (version simplifiée)
        stabulations = Stabulation.objects.filter(abattoir=abattoir).order_by('-date_debut')
        
        # Filtrage par statut si spécifié
        statut = request.query_params.get('statut', None)
        if statut:
            stabulations = stabulations.filter(statut=statut)
        
        # Filtrage par type de bête si spécifié
        type_bete = request.query_params.get('type_bete', None)
        if type_bete:
            stabulations = stabulations.filter(type_bete=type_bete)
        
        # Version simplifiée du serializer
        stabulations_data = []
        for stab in stabulations:
            stabulations_data.append({
                'id': stab.id,
                'numero_stabulation': stab.numero_stabulation,
                'type_bete': stab.type_bete,
                'statut': stab.statut,
                'date_debut': stab.date_debut,
                'date_fin': stab.date_fin,
                'notes': stab.notes,
                'nombre_betes_actuelles': stab.betes.count(),
                'abattoir_nom': stab.abattoir.nom,
                'abattoir_id': stab.abattoir.id,
            })
        
        # Statistiques simplifiées
        stats = {
            'total_stabulations': stabulations.count(),
            'stabulations_en_cours': stabulations.filter(statut='EN_COURS').count(),
            'stabulations_terminees': stabulations.filter(statut='TERMINE').count(),
            'stabulations_annulees': stabulations.filter(statut='ANNULE').count(),
            'total_betes_en_stabulation': sum(stab.betes.count() for stab in stabulations),
            'capacite_stabulation_ovin': abattoir.capacite_stabulation_ovin,
            'capacite_stabulation_bovin': abattoir.capacite_stabulation_bovin,
        }
        
        return Response({
            'stabulations': stabulations_data,
            'statistics': stats,
            'abattoir': {
                'id': abattoir.id,
                'nom': abattoir.nom,
                'wilaya': abattoir.wilaya,
                'commune': abattoir.commune
            }
        })
        
    except Abattoir.DoesNotExist:
        return Response(
            {'error': 'Abattoir non trouvé'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def all_stabulations(request):
    """Récupérer toutes les stabulations (pour les superusers)"""
    # Vérifier que l'utilisateur est superuser
    if not request.user.is_superuser:
        return Response(
            {'error': 'Accès non autorisé. Seuls les superusers peuvent voir toutes les stabulations.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Récupérer toutes les stabulations
    stabulations = Stabulation.objects.select_related('abattoir').order_by('-date_debut')
    
    # Filtrage par statut si spécifié
    statut = request.query_params.get('statut', None)
    if statut:
        stabulations = stabulations.filter(statut=statut)
    
    # Filtrage par type de bête si spécifié
    type_bete = request.query_params.get('type_bete', None)
    if type_bete:
        stabulations = stabulations.filter(type_bete=type_bete)
    
    # Filtrage par abattoir si spécifié
    abattoir_id = request.query_params.get('abattoir_id', None)
    if abattoir_id:
        stabulations = stabulations.filter(abattoir_id=abattoir_id)
    
    # Version simplifiée du serializer
    stabulations_data = []
    for stab in stabulations:
        stabulations_data.append({
            'id': stab.id,
            'numero_stabulation': stab.numero_stabulation,
            'type_bete': stab.type_bete,
            'statut': stab.statut,
            'date_debut': stab.date_debut,
            'date_fin': stab.date_fin,
            'notes': stab.notes,
            'nombre_betes_actuelles': stab.betes.count(),
            'abattoir_nom': stab.abattoir.nom,
            'abattoir_id': stab.abattoir.id,
            'abattoir_wilaya': stab.abattoir.wilaya,
            'abattoir_commune': stab.abattoir.commune,
        })
    
    # Statistiques globales
    stats = {
        'total_stabulations': stabulations.count(),
        'stabulations_en_cours': stabulations.filter(statut='EN_COURS').count(),
        'stabulations_terminees': stabulations.filter(statut='TERMINE').count(),
        'stabulations_annulees': stabulations.filter(statut='ANNULE').count(),
        'total_betes_en_stabulation': sum(stab.betes.count() for stab in stabulations),
        'stabulations_par_abattoir': {},
    }
    
    # Statistiques par abattoir
    for stab in stabulations:
        abattoir_nom = stab.abattoir.nom
        if abattoir_nom not in stats['stabulations_par_abattoir']:
            stats['stabulations_par_abattoir'][abattoir_nom] = {
                'total': 0,
                'en_cours': 0,
                'terminees': 0,
                'annulees': 0,
                'betes': 0
            }
        
        stats['stabulations_par_abattoir'][abattoir_nom]['total'] += 1
        stats['stabulations_par_abattoir'][abattoir_nom]['betes'] += stab.betes.count()
        
        if stab.statut == 'EN_COURS':
            stats['stabulations_par_abattoir'][abattoir_nom]['en_cours'] += 1
        elif stab.statut == 'TERMINE':
            stats['stabulations_par_abattoir'][abattoir_nom]['terminees'] += 1
        elif stab.statut == 'ANNULE':
            stats['stabulations_par_abattoir'][abattoir_nom]['annulees'] += 1
    
    return Response({
        'stabulations': stabulations_data,
        'statistics': stats,
        'is_superuser_view': True
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def terminer_stabulation(request, pk):
    """Terminer une stabulation et remettre les bêtes au statut VIVANT"""
    try:
        stabulation = Stabulation.objects.get(pk=pk)
        
        # Vérifier que l'utilisateur a le droit de modifier cette stabulation
        if not request.user.is_superuser and stabulation.abattoir != request.user.abattoir:
            return Response(
                {'error': 'Vous n\'avez pas le droit de modifier cette stabulation'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Mettre à jour le statut de la stabulation
        stabulation.statut = 'TERMINE'
        stabulation.date_fin = timezone.now()
        stabulation.save()
        
        # Remettre les bêtes au statut VIVANT
        from bete.models import Bete
        Bete.objects.filter(id__in=stabulation.betes.values_list('id', flat=True)).update(statut='VIVANT')
        
        return Response({
            'message': 'Stabulation terminée avec succès',
            'stabulation': {
                'id': stabulation.id,
                'statut': stabulation.statut,
                'date_fin': stabulation.date_fin
            }
        })
        
    except Stabulation.DoesNotExist:
        return Response(
            {'error': 'Stabulation non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def annuler_stabulation(request, pk):
    """Annuler une stabulation et remettre les bêtes au statut VIVANT"""
    try:
        stabulation = Stabulation.objects.get(pk=pk)
        
        # Vérifier que l'utilisateur a le droit de modifier cette stabulation
        if not request.user.is_superuser and stabulation.abattoir != request.user.abattoir:
            return Response(
                {'error': 'Vous n\'avez pas le droit de modifier cette stabulation'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Mettre à jour le statut de la stabulation
        stabulation.statut = 'ANNULE'
        stabulation.date_fin = timezone.now()
        stabulation.save()
        
        # Remettre les bêtes au statut VIVANT
        from bete.models import Bete
        Bete.objects.filter(id__in=stabulation.betes.values_list('id', flat=True)).update(statut='VIVANT')
        
        return Response({
            'message': 'Stabulation annulée avec succès',
            'stabulation': {
                'id': stabulation.id,
                'statut': stabulation.statut,
                'date_fin': stabulation.date_fin
            }
        })
        
    except Stabulation.DoesNotExist:
        return Response(
            {'error': 'Stabulation non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )