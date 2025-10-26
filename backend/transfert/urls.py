from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TransfertViewSet, ReceptionViewSet, TransfertAutomatiqueView
)

# Router pour les ViewSets
router = DefaultRouter()
router.register(r'transferts', TransfertViewSet, basename='transfert')
router.register(r'receptions', ReceptionViewSet, basename='reception')

urlpatterns = [
    # URLs des ViewSets
    path('', include(router.urls)),
    
    # URL pour la création automatique de transfert + réception
    path('transfert-automatique/', TransfertAutomatiqueView.as_view(), name='transfert-automatique'),
]

