from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User


class Abattoir(models.Model):
    """Modèle pour les abattoirs"""
    
    nom = models.CharField(max_length=200, verbose_name=_('Nom de l\'abattoir'))
    wilaya = models.CharField(max_length=100, verbose_name=_('Wilaya'))
    commune = models.CharField(max_length=100, verbose_name=_('Commune'))
    telephone = models.CharField(max_length=20, blank=True, null=True, verbose_name=_('Téléphone'))
    email = models.EmailField(blank=True, null=True, verbose_name=_('Email'))
    
    # Capacités de réception
    capacite_reception_ovin = models.PositiveIntegerField(
        verbose_name=_('Capacité de réception Ovin'),
        help_text=_('Nombre maximum d\'ovins pouvant être reçus par jour'),
        default=0
    )
    capacite_reception_bovin = models.PositiveIntegerField(
        verbose_name=_('Capacité de réception Bovin'),
        help_text=_('Nombre maximum de bovins pouvant être reçus par jour'),
        default=0
    )
    capacite_stabulation_ovin = models.PositiveIntegerField(
        verbose_name=_('Capacité de stabulation Ovin'),
        help_text=_('Nombre maximum d\'ovins pouvant être en stabulation'),
        default=0
    )
    capacite_stabulation_bovin = models.PositiveIntegerField(
        verbose_name=_('Capacité de stabulation Bovin'),
        help_text=_('Nombre maximum de bovins pouvant être en stabulation'),
        default=0
    )
    
    # Statut
    actif = models.BooleanField(default=True, verbose_name=_('Actif'))
    
    # Responsable
    responsable = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='abattoirs_responsable',
        verbose_name=_('Responsable'),
        limit_choices_to={'user_type': 'PRODUCTION'}
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Date de création'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Date de modification'))
    
    class Meta:
        verbose_name = _('Abattoir')
        verbose_name_plural = _('Abattoirs')
        ordering = ['wilaya', 'commune', 'nom']
    
    def __str__(self):
        return f"{self.nom} - {self.commune}, {self.wilaya}"
    
    @property
    def capacite_totale_reception(self):
        """Calcule la capacité totale de réception"""
        return self.capacite_reception_ovin + self.capacite_reception_bovin
    
    @property
    def capacite_totale_stabulation(self):
        """Calcule la capacité totale de stabulation"""
        return self.capacite_stabulation_ovin + self.capacite_stabulation_bovin
    
    @property
    def adresse_complete(self):
        """Retourne l'adresse complète"""
        return f"{self.commune}, {self.wilaya}"


class ChambreFroide(models.Model):
    """Modèle pour les chambres froides"""
    
    abattoir = models.ForeignKey(
        Abattoir, 
        on_delete=models.CASCADE, 
        verbose_name=_('Abattoir'),
        related_name='chambres_froides'
    )
    numero = models.CharField(
        max_length=50,
        verbose_name=_('Numéro de la chambre froide')
    )
    dimensions_m3 = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        verbose_name=_('Dimensions (m³)'),
        validators=[MinValueValidator(0.01)],
        help_text=_('Volume en mètres cubes')
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Date de création'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Date de modification'))
    
    class Meta:
        verbose_name = _('Chambre froide')
        verbose_name_plural = _('Chambres froides')
        ordering = ['abattoir', 'numero']
        unique_together = ['abattoir', 'numero']
    
    def __str__(self):
        return f"Chambre froide {self.numero} - {self.abattoir.nom}"


class HistoriqueChambreFroide(models.Model):
    """Modèle pour l'historique des températures des chambres froides"""
    
    chambre_froide = models.ForeignKey(
        ChambreFroide,
        on_delete=models.CASCADE,
        verbose_name=_('Chambre froide'),
        related_name='historique_temperatures'
    )
    temperature = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        verbose_name=_('Température (°C)'),
        help_text=_('Température en degrés Celsius')
    )
    date_mesure = models.DateTimeField(
        verbose_name=_('Date de mesure'),
        auto_now_add=True
    )
    
    # Utilisateur qui a effectué la mesure
    mesure_par = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Mesure effectuée par'),
        related_name='mesures_temperature',
        help_text=_('Utilisateur qui a enregistré cette mesure de température')
    )
    
    # Notes optionnelles
    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Notes'),
        help_text=_('Notes optionnelles sur cette mesure')
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Date de création'))
    
    class Meta:
        verbose_name = _('Historique chambre froide')
        verbose_name_plural = _('Historiques chambres froides')
        ordering = ['-date_mesure']
    
    def __str__(self):
        return f"{self.chambre_froide.numero} - {self.temperature}°C - {self.date_mesure.strftime('%d/%m/%Y %H:%M')}"
    
    @property
    def nom_utilisateur(self):
        """Retourne le nom de l'utilisateur qui a effectué la mesure"""
        if self.mesure_par:
            return f"{self.mesure_par.first_name} {self.mesure_par.last_name}".strip() or self.mesure_par.username
        return "Système"


