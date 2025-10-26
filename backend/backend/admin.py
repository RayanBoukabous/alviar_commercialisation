"""
Configuration personnalisée de l'interface d'administration Django
avec Django Jazzmin pour ALVIAR Dashboard
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

# ================================
# PERSONNALISATION DES MODÈLES
# ================================

class ALVIARUserAdmin(BaseUserAdmin):
    """
    Interface d'administration personnalisée pour les utilisateurs
    """
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined', 'last_login')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('-date_joined',)
    
    fieldsets = (
        ('Informations personnelles', {
            'fields': ('username', 'password', 'first_name', 'last_name', 'email')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Dates importantes', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('date_joined', 'last_login')

# ================================
# DASHBOARD PERSONNALISÉ
# ================================

class ALVIARDashboard:
    """
    Dashboard personnalisé pour ALVIAR
    """
    title = "ALVIAR Administration"
    site_header = "ALVIAR Dashboard"
    site_title = "ALVIAR Admin"
    index_title = "Tableau de bord ALVIAR"
    
    def index(self, request, extra_context=None):
        """
        Dashboard personnalisé avec statistiques ALVIAR
        """
        from django.db.models import Count
        from abattoir.models import Abattoir, Stabulation
        from bete.models import Bete
        from client.models import Client
        from personnel.models import Personnel
        from transfert.models import Transfert
        from bon_commande.models import BonDeCommande
        from notification.models import Notification
        
        # Statistiques principales
        stats = {
            'total_abattoirs': Abattoir.objects.count(),
            'total_betes': Bete.objects.count(),
            'total_clients': Client.objects.count(),
            'total_personnel': Personnel.objects.count(),
            'total_transferts': Transfert.objects.count(),
            'total_bons_commande': BonDeCommande.objects.count(),
            'total_notifications': Notification.objects.count(),
            'stabulations_actives': Stabulation.objects.filter(statut='ACTIVE').count(),
        }
        
        # Statistiques par statut
        betes_stats = Bete.objects.values('statut').annotate(count=Count('id'))
        transferts_stats = Transfert.objects.values('statut').annotate(count=Count('id'))
        
        extra_context = extra_context or {}
        extra_context.update({
            'stats': stats,
            'betes_stats': betes_stats,
            'transferts_stats': transferts_stats,
            'dashboard_title': 'Tableau de bord ALVIAR',
        })
        
        return super().index(request, extra_context)

# ================================
# WIDGETS PERSONNALISÉS
# ================================

class ALVIARAdminSite(admin.AdminSite):
    """
    Site d'administration personnalisé pour ALVIAR
    """
    site_header = "ALVIAR Administration"
    site_title = "ALVIAR Admin"
    index_title = "Tableau de bord ALVIAR"
    
    def index(self, request, extra_context=None):
        """
        Page d'accueil personnalisée avec statistiques
        """
        from django.db.models import Count
        from abattoir.models import Abattoir, Stabulation
        from bete.models import Bete
        from client.models import Client
        from personnel.models import Personnel
        from transfert.models import Transfert
        from bon_commande.models import BonDeCommande
        from notification.models import Notification
        
        # Statistiques principales
        stats = {
            'total_abattoirs': Abattoir.objects.count(),
            'total_betes': Bete.objects.count(),
            'total_clients': Client.objects.count(),
            'total_personnel': Personnel.objects.count(),
            'total_transferts': Transfert.objects.count(),
            'total_bons_commande': BonDeCommande.objects.count(),
            'total_notifications': Notification.objects.count(),
            'stabulations_actives': Stabulation.objects.filter(statut='ACTIVE').count(),
        }
        
        # Graphiques et statistiques avancées
        betes_par_espece = Bete.objects.values('espece__nom').annotate(count=Count('id'))
        transferts_par_statut = Transfert.objects.values('statut').annotate(count=Count('id'))
        
        extra_context = extra_context or {}
        extra_context.update({
            'stats': stats,
            'betes_par_espece': betes_par_espece,
            'transferts_par_statut': transferts_par_statut,
            'dashboard_title': 'Tableau de bord ALVIAR',
            'welcome_message': 'Bienvenue dans l\'administration ALVIAR',
        })
        
        return super().index(request, extra_context)

# ================================
# CONFIGURATION DES MODÈLES
# ================================

# Désinscrire le UserAdmin par défaut et utiliser notre version personnalisée
admin.site.unregister(User)
admin.site.register(User, ALVIARUserAdmin)

# Personnalisation des titres et descriptions
admin.site.site_header = "ALVIAR Administration"
admin.site.site_title = "ALVIAR Admin"
admin.site.index_title = "Tableau de bord ALVIAR"

# ================================
# ACTIONS PERSONNALISÉES
# ================================

@admin.action(description='Activer les utilisateurs sélectionnés')
def activate_users(modeladmin, request, queryset):
    """Action pour activer plusieurs utilisateurs"""
    updated = queryset.update(is_active=True)
    modeladmin.message_user(request, f'{updated} utilisateur(s) activé(s).')

@admin.action(description='Désactiver les utilisateurs sélectionnés')
def deactivate_users(modeladmin, request, queryset):
    """Action pour désactiver plusieurs utilisateurs"""
    updated = queryset.update(is_active=False)
    modeladmin.message_user(request, f'{updated} utilisateur(s) désactivé(s).')

# Ajouter les actions personnalisées au UserAdmin
ALVIARUserAdmin.actions = [activate_users, deactivate_users]

# ================================
# CONFIGURATION JAZZMIN
# ================================

# Configuration spécifique pour Jazzmin
JAZZMIN_SETTINGS = {
    "site_title": "ALVIAR Administration",
    "site_header": "ALVIAR Dashboard", 
    "site_brand": "ALVIAR",
    "welcome_sign": "Bienvenue dans l'administration ALVIAR",
    "copyright": "ALVIAR Dashboard - Développé par ALVIAR",
    
    # Thème et couleurs
    "theme": "flatly",
    "color_theme": "light",
    
    # Navigation
    "show_sidebar": True,
    "navigation_expanded": True,
    
    # Icônes personnalisées
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "abattoir.Abattoir": "fas fa-building",
        "abattoir.Stabulation": "fas fa-home",
        "abattoir.ChambreFroide": "fas fa-snowflake",
        "abattoir.HistoriqueAbattoir": "fas fa-history",
        "bete.Bete": "fas fa-paw",
        "bete.Espece": "fas fa-tags",
        "client.Client": "fas fa-user-tie",
        "personnel.Personnel": "fas fa-id-badge",
        "personnel.Role": "fas fa-user-tag",
        "transfert.Transfert": "fas fa-truck",
        "bon_commande.BonDeCommande": "fas fa-file-invoice",
        "aliment.Aliment": "fas fa-seedling",
        "notification.Notification": "fas fa-bell",
    },
    
    # Liens du menu supérieur
    "topmenu_links": [
        {"name": "Accueil", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "API Documentation", "url": "/api/", "new_window": True},
        {"name": "Support", "url": "mailto:support@alviar.com", "new_window": True},
    ],
    
    # Liens du menu utilisateur
    "usermenu_links": [
        {"name": "Profil", "url": "admin:auth_user_change", "permissions": ["auth.view_user"]},
        {"name": "Paramètres", "url": "admin:auth_user_change", "permissions": ["auth.view_user"]},
    ],
    
    # Interface utilisateur
    "show_ui_builder": True,
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible",
        "auth.group": "vertical_tabs",
    },
    
    # Recherche
    "search_model": ["auth.User", "abattoir.Abattoir", "bete.Bete"],
    
    # Ordre des applications
    "order_with_respect_to": [
        "auth",
        "abattoir",
        "bete", 
        "client",
        "personnel",
        "transfert",
        "bon_commande",
        "aliment",
        "notification",
    ],
}
