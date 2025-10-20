from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from users.models import User


class Client(models.Model):
    """Modèle pour les clients"""
    
    TYPE_CLIENT_CHOICES = [
        ('PARTICULIER', _('Particulier')),
        ('SUPERGROSSISTE', _('Supergrossiste')),
        ('GROSSISTE', _('Grossiste')),
    ]
    
    STATUT_CHOICES = [
        ('ACTIF', _('Actif')),
        ('INACTIF', _('Inactif')),
        ('SUSPENDU', _('Suspendu')),
    ]
    
    # Informations de base
    nom = models.CharField(max_length=200, verbose_name=_('Nom/Raison sociale'))
    type_client = models.CharField(
        max_length=15,
        choices=TYPE_CLIENT_CHOICES,
        default='PARTICULIER',
        verbose_name=_('Type de client')
    )
    telephone = models.CharField(max_length=20, verbose_name=_('Téléphone'))
    email = models.EmailField(blank=True, null=True, verbose_name=_('Email'))
    adresse = models.TextField(verbose_name=_('Adresse'))
    
    # Informations fiscales et géographiques
    nif = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name=_('NIF (Numéro d\'Identification Fiscale)')
    )
    nis = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name=_('NIS (Numéro d\'Identification Sociale)')
    )
    wilaya = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_('Wilaya')
    )
    commune = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_('Commune')
    )
    
    # Informations de contact
    contact_principal = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_('Contact principal')
    )
    telephone_contact = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name=_('Téléphone du contact')
    )
    
    # Informations de suivi
    commercial = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Commercial responsable'),
        limit_choices_to={'user_type': 'SUPERVISEUR'}
    )
    notes = models.TextField(blank=True, null=True, verbose_name=_('Notes'))
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Date de création'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Date de modification'))
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='clients_created',
        verbose_name=_('Créé par')
    )
    
    class Meta:
        verbose_name = _('Client')
        verbose_name_plural = _('Clients')
        ordering = ['nom']
    
    def __str__(self):
        return f"{self.nom} ({self.get_type_client_display()})"
    
