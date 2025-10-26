from django.urls import path
from . import views

app_name = 'notification'

urlpatterns = [
    # Liste et création des notifications
    path('', views.NotificationListCreateView.as_view(), name='notification-list-create'),
    
    # Détail, mise à jour et suppression d'une notification
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    
    # Notifications non lues
    path('unread/', views.NotificationUnreadView.as_view(), name='notification-unread'),
    
    # Statistiques des notifications
    path('stats/', views.notification_stats, name='notification-stats'),
    
    # Marquer toutes les notifications comme lues
    path('mark-all-read/', views.mark_all_as_read, name='notification-mark-all-read'),
    
    # Marquer une notification spécifique comme lue
    path('<int:notification_id>/mark-read/', views.mark_notification_as_read, name='notification-mark-read'),
    
    # Nombre de notifications non lues
    path('unread-count/', views.unread_count, name='notification-unread-count'),
    
    # Supprimer toutes les notifications
    path('delete-all/', views.delete_all_notifications, name='notification-delete-all'),
]
