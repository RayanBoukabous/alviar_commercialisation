from django.contrib import admin
from .models import Transfert


@admin.register(Transfert)
class TransfertAdmin(admin.ModelAdmin):
    list_display = [
        'numero_transfert',
        'abattoir_expediteur',
        'abattoir_destinataire',
        'nombre_betes',
        'statut',
        'date_creation',
        'cree_par'
    ]
    
    list_filter = [
        'statut',
        'abattoir_expediteur',
        'abattoir_destinataire',
        'date_creation',
        'created_at'
    ]
    
    search_fields = [
        'numero_transfert',
        'abattoir_expediteur__nom',
        'abattoir_destinataire__nom',
        'cree_par__username',
        'note'
    ]
    
    readonly_fields = [
        'numero_transfert',
        'date_creation',
        'date_livraison',
        'date_annulation',
        'created_at',
        'updated_at'
    ]
    
    fieldsets = (
        ('Informations générales', {
            'fields': (
                'numero_transfert',
                'abattoir_expediteur',
                'abattoir_destinataire',
                'statut'
            )
        }),
        ('Bêtes et dates', {
            'fields': (
                'betes',
                'date_creation',
                'date_livraison',
                'date_annulation'
            )
        }),
        ('Utilisateurs et notes', {
            'fields': (
                'cree_par',
                'valide_par',
                'note'
            )
        }),
        ('Métadonnées', {
            'fields': (
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        })
    )
    
    filter_horizontal = ['betes']
    
    def nombre_betes(self, obj):
        return obj.nombre_betes
    nombre_betes.short_description = 'Nombre de bêtes'