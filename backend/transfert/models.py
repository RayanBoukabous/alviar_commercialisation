from django.db import models
from django.conf import settings
from django.utils import timezone
from abattoir.models import Abattoir
from bete.models import Bete


class Transfert(models.Model):
    """
    Modèle pour gérer les transferts de bêtes entre abattoirs
    """
    
    STATUT_CHOICES = [
        ('EN_COURS', 'En cours'),
        ('LIVRE', 'Livré'),
        ('ANNULE', 'Annulé'),
    ]
    
    # Informations de base
    numero_transfert = models.CharField(
        max_length=50, 
        unique=True, 
        verbose_name="Numéro de transfert"
    )
    
    # Abattoirs
    abattoir_expediteur = models.ForeignKey(
        Abattoir,
        on_delete=models.CASCADE,
        related_name='transferts_expedies',
        verbose_name="Abattoir expéditeur"
    )
    
    abattoir_destinataire = models.ForeignKey(
        Abattoir,
        on_delete=models.CASCADE,
        related_name='transferts_recus',
        verbose_name="Abattoir destinataire"
    )
    
    # Bêtes transférées
    betes = models.ManyToManyField(
        Bete,
        related_name='transferts',
        verbose_name="Bêtes transférées"
    )
    
    # Statut et dates
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='EN_COURS',
        verbose_name="Statut"
    )
    
    date_creation = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )
    
    date_livraison = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de livraison"
    )
    
    date_annulation = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date d'annulation"
    )
    
    # Utilisateur et notes
    cree_par = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transferts_crees',
        verbose_name="Créé par"
    )
    
    valide_par = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transferts_valides',
        verbose_name="Validé par"
    )
    
    note = models.TextField(
        blank=True,
        null=True,
        verbose_name="Note"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Transfert"
        verbose_name_plural = "Transferts"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.numero_transfert} - {self.abattoir_expediteur.nom} → {self.abattoir_destinataire.nom}"
    
    @property
    def nombre_betes(self):
        """Retourne le nombre de bêtes dans le transfert"""
        return self.betes.count()
    
    @property
    def est_modifiable(self):
        """Vérifie si le transfert peut encore être modifié"""
        return self.statut == 'EN_COURS'
    
    @property
    def est_annulable(self):
        """Vérifie si le transfert peut être annulé"""
        return self.statut == 'EN_COURS'
    
    @property
    def est_livrable(self):
        """Vérifie si le transfert peut être marqué comme livré"""
        return self.statut == 'EN_COURS'
    
    def annuler(self, user):
        """Annule le transfert"""
        if self.est_annulable:
            self.statut = 'ANNULE'
            self.date_annulation = timezone.now()
            self.save()
            return True
        return False
    
    def livrer(self, user):
        """Marque le transfert comme livré"""
        if self.est_livrable:
            self.statut = 'LIVRE'
            self.date_livraison = timezone.now()
            self.valide_par = user
            self.save()
            return True
        return False
    
    def get_betes_info(self):
        """Retourne les informations des bêtes"""
        return {
            'total': self.nombre_betes,
            'bovins': self.betes.filter(espece__nom='Bovin').count(),
            'ovins': self.betes.filter(espece__nom='Ovin').count(),
            'caprins': self.betes.filter(espece__nom='Caprin').count(),
        }
    
    def get_statut_display_color(self):
        """Retourne la couleur du badge de statut"""
        colors = {
            'EN_COURS': 'yellow',
            'LIVRE': 'green',
            'ANNULE': 'red',
        }
        return colors.get(self.statut, 'gray')