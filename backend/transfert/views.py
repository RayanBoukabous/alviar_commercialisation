from rest_framework import generics, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from django.conf import settings
from abattoir.models import Abattoir
from bete.models import Bete, HistoriqueTransfertBete
from .models import Transfert
from .serializers import (
    TransfertSerializer,
    CreateTransfertSerializer,
    UpdateTransfertStatusSerializer,
    TransfertStatsSerializer,
    ReceptionDetailleeSerializer
)
import random


class TransfertListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer des transferts"""
    
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateTransfertSerializer
        return TransfertSerializer
    
    def get_queryset(self):
        """Filtre les transferts selon l'utilisateur"""
        user = self.request.user
        queryset = Transfert.objects.select_related(
            'abattoir_expediteur',
            'abattoir_destinataire',
            'cree_par',
            'valide_par'
        ).prefetch_related('betes')
        
        # Filtres
        statut = self.request.GET.get('statut')
        abattoir_id = self.request.GET.get('abattoir_id')
        search = self.request.GET.get('search')
        
        if statut and statut != 'ALL':
            queryset = queryset.filter(statut=statut)
        
        if abattoir_id:
            queryset = queryset.filter(
                Q(abattoir_expediteur_id=abattoir_id) | 
                Q(abattoir_destinataire_id=abattoir_id)
            )
        elif not user.is_superuser:
            # Les utilisateurs normaux ne voient que les transferts de leur abattoir
            user_abattoir = user.abattoir
            if user_abattoir:
                queryset = queryset.filter(
                    Q(abattoir_expediteur=user_abattoir) | 
                    Q(abattoir_destinataire=user_abattoir)
                )
        
        if search:
            queryset = queryset.filter(
                Q(numero_transfert__icontains=search) |
                Q(abattoir_expediteur__nom__icontains=search) |
                Q(abattoir_destinataire__nom__icontains=search) |
                Q(cree_par__username__icontains=search) |
                Q(note__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Crée un nouveau transfert"""
        user = self.request.user
        data = serializer.validated_data
        
        # Déterminer l'abattoir expéditeur
        if user.is_superuser and data.get('abattoir_expediteur_id'):
            # Pour les superusers, utiliser l'abattoir expéditeur fourni
            abattoir_expediteur = Abattoir.objects.get(id=data['abattoir_expediteur_id'])
        else:
            # Pour les utilisateurs normaux ou superusers sans abattoir expéditeur spécifié
            abattoir_expediteur = user.abattoir
        
        if not abattoir_expediteur:
            raise serializers.ValidationError("Abattoir expéditeur non défini")
        
        # Récupérer l'abattoir destinataire
        abattoir_destinataire = Abattoir.objects.get(id=data['abattoir_destinataire_id'])
        
        # Générer le numéro de transfert
        numero_transfert = self.generate_numero_transfert()
        
        # Sélectionner les bêtes
        betes = self.select_betes(abattoir_expediteur, data)
        
        if not betes:
            raise serializers.ValidationError("Aucune bête disponible pour le transfert")
        
        # Créer le transfert
        transfert = Transfert.objects.create(
            numero_transfert=numero_transfert,
            abattoir_expediteur=abattoir_expediteur,
            abattoir_destinataire=abattoir_destinataire,
            cree_par=user,
            note=data.get('note', '')
        )
        
        # Ajouter les bêtes
        transfert.betes.set(betes)
        
        return transfert
    
    def generate_numero_transfert(self):
        """Génère un numéro de transfert unique"""
        today = timezone.now().date()
        year = today.year
        month = today.month
        
        # Compter les transferts du mois
        count = Transfert.objects.filter(
            created_at__year=year,
            created_at__month=month
        ).count() + 1
        
        return f"TRF-{year}-{month:02d}-{count:03d}"
    
    def select_betes(self, abattoir, data):
        """Sélectionne les bêtes pour le transfert"""
        betes_ids = data.get('betes_ids')
        nombre_betes_aleatoire = data.get('nombre_betes_aleatoire')
        
        # Bêtes disponibles dans l'abattoir (statut VIVANT)
        betes_disponibles = Bete.objects.filter(
            abattoir=abattoir,
            statut='VIVANT'
        )
        
        if betes_ids:
            # Sélection manuelle
            return betes_disponibles.filter(id__in=betes_ids)
        elif nombre_betes_aleatoire:
            # Sélection aléatoire
            betes_list = list(betes_disponibles)
            if len(betes_list) < nombre_betes_aleatoire:
                raise serializers.ValidationError(
                    f"Pas assez de bêtes disponibles. Disponible: {len(betes_list)}, Demandé: {nombre_betes_aleatoire}"
                )
            return random.sample(betes_list, nombre_betes_aleatoire)
        
        return []


class TransfertDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour les détails d'un transfert"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = TransfertSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Transfert.objects.select_related(
            'abattoir_expediteur',
            'abattoir_destinataire',
            'cree_par',
            'valide_par'
        ).prefetch_related('betes')
        
        if not user.is_superuser:
            user_abattoir = user.abattoir
            if user_abattoir:
                queryset = queryset.filter(
                    Q(abattoir_expediteur=user_abattoir) | 
                    Q(abattoir_destinataire=user_abattoir)
                )
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UpdateTransfertStatusSerializer
        return TransfertSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def annuler_transfert(request, pk):
    """Annule un transfert"""
    try:
        transfert = Transfert.objects.get(pk=pk)
        
        # Vérifier les permissions
        user = request.user
        if not user.is_superuser:
            user_abattoir = user.abattoir
            if not user_abattoir or transfert.abattoir_expediteur != user_abattoir:
                return Response(
                    {'detail': 'Permission refusée'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        if transfert.annuler(user):
            serializer = TransfertSerializer(transfert)
            return Response(serializer.data)
        else:
            return Response(
                {'detail': 'Le transfert ne peut pas être annulé'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except Transfert.DoesNotExist:
        return Response(
            {'detail': 'Transfert non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def livrer_transfert(request, pk):
    """Marque un transfert comme livré"""
    try:
        transfert = Transfert.objects.get(pk=pk)
        
        # Vérifier les permissions (seul l'abattoir destinataire peut valider)
        user = request.user
        if not user.is_superuser:
            user_abattoir = user.abattoir
            if not user_abattoir or transfert.abattoir_destinataire != user_abattoir:
                return Response(
                    {'detail': 'Permission refusée'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        if transfert.livrer(user):
            serializer = TransfertSerializer(transfert)
            return Response(serializer.data)
        else:
            return Response(
                {'detail': 'Le transfert ne peut pas être marqué comme livré'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except Transfert.DoesNotExist:
        return Response(
            {'detail': 'Transfert non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transfert_stats(request):
    """Retourne les statistiques des transferts"""
    user = request.user
    
    # Base queryset
    if user.is_superuser:
        queryset = Transfert.objects.all()
    else:
        user_abattoir = user.abattoir
        if user_abattoir:
            queryset = Transfert.objects.filter(
                Q(abattoir_expediteur=user_abattoir) | 
                Q(abattoir_destinataire=user_abattoir)
            )
        else:
            queryset = Transfert.objects.none()
    
    # Calculer les statistiques
    total_transferts = queryset.count()
    transferts_en_cours = queryset.filter(statut='EN_COURS').count()
    transferts_livres = queryset.filter(statut='LIVRE').count()
    transferts_annules = queryset.filter(statut='ANNULE').count()
    
    taux_livraison = (transferts_livres / total_transferts * 100) if total_transferts > 0 else 0
    
    stats = {
        'total_transferts': total_transferts,
        'transferts_en_cours': transferts_en_cours,
        'transferts_livres': transferts_livres,
        'transferts_annules': transferts_annules,
        'taux_livraison': round(taux_livraison, 2)
    }
    
    serializer = TransfertStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def betes_disponibles(request):
    """Retourne les bêtes disponibles pour transfert"""
    user = request.user
    
    if user.is_superuser:
        # Pour les superusers, on pourrait ajouter un paramètre abattoir_id
        abattoir_id = request.GET.get('abattoir_id')
        if abattoir_id:
            abattoir = Abattoir.objects.get(id=abattoir_id)
        else:
            abattoir = user.abattoir
    else:
        abattoir = user.abattoir
    
    if not abattoir:
        return Response(
            {'detail': 'Abattoir non défini'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Récupérer le type de produit depuis les paramètres
    type_produit = request.GET.get('type_produit', 'VIF')
    
    # Bêtes disponibles selon le type de produit
    if type_produit == 'VIF':
        # Pour les bêtes vives : statut VIVANT
        betes = Bete.objects.filter(
            abattoir=abattoir,
            statut='VIVANT'
        ).select_related('espece')
    elif type_produit == 'CARCASSE':
        # Pour les carcasses : statut ABATTU
        betes = Bete.objects.filter(
            abattoir=abattoir,
            statut='ABATTU'
        ).select_related('espece')
    else:
        # Par défaut, bêtes vives
        betes = Bete.objects.filter(
            abattoir=abattoir,
            statut='VIVANT'
        ).select_related('espece')
    
    # Filtre par espèce
    espece = request.GET.get('espece')
    if espece:
        betes = betes.filter(espece__nom=espece)
    
    # Filtre par recherche
    search = request.GET.get('search')
    if search:
        betes = betes.filter(numero_identification__icontains=search)
    
    # Pagination
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 30))
    
    # Calculer l'offset
    offset = (page - 1) * page_size
    
    # Récupérer le total pour la pagination
    total_count = betes.count()
    
    # Récupérer les bêtes paginées
    betes_paginated = betes[offset:offset + page_size]
    
    from bete.serializers import BeteSerializer
    serializer = BeteSerializer(betes_paginated, many=True)
    
    return Response({
        'results': serializer.data,
        'count': total_count,
        'page': page,
        'page_size': page_size,
        'total_pages': (total_count + page_size - 1) // page_size,
        'has_next': offset + page_size < total_count,
        'has_previous': page > 1
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirmer_reception_detaillee(request, transfert_id):
    """Confirmer la réception détaillée d'un transfert"""
    try:
        transfert = Transfert.objects.get(id=transfert_id)
    except Transfert.DoesNotExist:
        return Response(
            {'detail': 'Transfert non trouvé'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Vérifier que l'utilisateur appartient à l'abattoir destinataire
    user = request.user
    if not user.abattoir or user.abattoir.id != transfert.abattoir_destinataire.id:
        return Response(
            {'detail': 'Vous ne pouvez confirmer la réception que pour votre abattoir'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Vérifier que le transfert est en cours
    if transfert.statut != 'EN_COURS':
        return Response(
            {'detail': 'Ce transfert ne peut plus être modifié'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Valider les données de réception
    serializer = ReceptionDetailleeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    received_count = data['received_count']
    missing_betes_numbers = data.get('missing_betes', [])
    received_betes_ids = data.get('received_betes', [])
    
    # Vérifier que les bêtes reçues existent dans le transfert
    betes_transfert = transfert.betes.all()
    betes_transfert_ids = [b.id for b in betes_transfert]
    
    for bete_id in received_betes_ids:
        if bete_id not in betes_transfert_ids:
            return Response(
                {'detail': f'Bête {bete_id} non trouvée dans ce transfert'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Vérifier que les numéros de boucles manquantes existent dans le transfert
    betes_transfert_numbers = [b.num_boucle for b in betes_transfert]
    for num_boucle in missing_betes_numbers:
        if num_boucle not in betes_transfert_numbers:
            return Response(
                {'detail': f'Bête avec numéro {num_boucle} non trouvée dans ce transfert'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Vérifier qu'il n'y a pas de conflit entre bêtes reçues et manquantes
    betes_recues_numbers = [b.num_boucle for b in betes_transfert.filter(id__in=received_betes_ids)]
    for num_boucle in missing_betes_numbers:
        if num_boucle in betes_recues_numbers:
            return Response(
                {'detail': f'Bête {num_boucle} ne peut pas être à la fois reçue et manquante'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Mettre à jour les bêtes reçues (changer leur abattoir)
    betes_recues = betes_transfert.filter(id__in=received_betes_ids)
    for bete in betes_recues:
        # Créer l'historique avant de changer l'abattoir
        HistoriqueTransfertBete.objects.create(
            bete=bete,
            transfert=transfert,
            abattoir_source=transfert.abattoir_expediteur,
            abattoir_destination=transfert.abattoir_destinataire,
            statut_transfert='LIVRE',
            note=f'Transfert confirmé - {received_count} bêtes reçues'
        )
        
        # Changer l'abattoir de la bête
        bete.abattoir = transfert.abattoir_destinataire
        bete.save()
    
    # Créer l'historique pour les bêtes manquantes (elles restent dans l'abattoir source)
    betes_manquantes = betes_transfert.filter(num_boucle__in=missing_betes_numbers)
    for bete in betes_manquantes:
        HistoriqueTransfertBete.objects.create(
            bete=bete,
            transfert=transfert,
            abattoir_source=transfert.abattoir_expediteur,
            abattoir_destination=transfert.abattoir_destinataire,
            statut_transfert='ANNULE',
            note=f'Bête manquante lors de la réception - {len(missing_betes_numbers)} bêtes manquantes'
        )
    
    # Marquer le transfert comme livré
    transfert.statut = 'LIVRE'
    transfert.date_livraison = timezone.now()
    transfert.valide_par = user
    transfert.save()
    
    # Retourner le transfert mis à jour
    transfert_serializer = TransfertSerializer(transfert)
    return Response({
        'detail': 'Réception confirmée avec succès',
        'transfert': transfert_serializer.data,
        'betes_recues': len(betes_recues),
        'betes_manquantes': len(missing_betes_numbers)
    }, status=status.HTTP_200_OK)