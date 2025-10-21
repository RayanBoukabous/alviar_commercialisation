import os
from celery import Celery

# Configuration de Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

# Configuration depuis les settings Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# Découverte automatique des tâches
app.autodiscover_tasks()

# Configuration des tâches périodiques
app.conf.beat_schedule = {
    'backup-database': {
        'task': 'backend.tasks.backup_database',
        'schedule': 86400.0,  # Tous les jours
    },
    'cleanup-old-logs': {
        'task': 'backend.tasks.cleanup_old_logs',
        'schedule': 604800.0,  # Toutes les semaines
    },
    'send-daily-reports': {
        'task': 'backend.tasks.send_daily_reports',
        'schedule': 3600.0,  # Toutes les heures
    },
}

app.conf.timezone = 'Africa/Algiers'

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')







