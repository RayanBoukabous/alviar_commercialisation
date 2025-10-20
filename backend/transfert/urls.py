from django.urls import path
from . import views

urlpatterns = [
    # Transferts
    path('', views.TransfertListCreateView.as_view(), name='transfert-list-create'),
    path('<int:pk>/', views.TransfertDetailView.as_view(), name='transfert-detail'),
    path('<int:pk>/annuler/', views.annuler_transfert, name='transfert-annuler'),
    path('<int:pk>/livrer/', views.livrer_transfert, name='transfert-livrer'),
    path('<int:transfert_id>/confirmer-reception/', views.confirmer_reception_detaillee, name='transfert-confirmer-reception'),
    
    # Statistiques et utilitaires
    path('stats/', views.transfert_stats, name='transfert-stats'),
    path('betes-disponibles/', views.betes_disponibles, name='betes-disponibles'),
]

