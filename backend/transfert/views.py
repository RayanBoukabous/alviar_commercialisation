from rest_framework import generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Count, Sum, Avg, Prefetch
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Transfert, Reception, TransfertBete
from .serializers import (
    TransfertSerializer, TransfertListSerializer,
    ReceptionSerializer, ReceptionListSerializer,
    ConfirmerReceptionSerializer, AnnulerReceptionSerializer,
    TransfertStatsSerializer, ReceptionStatsSerializer
)
from .filters import TransfertFilter, ReceptionFilter

User = get_user_model()


class TransfertViewSet(ModelViewSet):
    """ViewSet pour la gestion des transferts"""
    
    queryset = Transfert.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TransfertFilter
    search_fields = ['numero_transfert', 'motif', 'notes']
    ordering_fields = ['date_creation', 'nombre_betes', 'statut']
    ordering = ['-date_creation']
    
    def get_serializer_class(self):
        """Retourne le bon sérialiseur selon l'action"""
        if self.action == 'list':
            return TransfertListSerializer
        return TransfertSerializer
    
    def get_queryset(self):
        """Filtre les transferts selon l'utilisateur"""
        user = self.request.user
        
        # Précharger les relations des bêtes avec leurs détails
        betes_prefetch = Prefetch(
            'betes',
            queryset=TransfertBete.objects.select_related('bete__espece', 'ajoute_par')
        )
        
        # Si l'utilisateur est un superuser Django ou un superviseur, il voit tous les transferts
        if user.is_superuser or user.user_type == 'SUPERVISEUR':
            return Transfert.objects.select_related(
                'abattoir_expediteur', 'abattoir_destinataire', 'cree_par'
            ).prefetch_related(betes_prefetch)
        
        # Sinon, il ne voit que les transferts de son abattoir
        if hasattr(user, 'abattoir') and user.abattoir:
            return Transfert.objects.filter(
                Q(abattoir_expediteur=user.abattoir) | 
                Q(abattoir_destinataire=user.abattoir)
            ).select_related(
                'abattoir_expediteur', 'abattoir_destinataire', 'cree_par'
            ).prefetch_related(betes_prefetch)
        
        # Si pas d'abattoir associé, retourner tous les transferts pour les superusers
        if user.is_superuser:
            return Transfert.objects.select_related(
                'abattoir_expediteur', 'abattoir_destinataire', 'cree_par'
            ).prefetch_related(betes_prefetch)
        
        return Transfert.objects.none()
    
    def perform_create(self, serializer):
        """Création d'un transfert avec l'utilisateur actuel et création automatique de la réception"""
        try:
            transfert = serializer.save(cree_par=self.request.user)
            
            # Créer automatiquement une réception pour ce transfert
            # La réception est créée pour l'abattoir destinataire
            reception = Reception.objects.create(
                transfert=transfert,
                nombre_betes_attendues=transfert.nombre_betes,
                statut='EN_ATTENTE',
                cree_par=self.request.user
            )
            
            # La réception est créée automatiquement, pas besoin d'ajouter les bêtes ici
            # Les bêtes sont gérées via le transfert
            
            return transfert
            
        except Exception as e:
            # En cas d'erreur, supprimer le transfert créé s'il existe
            if 'transfert' in locals():
                transfert.delete()
            raise e
    
    @action(detail=True, methods=['post'])
    def mettre_en_livraison(self, request, pk=None):
        """Met un transfert en livraison"""
        transfert = self.get_object()
        
        if not transfert.peut_etre_en_livraison:
            return Response(
                {'error': 'Ce transfert ne peut pas être mis en livraison'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            transfert.mettre_en_livraison()
            return Response(
                {'message': 'Transfert mis en livraison avec succès'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def livrer(self, request, pk=None):
        """Marque un transfert comme livré"""
        transfert = self.get_object()
        
        if not transfert.peut_etre_livre:
            return Response(
                {'error': 'Ce transfert ne peut pas être livré'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            transfert.livrer(request.user)
            return Response(
                {'message': 'Transfert livré avec succès'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def annuler(self, request, pk=None):
        """Annule un transfert"""
        transfert = self.get_object()
        
        if not transfert.peut_etre_annule:
            return Response(
                {'error': 'Ce transfert ne peut pas être annulé'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        motif_annulation = request.data.get('motif_annulation', '')
        
        try:
            transfert.annuler(request.user, motif_annulation)
            return Response(
                {'message': 'Transfert annulé avec succès'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def ajouter_bete(self, request, pk=None):
        """Ajoute une bête au transfert"""
        transfert = self.get_object()
        bete_id = request.data.get('bete_id')
        
        if not bete_id:
            return Response(
                {'error': 'ID de la bête requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from bete.models import Bete
            bete = Bete.objects.get(id=bete_id)
            transfert.ajouter_bete(bete)
            return Response(
                {'message': 'Bête ajoutée au transfert'},
                status=status.HTTP_200_OK
            )
        except Bete.DoesNotExist:
            return Response(
                {'error': 'Bête introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def retirer_bete(self, request, pk=None):
        """Retire une bête du transfert"""
        transfert = self.get_object()
        bete_id = request.data.get('bete_id')
        
        if not bete_id:
            return Response(
                {'error': 'ID de la bête requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from bete.models import Bete
            bete = Bete.objects.get(id=bete_id)
            transfert.retirer_bete(bete)
            return Response(
                {'message': 'Bête retirée du transfert'},
                status=status.HTTP_200_OK
            )
        except Bete.DoesNotExist:
            return Response(
                {'error': 'Bête introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Retourne les statistiques des transferts"""
        queryset = self.get_queryset()
        
        stats = {
            'total_transferts': queryset.count(),
            'transferts_en_cours': queryset.filter(statut='EN_COURS').count(),
            'transferts_livres': queryset.filter(statut='LIVRE').count(),
            'transferts_annules': queryset.filter(statut='ANNULE').count(),
            'total_betes_transferees': queryset.aggregate(
                total=Sum('nombre_betes')
            )['total'] or 0,
        }
        
        # Calcul du taux de livraison
        total = stats['total_transferts']
        if total > 0:
            stats['taux_livraison'] = round(
                (stats['transferts_livres'] / total) * 100, 2
            )
        else:
            stats['taux_livraison'] = 0
        
        serializer = TransfertStatsSerializer(stats)
        return Response(serializer.data)


class ReceptionViewSet(ModelViewSet):
    """ViewSet pour la gestion des réceptions"""
    
    queryset = Reception.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ReceptionFilter
    search_fields = ['numero_reception', 'note']
    ordering_fields = ['date_creation', 'statut', 'nombre_betes_recues']
    ordering = ['-date_creation']
    
    def get_serializer_class(self):
        """Retourne le bon sérialiseur selon l'action"""
        if self.action == 'list':
            return ReceptionListSerializer
        return ReceptionSerializer
    
    def get_queryset(self):
        """Filtre les réceptions selon l'utilisateur"""
        user = self.request.user
        
        # Si l'utilisateur est un superuser Django ou un superviseur, il voit toutes les réceptions
        if user.is_superuser or user.user_type == 'SUPERVISEUR':
            return Reception.objects.select_related(
                'transfert__abattoir_expediteur',
                'transfert__abattoir_destinataire',
                'cree_par'
            )
        
        # Sinon, il ne voit que les réceptions de son abattoir
        if user.abattoir:
            return Reception.objects.filter(
                transfert__abattoir_destinataire=user.abattoir
            ).select_related(
                'transfert__abattoir_expediteur',
                'transfert__abattoir_destinataire',
                'cree_par'
            )
        
        return Reception.objects.none()
    
    def perform_create(self, serializer):
        """Création d'une réception avec l'utilisateur actuel"""
        serializer.save(cree_par=self.request.user)
    
    @action(detail=True, methods=['post'])
    def confirmer(self, request, pk=None):
        """Confirme une réception"""
        reception = self.get_object()
        
        if not reception.peut_etre_confirmee:
            return Response(
                {'error': 'Cette réception ne peut pas être confirmée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ConfirmerReceptionSerializer(
            data=request.data,
            context={'reception': reception}
        )
        
        if serializer.is_valid():
            try:
                reception.confirmer_reception(
                    nombre_betes_recues=serializer.validated_data['nombre_betes_recues'],
                    betes_manquantes=serializer.validated_data.get('betes_manquantes', []),
                    valide_par_user=request.user,
                    note=serializer.validated_data.get('note', '')
                )
                
                # Retourner la réception mise à jour
                response_serializer = ReceptionSerializer(reception)
                return Response(response_serializer.data)
                
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def annuler(self, request, pk=None):
        """Annule une réception"""
        reception = self.get_object()
        
        if not reception.peut_etre_annulee:
            return Response(
                {'error': 'Cette réception ne peut pas être annulée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = AnnulerReceptionSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                reception.annuler(
                    annule_par_user=request.user,
                    motif_annulation=serializer.validated_data.get('motif_annulation', '')
                )
                
                return Response(
                    {'message': 'Réception annulée avec succès'},
                    status=status.HTTP_200_OK
                )
                
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Retourne les statistiques des réceptions"""
        queryset = self.get_queryset()
        
        stats = {
            'total_receptions': queryset.count(),
            'receptions_en_attente': queryset.filter(statut='EN_ATTENTE').count(),
            'receptions_completes': queryset.filter(statut='RECU').count(),
            'receptions_partielles': queryset.filter(statut='PARTIEL').count(),
            'receptions_annulees': queryset.filter(statut='ANNULE').count(),
            'total_betes_recues': queryset.aggregate(
                total=Sum('nombre_betes_recues')
            )['total'] or 0,
        }
        
        # Calcul du taux de réception
        total_attendues = queryset.aggregate(
            total=Sum('nombre_betes_attendues')
        )['total'] or 0
        
        if total_attendues > 0:
            stats['taux_reception'] = round(
                (stats['total_betes_recues'] / total_attendues) * 100, 2
            )
        else:
            stats['taux_reception'] = 0
        
        serializer = ReceptionStatsSerializer(stats)
        return Response(serializer.data)


class TransfertAutomatiqueView(generics.CreateAPIView):
    """Vue pour créer automatiquement une réception lors de la création d'un transfert"""
    
    def post(self, request, *args, **kwargs):
        """Crée un transfert et sa réception automatiquement"""
        # Créer le transfert
        transfert_serializer = TransfertSerializer(data=request.data)
        
        if transfert_serializer.is_valid():
            transfert = transfert_serializer.save(cree_par=request.user)
            
            # Créer automatiquement la réception
            reception_data = {
                'transfert_id': transfert.id,
                'nombre_betes_attendues': transfert.nombre_betes
            }
            
            reception_serializer = ReceptionSerializer(data=reception_data)
            
            if reception_serializer.is_valid():
                reception = reception_serializer.save(cree_par=request.user)
                
                return Response({
                    'transfert': TransfertSerializer(transfert).data,
                    'reception': ReceptionSerializer(reception).data,
                    'message': 'Transfert et réception créés avec succès'
                }, status=status.HTTP_201_CREATED)
            else:
                # Si la réception échoue, supprimer le transfert
                transfert.delete()
                return Response(
                    reception_serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(
            transfert_serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )