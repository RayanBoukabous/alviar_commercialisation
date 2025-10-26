from django.db import models
from django.utils.translation import gettext_lazy as _
from simple_history.models import HistoricalRecords
from abattoir.models import Abattoir
from client.models import Client
from users.models import User


class Espece(models.Model):
    """Modèle pour les espèces d'animaux"""
    
    nom = models.CharField(max_length=100, unique=True, verbose_name=_('Nom de l\'espèce'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Description'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Date de création'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Date de modification'))
    
    class Meta:
        verbose_name = _('Espèce')
        verbose_name_plural = _('Espèces')
        ordering = ['nom']
    
    def __str__(self):
        return self.nom



class Bete(models.Model):
    """Modèle principal pour les bêtes"""
    
    SEXE_CHOICES = [
        ('M', _('Mâle')),
        ('F', _('Femelle')),
    ]
    
    STATUT_CHOICES = [
        ('VIVANT', _('Vivant')),
        ('EN_STABULATION', _('En stabulation')),
        ('ABATTU', _('Abattu')),
        ('MORT', _('Mort')),
        ('VENDU', _('Vendu')),
    ]
    SANTE_CHOICES = [
        ('BON', _('BON')),
        ('MALADE', _('MALADE')),
    ]
    
    # Informations de base
    num_boucle = models.CharField(
        max_length=50, 
        unique=True, 
        verbose_name=_('Numéro d\'identification')
    )
    num_boucle_post_abattage = models.CharField(
        max_length=50, 
        unique=True, 
        blank=True,
        null=True,
        verbose_name=_('Numéro d\'identification post abattage')
    )
    espece = models.ForeignKey('bete.Espece', on_delete=models.PROTECT, verbose_name=_('Espèce'))
    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES, verbose_name=_('Sexe'))

    
    # Informations actuelles
    poids_vif = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        blank=True, 
        null=True, 
        verbose_name=_('Poids actuel (kg)')
    )
    poids_a_chaud = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        blank=True, 
        null=True, 
        verbose_name=_('Poids a chaud (kg)')
    )
    poids_a_froid = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        blank=True, 
        null=True, 
        verbose_name=_('Poids a froid (kg)')
    )
    statut = models.CharField(
        max_length=20, 
        choices=STATUT_CHOICES, 
        default='VIVANT', 
        verbose_name=_('Statut')
    )
    etat_sante = models.CharField(
        max_length=10, 
        choices=SANTE_CHOICES, 
        default='BON', 
        verbose_name=_('Etat de santé')
    )
    abattage_urgence = models.BooleanField(
        default=False, 
        verbose_name=_('Abattage urgent')
    )

    abattoir = models.ForeignKey('abattoir.Abattoir', on_delete=models.CASCADE, null=True, blank=True, verbose_name=_('Abattoir'))
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True, verbose_name=_('Client'))

    notes = models.TextField(blank=True, null=True, verbose_name=_('Notes'))
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Date de création'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Date de modification'))
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='betes_created',
        verbose_name=_('Créé par')
    )
    
    # Historique complet des modifications
    history = HistoricalRecords(
        verbose_name=_('Historique'),
        history_user_id_field=models.IntegerField(null=True, blank=True),
        cascade_delete_history=False,  # Garder l'historique même si la bête est supprimée
    )
    
    class Meta:
        verbose_name = _('Bête')
        verbose_name_plural = _('Bêtes')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.num_boucle} - {self.espece.nom} ({self.get_sexe_display()})"
    
    @property
    def est_vivant(self):
        """Vérifie si la bête est vivante"""
        return self.statut == 'VIVANT'


# Temporairement commenté car l'app 'transfert' n'existe pas
# class HistoriqueTransfertBete(models.Model):
#     """Modèle pour l'historique des transferts de bêtes"""
#     
#     bete = models.ForeignKey(Bete, on_delete=models.CASCADE, related_name='historique_transferts', verbose_name=_('Bête'))
#     transfert = models.ForeignKey('transfert.Transfert', on_delete=models.CASCADE, related_name='historique_betes', verbose_name=_('Transfert'))
#     abattoir_source = models.ForeignKey('abattoir.Abattoir', on_delete=models.CASCADE, related_name='transferts_sortants', verbose_name=_('Abattoir source'))
#     abattoir_destination = models.ForeignKey('abattoir.Abattoir', on_delete=models.CASCADE, related_name='transferts_entrants', verbose_name=_('Abattoir destination'))
#     date_transfert = models.DateTimeField(auto_now_add=True, verbose_name=_('Date du transfert'))
#     statut_transfert = models.CharField(max_length=20, choices=[
#         ('EN_COURS', _('En cours')),
#         ('LIVRE', _('Livré')),
#         ('ANNULE', _('Annulé')),
#     ], default='EN_COURS', verbose_name=_('Statut du transfert'))
#     note = models.TextField(blank=True, null=True, verbose_name=_('Note'))
#     created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Date de création'))
#     
#     class Meta:
#         verbose_name = _('Historique de transfert de bête')
#         verbose_name_plural = _('Historiques de transferts de bêtes')
#         ordering = ['-date_transfert']
#         unique_together = ['bete', 'transfert']  # Une bête ne peut avoir qu'un seul historique par transfert
#     
#     def __str__(self):
#         return f"{self.bete.num_boucle} - {self.abattoir_source.nom} → {self.abattoir_destination.nom} ({self.get_statut_transfert_display()})"