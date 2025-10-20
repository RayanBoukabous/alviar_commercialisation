from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from django.utils import timezone
import uuid
import os

User = get_user_model()


def personnel_photo_upload_path(instance, filename):
    """Génère le chemin d'upload pour les photos du personnel"""
    ext = filename.split('.')[-1]
    filename = f"{instance.id}_{instance.nom}_{instance.prenom}.{ext}"
    return os.path.join('personnel/photos', filename)


def carte_identite_upload_path(instance, filename):
    """Génère le chemin d'upload pour les cartes d'identité"""
    ext = filename.split('.')[-1]
    filename = f"{instance.id}_carte_identite_{instance.nom}_{instance.prenom}.{ext}"
    return os.path.join('personnel/cartes_identite', filename)


class Role(models.Model):
    """Modèle pour les rôles du personnel"""
    
    ROLE_CHOICES = [
        ('RESPONSABLE_ABATTOIR', 'Responsable de l\'abattoir'),
        ('RESPONSABLE_ABATTAGE', 'Responsable d\'abattage'),
        ('GESTIONNAIRE_STOCK', 'Gestionnaire de stock'),
        ('RH', 'Ressources Humaines'),
        ('COMPTABLE', 'Comptable'),
        ('SECURITE', 'Agent de sécurité'),
        ('MAINTENANCE', 'Agent de maintenance'),
        ('VETERINAIRE', 'Vétérinaire'),
        ('INSPECTEUR', 'Inspecteur'),
        ('OPERATEUR', 'Opérateur'),
        ('CHAUFFEUR', 'Chauffeur'),
        ('NETTOYAGE', 'Agent de nettoyage'),
        ('AUTRE', 'Autre'),
    ]
    
    nom = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True, null=True)
    permissions = models.JSONField(default=dict, blank=True)
    actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Rôle"
        verbose_name_plural = "Rôles"
        ordering = ['nom']
    
    def __str__(self):
        return self.get_nom_display()


class Personnel(models.Model):
    """Modèle pour le personnel des abattoirs"""
    
    SEXE_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]
    
    STATUT_CHOICES = [
        ('ACTIF', 'Actif'),
        ('INACTIF', 'Inactif'),
        ('SUSPENDU', 'Suspendu'),
        ('CONGE', 'En congé'),
        ('DEMISSION', 'Démission'),
    ]
    
    # Informations de base
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=100, verbose_name="Nom de famille")
    prenom = models.CharField(max_length=100, verbose_name="Prénom")
    nom_complet = models.CharField(max_length=201, blank=True, verbose_name="Nom complet")
    
    # Informations personnelles
    date_naissance = models.DateField(verbose_name="Date de naissance")
    lieu_naissance = models.CharField(max_length=100, verbose_name="Lieu de naissance")
    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES, verbose_name="Sexe")
    nationalite = models.CharField(max_length=50, default="Algérienne", verbose_name="Nationalité")
    
    # Informations d'identité
    numero_carte_identite = models.CharField(
        max_length=20, 
        unique=True,
        validators=[RegexValidator(
            regex=r'^\d{10}$',
            message='Le numéro de carte d\'identité doit contenir exactement 10 chiffres'
        )],
        verbose_name="Numéro de carte d'identité"
    )
    date_emission_carte = models.DateField(verbose_name="Date d'émission de la carte")
    lieu_emission_carte = models.CharField(max_length=100, verbose_name="Lieu d'émission de la carte")
    
    # Informations de contact
    telephone = models.CharField(
        max_length=15,
        validators=[RegexValidator(
            regex=r'^(\+213|0)[5-7]\d{8}$',
            message='Numéro de téléphone algérien invalide'
        )],
        verbose_name="Téléphone"
    )
    telephone_urgence = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[RegexValidator(
            regex=r'^(\+213|0)[5-7]\d{8}$',
            message='Numéro de téléphone algérien invalide'
        )],
        verbose_name="Téléphone d'urgence"
    )
    email = models.EmailField(blank=True, null=True, verbose_name="Email")
    adresse = models.TextField(verbose_name="Adresse")
    wilaya = models.CharField(max_length=50, verbose_name="Wilaya")
    commune = models.CharField(max_length=50, verbose_name="Commune")
    
    # Informations professionnelles
    abattoir = models.ForeignKey(
        'abattoir.Abattoir',
        on_delete=models.CASCADE,
        related_name='personnel',
        verbose_name="Abattoir"
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name='personnel',
        verbose_name="Rôle"
    )
    numero_employe = models.CharField(max_length=20, unique=True, verbose_name="Numéro d'employé")
    date_embauche = models.DateField(verbose_name="Date d'embauche")
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='ACTIF', verbose_name="Statut")
    
    # Documents et photos
    photo = models.ImageField(
        upload_to=personnel_photo_upload_path,
        blank=True,
        null=True,
        verbose_name="Photo"
    )
    carte_identite_recto = models.ImageField(
        upload_to=carte_identite_upload_path,
        blank=True,
        null=True,
        verbose_name="Carte d'identité (recto)"
    )
    carte_identite_verso = models.ImageField(
        upload_to=carte_identite_upload_path,
        blank=True,
        null=True,
        verbose_name="Carte d'identité (verso)"
    )
    
    # Informations de gestion
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_personnel',
        verbose_name="Créé par"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Informations supplémentaires
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")
    competences = models.JSONField(default=list, blank=True, verbose_name="Compétences")
    formations = models.JSONField(default=list, blank=True, verbose_name="Formations")
    
    class Meta:
        verbose_name = "Personnel"
        verbose_name_plural = "Personnel"
        ordering = ['nom', 'prenom']
        unique_together = ['abattoir', 'numero_employe']
    
    def __str__(self):
        return f"{self.nom_complet} - {self.role.get_nom_display()}"
    
    def save(self, *args, **kwargs):
        # Générer automatiquement le nom complet
        self.nom_complet = f"{self.prenom} {self.nom}"
        super().save(*args, **kwargs)
    
    @property
    def age(self):
        """Calcule l'âge du personnel"""
        today = timezone.now().date()
        return today.year - self.date_naissance.year - (
            (today.month, today.day) < (self.date_naissance.month, self.date_naissance.day)
        )
    
    @property
    def anciennete(self):
        """Calcule l'ancienneté du personnel"""
        today = timezone.now().date()
        return today.year - self.date_embauche.year - (
            (today.month, today.day) < (self.date_embauche.month, self.date_embauche.day)
        )

