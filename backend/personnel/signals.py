from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Personnel

User = get_user_model()


@receiver(pre_save, sender=Personnel)
def generate_employee_number(sender, instance, **kwargs):
    """Génère automatiquement un numéro d'employé si non fourni"""
    if not instance.numero_employe and instance.abattoir:
        # Générer un numéro d'employé basé sur l'abattoir et le nombre d'employés
        abattoir_code = str(instance.abattoir.id).zfill(3)
        employee_count = Personnel.objects.filter(abattoir=instance.abattoir).count() + 1
        instance.numero_employe = f"EMP{abattoir_code}{str(employee_count).zfill(4)}"


@receiver(post_save, sender=Personnel)
def create_user_account(sender, instance, created, **kwargs):
    """Signal post-save pour le personnel (fonctionnalité désactivée)"""
    # Fonctionnalité de création automatique de compte utilisateur désactivée
    # car le champ user_account a été supprimé du modèle Personnel
    pass
