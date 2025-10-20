from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Configuration de l'administration des utilisateurs"""
    
    list_display = [
        'username', 'email', 'first_name', 'last_name', 'user_type', 'abattoir',
        'is_active', 'is_staff', 'date_joined'
    ]
    
    list_filter = [
        'user_type', 'abattoir', 'is_active', 'is_staff', 'is_superuser', 'date_joined'
    ]
    
    search_fields = ['username', 'first_name', 'last_name', 'email']
    
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
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'user_type', 'abattoir'),
        }),
    )
    
    readonly_fields = ['date_joined', 'last_login', 'created_at', 'updated_at']
    
    def get_readonly_fields(self, request, obj=None):
        """Champs en lecture seule selon le contexte"""
        readonly_fields = list(self.readonly_fields)
        if obj:  # Modification d'un utilisateur existant
            readonly_fields.append('username')
        return readonly_fields