# SIGNAUX DÉSACTIVÉS TEMPORAIREMENT POUR ÉVITER LES CONFLITS
# Les statuts des bêtes sont maintenant gérés UNIQUEMENT par le gestionnaire unifié
# dans les méthodes terminer_stabulation() et annuler_stabulation() du modèle

# from django.db.models.signals import post_save, m2m_changed
# from django.dispatch import receiver
# from .models import Stabulation
# from bete.status_manager import BeteStatusManager
# import logging

# logger = logging.getLogger(__name__)

# NOTE: Les signaux ont été désactivés car ils causaient des conflits
# Les statuts des bêtes sont maintenant gérés directement dans les méthodes du modèle
# pour garantir la cohérence et éviter les changements de statut inattendus
