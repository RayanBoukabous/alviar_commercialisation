from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from django.db.models import Count, Q
from django.contrib.admin import SimpleListFilter
from .models import Transfert, TransfertBete, Reception


@admin.register(TransfertBete)
class TransfertBeteAdmin(admin.ModelAdmin):
    """Administration des bêtes de transfert"""
    
    list_display = [
        'transfert', 'bete', 'ajoute_par', 'date_ajout'
    ]
    list_filter = [
        'transfert__abattoir_expediteur',
        'transfert__abattoir_destinataire',
        'transfert__statut',
        'date_ajout'
    ]
    search_fields = [
        'transfert__numero_transfert',
        'bete__num_boucle',
        'ajoute_par__username'
    ]
    readonly_fields = ['date_ajout']
    ordering = ['-date_ajout']


class TransfertBeteInline(admin.TabularInline):
    """Inline pour les bêtes de transfert"""
    model = TransfertBete
    extra = 0
    readonly_fields = ['date_ajout']
    fields = ['bete', 'ajoute_par', 'date_ajout']


class StatutTransfertFilter(SimpleListFilter):
    """Filtre personnalisé pour le statut des transferts"""
    title = _('Statut')
    parameter_name = 'statut'

    def lookups(self, request, model_admin):
        return (
            ('EN_COURS', _('En cours')),
            ('LIVRE', _('Livré')),
            ('ANNULE', _('Annulé')),
        )

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(statut=self.value())
        return queryset


