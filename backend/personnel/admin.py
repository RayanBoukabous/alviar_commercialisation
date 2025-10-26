from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from django.db.models import Count, Q
from django.contrib.admin import SimpleListFilter
from .models import Role, Personnel


class StatutPersonnelFilter(SimpleListFilter):
    """Filtre personnalisé pour le statut du personnel"""
    title = _('Statut')
    parameter_name = 'statut'

    def lookups(self, request, model_admin):
        return (
            ('ACTIF', _('Actif')),
            ('INACTIF', _('Inactif')),
            ('CONGE', _('En congé')),
            ('SUSPENDU', _('Suspendu')),
        )

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(statut=self.value())
        return queryset


class AncienneteFilter(SimpleListFilter):
    """Filtre personnalisé pour l'ancienneté"""
    title = _('Ancienneté')
    parameter_name = 'anciennete'

    def lookups(self, request, model_admin):
        return (
            ('0-1', _('0-1 an')),
            ('1-5', _('1-5 ans')),
            ('5-10', _('5-10 ans')),
            ('10+', _('10+ ans')),
        )

    def queryset(self, request, queryset):
        from datetime import date, timedelta
        today = date.today()
        
        if self.value() == '0-1':
            return queryset.filter(date_embauche__gte=today - timedelta(days=365))
        elif self.value() == '1-5':
            return queryset.filter(
                date_embauche__lt=today - timedelta(days=365),
                date_embauche__gte=today - timedelta(days=365*5)
            )
        elif self.value() == '5-10':
            return queryset.filter(
                date_embauche__lt=today - timedelta(days=365*5),
                date_embauche__gte=today - timedelta(days=365*10)
            )
        elif self.value() == '10+':
            return queryset.filter(date_embauche__lt=today - timedelta(days=365*10))
        return queryset


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """Configuration professionnelle de l'administration des rôles"""
    
    list_display = [
        'nom', 'description_short', 'nombre_personnel', 'actif_badge', 'created_at'
    ]
    list_filter = ['actif', 'created_at']
    search_fields = ['nom', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    # Configuration pour Jazzmin
    list_per_page = 25
    list_max_show_all = 100
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (_('Informations de base'), {
            'fields': ('nom', 'description', 'actif')
        }),
        (_('Permissions'), {
            'fields': ('permissions',),
            'classes': ('collapse',)
        }),
        (_('Métadonnées'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def description_short(self, obj):
        """Affiche une version courte de la description"""
        if obj.description:
            return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
        return '-'
    description_short.short_description = _('Description')
    
    def nombre_personnel(self, obj):
        """Affiche le nombre de personnel pour ce rôle"""
        count = obj.personnel.count()
        if count > 0:
            return format_html(
                '<span style="color: green; font-weight: bold;">{}</span>',
                count
            )
        return format_html('<span style="color: gray;">0</span>')
    nombre_personnel.short_description = _('Personnel')
    nombre_personnel.admin_order_field = 'personnel_count'
    
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
        return super().get_queryset(request).annotate(
            personnel_count=Count('personnel')
        )


@admin.register(Personnel)
class PersonnelAdmin(admin.ModelAdmin):
    """Configuration professionnelle de l'administration du personnel"""
    
    list_display = [
        'photo_thumbnail', 'nom_complet', 'numero_employe', 'abattoir', 'role', 
        'statut_badge', 'age', 'anciennete', 'created_at'
    ]
    list_filter = [
        StatutPersonnelFilter,
        AncienneteFilter,
        'sexe', 'role', 'abattoir', 'wilaya', 
        'date_embauche', 'created_at'
    ]
    search_fields = [
        'nom', 'prenom', 'numero_employe', 'numero_carte_identite',
        'telephone', 'email', 'adresse'
    ]
    readonly_fields = [
        'id', 'nom_complet', 'age', 'anciennete', 'created_at', 'updated_at'
    ]
    raw_id_fields = ['abattoir', 'role', 'created_by']
    
    # Configuration pour Jazzmin
    list_per_page = 25
    list_max_show_all = 100
    date_hierarchy = 'created_at'
    list_select_related = ['abattoir', 'role', 'created_by']
    
    fieldsets = (
        (_('Informations personnelles'), {
            'fields': (
                'nom', 'prenom', 'nom_complet', 'date_naissance', 
                'lieu_naissance', 'sexe', 'nationalite'
            )
        }),
        (_('Informations d\'identité'), {
            'fields': (
                'numero_carte_identite', 'date_emission_carte', 
                'lieu_emission_carte', 'carte_identite_recto', 'carte_identite_verso'
            )
        }),
        (_('Informations de contact'), {
            'fields': (
                'telephone', 'telephone_urgence', 'email', 
                'adresse', 'wilaya', 'commune'
            )
        }),
        (_('Informations professionnelles'), {
            'fields': (
                'abattoir', 'role', 'numero_employe', 'date_embauche',
                'statut'
            )
        }),
        (_('Documents et photos'), {
            'fields': ('photo',),
            'classes': ('collapse',)
        }),
        (_('Informations supplémentaires'), {
            'fields': ('competences', 'formations', 'notes'),
            'classes': ('collapse',)
        }),
        (_('Métadonnées'), {
            'fields': ('id', 'age', 'anciennete', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def photo_thumbnail(self, obj):
        """Affiche une miniature de la photo"""
        if obj.photo:
            return format_html(
                '<img src="{}" width="40" height="40" style="border-radius: 50%; object-fit: cover;" />',
                obj.photo.url
            )
        return format_html('<div style="width: 40px; height: 40px; background-color: #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">👤</div>')
    photo_thumbnail.short_description = _('Photo')
    
    def statut_badge(self, obj):
        """Affiche le statut avec un badge coloré"""
        colors = {
            'ACTIF': 'green',
            'INACTIF': 'red',
            'CONGE': 'orange',
            'SUSPENDU': 'darkred'
        }
        color = colors.get(obj.statut, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            obj.get_statut_display()
        )
    statut_badge.short_description = _('Statut')
    statut_badge.admin_order_field = 'statut'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('abattoir', 'role', 'created_by')
    
    def save_model(self, request, obj, form, change):
        """Logique de sauvegarde personnalisée"""
        if not change:  # Si c'est une création
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

