from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    """Configuration de l'administration des clients"""
    
    list_display = [
        'nom', 'type_client', 'telephone', 'email', 'wilaya', 'commune', 'commercial'
    ]
    
    list_filter = [
        'type_client', 'wilaya', 'commune', 'commercial', 'created_at'
    ]
    
    search_fields = [
        'nom', 'telephone', 'email', 'adresse', 'nif', 'nis', 'wilaya', 'commune', 'contact_principal'
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
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
    
    ordering = ['nom']