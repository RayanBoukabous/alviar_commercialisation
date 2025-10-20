from django.urls import path
from . import views

app_name = 'client'

urlpatterns = [
    # Clients
    path('', views.ClientListCreateView.as_view(), name='client-list-create'),
    path('<int:pk>/', views.ClientDetailView.as_view(), name='client-detail'),
    
    # Statistiques
    path('stats/', views.client_stats, name='client-stats'),
]

