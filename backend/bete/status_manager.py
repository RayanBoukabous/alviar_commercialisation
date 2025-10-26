"""
Gestionnaire unifié des statuts des bêtes
Cette classe centralise TOUTE la logique de changement de statut des bêtes
pour éviter les conflits et assurer la cohérence
"""
from django.db import transaction
from django.utils import timezone
from .models import Bete
import logging

logger = logging.getLogger(__name__)


class BeteStatusManager:
    """
    Gestionnaire unifié et fiable des statuts des bêtes
    TOUS les changements de statut doivent passer par cette classe
    """
    
    # Statuts autorisés
    VALID_STATUSES = ['VIVANT', 'EN_STABULATION', 'ABATTU', 'MORT', 'VENDU']
    
    # Transitions autorisées (statut_actuel -> [statuts_possibles])
    ALLOWED_TRANSITIONS = {
        'VIVANT': ['EN_STABULATION', 'ABATTU', 'MORT', 'VENDU'],
        'EN_STABULATION': ['VIVANT', 'ABATTU'],  # Peut revenir vivant ou être abattu
        'ABATTU': [],  # Une fois abattu, on ne peut plus changer
        'MORT': [],    # Une fois mort, on ne peut plus changer
        'VENDU': []    # Une fois vendu, on ne peut plus changer
    }
    
    @classmethod
    def can_transition(cls, current_status: str, new_status: str) -> bool:
        """Vérifie si une transition de statut est autorisée"""
        if new_status not in cls.VALID_STATUSES:
            return False
        return new_status in cls.ALLOWED_TRANSITIONS.get(current_status, [])
    
    @classmethod
    @transaction.atomic
    def change_status(cls, bete_ids: list, new_status: str, reason: str = None, user=None) -> dict:
        """
        Change le statut de bêtes de manière atomique et fiable
        
        Args:
            bete_ids: Liste des IDs des bêtes à modifier
            new_status: Nouveau statut
            reason: Raison du changement (pour audit)
            user: Utilisateur qui effectue le changement
            
        Returns:
            dict: Résultat de l'opération
        """
        if not bete_ids:
            return {'success': False, 'error': 'Aucune bête spécifiée'}
        
        if new_status not in cls.VALID_STATUSES:
            return {'success': False, 'error': f'Statut invalide: {new_status}'}
        
        try:
            # Récupérer les bêtes
            betes = Bete.objects.filter(id__in=bete_ids)
            if not betes.exists():
                return {'success': False, 'error': 'Aucune bête trouvée'}
            
            # Vérifier les transitions autorisées
            invalid_transitions = []
            valid_betes = []
            
            for bete in betes:
                if cls.can_transition(bete.statut, new_status):
                    valid_betes.append(bete)
                else:
                    invalid_transitions.append(f"Bête {bete.num_boucle}: {bete.statut} -> {new_status}")
            
            if invalid_transitions:
                return {
                    'success': False, 
                    'error': 'Transitions non autorisées',
                    'details': invalid_transitions
                }
            
            # Effectuer le changement
            updated_count = betes.filter(id__in=[b.id for b in valid_betes]).update(
                statut=new_status,
                updated_at=timezone.now()
            )
            
            # Log pour audit
            logger.info(
                f"Changement de statut: {updated_count} bêtes -> {new_status} "
                f"(Raison: {reason}, User: {user})"
            )
            
            return {
                'success': True,
                'updated_count': updated_count,
                'new_status': new_status,
                'reason': reason
            }
            
        except Exception as e:
            logger.error(f"Erreur lors du changement de statut: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    @classmethod
    def finalize_stabulation_betes(cls, stabulation_id: int, user=None) -> dict:
        """
        Finalise les bêtes d'une stabulation (VIVANT/EN_STABULATION -> ABATTU)
        Cette méthode est appelée UNIQUEMENT lors de la finalisation d'une stabulation
        """
        from abattoir.models import Stabulation
        
        try:
            stabulation = Stabulation.objects.get(id=stabulation_id)
            bete_ids = list(stabulation.betes.values_list('id', flat=True))
            
            if not bete_ids:
                return {'success': True, 'updated_count': 0, 'message': 'Aucune bête dans la stabulation'}
            
            return cls.change_status(
                bete_ids=bete_ids,
                new_status='ABATTU',
                reason=f'Finalisation stabulation {stabulation.numero_stabulation}',
                user=user
            )
            
        except Stabulation.DoesNotExist:
            return {'success': False, 'error': 'Stabulation non trouvée'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @classmethod
    def cancel_stabulation_betes(cls, stabulation_id: int, user=None) -> dict:
        """
        Annule les bêtes d'une stabulation (EN_STABULATION -> VIVANT)
        Cette méthode est appelée UNIQUEMENT lors de l'annulation d'une stabulation
        """
        from abattoir.models import Stabulation
        
        try:
            stabulation = Stabulation.objects.get(id=stabulation_id)
            bete_ids = list(stabulation.betes.values_list('id', flat=True))
            
            if not bete_ids:
                return {'success': True, 'updated_count': 0, 'message': 'Aucune bête dans la stabulation'}
            
            return cls.change_status(
                bete_ids=bete_ids,
                new_status='VIVANT',
                reason=f'Annulation stabulation {stabulation.numero_stabulation}',
                user=user
            )
            
        except Stabulation.DoesNotExist:
            return {'success': False, 'error': 'Stabulation non trouvée'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @classmethod
    def add_betes_to_stabulation(cls, bete_ids: list, user=None) -> dict:
        """
        Ajoute des bêtes à une stabulation (VIVANT -> EN_STABULATION)
        """
        return cls.change_status(
            bete_ids=bete_ids,
            new_status='EN_STABULATION',
            reason='Ajout à stabulation',
            user=user
        )
    
    @classmethod
    def remove_betes_from_stabulation(cls, bete_ids: list, user=None) -> dict:
        """
        Retire des bêtes d'une stabulation (EN_STABULATION -> VIVANT)
        """
        return cls.change_status(
            bete_ids=bete_ids,
            new_status='VIVANT',
            reason='Retrait de stabulation',
            user=user
        )
