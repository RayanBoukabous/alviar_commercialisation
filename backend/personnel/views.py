from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.contrib.auth import get_user_model
from .models import Role, Personnel

User = get_user_model()
from .serializers import (
    RoleSerializer, PersonnelListSerializer, PersonnelDetailSerializer,
    PersonnelCreateUpdateSerializer, PersonnelStatsSerializer, PersonnelSearchSerializer
)
from abattoir.models import Abattoir


class PersonnelPagination(PageNumberPagination):
    """Pagination personnalisée pour le personnel"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class RoleListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer les rôles"""
    queryset = Role.objects.filter(actif=True)
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'description']
    ordering_fields = ['nom', 'created_at']
    ordering = ['nom']


class RoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer un rôle"""
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]


class PersonnelListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer le personnel"""
    queryset = Personnel.objects.select_related('abattoir', 'role', 'created_by').all()
    permission_classes = [IsAuthenticated]
    pagination_class = PersonnelPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['abattoir', 'role', 'statut', 'wilaya', 'sexe']
    search_fields = ['nom', 'prenom', 'numero_employe', 'numero_carte_identite', 'telephone', 'email']
    ordering_fields = ['nom', 'prenom', 'date_embauche', 'created_at']
    ordering = ['nom', 'prenom']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PersonnelListSerializer
        return PersonnelCreateUpdateSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PersonnelDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer un membre du personnel"""
    queryset = Personnel.objects.select_related('abattoir', 'role', 'created_by').all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PersonnelDetailSerializer
        return PersonnelCreateUpdateSerializer


class PersonnelByAbattoirView(generics.ListAPIView):
    """Vue pour lister le personnel par abattoir"""
    serializer_class = PersonnelListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PersonnelPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'statut', 'sexe']
    search_fields = ['nom', 'prenom', 'numero_employe']
    ordering_fields = ['nom', 'prenom', 'date_embauche']
    ordering = ['nom', 'prenom']
    
    def get_queryset(self):
        abattoir_id = self.kwargs['abattoir_id']
        return Personnel.objects.filter(
            abattoir_id=abattoir_id
        ).select_related('abattoir', 'role', 'created_by')


class PersonnelByRoleView(generics.ListAPIView):
    """Vue pour lister le personnel par rôle"""
    serializer_class = PersonnelListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PersonnelPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['abattoir', 'statut', 'sexe']
    search_fields = ['nom', 'prenom', 'numero_employe']
    ordering_fields = ['nom', 'prenom', 'date_embauche']
    ordering = ['nom', 'prenom']
    
    def get_queryset(self):
        role_id = self.kwargs['role_id']
        return Personnel.objects.filter(
            role_id=role_id
        ).select_related('abattoir', 'role', 'created_by')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def personnel_stats(request):
    """Vue pour les statistiques du personnel"""
    
    # Statistiques générales
    total_personnel = Personnel.objects.count()
    personnel_actif = Personnel.objects.filter(statut='ACTIF').count()
    personnel_inactif = Personnel.objects.filter(statut='INACTIF').count()
    
    # Personnel par rôle
    personnel_par_role = {}
    for role in Role.objects.all():
        count = Personnel.objects.filter(role=role).count()
        if count > 0:
            personnel_par_role[role.get_nom_display()] = count
    
    # Personnel par abattoir
    personnel_par_abattoir = {}
    for abattoir in Abattoir.objects.all():
        count = Personnel.objects.filter(abattoir=abattoir).count()
        if count > 0:
            personnel_par_abattoir[abattoir.nom] = count
    
    # Personnel par wilaya
    personnel_par_wilaya = {}
    wilayas = Personnel.objects.values_list('wilaya', flat=True).distinct()
    for wilaya in wilayas:
        if wilaya:
            count = Personnel.objects.filter(wilaya=wilaya).count()
            personnel_par_wilaya[wilaya] = count
    
    # Moyennes
    moyenne_age = Personnel.objects.aggregate(avg_age=Avg('date_naissance'))['avg_age']
    moyenne_anciennete = Personnel.objects.aggregate(avg_embauche=Avg('date_embauche'))['avg_embauche']
    
    # Calculer l'âge moyen (approximatif)
    if moyenne_age:
        from datetime import date
        today = date.today()
        moyenne_age = today.year - moyenne_age.year
    
    # Calculer l'ancienneté moyenne (approximative)
    if moyenne_anciennete:
        from datetime import date
        today = date.today()
        moyenne_anciennete = today.year - moyenne_anciennete.year
    
    stats = {
        'total_personnel': total_personnel,
        'personnel_actif': personnel_actif,
        'personnel_inactif': personnel_inactif,
        'personnel_par_role': personnel_par_role,
        'personnel_par_abattoir': personnel_par_abattoir,
        'personnel_par_wilaya': personnel_par_wilaya,
        'moyenne_age': moyenne_age or 0,
        'moyenne_anciennete': moyenne_anciennete or 0,
    }
    
    serializer = PersonnelStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def personnel_search(request):
    """Vue pour la recherche avancée de personnel"""
    serializer = PersonnelSearchSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    query = data.get('query', '')
    abattoir_id = data.get('abattoir')
    role_id = data.get('role')
    statut = data.get('statut')
    wilaya = data.get('wilaya')
    
    # Construire la requête
    queryset = Personnel.objects.select_related('abattoir', 'role', 'created_by')
    
    # Recherche textuelle
    if query:
        queryset = queryset.filter(
            Q(nom__icontains=query) |
            Q(prenom__icontains=query) |
            Q(numero_employe__icontains=query) |
            Q(numero_carte_identite__icontains=query) |
            Q(telephone__icontains=query) |
            Q(email__icontains=query)
        )
    
    # Filtres
    if abattoir_id:
        queryset = queryset.filter(abattoir_id=abattoir_id)
    if role_id:
        queryset = queryset.filter(role_id=role_id)
    if statut:
        queryset = queryset.filter(statut=statut)
    if wilaya:
        queryset = queryset.filter(wilaya__icontains=wilaya)
    
    # Pagination
    paginator = PersonnelPagination()
    page = paginator.paginate_queryset(queryset, request)
    
    if page is not None:
        serializer = PersonnelListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = PersonnelListSerializer(queryset, many=True)
    return Response(serializer.data)

