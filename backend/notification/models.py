from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from abattoir.models import Abattoir


class Notification(models.Model):
    """
    Modèle pour gérer les notifications du système
    """
    
    TYPE_CHOICES = [
        ('STABULATION_CREATED', _('Stabulation créée')),
        ('STABULATION_TERMINATED', _('Stabulation terminée')),
        ('BON_COMMANDE_CREATED', _('Bon de commande créé')),
        ('BON_COMMANDE_CONFIRMED', _('Bon de commande confirmé')),
        ('BON_COMMANDE_STATUS_CHANGED', _('Statut bon de commande modifié')),
        ('TRANSFERT_CREATED', _('Transfert créé')),
        ('TRANSFERT_DELIVERED', _('Transfert livré')),
        ('ABATTOIR_UPDATED', _('Abattoir modifié')),
    ]
    
    PRIORITY_CHOICES = [
        ('LOW', _('Faible')),
        ('MEDIUM', _('Moyenne')),
        ('HIGH', _('Élevée')),
        ('URGENT', _('Urgente')),
    ]
    
    # Relations
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('Utilisateur'),
        help_text=_('Utilisateur destinataire de la notification')
    )
    
    abattoir = models.ForeignKey(
        Abattoir,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('Abattoir'),
        help_text=_('Abattoir concerné par la notification'),
        null=True,
        blank=True
    )
    
    # Contenu de la notification
    type_notification = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES,
        verbose_name=_('Type de notification'),
        help_text=_('Type d\'événement qui a déclenché la notification')
    )
    
    title = models.CharField(
        max_length=200,
        verbose_name=_('Titre'),
        help_text=_('Titre de la notification')
    )
    
    message = models.TextField(
        verbose_name=_('Message'),
        help_text=_('Message détaillé de la notification')
    )
    
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='MEDIUM',
        verbose_name=_('Priorité'),
        help_text=_('Niveau de priorité de la notification')
    )
    
    # Statut de lecture
    is_read = models.BooleanField(
        default=False,
        verbose_name=_('Lu'),
        help_text=_('Indique si la notification a été lue par l\'utilisateur')
    )
    
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Date de lecture'),
        help_text=_('Date et heure de lecture de la notification')
    )
    
    # Données contextuelles (JSON)
    data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Données contextuelles'),
        help_text=_('Données supplémentaires liées à la notification (JSON)')
    )
    
    # Métadonnées
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Date de modification')
    )
    
    class Meta:
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['type_notification', 'created_at']),
            models.Index(fields=['abattoir', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    def mark_as_read(self):
        """Marque la notification comme lue"""
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    @property
    def is_urgent(self):
        """Vérifie si la notification est urgente"""
        return self.priority == 'URGENT'
    
    @property
    def time_since_created(self):
        """Retourne le temps écoulé depuis la création"""
        from django.utils import timezone
        return timezone.now() - self.created_at
    
    @classmethod
    def create_notification(cls, user, type_notification, title, message, abattoir=None, priority='MEDIUM', data=None):
        """Méthode utilitaire pour créer une notification"""
        return cls.objects.create(
            user=user,
            type_notification=type_notification,
            title=title,
            message=message,
            abattoir=abattoir,
            priority=priority,
            data=data or {}
        )
    
    @classmethod
    def get_unread_count(cls, user):
        """Retourne le nombre de notifications non lues pour un utilisateur"""
        return cls.objects.filter(user=user, is_read=False).count()
    
    @classmethod
    def get_unread_notifications(cls, user, limit=10):
        """Retourne les notifications non lues pour un utilisateur"""
        return cls.objects.filter(
            user=user, 
            is_read=False
        ).select_related('abattoir').order_by('-created_at')[:limit]
