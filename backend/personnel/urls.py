from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router pour les vues basées sur les vues génériques
router = DefaultRouter()

urlpatterns = [
    # URLs pour les rôles
    path('roles/', views.RoleListCreateView.as_view(), name='role-list-create'),
    path('roles/<int:pk>/', views.RoleDetailView.as_view(), name='role-detail'),
    
    # URLs pour le personnel
    path('', views.PersonnelListCreateView.as_view(), name='personnel-list-create'),
    path('<uuid:pk>/', views.PersonnelDetailView.as_view(), name='personnel-detail'),
    path('abattoir/<int:abattoir_id>/', views.PersonnelByAbattoirView.as_view(), name='personnel-by-abattoir'),
    path('role/<int:role_id>/', views.PersonnelByRoleView.as_view(), name='personnel-by-role'),
    path('stats/', views.personnel_stats, name='personnel-stats'),
    path('search/', views.personnel_search, name='personnel-search'),
    
]

