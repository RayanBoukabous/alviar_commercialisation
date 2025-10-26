import django_filters
from django.db.models import Q
from .models import Transfert, Reception
from abattoir.models import Abattoir


class TransfertFilter(django_filters.FilterSet):
    """Filtres pour les transferts"""
    
    # Filtres de base
    statut = django_filters.ChoiceFilter(choices=Transfert.STATUT_CHOICES)
    abattoir_expediteur = django_filters.ModelChoiceFilter(
        queryset=Abattoir.objects.all()
    )
    abattoir_destinataire = django_filters.ModelChoiceFilter(
        queryset=Abattoir.objects.all()
    )
    
    # Filtres de date
    date_creation_after = django_filters.DateTimeFilter(
        field_name='date_creation',
        lookup_expr='gte'
    )
    date_creation_before = django_filters.DateTimeFilter(
        field_name='date_creation',
        lookup_expr='lte'
    )
    date_livraison_after = django_filters.DateTimeFilter(
        field_name='date_livraison',
        lookup_expr='gte'
    )
    date_livraison_before = django_filters.DateTimeFilter(
        field_name='date_livraison',
        lookup_expr='lte'
    )
    
    # Filtres de nombre de bêtes
    nombre_betes_min = django_filters.NumberFilter(
        field_name='nombre_betes',
        lookup_expr='gte'
    )
    nombre_betes_max = django_filters.NumberFilter(
        field_name='nombre_betes',
        lookup_expr='lte'
    )
    
    # Filtre pour les transferts en cours
    en_cours = django_filters.BooleanFilter(
        method='filter_en_cours'
    )
    
    # Filtre pour les transferts de l'utilisateur
    mes_transferts = django_filters.BooleanFilter(
        method='filter_mes_transferts'
    )
    
    class Meta:
        model = Transfert
        fields = [
            'statut', 'abattoir_expediteur', 'abattoir_destinataire',
            'date_creation_after', 'date_creation_before',
            'date_livraison_after', 'date_livraison_before',
            'nombre_betes_min', 'nombre_betes_max',
            'en_cours', 'mes_transferts'
        ]
    
    def filter_en_cours(self, queryset, name, value):
        """Filtre les transferts en cours"""
        if value:
            return queryset.filter(statut='EN_COURS')
        return queryset
    
    def filter_mes_transferts(self, queryset, name, value):
        """Filtre les transferts de l'utilisateur connecté"""
        if value and hasattr(self, 'request'):
            user = self.request.user
            if user.abattoir:
                return queryset.filter(
                    Q(abattoir_expediteur=user.abattoir) |
                    Q(abattoir_destinataire=user.abattoir)
                )
        return queryset


class ReceptionFilter(django_filters.FilterSet):
    """Filtres pour les réceptions"""
    
    # Filtres de base
    statut = django_filters.ChoiceFilter(choices=Reception.STATUT_CHOICES)
    
    # Filtres via le transfert
    abattoir_expediteur = django_filters.ModelChoiceFilter(
        field_name='transfert__abattoir_expediteur',
        queryset=Abattoir.objects.all()
    )
    abattoir_destinataire = django_filters.ModelChoiceFilter(
        field_name='transfert__abattoir_destinataire',
        queryset=Abattoir.objects.all()
    )
    
    # Filtres de date
    date_creation_after = django_filters.DateTimeFilter(
        field_name='date_creation',
        lookup_expr='gte'
    )
    date_creation_before = django_filters.DateTimeFilter(
        field_name='date_creation',
        lookup_expr='lte'
    )
    date_reception_after = django_filters.DateTimeFilter(
        field_name='date_reception',
        lookup_expr='gte'
    )
    date_reception_before = django_filters.DateTimeFilter(
        field_name='date_reception',
        lookup_expr='lte'
    )
    
    # Filtres de nombre de bêtes
    nombre_betes_attendues_min = django_filters.NumberFilter(
        field_name='nombre_betes_attendues',
        lookup_expr='gte'
    )
    nombre_betes_attendues_max = django_filters.NumberFilter(
        field_name='nombre_betes_attendues',
        lookup_expr='lte'
    )
    nombre_betes_recues_min = django_filters.NumberFilter(
        field_name='nombre_betes_recues',
        lookup_expr='gte'
    )
    nombre_betes_recues_max = django_filters.NumberFilter(
        field_name='nombre_betes_recues',
        lookup_expr='lte'
    )
    
    # Filtre pour les réceptions en attente
    en_attente = django_filters.BooleanFilter(
        method='filter_en_attente'
    )
    
    # Filtre pour les réceptions partielles
    partielles = django_filters.BooleanFilter(
        method='filter_partielles'
    )
    
    # Filtre pour les réceptions de l'utilisateur
    mes_receptions = django_filters.BooleanFilter(
        method='filter_mes_receptions'
    )
    
    class Meta:
        model = Reception
        fields = [
            'statut', 'abattoir_expediteur', 'abattoir_destinataire',
            'date_creation_after', 'date_creation_before',
            'date_reception_after', 'date_reception_before',
            'nombre_betes_attendues_min', 'nombre_betes_attendues_max',
            'nombre_betes_recues_min', 'nombre_betes_recues_max',
            'en_attente', 'partielles', 'mes_receptions'
        ]
    
    def filter_en_attente(self, queryset, name, value):
        """Filtre les réceptions en attente"""
        if value:
            return queryset.filter(statut='EN_ATTENTE')
        return queryset
    
    def filter_partielles(self, queryset, name, value):
        """Filtre les réceptions partielles"""
        if value:
            return queryset.filter(statut='PARTIEL')
        return queryset
    
    def filter_mes_receptions(self, queryset, name, value):
        """Filtre les réceptions de l'utilisateur connecté"""
        if value and hasattr(self, 'request'):
            user = self.request.user
            if user.abattoir:
                return queryset.filter(
                    transfert__abattoir_destinataire=user.abattoir
                )
        return queryset