@admin.register(Transfert)
class TransfertAdmin(admin.ModelAdmin):
    """Configuration professionnelle de l'administration des transferts"""
    
    list_display = [
        'numero_transfert',
        'route_display',
        'nombre_betes',
        'statut_badge',
        'dates_display',
        'created_at'
    ]
    
    list_filter = [
        StatutTransfertFilter,
        'abattoir_expediteur',
        'abattoir_destinataire',
        'date_creation',
        'cree_par'
    ]
    
    search_fields = [
        'numero_transfert',
        'abattoir_expediteur__nom',
        'abattoir_destinataire__nom',
        'cree_par__username',
        'motif'
    ]
    
    readonly_fields = [
        'numero_transfert',
        'date_creation',
        'date_livraison',
        'date_annulation',
        'created_at',
        'updated_at'
    ]
    
    raw_id_fields = ['abattoir_expediteur', 'abattoir_destinataire', 'cree_par', 'valide_par', 'annule_par']
    
    # Configuration pour Jazzmin
    list_per_page = 25
    list_max_show_all = 100
    date_hierarchy = 'date_creation'
    list_select_related = [
        'abattoir_expediteur',
        'abattoir_destinataire',
        'cree_par',
        'valide_par',
        'annule_par'
    ]
    
    fieldsets = (
        (_('Informations générales'), {
            'fields': (
                'numero_transfert',
                'abattoir_expediteur',
                'abattoir_destinataire',
                'statut'
            )
        }),
        (_('Bêtes'), {
            'fields': ('nombre_betes',)
        }),
        (_('Dates'), {
            'fields': (
                'date_creation',
                'date_livraison',
                'date_annulation'
            )
        }),
        (_('Responsables'), {
            'fields': (
                'cree_par',
                'valide_par',
                'annule_par'
            )
        }),
        (_('Informations supplémentaires'), {
            'fields': (
                'motif',
                'notes'
            ),
            'classes': ('collapse',)
        }),
        (_('Métadonnées'), {
            'fields': (
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        })
    )
    
    inlines = [TransfertBeteInline]
    
    ordering = ['-date_creation']
    
    def route_display(self, obj):
        """Affiche la route du transfert"""
        return format_html(
            '<div style="font-size: 11px;">'
            '<div>🚛 <strong>{}</strong></div>'
            '<div>➡️ <strong>{}</strong></div>'
            '</div>',
            obj.abattoir_expediteur.nom,
            obj.abattoir_destinataire.nom
        )
    route_display.short_description = _('Route')
    
    def statut_badge(self, obj):
        """Affiche le statut avec un badge coloré"""
        colors = {
            'EN_COURS': 'orange',
            'LIVRE': 'green',
            'ANNULE': 'red'
        }
        color = colors.get(obj.statut, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            obj.get_statut_display()
        )
    statut_badge.short_description = _('Statut')
    statut_badge.admin_order_field = 'statut'
    
    def dates_display(self, obj):
        """Affiche les dates importantes"""
        dates = []
        if obj.date_creation:
            dates.append(f"📅 Créé: {obj.date_creation.strftime('%d/%m/%Y')}")
        if obj.date_livraison:
            dates.append(f"🚚 Livré: {obj.date_livraison.strftime('%d/%m/%Y')}")
        return format_html('<br>'.join(dates)) if dates else '-'
    dates_display.short_description = _('Dates')
    
    def get_queryset(self, request):
        """Optimise les requêtes"""
        return super().get_queryset(request).select_related(
            'abattoir_expediteur',
            'abattoir_destinataire',
            'cree_par',
            'valide_par',
            'annule_par'
        )


@admin.register(Reception)
class ReceptionAdmin(admin.ModelAdmin):
    """Administration des réceptions"""
    
    list_display = [
        'numero_reception',
        'transfert_link',
        'abattoir_expediteur',
        'abattoir_destinataire',
        'nombre_betes_attendues',
        'nombre_betes_recues',
        'taux_reception_display',
        'statut_colored',
        'date_creation',
        'date_reception'
    ]
    
    list_filter = [
        'statut',
        'transfert__abattoir_expediteur',
        'transfert__abattoir_destinataire',
        'date_creation',
        'cree_par'
    ]
    
    search_fields = [
        'numero_reception',
        'transfert__numero_transfert',
        'transfert__abattoir_expediteur__nom',
        'transfert__abattoir_destinataire__nom',
        'cree_par__username',
        'note'
    ]
    
    readonly_fields = [
        'numero_reception',
        'transfert',
        'nombre_betes_attendues',
        'date_creation',
        'date_reception',
        'date_annulation',
        'created_at',
        'updated_at'
    ]
    
    fieldsets = (
        ('Informations générales', {
            'fields': (
                'numero_reception',
                'transfert',
                'statut'
            )
        }),
        ('Compteurs de bêtes', {
            'fields': (
                'nombre_betes_attendues',
                'nombre_betes_recues',
                'nombre_betes_manquantes',
                'betes_manquantes'
            )
        }),
        ('Dates', {
            'fields': (
                'date_creation',
                'date_reception',
                'date_annulation'
            )
        }),
        ('Responsables', {
            'fields': (
                'cree_par',
                'valide_par',
                'annule_par'
            )
        }),
        ('Informations supplémentaires', {
            'fields': (
                'note',
            ),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': (
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        })
    )
    
    ordering = ['-date_creation']
    
    def transfert_link(self, obj):
        """Lien vers le transfert associé"""
        url = reverse('admin:transfert_transfert_change', args=[obj.transfert.id])
        return format_html('<a href="{}">{}</a>', url, obj.transfert.numero_transfert)
    transfert_link.short_description = 'Transfert'
    
    def abattoir_expediteur(self, obj):
        """Abattoir expéditeur via le transfert"""
        return obj.transfert.abattoir_expediteur.nom
    abattoir_expediteur.short_description = 'Abattoir expéditeur'
    
    def abattoir_destinataire(self, obj):
        """Abattoir destinataire via le transfert"""
        return obj.transfert.abattoir_destinataire.nom
    abattoir_destinataire.short_description = 'Abattoir destinataire'
    
    def taux_reception_display(self, obj):
        """Affiche le taux de réception avec des couleurs"""
        taux = obj.taux_reception
        if taux == 100:
            color = 'green'
        elif taux >= 80:
            color = 'orange'
        else:
            color = 'red'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}%</span>',
            color,
            taux
        )
    taux_reception_display.short_description = 'Taux'
    
    def statut_colored(self, obj):
        """Affiche le statut avec des couleurs"""
        colors = {
            'EN_ATTENTE': 'orange',
            'EN_COURS': 'blue',
            'RECU': 'green',
            'PARTIEL': 'yellow',
            'ANNULE': 'red'
        }
        color = colors.get(obj.statut, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_statut_display()
        )
    statut_colored.short_description = 'Statut'
    
    def get_queryset(self, request):
        """Optimise les requêtes"""
        return super().get_queryset(request).select_related(
            'transfert__abattoir_expediteur',
            'transfert__abattoir_destinataire',
            'cree_par',
            'valide_par',
            'annule_par'
        )