from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Role, Personnel


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['nom', 'description', 'actif', 'created_at']
    list_filter = ['actif', 'created_at']
    search_fields = ['nom', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('nom', 'description', 'actif')
        }),
        ('Permissions', {
            'fields': ('permissions',),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )




@admin.register(Personnel)
class PersonnelAdmin(admin.ModelAdmin):
    list_display = [
        'nom_complet', 'numero_employe', 'abattoir', 'role', 
        'statut', 'date_embauche', 'age', 'anciennete'
    ]
    list_filter = [
        'statut', 'sexe', 'role', 'abattoir', 'wilaya', 
        'date_embauche', 'created_at'
    ]
    search_fields = [
        'nom', 'prenom', 'numero_employe', 'numero_carte_identite',
        'telephone', 'email'
    ]
    readonly_fields = [
        'id', 'nom_complet', 'age', 'anciennete', 'created_at', 'updated_at'
    ]
    raw_id_fields = ['abattoir', 'role', 'created_by']
    
    fieldsets = (
        ('Informations personnelles', {
            'fields': (
                'nom', 'prenom', 'nom_complet', 'date_naissance', 
                'lieu_naissance', 'sexe', 'nationalite'
            )
        }),
        ('Informations d\'identité', {
            'fields': (
                'numero_carte_identite', 'date_emission_carte', 
                'lieu_emission_carte', 'carte_identite_recto', 'carte_identite_verso'
            )
        }),
        ('Informations de contact', {
            'fields': (
                'telephone', 'telephone_urgence', 'email', 
                'adresse', 'wilaya', 'commune'
            )
        }),
        ('Informations professionnelles', {
            'fields': (
                'abattoir', 'role', 'numero_employe', 'date_embauche',
                'statut'
            )
        }),
        ('Documents et photos', {
            'fields': ('photo',),
            'classes': ('collapse',)
        }),
        ('Informations supplémentaires', {
            'fields': ('competences', 'formations', 'notes'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('id', 'age', 'anciennete', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('abattoir', 'role', 'created_by')
    
    def save_model(self, request, obj, form, change):
        if not change:  # Si c'est une création
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

