from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count, Q
from django.contrib.admin import SimpleListFilter
from .models import Espece, Bete


class StatutFilter(SimpleListFilter):
    """Filtre personnalisé pour le statut des bêtes"""
    title = _('Statut')
    parameter_name = 'statut'

    def lookups(self, request, model_admin):
        return (
            ('VIVANT', _('Vivant')),
            ('EN_STABULATION', _('En stabulation')),
            ('ABATTU', _('Abattu')),
            ('MORT', _('Mort')),
            ('VENDU', _('Vendu')),
        )

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(statut=self.value())
        return queryset


class PoidsFilter(SimpleListFilter):
    """Filtre personnalisé pour le poids des bêtes"""
    title = _('Poids')
    parameter_name = 'poids_range'

    def lookups(self, request, model_admin):
        return (
            ('0-50', _('0-50 kg')),
            ('50-100', _('50-100 kg')),
            ('100-200', _('100-200 kg')),
            ('200+', _('200+ kg')),
        )

    def queryset(self, request, queryset):
        if self.value() == '0-50':
            return queryset.filter(poids_vif__lte=50)
        elif self.value() == '50-100':
            return queryset.filter(poids_vif__gt=50, poids_vif__lte=100)
        elif self.value() == '100-200':
            return queryset.filter(poids_vif__gt=100, poids_vif__lte=200)
        elif self.value() == '200+':
            return queryset.filter(poids_vif__gt=200)
        return queryset


@admin.register(Espece)
class EspeceAdmin(admin.ModelAdmin):
    """Configuration professionnelle de l'administration des espèces"""
    
    list_display = [
        'nom', 'nombre_betes', 'description_short', 'created_at'
    ]
    list_filter = ['created_at']
    search_fields = ['nom', 'description']
    ordering = ['nom']
    
    # Configuration pour Jazzmin
    list_per_page = 25
    list_max_show_all = 100
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (_('Informations de base'), {
            'fields': ('nom', 'description')
        }),
        (_('Métadonnées'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def nombre_betes(self, obj):
        """Affiche le nombre de bêtes pour cette espèce"""
        count = obj.bete_set.count()
        if count > 0:
            return format_html(
                '<span style="color: green; font-weight: bold;">{}</span>',
                count
            )
        return format_html('<span style="color: gray;">0</span>')
    nombre_betes.short_description = _('Nombre de bêtes')
    nombre_betes.admin_order_field = 'bete_count'
    
    def description_short(self, obj):
        """Affiche une version courte de la description"""
        if obj.description:
            return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
        return '-'
    description_short.short_description = _('Description')
    
    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            bete_count=Count('bete')
        )


@admin.register(Bete)
class BeteAdmin(admin.ModelAdmin):
    """Configuration professionnelle de l'administration des bêtes"""
    
    list_display = [
        'num_boucle', 'espece', 'client', 'statut_colored', 
        'poids_display', 'sexe_icon', 'abattoir', 'created_at'
    ]
    
    list_filter = [
        StatutFilter,
        PoidsFilter,
        'espece', 
        'sexe', 
        'etat_sante',
        'abattage_urgence',
        'client',
        'abattoir',
        'created_at'
    ]
    
    search_fields = [
        'num_boucle', 
        'num_boucle_post_abattage',
        'client__nom', 
        'espece__nom',
        'notes'
    ]
    
    readonly_fields = [
        'created_at', 'updated_at', 'poids_display'
    ]
    
    raw_id_fields = ['client', 'espece', 'abattoir', 'created_by']
    
    fieldsets = (
        (_('Informations d\'identification'), {
            'fields': (
                'num_boucle', 
                'num_boucle_post_abattage',
                'espece', 
                'client',
                'abattoir'
            )
        }),
        (_('Caractéristiques physiques'), {
            'fields': (
                'sexe', 
                'poids_vif', 
                'poids_a_chaud', 
                'poids_a_froid',
                'couleur'
            )
        }),
        (_('Statut et santé'), {
            'fields': (
                'statut', 
                'etat_sante', 
                'abattage_urgence'
            )
        }),
        (_('Informations supplémentaires'), {
            'fields': [
                'notes'
            ],
            'classes': ('collapse',)
        }),
        (_('Métadonnées'), {
            'fields': (
                'created_by',
                'created_at', 
                'updated_at',
                'poids_display'
            ),
            'classes': ('collapse',)
        }),
    )
    
    # Configuration pour Jazzmin
    list_per_page = 25
    list_max_show_all = 100
    date_hierarchy = 'created_at'
    list_select_related = ['espece', 'proprietaire']
    
    def statut_colored(self, obj):
        """Affiche le statut avec des couleurs"""
        colors = {
            'VIVANT': 'green',
            'EN_STABULATION': 'orange',
            'ABATTU': 'red',
            'MORT': 'darkred',
            'VENDU': 'blue'
        }
        color = colors.get(obj.statut, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_statut_display()
        )
    statut_colored.short_description = _('Statut')
    statut_colored.admin_order_field = 'statut'
    
    def poids_display(self, obj):
        """Affiche le poids avec formatage"""
        if obj.poids_vif:
            return f"{obj.poids_vif} kg"
        return '-'
    poids_display.short_description = _('Poids')
    poids_display.admin_order_field = 'poids_vif'
    
    def sexe_icon(self, obj):
        """Affiche le sexe avec une icône"""
        if obj.sexe == 'M':
            return format_html('<span style="color: blue;">♂ Mâle</span>')
        else:
            return format_html('<span style="color: pink;">♀ Femelle</span>')
    sexe_icon.short_description = _('Sexe')
    sexe_icon.admin_order_field = 'sexe'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('espece', 'client', 'abattoir', 'created_by')
    
    def save_model(self, request, obj, form, change):
        """Logique de sauvegarde personnalisée"""
        super().save_model(request, obj, form, change)
