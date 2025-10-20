from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta
import uuid


class User(AbstractUser):
    """
    Modèle utilisateur personnalisé avec 3 types d'utilisateurs professionnels
    """
    
    USER_TYPES = [
        ('ALIMENT_SHEPTEL', 'Gestion Aliments et Cheptel'),
        ('PRODUCTION', 'Gestion Abattage et Production'),
        ('SUPERVISEUR', 'Superviseur Général'),
    ]
    
    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPES,
        default='ALIMENT_SHEPTEL',
        verbose_name=_('Type d\'utilisateur'),
        help_text=_('Définit le rôle et les permissions de l\'utilisateur')
    )
    
    # Relation avec l'abattoir
    abattoir = models.ForeignKey(
        'abattoir.Abattoir',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='utilisateurs',
        verbose_name=_('Abattoir assigné'),
        help_text=_('Abattoir auquel cet utilisateur est assigné')
    )
    
    # Informations de contact
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name=_('Numéro de téléphone')
    )
    
    address = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Adresse')
    )
    
    # Informations d'authentification avancées
    email_verified = models.BooleanField(
        default=False,
        verbose_name=_('Email vérifié'),
        help_text=_('Indique si l\'email a été vérifié')
    )
    
    phone_verified = models.BooleanField(
        default=False,
        verbose_name=_('Téléphone vérifié'),
        help_text=_('Indique si le numéro de téléphone a été vérifié')
    )
    
    # Sécurité et sessions
    last_login_ip = models.GenericIPAddressField(
        blank=True,
        null=True,
        verbose_name=_('Dernière IP de connexion')
    )
    
    login_attempts = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Tentatives de connexion échouées')
    )
    
    locked_until = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name=_('Verrouillé jusqu\'à'),
        help_text=_('Date jusqu\'à laquelle le compte est verrouillé')
    )
    
    password_changed_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Mot de passe changé le')
    )
    
    # Tokens et sessions
    refresh_token = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Token de rafraîchissement')
    )
    
    device_fingerprint = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_('Empreinte de l\'appareil')
    )
    
    # Préférences utilisateur
    language = models.CharField(
        max_length=10,
        default='fr',
        choices=[
            ('fr', 'Français'),
            ('ar', 'العربية'),
            ('en', 'English'),
        ],
        verbose_name=_('Langue préférée')
    )
    
    timezone = models.CharField(
        max_length=50,
        default='Africa/Algiers',
        verbose_name=_('Fuseau horaire')
    )
    
    # Notifications
    email_notifications = models.BooleanField(
        default=True,
        verbose_name=_('Notifications par email')
    )
    
    sms_notifications = models.BooleanField(
        default=False,
        verbose_name=_('Notifications par SMS')
    )
    
    push_notifications = models.BooleanField(
        default=True,
        verbose_name=_('Notifications push')
    )
    
    # Métadonnées
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Actif'),
        help_text=_('Désignez si cet utilisateur doit être traité comme actif.')
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Date de modification')
    )
    
    # Champs Django par défaut à masquer
    first_name = models.CharField(_('Prénom'), max_length=150, blank=True)
    last_name = models.CharField(_('Nom'), max_length=150, blank=True)
    email = models.EmailField(_('Adresse e-mail'), unique=True)
    
    class Meta:
        verbose_name = _('Utilisateur')
        verbose_name_plural = _('Utilisateurs')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_user_type_display()})"
    
    def get_user_type_display(self):
        """Retourne le nom d'affichage du type d'utilisateur"""
        return dict(self.USER_TYPES).get(self.user_type, self.user_type)
    
    @property
    def is_aliment_sheptel(self):
        """Vérifie si l'utilisateur est de type Gestion Aliments et Cheptel"""
        return self.user_type == 'ALIMENT_SHEPTEL'
    
    @property
    def is_production(self):
        """Vérifie si l'utilisateur est de type Gestion Abattage et Production"""
        return self.user_type == 'PRODUCTION'
    
    @property
    def is_superviseur(self):
        """Vérifie si l'utilisateur est un superviseur"""
        return self.user_type == 'SUPERVISEUR'
    
    @property
    def is_locked(self):
        """Vérifie si le compte est verrouillé"""
        if self.locked_until:
            return timezone.now() < self.locked_until
        return False
    
    @property
    def full_name(self):
        """Retourne le nom complet de l'utilisateur"""
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def lock_account(self, duration_minutes=30):
        """Verrouille le compte pour une durée donnée"""
        self.locked_until = timezone.now() + timedelta(minutes=duration_minutes)
        self.save(update_fields=['locked_until'])
    
    def unlock_account(self):
        """Déverrouille le compte"""
        self.locked_until = None
        self.login_attempts = 0
        self.save(update_fields=['locked_until', 'login_attempts'])
    
    def increment_login_attempts(self):
        """Incrémente les tentatives de connexion échouées"""
        self.login_attempts += 1
        if self.login_attempts >= 5:  # Verrouiller après 5 tentatives
            self.lock_account(30)  # 30 minutes
        self.save(update_fields=['login_attempts', 'locked_until'])
    
    def reset_login_attempts(self):
        """Remet à zéro les tentatives de connexion"""
        self.login_attempts = 0
        self.save(update_fields=['login_attempts'])
    
    def update_last_login_info(self, ip_address, device_fingerprint=None):
        """Met à jour les informations de dernière connexion"""
        self.last_login_ip = ip_address
        if device_fingerprint:
            self.device_fingerprint = device_fingerprint
        self.last_login = timezone.now()
        self.save(update_fields=['last_login_ip', 'device_fingerprint', 'last_login'])


class UserSession(models.Model):
    """Modèle pour gérer les sessions utilisateur"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_token = models.UUIDField(default=uuid.uuid4, unique=True)
    device_fingerprint = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        verbose_name = _('Session utilisateur')
        verbose_name_plural = _('Sessions utilisateur')
        ordering = ['-last_activity']
    
    def __str__(self):
        return f"Session {self.user.username} - {self.device_fingerprint}"
    
    @property
    def is_expired(self):
        """Vérifie si la session a expiré"""
        return timezone.now() > self.expires_at
    
    def extend_session(self, days=7):
        """Prolonge la session"""
        self.expires_at = timezone.now() + timedelta(days=days)
        self.save(update_fields=['expires_at'])


class PasswordResetToken(models.Model):
    """Modèle pour les tokens de réinitialisation de mot de passe"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        verbose_name = _('Token de réinitialisation')
        verbose_name_plural = _('Tokens de réinitialisation')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Reset token for {self.user.username}"
    
    @property
    def is_expired(self):
        """Vérifie si le token a expiré"""
        return timezone.now() > self.expires_at
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)


class EmailVerificationToken(models.Model):
    """Modèle pour les tokens de vérification d'email"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verification_tokens')
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        verbose_name = _('Token de vérification email')
        verbose_name_plural = _('Tokens de vérification email')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Email verification for {self.user.email}"
    
    @property
    def is_expired(self):
        """Vérifie si le token a expiré"""
        return timezone.now() > self.expires_at
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)