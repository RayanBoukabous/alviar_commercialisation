from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count
from .models import Client
from .serializers import (
    ClientSerializer, ClientCreateSerializer, ClientStatsSerializer
)


class ClientListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer des clients"""
    
    queryset = Client.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ClientCreateSerializer
        return ClientSerializer
    
    def get_queryset(self):
        """Filtrage des clients"""
        queryset = Client.objects.all()
        
        # Filtrage par type
        type_client = self.request.query_params.get('type_client', None)
        if type_client:
            queryset = queryset.filter(type_client=type_client)
        
        
        # Filtrage par commercial
        commercial_id = self.request.query_params.get('commercial_id', None)
        if commercial_id:
            queryset = queryset.filter(commercial_id=commercial_id)
        
        # Filtrage par wilaya
        wilaya = self.request.query_params.get('wilaya', None)
        if wilaya:
            queryset = queryset.filter(wilaya=wilaya)
        
        # Filtrage par commune
        commune = self.request.query_params.get('commune', None)
        if commune:
            queryset = queryset.filter(commune=commune)
        
        # Filtrage par recherche
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) |
                Q(telephone__icontains=search) |
                Q(email__icontains=search) |
                Q(adresse__icontains=search) |
                Q(nif__icontains=search) |
                Q(nis__icontains=search) |
                Q(wilaya__icontains=search) |
                Q(commune__icontains=search)
            )
        
        return queryset.order_by('nom')


class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer un client"""
    
    queryset = Client.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ClientCreateSerializer
        return ClientSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def client_stats(request):
    """Statistiques des clients"""
    
    # Statistiques générales
    total_clients = Client.objects.count()
    
    # Statistiques par type
    par_type = Client.objects.values('type_client').annotate(
        count=Count('id')
    )
    
    # Statistiques par wilaya
    par_wilaya = Client.objects.values('wilaya').annotate(
        count=Count('id')
    ).filter(wilaya__isnull=False)
    
    # Statistiques par commune
    par_commune = Client.objects.values('commune').annotate(
        count=Count('id')
    ).filter(commune__isnull=False)
    
    stats = {
        'total_clients': total_clients,
        'par_type': {item['type_client']: item['count'] for item in par_type},
        'par_wilaya': {item['wilaya']: item['count'] for item in par_wilaya},
        'par_commune': {item['commune']: item['count'] for item in par_commune}
    }
    
    serializer = ClientStatsSerializer(stats)
    return Response(serializer.data)