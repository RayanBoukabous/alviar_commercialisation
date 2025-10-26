from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from .models import Notification
from .serializers import (
    NotificationSerializer,
    NotificationListSerializer,
    NotificationUpdateSerializer,
    NotificationStatsSerializer
)


class NotificationListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des notifications
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtre les notifications par utilisateur"""
        user = self.request.user
        queryset = Notification.objects.filter(user=user).select_related('abattoir')
        
        # Filtres optionnels
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        type_notification = self.request.query_params.get('type')
        if type_notification:
            queryset = queryset.filter(type_notification=type_notification)
        
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        abattoir_id = self.request.query_params.get('abattoir_id')
        if abattoir_id:
            queryset = queryset.filter(abattoir_id=abattoir_id)
        
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return NotificationSerializer
        return NotificationListSerializer
    
    def perform_create(self, serializer):
        """Associe automatiquement l'utilisateur connecté à la notification"""
        serializer.save(user=self.request.user)


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, mettre à jour et supprimer une notification
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        """Filtre les notifications par utilisateur"""
        return Notification.objects.filter(user=self.request.user).select_related('abattoir')
    
    def retrieve(self, request, *args, **kwargs):
        """Marque automatiquement la notification comme lue lors de la récupération"""
        instance = self.get_object()
        if not instance.is_read:
            instance.mark_as_read()
        return super().retrieve(request, *args, **kwargs)


class NotificationUnreadView(generics.ListAPIView):
    """
    Vue pour récupérer les notifications non lues
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationListSerializer
    
    def get_queryset(self):
        """Retourne les notifications non lues de l'utilisateur"""
        user = self.request.user
        queryset = Notification.objects.filter(
            user=user,
            is_read=False
        ).select_related('abattoir').order_by('-created_at')
        
        # Pour les superusers, inclure toutes les notifications non lues
        if user.is_superuser:
            queryset = Notification.objects.filter(
                is_read=False
            ).select_related('abattoir', 'user').order_by('-created_at')
        
        return queryset


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def notification_stats(request):
    """
    Vue pour récupérer les statistiques des notifications
    """
    user = request.user
    
    # Compter les notifications
    total_notifications = Notification.objects.filter(user=user).count()
    unread_count = Notification.objects.filter(user=user, is_read=False).count()
    urgent_count = Notification.objects.filter(
        user=user, 
        is_read=False, 
        priority='URGENT'
    ).count()
    
    # Statistiques par type
    by_type = Notification.objects.filter(user=user).values('type_notification').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Statistiques par priorité
    by_priority = Notification.objects.filter(user=user).values('priority').annotate(
        count=Count('id')
    ).order_by('-count')
    
    stats = {
        'total_notifications': total_notifications,
        'unread_count': unread_count,
        'urgent_count': urgent_count,
        'by_type': {item['type_notification']: item['count'] for item in by_type},
        'by_priority': {item['priority']: item['count'] for item in by_priority}
    }
    
    serializer = NotificationStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_as_read(request):
    """
    Vue pour marquer toutes les notifications comme lues
    """
    user = request.user
    updated_count = Notification.objects.filter(
        user=user,
        is_read=False
    ).update(
        is_read=True,
        read_at=timezone.now()
    )
    
    return Response({
        'message': f'{updated_count} notifications marquées comme lues',
        'updated_count': updated_count
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_as_read(request, notification_id):
    """
    Vue pour marquer une notification spécifique comme lue
    """
    try:
        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )
        
        if not notification.is_read:
            notification.mark_as_read()
            return Response({
                'message': 'Notification marquée comme lue',
                'notification_id': notification_id
            })
        else:
            return Response({
                'message': 'Notification déjà lue',
                'notification_id': notification_id
            })
    
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_count(request):
    """
    Vue pour récupérer le nombre de notifications non lues
    """
    user = request.user
    count = Notification.get_unread_count(user)
    
    return Response({
        'unread_count': count
    })


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_all_notifications(request):
    """
    Vue pour supprimer toutes les notifications de l'utilisateur
    """
    user = request.user
    
    # Compter les notifications avant suppression
    notifications_to_delete = Notification.objects.filter(user=user)
    deleted_count = notifications_to_delete.count()
    
    # Supprimer toutes les notifications
    notifications_to_delete.delete()
    
    return Response({
        'message': f'{deleted_count} notifications supprimées',
        'deleted_count': deleted_count
    })
