from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count, Q
from django.contrib.admin import SimpleListFilter
from .models import Client


class TypeClientFilter(SimpleListFilter):
    """Filtre personnalisé pour le type de client"""
    title = _('Type de client')
    parameter_name = 'type_client'

    def lookups(self, request, model_admin):
        return (
            ('PARTICULIER', _('Particulier')),
            ('GROSSISTE', _('Grossiste')),
            ('SUPERGROSSISTE', _('Supergrossiste')),
        )

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(type_client=self.value())
        return queryset


class WilayaFilter(SimpleListFilter):
    """Filtre personnalisé pour la wilaya"""
    title = _('Wilaya')
    parameter_name = 'wilaya'

    def lookups(self, request, model_admin):
        wilayas = Client.objects.values_list('wilaya', flat=True).distinct().exclude(wilaya__isnull=True).exclude(wilaya='')
        return [(w, w) for w in wilayas]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(wilaya=self.value())
        return queryset


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    """Configuration professionnelle de l'administration des clients"""
    
    list_display = [
        'nom', 'type_client_badge', 'contact_info', 'localisation', 
        'commercial', 'created_at'
    ]
    
    list_filter = [
        TypeClientFilter,
        WilayaFilter,
        'commune', 
        'commercial', 
        'created_at'
    ]
    
    search_fields = [
        'nom', 'telephone', 'email', 'adresse', 'nif', 'nis', 
        'wilaya', 'commune', 'contact_principal'
    ]
    
    readonly_fields = [
        'created_at', 'updated_at', 'contact_info', 'localisation'
    ]
    
    raw_id_fields = ['commercial', 'created_by']
    
    fieldsets = (
        (_('Informations de base'), {
            'fields': ('nom', 'type_client', 'telephone', 'email', 'adresse')
        }),
        (_('Informations fiscales et géographiques'), {
            'fields': ('nif', 'nis', 'wilaya', 'commune')
        }),
        (_('Informations commerciales'), {
            'fields': ('commercial', 'notes')
        }),
        (_('Contact'), {
            'fields': ('contact_principal', 'telephone_contact')
        }),
        (_('Métadonnées'), {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Configuration pour Jazzmin
    list_per_page = 25
    list_max_show_all = 100
    date_hierarchy = 'created_at'
    list_select_related = ['commercial', 'created_by']
    
    ordering = ['nom']
    
    def type_client_badge(self, obj):
        """Affiche le type de client avec un badge coloré"""
        colors = {
            'PARTICULIER': 'blue',
            'GROSSISTE': 'green',
            'SUPERGROSSISTE': 'purple'
        }
        color = colors.get(obj.type_client, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            obj.get_type_client_display()
        )
    type_client_badge.short_description = _('Type')
    type_client_badge.admin_order_field = 'type_client'
    
    def contact_info(self, obj):
        """Affiche les informations de contact"""
        info = []
        if obj.telephone:
            info.append(f"📞 {obj.telephone}")
        if obj.email:
            info.append(f"✉️ {obj.email}")
        return format_html('<br>'.join(info)) if info else '-'
    contact_info.short_description = _('Contact')
    
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
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('commercial', 'created_by')
    
    def save_model(self, request, obj, form, change):
        """Logique de sauvegarde personnalisée"""
        if not change:  # Si c'est une création
            obj.created_by = request.user
        super().save_model(request, obj, form, change)