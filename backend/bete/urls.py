from django.urls import path
from . import views
from . import espece_views

app_name = 'bete'

urlpatterns = [
    # Espèces
    path('especes/', views.EspeceListCreateView.as_view(), name='espece-list-create'),
    path('especes/<int:pk>/', views.EspeceDetailView.as_view(), name='espece-detail'),
    path('especes-list/', espece_views.espece_list, name='espece-list'),
    
    # Bêtes
    path('', views.BeteListCreateView.as_view(), name='bete-list-create'),
    path('<int:pk>/', views.BeteDetailView.as_view(), name='bete-detail'),
    path('<int:pk>/history/', views.bete_history, name='bete-history'),
    path('livestock/', views.betes_for_livestock, name='betes-for-livestock'),
    path('carcass-statistics/', views.carcass_statistics, name='carcass-statistics'),

]

