from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Espece, Bete


@admin.register(Espece)
class EspeceAdmin(admin.ModelAdmin):
    """Configuration de l'administration des espèces"""
    
    list_display = ['nom', 'created_at']
    search_fields = ['nom']
    ordering = ['nom']



@admin.register(Bete)
class BeteAdmin(admin.ModelAdmin):
    """Configuration de l'administration des bêtes"""
    

    
 
    


