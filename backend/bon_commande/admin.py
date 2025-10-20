from django.contrib import admin
from .models import BonDeCommande


@admin.register(BonDeCommande)
class BonDeCommandeAdmin(admin.ModelAdmin):
    list_display = [
        'numero_bon', 'client', 'source', 'type_bete', 'quantite', 'type_quantite',
        'statut', 'abattoir', 'versement', 'date_livraison_prevue', 'created_at'
    ]
    list_filter = ['statut', 'source', 'type_bete', 'type_produit', 'type_quantite', 'avec_cinquieme_quartier', 'abattoir']
    search_fields = ['numero_bon', 'client__nom', 'client__prenom', 'notes']
    readonly_fields = ['numero_bon', 'created_by', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('numero_bon', 'statut')
        }),
        ('Détails de la commande', {
            'fields': (
                'source', 'type_quantite', 'quantite', 'type_bete', 'type_produit',
                'avec_cinquieme_quartier', 'versement'
            )
        }),
        ('Relations', {
            'fields': ('abattoir', 'client')
        }),
        ('Livraison', {
            'fields': ('date_livraison_prevue', 'date_livraison_reelle')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Traçabilité', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Si c'est une nouvelle instance
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
