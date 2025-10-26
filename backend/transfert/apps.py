from django.apps import AppConfig


class TransfertConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'transfert'
    verbose_name = 'Système de Transfert'
    
    def ready(self):
        """Configuration au démarrage de l'application"""
        # Import des signaux si nécessaire
        pass