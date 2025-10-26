from django.apps import AppConfig


class AbattoirConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'abattoir'
    
    def ready(self):
        """Enregistrer les signaux quand l'application est prête"""
        import abattoir.signals