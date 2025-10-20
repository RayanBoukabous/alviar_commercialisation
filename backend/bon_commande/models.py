from django.db import models
from django.utils.translation import gettext_lazy as _
from abattoir.models import Abattoir
from client.models import Client
from users.models import User


class BonDeCommande(models.Model):
    """
    Modèle pour les bons de commande
    """
    
    TYPE_QUANTITE_CHOICES = [
        ('NOMBRE', _('Nombre de bêtes')),
        ('POIDS', _('Kilogrammes')),
    ]
    
    TYPE_BETE_CHOICES = [
        ('BOVIN', _('Bovin')),
        ('OVIN', _('Ovin')),
        ('CAPRIN', _('Caprin')),
    ]
    
    TYPE_PRODUIT_CHOICES = [
        ('CARCASSE', _('Carcasse')),
        ('VIF', _('Vif')),
    ]
    
    SOURCE_CHOICES = [
        ('PRODUCTION', _('Production')),
        ('ABATTOIR', _('Abattoir')),
    ]
    
    STATUT_CHOICES = [
        ('BROUILLON', _('Brouillon')),
        ('CONFIRME', _('Confirmé')),
        ('EN_COURS', _('En cours')),
        ('LIVRE', _('Livré')),
        ('ANNULE', _('Annulé')),
    ]
    
    # Numéro unique de bon de commande
    numero_bon = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        verbose_name=_('Numéro de bon'),
        help_text=_('Numéro unique du bon de commande (généré automatiquement)')
    )
    
    # Quantité
    type_quantite = models.CharField(
        max_length=10,
        choices=TYPE_QUANTITE_CHOICES,
        default='NOMBRE',
        verbose_name=_('Type de quantité')
    )
    
    quantite = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name=_('Quantité'),
        help_text=_('Nombre de bêtes ou kilogrammes selon le type')
    )
    
    # Type de bête et produit
    type_bete = models.CharField(
        max_length=10,
        choices=TYPE_BETE_CHOICES,
        verbose_name=_('Type de bête')
    )
    
    type_produit = models.CharField(
        max_length=10,
        choices=TYPE_PRODUIT_CHOICES,
        verbose_name=_('Type de produit')
    )
    
    # Cinquième quartier
    avec_cinquieme_quartier = models.BooleanField(
        default=False,
        verbose_name=_('Avec cinquième quartier'),
        help_text=_('Inclure le cinquième quartier (abats)')
    )
    
    # Source du bon de commande
    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default='ABATTOIR',
        verbose_name=_('Source'),
        help_text=_('Source du bon de commande : Production ou Abattoir')
    )
    
    # Relations
    abattoir = models.ForeignKey(
        Abattoir,
        on_delete=models.PROTECT,
        related_name='bons_commande',
        verbose_name=_('Abattoir'),
        help_text=_("Abattoir d'attribution (si source=Production) ou abattoir source (si source=Abattoir)")
    )
    
    client = models.ForeignKey(
        Client,
        on_delete=models.PROTECT,
        related_name='bons_commande',
        verbose_name=_('Client')
    )
    
    # Notes
    notes = models.TextField(
        blank=True,
        verbose_name=_('Notes'),
        help_text=_('Notes et remarques sur la commande')
    )
    
    # Versement
    versement = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Versement'),
        help_text=_('Montant versé par le client (en DA)')
    )
    
    # Statut
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='BROUILLON',
        verbose_name=_('Statut')
    )
    
    # Dates
    date_livraison_prevue = models.DateField(
        null=True,
        blank=True,
        verbose_name=_('Date de livraison prévue')
    )
    
    date_livraison_reelle = models.DateField(
        null=True,
        blank=True,
        verbose_name=_('Date de livraison réelle')
    )
    
    # Traçabilité
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bons_commande_crees',
        verbose_name=_('Créé par')
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Dernière modification')
    )
    
    class Meta:
        verbose_name = _('Bon de commande')
        verbose_name_plural = _('Bons de commande')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.numero_bon} - {self.client.nom} ({self.get_statut_display()})"
    
    def generate_numero_bon(self):
        """Génère un numéro unique pour le bon de commande"""
        from datetime import datetime
        
        # Format: BC-YYYYMMDD-HHMMSS-XXX
        now = datetime.now()
        date_str = now.strftime('%Y%m%d')
        time_str = now.strftime('%H%M%S')
        
        # Compter les bons existants aujourd'hui
        count = BonDeCommande.objects.filter(
            created_at__date=now.date()
        ).count() + 1
        
        numero = f"BC-{date_str}-{time_str}-{count:03d}"
        
        # Vérifier l'unicité
        while BonDeCommande.objects.filter(numero_bon=numero).exists():
            count += 1
            numero = f"BC-{date_str}-{time_str}-{count:03d}"
        
        return numero
    
    def save(self, *args, **kwargs):
        # Générer le numéro si c'est une nouvelle instance
        if not self.numero_bon:
            self.numero_bon = self.generate_numero_bon()
        
        super().save(*args, **kwargs)
    
    @property
    def est_modifiable(self):
        """Vérifie si le bon peut encore être modifié"""
        return self.statut in ['BROUILLON', 'CONFIRME', 'EN_COURS']
    
    @property
    def est_annulable(self):
        """Vérifie si le bon peut être annulé"""
        return self.statut not in ['LIVRE', 'ANNULE']
