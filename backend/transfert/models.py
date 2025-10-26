from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.validators import MinValueValidator
from simple_history.models import HistoricalRecords
from abattoir.models import Abattoir
from bete.models import Bete
from users.models import User
import uuid


class Transfert(models.Model):
    """Modèle pour les transferts de bêtes entre abattoirs"""
    
    STATUT_CHOICES = [
        ('EN_COURS', _('En cours')),
        ('EN_LIVRAISON', _('En livraison')),
        ('LIVRE', _('Livré')),
        ('ANNULE', _('Annulé')),
    ]
    
    # Informations de base
    numero_transfert = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        verbose_name=_('Numéro de transfert'),
        help_text=_('Numéro unique d\'identification du transfert (généré automatiquement)')
    )
    
    # Relations
    abattoir_expediteur = models.ForeignKey(
        Abattoir,
        on_delete=models.CASCADE,
        related_name='transferts_expedies',
        verbose_name=_('Abattoir expéditeur'),
        help_text=_('Abattoir qui envoie les bêtes')
    )
    
    abattoir_destinataire = models.ForeignKey(
        Abattoir,
        on_delete=models.CASCADE,
        related_name='transferts_recus',
        verbose_name=_('Abattoir destinataire'),
        help_text=_('Abattoir qui reçoit les bêtes')
    )
    
    # Bêtes à transférer
    betes = models.ManyToManyField(
        Bete,
        through='TransfertBete',
        verbose_name=_('Bêtes à transférer'),
        help_text=_('Bêtes incluses dans ce transfert')
    )
    
    # Informations du transfert
    nombre_betes = models.PositiveIntegerField(
        verbose_name=_('Nombre de bêtes'),
        help_text=_('Nombre total de bêtes à transférer'),
        validators=[MinValueValidator(1)]
    )
    
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='EN_COURS',
        verbose_name=_('Statut'),
        help_text=_('Statut actuel du transfert')
    )
    
    # Dates importantes
    date_creation = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création'),
        help_text=_('Date et heure de création du transfert')
    )
    
    date_livraison = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Date de livraison'),
        help_text=_('Date et heure de livraison effective')
    )
    
    date_annulation = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Date d\'annulation'),
        help_text=_('Date et heure d\'annulation du transfert')
    )
    
    # Utilisateurs responsables
    cree_par = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transferts_crees',
        verbose_name=_('Créé par'),
        help_text=_('Utilisateur qui a créé le transfert')
    )
    
    valide_par = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transferts_valides',
        verbose_name=_('Validé par'),
        help_text=_('Utilisateur qui a validé le transfert')
    )
    
    annule_par = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transferts_annules',
        verbose_name=_('Annulé par'),
        help_text=_('Utilisateur qui a annulé le transfert')
    )
    
    # Informations supplémentaires
    motif = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Motif du transfert'),
        help_text=_('Raison du transfert de bêtes')
    )
    
    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Notes'),
        help_text=_('Notes et observations sur le transfert')
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Date de création'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Date de modification'))
    
    # Historique complet des modifications
    history = HistoricalRecords(
        verbose_name=_('Historique'),
        history_user_id_field=models.IntegerField(null=True, blank=True),
        cascade_delete_history=False,
    )
    
    class Meta:
        verbose_name = _('Transfert')
        verbose_name_plural = _('Transferts')
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['abattoir_expediteur', 'statut']),
            models.Index(fields=['abattoir_destinataire', 'statut']),
            models.Index(fields=['date_creation']),
            models.Index(fields=['statut']),
        ]
    
    def __str__(self):
        return f"Transfert {self.numero_transfert} - {self.abattoir_expediteur.nom} → {self.abattoir_destinataire.nom}"
    
    def generate_numero_transfert(self):
        """Génère un numéro de transfert unique"""
        from datetime import datetime
        
        # Format: TRF-YYYYMMDD-HHMMSS-XXX
        now = timezone.now()
        date_str = now.strftime('%Y%m%d')
        time_str = now.strftime('%H%M%S')
        
        # Chercher le prochain numéro séquentiel pour cette date
        base_numero = f"TRF-{date_str}-{time_str}"
        counter = 1
        
        while True:
            numero = f"{base_numero}-{counter:03d}"
            if not Transfert.objects.filter(numero_transfert=numero).exists():
                return numero
            counter += 1
    
    def save(self, *args, **kwargs):
        """Override save pour générer automatiquement le numéro de transfert"""
        if not self.numero_transfert:
            self.numero_transfert = self.generate_numero_transfert()
        super().save(*args, **kwargs)
    
    @property
    def nombre_betes_actuelles(self):
        """Retourne le nombre actuel de bêtes dans le transfert"""
        return self.betes.count()
    
    @property
    def est_complet(self):
        """Vérifie si le transfert contient toutes les bêtes prévues"""
        return self.nombre_betes_actuelles >= self.nombre_betes
    
    @property
    def peut_etre_livre(self):
        """Vérifie si le transfert peut être livré"""
        return self.statut == 'EN_COURS' and self.est_complet
    
    @property
    def peut_etre_en_livraison(self):
        """Vérifie si le transfert peut être mis en livraison"""
        return self.statut == 'EN_COURS' and self.est_complet
    
    @property
    def peut_etre_annule(self):
        """Vérifie si le transfert peut être annulé"""
        return self.statut == 'EN_COURS'
    
    def ajouter_bete(self, bete):
        """Ajoute une bête au transfert"""
        if self.statut != 'EN_COURS':
            raise ValueError("Impossible d'ajouter une bête à un transfert non en cours")
        
        if bete.abattoir != self.abattoir_expediteur:
            raise ValueError("La bête doit appartenir à l'abattoir expéditeur")
        
        if bete.statut != 'VIVANT':
            raise ValueError("Seules les bêtes vivantes peuvent être transférées")
        
        # Créer la relation via le modèle intermédiaire
        TransfertBete.objects.create(
            transfert=self,
            bete=bete,
            ajoute_par=self.cree_par
        )
    
    def retirer_bete(self, bete):
        """Retire une bête du transfert"""
        if self.statut != 'EN_COURS':
            raise ValueError("Impossible de retirer une bête d'un transfert non en cours")
        
        try:
            transfert_bete = TransfertBete.objects.get(transfert=self, bete=bete)
            transfert_bete.delete()
        except TransfertBete.DoesNotExist:
            raise ValueError("Cette bête n'est pas dans ce transfert")
    
    def mettre_en_livraison(self):
        """Met le transfert en livraison"""
        if not self.peut_etre_en_livraison:
            raise ValueError("Le transfert ne peut pas être mis en livraison")
        
        self.statut = 'EN_LIVRAISON'
        self.save()
        
        # Mettre la réception en route
        if hasattr(self, 'reception'):
            self.reception.statut = 'EN_ROUTE'
            self.reception.save()
    
    def livrer(self, valide_par_user):
        """Marque le transfert comme livré"""
        if self.statut != 'EN_LIVRAISON':
            raise ValueError("Le transfert doit être en livraison pour être livré")
        
        self.statut = 'LIVRE'
        self.date_livraison = timezone.now()
        self.valide_par = valide_par_user
        self.save()
        
        # Mettre à jour l'abattoir des bêtes
        for bete in self.betes.all():
            bete.abattoir = self.abattoir_destinataire
            bete.save()
    
    def annuler(self, annule_par_user, motif_annulation=None):
        """Annule le transfert"""
        if not self.peut_etre_annule:
            raise ValueError("Le transfert ne peut pas être annulé")
        
        self.statut = 'ANNULE'
        self.date_annulation = timezone.now()
        self.annule_par = annule_par_user
        if motif_annulation:
            self.notes = f"{self.notes or ''}\nAnnulation: {motif_annulation}".strip()
        self.save()
    
    def annuler_par_reception(self, annule_par_user, motif_annulation=None):
        """Annule le transfert depuis la réception (même si en livraison)"""
        if self.statut not in ['EN_COURS', 'EN_LIVRAISON']:
            raise ValueError("Le transfert ne peut pas être annulé depuis la réception")
        
        self.statut = 'ANNULE'
        self.date_annulation = timezone.now()
        self.annule_par = annule_par_user
        if motif_annulation:
            self.notes = f"{self.notes or ''}\nAnnulation par réception: {motif_annulation}".strip()
        self.save()


