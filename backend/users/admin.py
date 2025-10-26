from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count, Q
from django.contrib.admin import SimpleListFilter
from .models import User


class UserTypeFilter(SimpleListFilter):
    """Filtre personnalisé pour le type d'utilisateur"""
    title = _('Type d\'utilisateur')
    parameter_name = 'user_type'

    def lookups(self, request, model_admin):
        return (
            ('ADMIN', _('Administrateur')),
            ('SUPERVISEUR', _('Superviseur')),
            ('GESTIONNAIRE', _('Gestionnaire')),
            ('OPERATEUR', _('Opérateur')),
        )

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(user_type=self.value())
        return queryset


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Configuration professionnelle de l'administration des utilisateurs"""
    
    list_display = [
        'username', 'nom_complet', 'email', 'user_type_badge', 'abattoir', 
        'is_active_badge', 'is_staff_badge', 'last_login_display', 'date_joined'
    ]
    
    list_filter = [
        UserTypeFilter,
        'abattoir', 
        'is_active', 
        'is_staff', 
        'is_superuser', 
        'date_joined'
    ]
    
    search_fields = [
        'username', 'first_name', 'last_name', 'email', 'phone_number'
    ]
    
    raw_id_fields = ['abattoir']
    
    # Configuration pour Jazzmin
    list_per_page = 25
    list_max_show_all = 100
    date_hierarchy = 'date_joined'
    list_select_related = ['abattoir']
    
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Informations personnelles'), {
            'fields': ('first_name', 'last_name', 'email', 'phone_number', 'address')
        }),
        (_('Permissions'), {
            'fields': ('user_type', 'abattoir', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Dates importantes'), {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'user_type', 'abattoir'),
        }),
    )
    
    readonly_fields = ['date_joined', 'last_login', 'created_at', 'updated_at']
    
    def nom_complet(self, obj):
        """Affiche le nom complet"""
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return '-'
    nom_complet.short_description = _('Nom complet')
    nom_complet.admin_order_field = 'first_name'
    
    def user_type_badge(self, obj):
        """Affiche le type d'utilisateur avec un badge coloré"""
        colors = {
            'ADMIN': 'red',
            'SUPERVISEUR': 'purple',
            'GESTIONNAIRE': 'blue',
            'OPERATEUR': 'green'
        }
        color = colors.get(obj.user_type, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            obj.get_user_type_display()
        )
    user_type_badge.short_description = _('Type')
    user_type_badge.admin_order_field = 'user_type'
    
    def is_active_badge(self, obj):
        """Affiche le statut actif avec un badge"""
        if obj.is_active:
            return format_html(
                '<span style="background-color: green; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;">Actif</span>'
            )
        else:
            return format_html(
                '<span style="background-color: red; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;">Inactif</span>'
            )
    is_active_badge.short_description = _('Actif')
    is_active_badge.admin_order_field = 'is_active'
    
    def is_staff_badge(self, obj):
        """Affiche le statut staff avec un badge"""
        if obj.is_staff:
            return format_html(
                '<span style="background-color: blue; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;">Staff</span>'
            )
        else:
            return format_html('<span style="color: gray;">-</span>')
    is_staff_badge.short_description = _('Staff')
    is_staff_badge.admin_order_field = 'is_staff'
    
    def last_login_display(self, obj):
        """Affiche la dernière connexion"""
        if obj.last_login:
            return obj.last_login.strftime('%d/%m/%Y %H:%M')
        return '-'
    last_login_display.short_description = _('Dernière connexion')
    last_login_display.admin_order_field = 'last_login'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('abattoir')
    
    def get_readonly_fields(self, request, obj=None):
        """Champs en lecture seule selon le contexte"""
        readonly_fields = list(self.readonly_fields)
        if obj:  # Modification d'un utilisateur existant
            readonly_fields.append('username')
        return readonly_fields