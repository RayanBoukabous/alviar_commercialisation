from django.urls import path
from . import views

app_name = 'bon_commande'

urlpatterns = [
    # CRUD basique
    path('', views.BonDeCommandeListCreateView.as_view(), name='bon-list-create'),
    path('<int:pk>/', views.BonDeCommandeDetailView.as_view(), name='bon-detail'),
    
    # Actions spécifiques
    path('<int:pk>/update-status/', views.update_bon_status, name='bon-update-status'),
    path('<int:pk>/annuler/', views.annuler_bon, name='bon-annuler'),
    
    # Statistiques
    path('stats/', views.bon_commande_stats, name='bon-stats'),
]