class Stabulation(models.Model):
    """Modèle pour gérer les bêtes en stabulation dans les abattoirs"""
    
    STATUT_CHOICES = [
        ('EN_COURS', _('En cours')),
        ('TERMINE', _('Terminé')),
        ('ANNULE', _('Annulé')),
    ]
    
    TYPE_BETE_CHOICES = [
        ('BOVIN', _('Bovin')),
        ('OVIN', _('Ovin')),
        ('CAPRIN', _('Caprin')),
        ('AUTRE', _('Autre')),
    ]
    
    # Relations
    abattoir = models.ForeignKey(
        Abattoir,
        on_delete=models.CASCADE,
        verbose_name=_('Abattoir'),
        related_name='stabulations'
    )
    
    # Informations de base
    numero_stabulation = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        verbose_name=_('Numéro de stabulation'),
        help_text=_('Numéro unique d\'identification de la stabulation (généré automatiquement)')
    )
    
    type_bete = models.CharField(
        max_length=20,
        choices=TYPE_BETE_CHOICES,
        verbose_name=_('Type de bête'),
        help_text=_('Type d\'animal en stabulation')
    )
    
    # Bêtes en stabulation
    betes = models.ManyToManyField(
        'bete.Bete',
        blank=True,
        verbose_name=_('Bêtes en stabulation'),
        help_text=_('Bêtes actuellement en stabulation'),
        related_name='stabulations'
    )
    
    # Statut et dates
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='EN_COURS',
        verbose_name=_('Statut'),
        help_text=_('Statut actuel de la stabulation')
    )
    
    date_debut = models.DateTimeField(
        verbose_name=_('Date de début'),
        help_text=_('Date et heure de début de la stabulation')
    )
    
    date_fin = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Date de fin'),
        help_text=_('Date et heure de fin de la stabulation (si terminée)')
    )
    
    
    # Informations supplémentaires
    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Notes'),
        help_text=_('Notes et observations sur la stabulation')
    )
    
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Date de création'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Date de modification'))
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stabulations_created',
        verbose_name=_('Créé par'),
        help_text=_('Utilisateur qui a créé cette stabulation')
    )
    
    class Meta:
        verbose_name = _('Stabulation')
        verbose_name_plural = _('Stabulations')
        ordering = ['-date_debut', 'abattoir', 'numero_stabulation']
        indexes = [
            models.Index(fields=['abattoir', 'statut']),
            models.Index(fields=['type_bete', 'statut']),
            models.Index(fields=['date_debut']),
        ]
    
    def __str__(self):
        return f"Stabulation {self.numero_stabulation} - {self.abattoir.nom} ({self.type_bete})"
    
    def generate_numero_stabulation(self):
        """Génère un numéro de stabulation unique"""
        from django.utils import timezone
        from datetime import datetime
        
        # Format: STAB-YYYYMMDD-HHMMSS-XXX
        now = timezone.now()
        date_str = now.strftime('%Y%m%d')
        time_str = now.strftime('%H%M%S')
        
        # Chercher le prochain numéro séquentiel pour cette date
        base_numero = f"STAB-{date_str}-{time_str}"
        counter = 1
        
        while True:
            numero = f"{base_numero}-{counter:03d}"
            if not Stabulation.objects.filter(numero_stabulation=numero).exists():
                return numero
            counter += 1
    
    def save(self, *args, **kwargs):
        """Override save pour générer automatiquement le numéro de stabulation"""
        if not self.numero_stabulation:
            self.numero_stabulation = self.generate_numero_stabulation()
        super().save(*args, **kwargs)
    
    @property
    def nombre_betes_actuelles(self):
        """Retourne le nombre actuel de bêtes en stabulation"""
        return self.betes.count()
    
    @property
    def capacite_maximale(self):
        """Retourne la capacité maximale de stabulation selon le type de bête"""
        if self.type_bete == 'BOVIN':
            return self.abattoir.capacite_stabulation_bovin
        elif self.type_bete == 'OVIN':
            return self.abattoir.capacite_stabulation_ovin
        elif self.type_bete == 'CAPRIN':
            # Pour les caprins, on utilise la capacité ovine comme référence
            return self.abattoir.capacite_stabulation_ovin
        else:
            # Pour les autres types, on utilise la capacité totale
            return self.abattoir.capacite_totale_stabulation
    
    @property
    def taux_occupation(self):
        """Calcule le taux d'occupation de la stabulation"""
        if self.capacite_maximale > 0:
            return round((self.nombre_betes_actuelles / self.capacite_maximale) * 100, 1)
        return 0
    
    @property
    def duree_stabulation(self):
        """Calcule la durée de la stabulation"""
        if self.date_fin:
            return self.date_fin - self.date_debut
        else:
            from django.utils import timezone
            return timezone.now() - self.date_debut
    
    @property
    def duree_stabulation_heures(self):
        """Retourne la durée en heures"""
        duree = self.duree_stabulation
        if duree:
            return round(duree.total_seconds() / 3600, 1)
        return 0
    
    @property
    def duree_stabulation_formatee(self):
        """Retourne la durée formatée en heures et minutes"""
        if self.statut == 'EN_COURS' or not self.date_fin:
            return '-'
        
        # Calculer la durée absolue (peu importe l'ordre des dates)
        duree = abs(self.date_fin - self.date_debut)
        
        total_minutes = int(duree.total_seconds() / 60)
        hours = total_minutes // 60
        minutes = total_minutes % 60
        
        # Si la durée est très longue (plus de 24h), afficher en jours
        if hours >= 24:
            days = hours // 24
            remaining_hours = hours % 24
            if remaining_hours > 0:
                return f"{days}j {remaining_hours}h"
            else:
                return f"{days}j"
        
        if hours > 0:
            return f"{hours}h {minutes}min" if minutes > 0 else f"{hours}h"
        else:
            return f"{minutes}min"
    
    @property
    def est_pleine(self):
        """Vérifie si la stabulation est pleine"""
        return self.nombre_betes_actuelles >= self.capacite_maximale
    
    @property
    def places_disponibles(self):
        """Calcule le nombre de places disponibles"""
        return max(0, self.capacite_maximale - self.nombre_betes_actuelles)
    
    
    def peut_ajouter_betes(self, nombre):
        """Vérifie si on peut ajouter un nombre donné de bêtes"""
        return self.places_disponibles >= nombre and self.statut == 'EN_COURS'
    
    def peut_ajouter_betes_type(self, nombre, type_bete):
        """Vérifie si on peut ajouter un nombre donné de bêtes d'un type spécifique"""
        if type_bete != self.type_bete:
            return False
        
        # Vérifier la capacité selon le type
        capacite_type = 0
        if type_bete == 'BOVIN':
            capacite_type = self.abattoir.capacite_stabulation_bovin
        elif type_bete == 'OVIN':
            capacite_type = self.abattoir.capacite_stabulation_ovin
        elif type_bete == 'CAPRIN':
            capacite_type = self.abattoir.capacite_stabulation_ovin
        else:
            capacite_type = self.abattoir.capacite_totale_stabulation
        
        # Compter les bêtes actuelles du même type
        betes_meme_type = self.betes.filter(espece__nom__iexact=type_bete).count()
        places_disponibles_type = max(0, capacite_type - betes_meme_type)
        
        return places_disponibles_type >= nombre and self.statut == 'EN_COURS'
    
    def ajouter_betes(self, betes_list):
        """Ajoute des bêtes à la stabulation avec vérification par type"""
        if not betes_list:
            return True
        
        # Vérifier que toutes les bêtes sont du même type que la stabulation
        for bete in betes_list:
            if bete.espece.nom.upper() != self.type_bete:
                return False
        
        # Vérifier la capacité selon le type
        if self.peut_ajouter_betes_type(len(betes_list), self.type_bete):
            self.betes.add(*betes_list)
            return True
        return False
    
    def retirer_betes(self, betes_list):
        """Retire des bêtes de la stabulation"""
        self.betes.remove(*betes_list)
    
    def vider_stabulation(self):
        """Vide complètement la stabulation"""
        self.betes.clear()
    
    def terminer_stabulation(self):
        """Termine la stabulation"""
        if self.statut == 'EN_COURS':
            from django.utils import timezone
            self.statut = 'TERMINE'
            self.date_fin = timezone.now()
            self.save()
    
    def annuler_stabulation(self):
        """Annule la stabulation"""
        if self.statut == 'EN_COURS':
            from django.utils import timezone
            self.statut = 'ANNULE'
            self.date_fin = timezone.now()
            self.save()