from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count, Q, Avg
from django.contrib.admin import SimpleListFilter
from .models import Abattoir, ChambreFroide, HistoriqueChambreFroide, Stabulation


class ChambreFroideInline(admin.TabularInline):
    """Inline pour les chambres froides dans l'admin des abattoirs"""
    model = ChambreFroide
    extra = 1
    fields = ['numero', 'dimensions_m3']
    readonly_fields = ['created_at', 'updated_at']


class WilayaFilter(SimpleListFilter):
    """Filtre personnalisé pour la wilaya des abattoirs"""
    title = _('Wilaya')
    parameter_name = 'wilaya'

    def lookups(self, request, model_admin):
        wilayas = Abattoir.objects.values_list('wilaya', flat=True).distinct().exclude(wilaya__isnull=True).exclude(wilaya='')
        return [(w, w) for w in wilayas]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(wilaya=self.value())
        return queryset


@admin.register(Abattoir)
class AbattoirAdmin(admin.ModelAdmin):
    """Configuration professionnelle de l'administration des abattoirs"""
    
    list_display = [
        'nom', 'localisation', 'capacites_display', 'chambres_froides_count', 
        'responsable', 'actif_badge', 'created_at'
    ]
    
    list_filter = [
        WilayaFilter,
        'actif', 
        'wilaya', 
        'commune', 
        'created_at'
    ]
    
    search_fields = [
        'nom', 'wilaya', 'commune', 'telephone', 'email', 'adresse'
    ]
    
    readonly_fields = [
        'created_at', 'updated_at', 'adresse_complete', 
        'capacite_totale_reception', 'capacite_totale_stabulation',
        'chambres_froides_count'
    ]
    
    raw_id_fields = ['responsable']
    inlines = [ChambreFroideInline]
    
    # Configuration pour Jazzmin
    list_per_page = 25
    list_max_show_all = 100
    date_hierarchy = 'created_at'
    list_select_related = ['responsable']
    
    fieldsets = (
        (_('Informations de base'), {
            'fields': ('nom', 'wilaya', 'commune', 'adresse_complete', 'telephone', 'email')
        }),
        (_('Capacités de réception'), {
            'fields': (
                'capacite_reception_ovin', 'capacite_reception_bovin', 
                'capacite_totale_reception'
            )
        }),
        (_('Capacités de stabulation'), {
            'fields': (
                'capacite_stabulation_ovin', 'capacite_stabulation_bovin', 
                'capacite_totale_stabulation'
            )
        }),
        (_('Responsable et statut'), {
            'fields': ('responsable', 'actif')
        }),
        (_('Métadonnées'), {
            'fields': ('created_at', 'updated_at', 'chambres_froides_count'),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['wilaya', 'commune', 'nom']
    
    def localisation(self, obj):
        """Affiche la localisation"""
        location = []
        if obj.wilaya:
            location.append(obj.wilaya)
        if obj.commune:
            location.append(obj.commune)
        return ', '.join(location) if location else '-'
    localisation.short_description = _('Localisation')
    localisation.admin_order_field = 'wilaya'
    
    def capacites_display(self, obj):
        """Affiche les capacités de manière compacte"""
        reception = obj.capacite_totale_reception or 0
        stabulation = obj.capacite_totale_stabulation or 0
        return format_html(
            '<div style="font-size: 11px;">'
            '<div>📥 Réception: <strong>{}</strong></div>'
            '<div>🏠 Stabulation: <strong>{}</strong></div>'
            '</div>',
            reception, stabulation
        )
    capacites_display.short_description = _('Capacités')
    
    def chambres_froides_count(self, obj):
        """Affiche le nombre de chambres froides"""
        count = obj.chambrefroide_set.count()
        if count > 0:
            return format_html(
                '<span style="color: blue; font-weight: bold;">{}</span>',
                count
            )
        return format_html('<span style="color: gray;">0</span>')
    chambres_froides_count.short_description = _('Chambres froides')
    chambres_froides_count.admin_order_field = 'chambrefroide_count'
    
    def actif_badge(self, obj):
        """Affiche le statut actif avec un badge"""
        if obj.actif:
            return format_html(
                '<span style="background-color: green; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;">Actif</span>'
            )
        else:
            return format_html(
                '<span style="background-color: red; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;">Inactif</span>'
            )
    actif_badge.short_description = _('Statut')
    actif_badge.admin_order_field = 'actif'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('responsable').annotate(
            chambrefroide_count=Count('chambrefroide')
        )


class HistoriqueChambreFroideInline(admin.TabularInline):
    """Inline pour l'historique des températures"""
    model = HistoriqueChambreFroide
    extra = 0
    readonly_fields = ['date_mesure', 'created_at']
    fields = ['temperature', 'date_mesure']


@admin.register(ChambreFroide)
class ChambreFroideAdmin(admin.ModelAdmin):
    """Configuration de l'administration des chambres froides"""
    
    list_display = [
        'numero', 'abattoir', 'dimensions_m3', 'nombre_mesures', 'derniere_temperature'
    ]
    
    list_filter = [
        'abattoir', 'created_at'
    ]
    
    search_fields = [
        'numero', 'abattoir__nom', 'abattoir__wilaya', 'abattoir__commune'
    ]
    
    readonly_fields = ['created_at', 'updated_at', 'nombre_mesures', 'derniere_temperature']
    
    fieldsets = (
        (_('Informations de base'), {
            'fields': ('abattoir', 'numero', 'dimensions_m3')
        }),
        (_('Statistiques'), {
            'fields': ('nombre_mesures', 'derniere_temperature'),
            'classes': ('collapse',)
        }),
        (_('Métadonnées'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['abattoir', 'numero']
    
    def nombre_mesures(self, obj):
        """Retourne le nombre de mesures"""
        return obj.historique_temperatures.count()
    nombre_mesures.short_description = _('Nombre de mesures')
    
    def derniere_temperature(self, obj):
        """Retourne la dernière température"""
        derniere_mesure = obj.historique_temperatures.first()
        return f"{derniere_mesure.temperature}°C" if derniere_mesure else _('Aucune mesure')
    derniere_temperature.short_description = _('Dernière température')


@admin.register(HistoriqueChambreFroide)
class HistoriqueChambreFroideAdmin(admin.ModelAdmin):
    """Configuration de l'administration de l'historique des températures"""
    
    list_display = [
        'chambre_froide', 'abattoir_nom', 'temperature', 'date_mesure'
    ]
    
    list_filter = [
        'chambre_froide__abattoir', 'date_mesure', 'created_at'
    ]
    
    search_fields = [
        'chambre_froide__numero', 'chambre_froide__abattoir__nom'
    ]
    
    readonly_fields = ['created_at', 'date_mesure']
    
    fieldsets = (
        (_('Mesure de température'), {
            'fields': ('chambre_froide', 'temperature', 'date_mesure')
        }),
        (_('Métadonnées'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['-date_mesure']
    
    def abattoir_nom(self, obj):
        """Retourne le nom de l'abattoir"""
        return obj.chambre_froide.abattoir.nom
    abattoir_nom.short_description = _('Abattoir')


# ============================================================================
# ADMIN POUR LES STABULATIONS
# ============================================================================

class BeteInline(admin.TabularInline):
    """Inline pour les bêtes dans l'admin des stabulations"""
    model = Stabulation.betes.through
    extra = 0
    fields = ['bete']
    readonly_fields = []


@admin.register(Stabulation)
class StabulationAdmin(admin.ModelAdmin):
    """Configuration de l'administration des stabulations"""
    
    list_display = [
        'numero_stabulation', 'abattoir', 'type_bete', 'statut', 
        'nombre_betes_actuelles', 'capacite_maximale', 'taux_occupation', 
        'date_debut', 'created_by'
    ]
    
    list_filter = [
        'statut', 'type_bete', 'abattoir', 'date_debut', 'created_at'
    ]
    
    search_fields = [
        'numero_stabulation', 'abattoir__nom', 'abattoir__wilaya', 
        'abattoir__commune', 'notes', 'created_by__username'
    ]
    
    readonly_fields = [
        'created_at', 'updated_at', 'nombre_betes_actuelles', 
        'capacite_maximale', 'taux_occupation', 'duree_stabulation_heures',
        'est_pleine', 'places_disponibles'
    ]
    
    filter_horizontal = ['betes']
    
    fieldsets = (
        (_('Informations de base'), {
            'fields': (
                'numero_stabulation', 'abattoir', 'type_bete', 'statut'
            )
        }),
        (_('Dates'), {
            'fields': ('date_debut', 'date_fin')
        }),
        (_('Bêtes en stabulation'), {
            'fields': ('betes',),
            'description': _('Sélectionnez les bêtes à mettre en stabulation')
        }),
        (_('Statistiques'), {
            'fields': (
                'nombre_betes_actuelles', 'capacite_maximale', 'taux_occupation',
                'duree_stabulation_heures', 'est_pleine', 'places_disponibles'
            ),
            'classes': ('collapse',)
        }),
        (_('Notes'), {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        (_('Métadonnées'), {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['-date_debut', 'abattoir', 'numero_stabulation']
    
    def nombre_betes_actuelles(self, obj):
        """Retourne le nombre de bêtes actuelles"""
        return obj.nombre_betes_actuelles
    nombre_betes_actuelles.short_description = _('Bêtes actuelles')
    
    def capacite_maximale(self, obj):
        """Retourne la capacité maximale"""
        return obj.capacite_maximale
    capacite_maximale.short_description = _('Capacité max')
    
    def taux_occupation(self, obj):
        """Retourne le taux d'occupation"""
        return f"{obj.taux_occupation}%"
    taux_occupation.short_description = _('Taux occupation')
    
    def duree_stabulation_heures(self, obj):
        """Retourne la durée en heures"""
        return f"{obj.duree_stabulation_heures}h"
    duree_stabulation_heures.short_description = _('Durée (h)')
    
    def est_pleine(self, obj):
        """Retourne si la stabulation est pleine"""
        return _('Oui') if obj.est_pleine else _('Non')
    est_pleine.short_description = _('Pleine')
    est_pleine.boolean = True
    
    def places_disponibles(self, obj):
        """Retourne le nombre de places disponibles"""
        return obj.places_disponibles
    places_disponibles.short_description = _('Places disponibles')
    
    def get_queryset(self, request):
        """Optimise les requêtes"""
        return super().get_queryset(request).select_related(
            'abattoir', 'created_by'
        ).prefetch_related('betes')
    
    def save_model(self, request, obj, form, change):
        """Associe automatiquement l'utilisateur créateur"""
        if not change:  # Si c'est une création
            obj.created_by = request.user
        super().save_model(request, obj, form, change)