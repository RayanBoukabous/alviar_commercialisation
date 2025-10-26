from django.urls import path
from . import views

app_name = 'abattoir'

urlpatterns = [
    # Abattoirs
    path('', views.AbattoirListCreateView.as_view(), name='abattoir-list-create'),
    path('<int:pk>/', views.AbattoirDetailView.as_view(), name='abattoir-detail'),
    
    # Chambres froides
    path('chambres-froides/', views.ChambreFroideListCreateView.as_view(), name='chambre-froide-list-create'),
    path('chambres-froides/<int:pk>/', views.ChambreFroideDetailView.as_view(), name='chambre-froide-detail'),
    
    # Historique des températures
    path('historique-temperatures/', views.HistoriqueChambreFroideListCreateView.as_view(), name='historique-list-create'),
    path('historique-temperatures/<int:pk>/', views.HistoriqueChambreFroideDetailView.as_view(), name='historique-detail'),
    
        # Stabulations
        path('stabulations/', views.StabulationListCreateView.as_view(), name='stabulation-list-create'),
        path('stabulations/all/', views.all_stabulations, name='all-stabulations'),
        path('stabulations/<int:pk>/', views.StabulationDetailView.as_view(), name='stabulation-detail'),
        path('stabulations/stats/', views.stabulation_stats, name='stabulation-stats'),
        path('stabulations/<int:pk>/terminer/', views.terminer_stabulation, name='terminer-stabulation'),
        path('stabulations/<int:pk>/annuler/', views.annuler_stabulation, name='annuler-stabulation'),
        path('stabulations/<int:pk>/ajouter-betes/', views.ajouter_betes_stabulation, name='ajouter-betes-stabulation'),
        path('stabulations/<int:pk>/retirer-betes/', views.retirer_betes_stabulation, name='retirer-betes-stabulation'),
        path('stabulations/<int:pk>/historique/', views.historique_stabulation, name='historique-stabulation'),
        path('<int:abattoir_id>/stabulations/', views.stabulations_abattoir, name='stabulations-abattoir'),
    
    # Bêtes disponibles pour stabulation
    path('betes-disponibles-stabulation/', views.betes_disponibles_stabulation, name='betes-disponibles-stabulation'),
    
    # Statistiques
    path('stats/', views.abattoir_stats, name='abattoir-stats'),
    path('my-stats/', views.my_abattoir_stats, name='my-abattoir-stats'),
    path('global-stats/', views.global_stats, name='global-stats'),
    path('dashboard-stats/', views.dashboard_stats, name='dashboard-stats'),
    path('dashboard-statistics/', views.dashboard_statistics, name='dashboard-statistics'),
    path('slaughter-data-by-period/', views.slaughter_data_by_period, name='slaughter-data-by-period'),
    path('diagnostic-data-consistency/', views.diagnostic_data_consistency, name='diagnostic-data-consistency'),
    path('slaughtered-animals-report/', views.slaughtered_animals_report, name='slaughtered-animals-report'),
    path('abattoirs-for-charts/', views.abattoirs_for_charts, name='abattoirs-for-charts'),
    path('abattoirs-for-management/', views.abattoirs_for_management, name='abattoirs-for-management'),
    path('<int:pk>/detail-with-facilities/', views.abattoir_detail_with_facilities, name='abattoir-detail-with-facilities'),
]

