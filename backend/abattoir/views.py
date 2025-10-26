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
            # Sélection manuelle : ajouter les bêtes sélectionnées
            stabulation.betes.set(betes_ids)
            # CRITIQUE: Mettre à jour le statut des bêtes
            from bete.models import Bete
            Bete.objects.filter(id__in=betes_ids).update(statut='EN_STABULATION')
            print(f"✅ {len(betes_ids)} bêtes mises au statut EN_STABULATION (sélection manuelle)")
            
        elif automatic_count:
            # Sélection automatique : sélectionner aléatoirement des bêtes
            from bete.models import Bete
            
            # Récupérer les bêtes disponibles pour l'abattoir et l'espèce
            available_betes = Bete.objects.filter(
                abattoir=stabulation.abattoir,
                espece__nom__iexact=stabulation.type_bete,
                statut='VIVANT'
            ).order_by('?')[:automatic_count]  # Sélection aléatoire
            
            if available_betes.exists():
                # Ajouter les bêtes à la stabulation
                bete_ids = list(available_betes.values_list('id', flat=True))
                stabulation.betes.set(bete_ids)
                # CRITIQUE: Mettre à jour le statut des bêtes
                Bete.objects.filter(id__in=bete_ids).update(statut='EN_STABULATION')
                print(f"✅ {len(bete_ids)} bêtes mises au statut EN_STABULATION (sélection automatique)")
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
    """
    MÉTHODE UNIQUE ET PROFESSIONNELLE POUR TERMINER UNE STABULATION
    
    Cette méthode :
    1. Vérifie que la stabulation peut être terminée
    2. Met la stabulation au statut TERMINE
    3. Met TOUTES les bêtes au statut ABATTU
    4. Met à jour les poids si fournis
    5. Retourne un résultat clair
    """
    try:
        # 1. Récupérer la stabulation
        stabulation = Stabulation.objects.get(pk=pk)
        
        # 2. Vérifications de sécurité
        if stabulation.statut != 'EN_COURS':
            return Response(
                {'error': 'Seules les stabulations en cours peuvent être terminées'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 3. Permissions (superuser ou responsable de l'abattoir)
        if not request.user.is_superuser:
            if not hasattr(request.user, 'abattoir') or stabulation.abattoir != request.user.abattoir:
                return Response(
                    {'error': 'Vous n\'avez pas le droit de modifier cette stabulation'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # 4. Récupérer les données de poids (optionnel)
        poids_data = request.data.get('poidsData', [])
        
        # 5. VÉRIFIER D'ABORD LES NUMÉROS DE POSTE AVANT DE TERMINER
        from bete.models import Bete
        betes_ids = list(stabulation.betes.values_list('id', flat=True))
        errors = []
        
        for poids_info in poids_data:
            bete_id = poids_info.get('bete_id')
            poids_a_chaud = poids_info.get('poids_a_chaud')
            num_boucle_post_abattage = poids_info.get('num_boucle_post_abattage', '')
            
            if bete_id and poids_a_chaud:
                try:
                    bete = Bete.objects.get(id=bete_id)
                    
                    # Vérifier l'unicité du numéro de boucle post-abattage AVANT de terminer
                    if num_boucle_post_abattage:
                        existing_bete = Bete.objects.filter(
                            num_boucle_post_abattage=num_boucle_post_abattage
                        ).exclude(id=bete_id).first()
                        
                        if existing_bete:
                            errors.append(f"Le numéro de boucle post-abattage '{num_boucle_post_abattage}' existe déjà pour la bête {existing_bete.num_boucle}")
                            continue
                    
                except Bete.DoesNotExist:
                    errors.append(f"Bête avec l'ID {bete_id} non trouvée")
                    continue
        
        # Si il y a des erreurs, retourner les erreurs SANS terminer la stabulation
        if errors:
            return Response({
                'error': 'Erreurs de validation',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 6. MAINTENANT TERMINER LA STABULATION (seulement si pas d'erreurs)
        # La méthode terminer_stabulation() met automatiquement les bêtes au statut ABATTU
        stabulation.terminer_stabulation()
        
        # 8. Mettre à jour les poids et numéros de boucle post-abattage
        for poids_info in poids_data:
            bete_id = poids_info.get('bete_id')
            poids_a_chaud = poids_info.get('poids_a_chaud')
            num_boucle_post_abattage = poids_info.get('num_boucle_post_abattage', '')
            
            if bete_id and poids_a_chaud:
                try:
                    bete = Bete.objects.get(id=bete_id)
                    bete.poids_a_chaud = poids_a_chaud
                    if num_boucle_post_abattage:
                        bete.num_boucle_post_abattage = num_boucle_post_abattage
                    bete.save()
                except Bete.DoesNotExist:
                    pass  # Déjà vérifié plus haut
        
        # 9. Retourner le résultat
        return Response({
            'message': 'Stabulation terminée avec succès',
            'stabulation': {
                'id': stabulation.id,
                'statut': 'TERMINE',
                'date_fin': stabulation.date_fin.isoformat() if stabulation.date_fin else None
            },
            'betes_affectees': len(betes_ids)
        })
        
    except Stabulation.DoesNotExist:
        return Response(
            {'error': 'Stabulation non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de la finalisation: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
        
        # Vérifier que la stabulation peut être annulée
        if stabulation.statut != 'EN_COURS':
            return Response(
                {'error': 'Seules les stabulations en cours peuvent être annulées'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Récupérer le motif d'annulation
        raison = request.data.get('raison', '').strip()
        if not raison:
            return Response(
                {'error': 'Le motif d\'annulation est obligatoire'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validation de la longueur du motif
        if len(raison) < 10:
            return Response(
                {'error': 'Le motif d\'annulation doit contenir au moins 10 caractères'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(raison) > 500:
            return Response(
                {'error': 'Le motif d\'annulation ne peut pas dépasser 500 caractères'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Annuler la stabulation avec le motif
        stabulation.annuler_stabulation(utilisateur=request.user, raison=raison)
        
        return Response({
            'message': 'Stabulation annulée avec succès',
            'stabulation': {
                'id': stabulation.id,
                'statut': stabulation.statut,
                'date_fin': stabulation.date_fin,
                'raison_annulation': stabulation.raison_annulation,
                'annule_par': stabulation.annule_par.username if stabulation.annule_par else None
            }
        })
        
    except Stabulation.DoesNotExist:
        return Response(
            {'error': 'Stabulation non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def betes_disponibles_stabulation(request):
    """Récupérer les bêtes disponibles pour créer une stabulation"""
    user = request.user
    
    # Paramètres de filtrage
    abattoir_id = request.query_params.get('abattoir_id')
    type_bete = request.query_params.get('type_bete')
    
    if not abattoir_id:
        return Response(
            {'error': 'abattoir_id est requis'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Base queryset - SEULEMENT les bêtes VIVANTES (pas EN_STABULATION)
    queryset = Bete.objects.filter(
        abattoir_id=abattoir_id,
        statut='VIVANT'  # IMPORTANT: Seulement les bêtes vivantes
    ).select_related('espece', 'abattoir', 'created_by')
    
    # Filtrage par type de bête
    if type_bete:
        queryset = queryset.filter(espece__nom__iexact=type_bete)
    
    # Filtrage par utilisateur (si pas superuser)
    if not user.is_superuser:
        if user.abattoir and user.abattoir.id != int(abattoir_id):
            return Response(
                {'error': 'Vous n\'avez pas accès à cet abattoir'}, 
                status=status.HTTP_403_FORBIDDEN
            )
    
    # Sérialisation
    from bete.serializers import BeteSerializer
    serializer = BeteSerializer(queryset, many=True)
    
    return Response({
        'betes': serializer.data,
        'count': queryset.count(),
        'abattoir_id': abattoir_id,
        'type_bete': type_bete
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def historique_stabulation(request, pk):
    """Récupérer l'historique des modifications d'une stabulation"""
    try:
        stabulation = Stabulation.objects.get(pk=pk)
        
        # Vérifier les permissions
        user = request.user
        if not user.is_superuser:
            if not user.abattoir or stabulation.abattoir != user.abattoir:
                return Response(
                    {'error': 'Vous n\'avez pas accès à cette stabulation'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Récupérer l'historique
        historique = stabulation.historique.all()
        
        # Sérialisation
        from .serializers import HistoriqueStabulationSerializer
        serializer = HistoriqueStabulationSerializer(historique, many=True)
        
        return Response({
            'stabulation_id': stabulation.id,
            'numero_stabulation': stabulation.numero_stabulation,
            'historique': serializer.data,
            'count': historique.count()
        })
        
    except Stabulation.DoesNotExist:
        return Response(
            {'error': 'Stabulation non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_statistics(request):
    """Récupérer les statistiques du dashboard principal"""
    from django.db.models import Count, Q
    from django.utils import timezone
    from bete.models import Bete
    from transfert.models import Transfert
    from datetime import date, timedelta
    
    def synchronize_bete_statuses():
        """Synchronise les statuts des bêtes avec les stabulations pour assurer la cohérence"""
        from abattoir.models import Stabulation
        
        # Mettre à jour les bêtes dans les stabulations EN_COURS
        stabulations_en_cours = Stabulation.objects.filter(statut='EN_COURS')
        for stab in stabulations_en_cours:
            stab.betes.update(statut='EN_STABULATION')
        
        # CORRECTION CRITIQUE: Ne pas toucher aux bêtes des stabulations terminées
        # Les bêtes des stabulations TERMINE restent ABATTU (c'est le comportement attendu)
        # Seules les bêtes des stabulations ANNULE peuvent être remises VIVANT
        stabulations_annulees = Stabulation.objects.filter(statut='ANNULE')
        for stab in stabulations_annulees:
            stab.betes.update(statut='VIVANT')
        
        # Les stabulations TERMINE ne sont PAS touchées - les bêtes restent ABATTU
    
    # Synchroniser les statuts pour assurer la cohérence
    synchronize_bete_statuses()
    
    user = request.user
    today = timezone.now().date()
    
    # Base querysets selon le type d'utilisateur
    if user.is_superuser:
        # Pour les superusers, afficher toutes les données globalement
        betes_queryset = Bete.objects.all()
        transferts_queryset = Transfert.objects.all()
    else:
        # Utilisateur normal - seulement son abattoir
        if hasattr(user, 'abattoir') and user.abattoir:
            betes_queryset = Bete.objects.filter(abattoir=user.abattoir)
            transferts_queryset = Transfert.objects.filter(
                Q(abattoir_expediteur=user.abattoir) | Q(abattoir_destinataire=user.abattoir)
            )
        else:
            betes_queryset = Bete.objects.none()
            transferts_queryset = Transfert.objects.none()
    
    # 1. Nombre de bêtes vivantes
    nombre_betes = betes_queryset.filter(statut='VIVANT').count()
    
    # 2. Nombre de carcasses (bêtes abattues)
    nombre_carcasses = betes_queryset.filter(statut='ABATTU').count()
    
    # 3. Nombre de transferts aujourd'hui
    transferts_aujourdhui = transferts_queryset.filter(
        date_creation__date=today
    ).count()
    
    # 4. Nombre d'animaux en stabulation (seulement dans les stabulations EN_COURS)
    from abattoir.models import Stabulation
    stabulations_en_cours = Stabulation.objects.filter(statut='EN_COURS')
    if user.is_superuser:
        # Superuser voit toutes les stabulations
        animaux_stabulation = sum(stab.betes.count() for stab in stabulations_en_cours)
    else:
        # Utilisateur normal - seulement son abattoir
        if hasattr(user, 'abattoir') and user.abattoir:
            stabulations_en_cours = stabulations_en_cours.filter(abattoir=user.abattoir)
            animaux_stabulation = sum(stab.betes.count() for stab in stabulations_en_cours)
        else:
            animaux_stabulation = 0
    
    # Statistiques supplémentaires pour enrichir le dashboard
    stats_supplementaires = {
        'betes_par_statut': list(betes_queryset.values('statut').annotate(count=Count('id'))),
        'transferts_par_statut': list(transferts_queryset.values('statut').annotate(count=Count('id'))),
        'betes_par_espece': list(betes_queryset.values('espece__nom').annotate(count=Count('id'))),
        'transferts_7_derniers_jours': transferts_queryset.filter(
            date_creation__date__gte=today - timedelta(days=7)
        ).count(),
        'betes_ajoutees_aujourdhui': betes_queryset.filter(
            created_at__date=today
        ).count(),
    }
    
    return Response({
        'nombre_betes': nombre_betes,
        'nombre_carcasses': nombre_carcasses,
        'transferts_aujourdhui': transferts_aujourdhui,
        'animaux_stabulation': animaux_stabulation,
        'stats_supplementaires': stats_supplementaires,
        'date_actualisation': timezone.now().isoformat(),
        'abattoir_nom': user.abattoir.nom if hasattr(user, 'abattoir') and user.abattoir else 'Tous les abattoirs',
        'abattoir_location': f"{user.abattoir.wilaya}, {user.abattoir.commune}" if hasattr(user, 'abattoir') and user.abattoir else 'Système central'
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def slaughter_data_by_period(request):
    """Récupérer les données d'abattage filtrées par période selon les stabulations terminées"""
    from django.db.models import Count, Q
    from django.utils import timezone
    from bete.models import Bete
    from abattoir.models import Stabulation
    from datetime import date, timedelta
    
    user = request.user
    period = request.query_params.get('period', 'today')  # today, week, month
    
    # Calculer les dates selon la période
    today = timezone.now().date()
    
    if period == 'today':
        start_date = today
        end_date = today
    elif period == 'week':
        start_date = today - timedelta(days=7)
        end_date = today
    elif period == 'month':
        start_date = today - timedelta(days=30)
        end_date = today
    else:
        start_date = today
        end_date = today
    
    # CORRECTION: Filtrer selon les stabulations terminées dans la période
    if user.is_superuser:
        stabulations_queryset = Stabulation.objects.filter(statut='TERMINE')
    else:
        if hasattr(user, 'abattoir') and user.abattoir:
            stabulations_queryset = Stabulation.objects.filter(statut='TERMINE', abattoir=user.abattoir)
        else:
            stabulations_queryset = Stabulation.objects.none()
    
    # Filtrer les stabulations terminées dans la période
    # Utiliser une approche plus simple avec les dates
    stabulations_terminees = stabulations_queryset.filter(
        date_fin__date__gte=start_date,
        date_fin__date__lte=end_date
    )
    
    # Récupérer toutes les bêtes de ces stabulations terminées
    betes_filtrees = Bete.objects.filter(
        stabulations__in=stabulations_terminees,
        statut='ABATTU'
    )
    
    # Grouper par abattoir et espèce
    from django.db.models import Sum
    
    # Si superuser, grouper par abattoir
    if user.is_superuser:
        abattoirs_data = []
        abattoirs = betes_filtrees.values('abattoir__nom').distinct()
        
        for abattoir in abattoirs:
            abattoir_nom = abattoir['abattoir__nom'] or 'Abattoir inconnu'
            abattoir_betes = betes_filtrees.filter(abattoir__nom=abattoir_nom)
            
            # Compter par espèce
            especes_count = {}
            for espece in ['Bovin', 'Ovin', 'Caprin', 'Autre']:
                especes_count[espece] = abattoir_betes.filter(espece__nom=espece).count()
            
            abattoirs_data.append({
                'abattoir_nom': abattoir_nom,
                'Bovin': especes_count['Bovin'],
                'Ovin': especes_count['Ovin'],
                'Caprin': especes_count['Caprin'],
                'Autre': especes_count['Autre']
            })
    else:
        # Utilisateur normal - seulement son abattoir
        if hasattr(user, 'abattoir') and user.abattoir:
            especes_count = {}
            for espece in ['Bovin', 'Ovin', 'Caprin', 'Autre']:
                especes_count[espece] = betes_filtrees.filter(espece__nom=espece).count()
            
            abattoirs_data = [{
                'abattoir_nom': user.abattoir.nom,
                'Bovin': especes_count['Bovin'],
                'Ovin': especes_count['Ovin'],
                'Caprin': especes_count['Caprin'],
                'Autre': especes_count['Autre']
            }]
        else:
            abattoirs_data = []
    
    return Response({
        'period': period,
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'abattoirs_data': abattoirs_data,
        'total_animals': sum(sum(abattoir[espece] for espece in ['Bovin', 'Ovin', 'Caprin', 'Autre']) for abattoir in abattoirs_data)
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def diagnostic_data_consistency(request):
    """Diagnostic de cohérence des données pour les superusers"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'Accès non autorisé. Seuls les superusers peuvent accéder à ce diagnostic.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    from abattoir.models import Stabulation
    from bete.models import Bete
    
    # 1. Méthode Dashboard (statuts des bêtes)
    betes_en_stabulation = Bete.objects.filter(statut='EN_STABULATION').count()
    
    # 2. Méthode Page Stabulation (bêtes dans stabulations EN_COURS)
    stabulations_en_cours = Stabulation.objects.filter(statut='EN_COURS')
    betes_dans_stabulations = sum(stab.betes.count() for stab in stabulations_en_cours)
    
    # 3. Détail par abattoir
    detail_par_abattoir = []
    for stab in stabulations_en_cours:
        betes_count = stab.betes.count()
        betes_en_stabulation_count = stab.betes.filter(statut='EN_STABULATION').count()
        detail_par_abattoir.append({
            'stabulation_id': stab.id,
            'numero_stabulation': stab.numero_stabulation,
            'abattoir': stab.abattoir.nom,
            'betes_total': betes_count,
            'betes_en_stabulation': betes_en_stabulation_count,
            'incoherent': betes_count != betes_en_stabulation_count
        })
    
    # 4. Bêtes orphelines
    betes_orphelines = Bete.objects.filter(statut='EN_STABULATION').exclude(
        stabulations__statut='EN_COURS'
    )
    
    return Response({
        'dashboard_method': betes_en_stabulation,
        'stabulation_page_method': betes_dans_stabulations,
        'difference': betes_en_stabulation - betes_dans_stabulations,
        'is_consistent': betes_en_stabulation == betes_dans_stabulations,
        'detail_par_abattoir': detail_par_abattoir,
        'betes_orphelines_count': betes_orphelines.count(),
        'betes_orphelines': [
            {
                'id': bete.id,
                'statut': bete.statut,
                'abattoir': bete.abattoir.nom if bete.abattoir else 'N/A'
            } for bete in betes_orphelines[:10]  # Limiter à 10 pour éviter une réponse trop lourde
        ]
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def slaughtered_animals_report(request):
    """Rapport détaillé des bêtes abattues pour les superusers"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'Accès non autorisé. Seuls les superusers peuvent accéder à ce rapport.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    from bete.models import Bete
    from abattoir.models import Stabulation
    from django.db.models import Count, Q
    
    # 1. Statistiques par statut
    stats_by_status = Bete.objects.values('statut').annotate(count=Count('id')).order_by('statut')
    
    # 2. Bêtes abattues détaillées
    betes_abattues = Bete.objects.filter(statut='ABATTU').select_related('espece', 'abattoir')
    
    # 3. Stabulations terminées avec leurs bêtes
    stabulations_terminees = Stabulation.objects.filter(statut='TERMINE').select_related('abattoir')
    
    stabulations_details = []
    for stab in stabulations_terminees:
        betes_in_stab = stab.betes.filter(statut='ABATTU')
        stabulations_details.append({
            'stabulation_id': stab.id,
            'numero_stabulation': stab.numero_stabulation,
            'abattoir': stab.abattoir.nom,
            'date_fin': stab.date_fin,
            'betes_abattues_count': betes_in_stab.count(),
            'betes_details': [
                {
                    'id': bete.id,
                    'num_boucle': bete.num_boucle,
                    'num_boucle_post_abattage': bete.num_boucle_post_abattage,
                    'espece': bete.espece.nom,
                    'poids_vif': float(bete.poids_vif) if bete.poids_vif else None,
                    'poids_a_chaud': float(bete.poids_a_chaud) if bete.poids_a_chaud else None,
                    'poids_a_froid': float(bete.poids_a_froid) if bete.poids_a_froid else None,
                    'date_abattage': bete.updated_at.isoformat()
                } for bete in betes_in_stab[:20]  # Limiter à 20 par stabulation
            ]
        })
    
    # 4. Statistiques globales
    total_betes = Bete.objects.count()
    betes_abattues_count = betes_abattues.count()
    stabulations_terminees_count = stabulations_terminees.count()
    
    return Response({
        'summary': {
            'total_betes': total_betes,
            'betes_abattues': betes_abattues_count,
            'stabulations_terminees': stabulations_terminees_count,
            'taux_abattage': round((betes_abattues_count / total_betes * 100), 2) if total_betes > 0 else 0
        },
        'stats_by_status': list(stats_by_status),
        'stabulations_terminees': stabulations_details,
        'betes_abattues_recentes': [
            {
                'id': bete.id,
                'num_boucle': bete.num_boucle,
                'espece': bete.espece.nom,
                'abattoir': bete.abattoir.nom if bete.abattoir else 'N/A',
                'poids_a_chaud': float(bete.poids_a_chaud) if bete.poids_a_chaud else None,
                'date_abattage': bete.updated_at.isoformat()
            } for bete in betes_abattues.order_by('-updated_at')[:50]  # 50 plus récentes
        ]
    })