class TransfertBete(models.Model):
    """Modèle intermédiaire pour la relation Many-to-Many entre Transfert et Bete"""
    
    transfert = models.ForeignKey(
        Transfert,
        on_delete=models.CASCADE,
        verbose_name=_('Transfert')
    )
    
    bete = models.ForeignKey(
        Bete,
        on_delete=models.CASCADE,
        verbose_name=_('Bête')
    )
    
    ajoute_par = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Ajouté par'),
        help_text=_('Utilisateur qui a ajouté cette bête au transfert')
    )
    
    date_ajout = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date d\'ajout')
    )
    
    class Meta:
        verbose_name = _('Bête de transfert')
        verbose_name_plural = _('Bêtes de transfert')
        unique_together = ['transfert', 'bete']
        ordering = ['-date_ajout']
    
    def __str__(self):
        return f"{self.bete.num_boucle} dans {self.transfert.numero_transfert}"


class Reception(models.Model):
    """Modèle pour les réceptions de bêtes transférées"""
    
    STATUT_CHOICES = [
        ('EN_ATTENTE', _('En attente')),
        ('EN_ROUTE', _('En route')),
        ('EN_COURS', _('En cours')),
        ('RECU', _('Reçu')),
        ('PARTIEL', _('Partiel')),
        ('ANNULE', _('Annulé')),
    ]
    
    # Relations
    transfert = models.OneToOneField(
        Transfert,
        on_delete=models.CASCADE,
        related_name='reception',
        verbose_name=_('Transfert'),
        help_text=_('Transfert associé à cette réception')
    )
    
    # Informations de base
    numero_reception = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        verbose_name=_('Numéro de réception'),
        help_text=_('Numéro unique d\'identification de la réception (généré automatiquement)')
    )
    
    # Compteurs de bêtes
    nombre_betes_attendues = models.PositiveIntegerField(
        verbose_name=_('Nombre de bêtes attendues'),
        help_text=_('Nombre de bêtes attendues selon le transfert')
    )
    
    nombre_betes_recues = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Nombre de bêtes reçues'),
        help_text=_('Nombre de bêtes effectivement reçues')
    )
    
    nombre_betes_manquantes = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Nombre de bêtes manquantes'),
        help_text=_('Nombre de bêtes manquantes')
    )
    
    # Bêtes manquantes
    betes_manquantes = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_('Bêtes manquantes'),
        help_text=_('Liste des numéros de boucles des bêtes manquantes')
    )
    
    # Statut et dates
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='EN_ATTENTE',
        verbose_name=_('Statut'),
        help_text=_('Statut actuel de la réception')
    )
    
    date_creation = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création'),
        help_text=_('Date et heure de création de la réception')
    )
    
    date_reception = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Date de réception'),
        help_text=_('Date et heure de réception effective')
    )
    
    date_annulation = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Date d\'annulation'),
        help_text=_('Date et heure d\'annulation de la réception')
    )
    
    # Utilisateurs responsables
    cree_par = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='receptions_creees',
        verbose_name=_('Créé par'),
        help_text=_('Utilisateur qui a créé la réception')
    )
    
    valide_par = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='receptions_validees',
        verbose_name=_('Validé par'),
        help_text=_('Utilisateur qui a validé la réception')
    )
    
    annule_par = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='receptions_annulees',
        verbose_name=_('Annulé par'),
        help_text=_('Utilisateur qui a annulé la réception')
    )
    
    # Informations supplémentaires
    note = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Note'),
        help_text=_('Notes et observations sur la réception')
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Date de création'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Date de modification'))
    
    # Historique complet des modifications
    history = HistoricalRecords(
        verbose_name=_('Historique'),
        history_user_id_field=models.IntegerField(null=True, blank=True),
        cascade_delete_history=False,
    )
    
    class Meta:
        verbose_name = _('Réception')
        verbose_name_plural = _('Réceptions')
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['date_creation']),
            models.Index(fields=['statut']),
        ]
    
    def __str__(self):
        return f"Réception {self.numero_reception} - {self.transfert.abattoir_expediteur.nom} → {self.transfert.abattoir_destinataire.nom}"
    
    def generate_numero_reception(self):
        """Génère un numéro de réception unique"""
        from datetime import datetime
        
        # Format: REC-YYYYMMDD-HHMMSS-XXX
        now = timezone.now()
        date_str = now.strftime('%Y%m%d')
        time_str = now.strftime('%H%M%S')
        
        # Chercher le prochain numéro séquentiel pour cette date
        base_numero = f"REC-{date_str}-{time_str}"
        counter = 1
        
        while True:
            numero = f"{base_numero}-{counter:03d}"
            if not Reception.objects.filter(numero_reception=numero).exists():
                return numero
            counter += 1
    
    def save(self, *args, **kwargs):
        """Override save pour générer automatiquement le numéro de réception"""
        if not self.numero_reception:
            self.numero_reception = self.generate_numero_reception()
        super().save(*args, **kwargs)
    
    @property
    def abattoir_destinataire(self):
        """Retourne l'abattoir destinataire via le transfert"""
        return self.transfert.abattoir_destinataire
    
    @property
    def abattoir_expediteur(self):
        """Retourne l'abattoir expéditeur via le transfert"""
        return self.transfert.abattoir_expediteur
    
    @property
    def taux_reception(self):
        """Calcule le taux de réception en pourcentage"""
        if self.nombre_betes_attendues > 0:
            return round((self.nombre_betes_recues / self.nombre_betes_attendues) * 100, 1)
        return 0
    
    @property
    def est_complete(self):
        """Vérifie si la réception est complète"""
        return self.nombre_betes_recues == self.nombre_betes_attendues
    
    @property
    def est_partielle(self):
        """Vérifie si la réception est partielle"""
        return 0 < self.nombre_betes_recues < self.nombre_betes_attendues
    
    @property
    def est_vide(self):
        """Vérifie si aucune bête n'a été reçue"""
        return self.nombre_betes_recues == 0
    
    @property
    def peut_etre_confirmee(self):
        """Vérifie si la réception peut être confirmée"""
        return self.statut in ['EN_ATTENTE', 'EN_COURS', 'EN_ROUTE']
    
    @property
    def peut_etre_annulee(self):
        """Vérifie si la réception peut être annulée"""
        return self.statut in ['EN_ATTENTE', 'EN_COURS', 'EN_ROUTE']
    
    def confirmer_reception(self, nombre_betes_recues, betes_manquantes=None, valide_par_user=None, note=None):
        """Confirme la réception avec le nombre de bêtes reçues"""
        if not self.peut_etre_confirmee:
            raise ValueError("La réception ne peut pas être confirmée")
        
        self.nombre_betes_recues = nombre_betes_recues
        self.nombre_betes_manquantes = max(0, self.nombre_betes_attendues - nombre_betes_recues)
        
        if betes_manquantes is not None:
            self.betes_manquantes = betes_manquantes
        
        if note:
            self.note = note
        
        if valide_par_user:
            self.valide_par = valide_par_user
        
        # Déterminer le statut final
        if self.est_complete:
            self.statut = 'RECU'
        elif self.est_partielle:
            self.statut = 'PARTIEL'
        else:
            self.statut = 'RECU'  # Même si vide, on considère comme reçu
        
        self.date_reception = timezone.now()
        self.save()
        
        # Mettre à jour le statut du transfert associé
        if self.transfert.statut in ['EN_COURS', 'EN_LIVRAISON']:
            self.transfert.livrer(valide_par_user)
    
    def annuler(self, annule_par_user, motif_annulation=None):
        """Annule la réception"""
        if not self.peut_etre_annulee:
            raise ValueError("La réception ne peut pas être annulée")
        
        self.statut = 'ANNULE'
        self.date_annulation = timezone.now()
        self.annule_par = annule_par_user
        
        if motif_annulation:
            self.note = f"{self.note or ''}\nAnnulation: {motif_annulation}".strip()
        
        self.save()
        
        # Annuler aussi le transfert associé
        if self.transfert.statut in ['EN_COURS', 'EN_LIVRAISON']:
            self.transfert.annuler_par_reception(annule_par_user, motif_annulation)