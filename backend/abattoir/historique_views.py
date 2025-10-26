from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone
from .models import HistoriqueAbattoir
from .serializers import HistoriqueAbattoirSerializer, HistoriqueAbattoirListSerializer


class HistoriqueAbattoirListView(generics.ListAPIView):
    """Vue pour lister l'historique des modifications d'abattoirs"""
    
    serializer_class = HistoriqueAbattoirListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtrage de l'historique"""
        queryset = HistoriqueAbattoir.objects.select_related(
            'abattoir', 'utilisateur'
        ).order_by('-date_modification')
        
        # Filtrage par abattoir
        abattoir_id = self.request.query_params.get('abattoir_id')
        if abattoir_id:
            queryset = queryset.filter(abattoir_id=abattoir_id)
        
        # Filtrage par type d'action
        type_action = self.request.query_params.get('type_action')
        if type_action:
            queryset = queryset.filter(type_action=type_action)
        
        # Filtrage par utilisateur
        utilisateur_id = self.request.query_params.get('utilisateur_id')
        if utilisateur_id:
            queryset = queryset.filter(utilisateur_id=utilisateur_id)
        
        # Filtrage par date
        date_debut = self.request.query_params.get('date_debut')
        date_fin = self.request.query_params.get('date_fin')
        if date_debut:
            queryset = queryset.filter(date_modification__date__gte=date_debut)
        if date_fin:
            queryset = queryset.filter(date_modification__date__lte=date_fin)
        
        # Limitation pour les utilisateurs non-superuser
        if not self.request.user.is_superuser:
            # Les utilisateurs normaux ne voient que l'historique de leur abattoir
            if hasattr(self.request.user, 'abattoir') and self.request.user.abattoir:
                queryset = queryset.filter(abattoir=self.request.user.abattoir)
            else:
                queryset = queryset.none()
        
        return queryset


class HistoriqueAbattoirDetailView(generics.RetrieveAPIView):
    """Vue pour récupérer les détails d'un historique"""
    
    serializer_class = HistoriqueAbattoirSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtrage selon les permissions"""
        queryset = HistoriqueAbattoir.objects.select_related(
            'abattoir', 'utilisateur'
        )
        
        # Limitation pour les utilisateurs non-superuser
        if not self.request.user.is_superuser:
            if hasattr(self.request.user, 'abattoir') and self.request.user.abattoir:
                queryset = queryset.filter(abattoir=self.request.user.abattoir)
            else:
                queryset = queryset.none()
        
        return queryset


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def historique_abattoir_stats(request):
    """Statistiques de l'historique des modifications d'abattoirs"""
    try:
        # Filtrage de base
        queryset = HistoriqueAbattoir.objects.all()
        
        # Limitation pour les utilisateurs non-superuser
        if not request.user.is_superuser:
            if hasattr(request.user, 'abattoir') and request.user.abattoir:
                queryset = queryset.filter(abattoir=request.user.abattoir)
            else:
                queryset = queryset.none()
        
        # Statistiques générales
        total_modifications = queryset.count()
        
        # Modifications par type d'action
        modifications_par_type = queryset.values('type_action').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Modifications par utilisateur
        modifications_par_utilisateur = queryset.values(
            'utilisateur__first_name', 'utilisateur__last_name', 'utilisateur__username'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Modifications par abattoir
        modifications_par_abattoir = queryset.values(
            'abattoir__nom'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Modifications récentes (dernières 30 jours)
        from datetime import timedelta
        date_limite = timezone.now() - timedelta(days=30)
        modifications_recentes = queryset.filter(
            date_modification__gte=date_limite
        ).count()
        
        # Modifications aujourd'hui
        aujourd_hui = timezone.now().date()
        modifications_aujourd_hui = queryset.filter(
            date_modification__date=aujourd_hui
        ).count()
        
        return Response({
            'statistiques': {
                'total_modifications': total_modifications,
                'modifications_recentes_30j': modifications_recentes,
                'modifications_aujourd_hui': modifications_aujourd_hui,
                'modifications_par_type': list(modifications_par_type),
                'modifications_par_utilisateur': list(modifications_par_utilisateur),
                'modifications_par_abattoir': list(modifications_par_abattoir),
            },
            'user_type': 'superuser' if request.user.is_superuser else 'regular',
            'last_updated': timezone.now().isoformat()
        })
        
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de la récupération des statistiques: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
