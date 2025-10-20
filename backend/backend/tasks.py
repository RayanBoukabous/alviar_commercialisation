from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import os
import subprocess
import logging

logger = logging.getLogger(__name__)


@shared_task
def backup_database():
    """Sauvegarde automatique de la base de données"""
    try:
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f'backup_{timestamp}.sql'
        backup_path = os.path.join(settings.BASE_DIR, 'backups', backup_filename)
        
        # Créer le dossier backups s'il n'existe pas
        os.makedirs(os.path.dirname(backup_path), exist_ok=True)
        
        # Commande de sauvegarde PostgreSQL
        cmd = [
            'pg_dump',
            '-h', settings.DATABASES['default']['HOST'],
            '-U', settings.DATABASES['default']['USER'],
            '-d', settings.DATABASES['default']['NAME'],
            '-f', backup_path
        ]
        
        # Définir le mot de passe
        env = os.environ.copy()
        env['PGPASSWORD'] = settings.DATABASES['default']['PASSWORD']
        
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info(f'Sauvegarde créée avec succès: {backup_path}')
            return f'Sauvegarde créée: {backup_filename}'
        else:
            logger.error(f'Erreur lors de la sauvegarde: {result.stderr}')
            return f'Erreur: {result.stderr}'
            
    except Exception as e:
        logger.error(f'Erreur lors de la sauvegarde: {str(e)}')
        return f'Erreur: {str(e)}'


@shared_task
def cleanup_old_logs():
    """Nettoyage des anciens logs"""
    try:
        log_dir = os.path.join(settings.BASE_DIR, 'logs')
        if not os.path.exists(log_dir):
            return "Dossier logs non trouvé"
        
        # Supprimer les logs de plus de 30 jours
        cutoff_date = timezone.now() - timedelta(days=30)
        deleted_count = 0
        
        for filename in os.listdir(log_dir):
            file_path = os.path.join(log_dir, filename)
            if os.path.isfile(file_path):
                file_time = timezone.datetime.fromtimestamp(
                    os.path.getmtime(file_path),
                    tz=timezone.get_current_timezone()
                )
                if file_time < cutoff_date:
                    os.remove(file_path)
                    deleted_count += 1
        
        logger.info(f'Nettoyage terminé: {deleted_count} fichiers supprimés')
        return f'{deleted_count} fichiers de logs supprimés'
        
    except Exception as e:
        logger.error(f'Erreur lors du nettoyage: {str(e)}')
        return f'Erreur: {str(e)}'


@shared_task
def send_daily_reports():
    """Envoi des rapports quotidiens"""
    try:
        from django.contrib.auth import get_user_model
        from .models import Bete, Abattage, Commande
        
        User = get_user_model()
        supervisors = User.objects.filter(user_type='SUPERVISEUR', is_active=True)
        
        # Statistiques du jour
        today = timezone.now().date()
        
        stats = {
            'betes_ajoutees': Bete.objects.filter(created_at__date=today).count(),
            'abattages_termines': Abattage.objects.filter(
                statut='TERMINE',
                heure_abattage__date=today
            ).count(),
            'commandes_livrees': Commande.objects.filter(
                statut='LIVREE',
                date_livraison_reelle__date=today
            ).count(),
        }
        
        # Envoyer les rapports aux superviseurs
        for supervisor in supervisors:
            if supervisor.email:
                send_mail(
                    subject=f'Rapport quotidien - {today}',
                    message=f'''
Rapport quotidien du {today}

Nouvelles bêtes ajoutées: {stats['betes_ajoutees']}
Abattages terminés: {stats['abattages_termines']}
Commandes livrées: {stats['commandes_livrees']}

Cordialement,
Système Alviar Dashboard
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[supervisor.email],
                    fail_silently=True,
                )
        
        logger.info(f'Rapports quotidiens envoyés à {supervisors.count()} superviseurs')
        return f'Rapports envoyés à {supervisors.count()} superviseurs'
        
    except Exception as e:
        logger.error(f'Erreur lors de l\'envoi des rapports: {str(e)}')
        return f'Erreur: {str(e)}'


@shared_task
def send_notification_email(user_id, subject, message):
    """Envoi d'email de notification"""
    try:
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        user = User.objects.get(id=user_id)
        
        if user.email:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
            return f'Email envoyé à {user.email}'
        else:
            return f'Utilisateur {user.username} n\'a pas d\'email'
            
    except Exception as e:
        logger.error(f'Erreur lors de l\'envoi d\'email: {str(e)}')
        return f'Erreur: {str(e)}'


@shared_task
def process_abattage_completion(abattage_id):
    """Traitement après completion d'un abattage"""
    try:
        from abattoir.models import Abattage, Carcasse
        
        abattage = Abattage.objects.get(id=abattage_id)
        
        # Créer automatiquement une carcasse
        if not hasattr(abattage, 'carcasse'):
            Carcasse.objects.create(
                abattage=abattage,
                poids_carcasse=abattage.bete.poids_actuel * 0.6,  # Estimation 60%
                rendement=60.0,
                qualite='BONNE',
                inspecteur=abattage.session.superviseur
            )
        
        # Notifier le superviseur
        if abattage.session.superviseur:
            send_notification_email.delay(
                abattage.session.superviseur.id,
                'Abattage terminé',
                f'L\'abattage de la bête {abattage.bete.numero_identification} a été terminé.'
            )
        
        return f'Abattage {abattage_id} traité avec succès'
        
    except Exception as e:
        logger.error(f'Erreur lors du traitement de l\'abattage: {str(e)}')
        return f'Erreur: {str(e)}'






