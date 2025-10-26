from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Notification
from abattoir.models import Abattoir

User = get_user_model()


class NotificationService:
    """
    Service pour gérer les notifications automatiques
    """
    
    @staticmethod
    def create_stabulation_notification(stabulation):
        """
        Crée une notification lors de la création d'une stabulation
        """
        abattoir = stabulation.abattoir
        created_by = stabulation.created_by
        
        # Notifier tous les utilisateurs de l'abattoir (sauf le créateur) + tous les superusers
        users_to_notify = User.objects.filter(
            Q(abattoir=abattoir) | Q(is_superuser=True)
        ).exclude(id=created_by.id)
        
        notifications = []
        for user in users_to_notify:
            # Adapter le titre et message selon le type d'utilisateur
            if user.is_superuser:
                title = f"Nouvelle stabulation - {abattoir.nom}"
                message = f"Stabulation de type {stabulation.get_type_bete_display()} créée dans l'abattoir {abattoir.nom} par {created_by.username}."
            else:
                title = f"Nouvelle stabulation créée - {abattoir.nom}"
                message = f"Une nouvelle stabulation de type {stabulation.get_type_bete_display()} a été créée dans l'abattoir {abattoir.nom} par {created_by.username}."
            
            notification = Notification.create_notification(
                user=user,
                type_notification='STABULATION_CREATED',
                title=title,
                message=message,
                abattoir=abattoir,
                priority='MEDIUM',
                data={
                    'stabulation_id': stabulation.id,
                    'numero_stabulation': stabulation.numero_stabulation,
                    'type_bete': stabulation.type_bete,
                    'created_by': created_by.username
                }
            )
            notifications.append(notification)
        
        return notifications
    
    @staticmethod
    def create_stabulation_terminated_notification(stabulation):
        """
        Crée une notification lors de la termination d'une stabulation
        """
        abattoir = stabulation.abattoir
        
        # Notifier tous les utilisateurs de l'abattoir + tous les superusers
        users_to_notify = User.objects.filter(
            Q(abattoir=abattoir) | Q(is_superuser=True)
        )
        
        notifications = []
        for user in users_to_notify:
            # Adapter le titre et message selon le type d'utilisateur
            if user.is_superuser:
                title = f"Stabulation terminée - {abattoir.nom}"
                message = f"Stabulation {stabulation.numero_stabulation} de type {stabulation.get_type_bete_display()} terminée dans l'abattoir {abattoir.nom}."
            else:
                title = f"Stabulation terminée - {abattoir.nom}"
                message = f"La stabulation {stabulation.numero_stabulation} de type {stabulation.get_type_bete_display()} a été terminée dans l'abattoir {abattoir.nom}."
            
            notification = Notification.create_notification(
                user=user,
                type_notification='STABULATION_TERMINATED',
                title=title,
                message=message,
                abattoir=abattoir,
                priority='HIGH',
                data={
                    'stabulation_id': stabulation.id,
                    'numero_stabulation': stabulation.numero_stabulation,
                    'type_bete': stabulation.type_bete,
                    'date_fin': stabulation.date_fin.isoformat() if stabulation.date_fin else None
                }
            )
            notifications.append(notification)
        
        return notifications
    
    @staticmethod
    def create_bon_commande_notification(bon_commande):
        """
        Crée une notification lors de la création d'un bon de commande
        """
        abattoir = bon_commande.abattoir
        created_by = bon_commande.created_by
        
        # Notifier tous les utilisateurs de l'abattoir (sauf le créateur)
        users_to_notify = User.objects.filter(
            abattoir=abattoir
        ).exclude(id=created_by.id)
        
        title = f"Nouveau bon de commande - {abattoir.nom}"
        message = f"Un nouveau bon de commande {bon_commande.numero_bon} a été créé pour le client {bon_commande.client.nom} dans l'abattoir {abattoir.nom}."
        
        notifications = []
        for user in users_to_notify:
            notification = Notification.create_notification(
                user=user,
                type_notification='BON_COMMANDE_CREATED',
                title=title,
                message=message,
                abattoir=abattoir,
                priority='MEDIUM',
                data={
                    'bon_commande_id': bon_commande.id,
                    'numero_bon': bon_commande.numero_bon,
                    'client_nom': bon_commande.client.nom,
                    'type_bete': bon_commande.type_bete,
                    'quantite': float(bon_commande.quantite),
                    'created_by': created_by.username
                }
            )
            notifications.append(notification)
        
        return notifications
    
    @staticmethod
    def create_bon_commande_confirmed_notification(bon_commande):
        """
        Crée une notification lors de la confirmation d'un bon de commande
        """
        abattoir = bon_commande.abattoir
        
        # Notifier tous les utilisateurs de l'abattoir + tous les superusers
        users_to_notify = User.objects.filter(
            Q(abattoir=abattoir) | Q(is_superuser=True)
        )
        
        title = f"Bon de commande confirmé - {abattoir.nom}"
        message = f"Le bon de commande {bon_commande.numero_bon} pour le client {bon_commande.client.nom} a été confirmé."
        
        notifications = []
        for user in users_to_notify:
            notification = Notification.create_notification(
                user=user,
                type_notification='BON_COMMANDE_CONFIRMED',
                title=title,
                message=message,
                abattoir=abattoir,
                priority='HIGH',
                data={
                    'bon_commande_id': bon_commande.id,
                    'numero_bon': bon_commande.numero_bon,
                    'client_nom': bon_commande.client.nom,
                    'statut': bon_commande.statut
                }
            )
            notifications.append(notification)
        
        return notifications
    
    @staticmethod
    def create_bon_commande_status_changed_notification(bon_commande, ancien_statut, nouveau_statut, user):
        """
        Crée une notification lors du changement de statut d'un bon de commande
        """
        abattoir = bon_commande.abattoir
        
        # Notifier tous les utilisateurs de l'abattoir + tous les superusers
        users_to_notify = User.objects.filter(
            Q(abattoir=abattoir) | Q(is_superuser=True)
        )
        
        # Adapter le titre et message selon le nouveau statut
        statut_messages = {
            'CONFIRME': {
                'title': f"Bon de commande confirmé - {abattoir.nom}",
                'message': f"Le bon de commande {bon_commande.numero_bon} a été confirmé par {user.get_full_name()}."
            },
            'EN_COURS': {
                'title': f"Bon de commande en cours - {abattoir.nom}",
                'message': f"Le bon de commande {bon_commande.numero_bon} est maintenant en cours de traitement."
            },
            'LIVRE': {
                'title': f"Bon de commande livré - {abattoir.nom}",
                'message': f"Le bon de commande {bon_commande.numero_bon} a été livré avec succès."
            },
            'ANNULE': {
                'title': f"Bon de commande annulé - {abattoir.nom}",
                'message': f"Le bon de commande {bon_commande.numero_bon} a été annulé par {user.get_full_name()}."
            }
        }
        
        message_config = statut_messages.get(nouveau_statut, {
            'title': f"Statut modifié - {abattoir.nom}",
            'message': f"Le statut du bon de commande {bon_commande.numero_bon} a été modifié de {ancien_statut} vers {nouveau_statut}."
        })
        
        notifications = []
        for user_to_notify in users_to_notify:
            # Adapter le message selon le type d'utilisateur
            if user_to_notify.is_superuser:
                title = f"{message_config['title']} (Superuser)"
                message = f"{message_config['message']} Abattoir: {abattoir.nom}"
            else:
                title = message_config['title']
                message = message_config['message']
            
            notification = Notification.create_notification(
                user=user_to_notify,
                type_notification='BON_COMMANDE_STATUS_CHANGED',
                title=title,
                message=message,
                abattoir=abattoir,
                priority='HIGH' if nouveau_statut in ['LIVRE', 'ANNULE'] else 'MEDIUM',
                data={
                    'bon_commande_id': bon_commande.id,
                    'numero_bon': bon_commande.numero_bon,
                    'client_nom': bon_commande.client.nom,
                    'ancien_statut': ancien_statut,
                    'nouveau_statut': nouveau_statut,
                    'changed_by': user.get_full_name(),
                    'date_livraison_reelle': bon_commande.date_livraison_reelle.isoformat() if bon_commande.date_livraison_reelle else None
                }
            )
            notifications.append(notification)
        
        return notifications
    
    @staticmethod
    def create_transfert_notification(transfert):
        """
        Crée une notification lors de la création d'un transfert
        """
        abattoir_expediteur = transfert.abattoir_expediteur
        abattoir_destinataire = transfert.abattoir_destinataire
        created_by = transfert.cree_par
        
        # Notifier les utilisateurs de l'abattoir destinataire + tous les superusers
        users_to_notify = User.objects.filter(
            Q(abattoir=abattoir_destinataire) | Q(is_superuser=True)
        )
        
        notifications = []
        for user in users_to_notify:
            # Adapter le titre et message selon le type d'utilisateur
            if user.is_superuser:
                title = f"Nouveau transfert - {abattoir_expediteur.nom} → {abattoir_destinataire.nom}"
                message = f"Transfert de {transfert.nombre_betes} bêtes depuis {abattoir_expediteur.nom} vers {abattoir_destinataire.nom} créé par {created_by.username}."
            else:
                title = f"Nouveau transfert reçu - {abattoir_destinataire.nom}"
                message = f"Un transfert de {transfert.nombre_betes} bêtes a été envoyé depuis {abattoir_expediteur.nom} vers {abattoir_destinataire.nom}."
            
            notification = Notification.create_notification(
                user=user,
                type_notification='TRANSFERT_CREATED',
                title=title,
                message=message,
                abattoir=abattoir_destinataire,
                priority='HIGH',
                data={
                    'transfert_id': transfert.id,
                    'numero_transfert': transfert.numero_transfert,
                    'abattoir_expediteur': abattoir_expediteur.nom,
                    'abattoir_destinataire': abattoir_destinataire.nom,
                    'nombre_betes': transfert.nombre_betes,
                    'created_by': created_by.username
                }
            )
            notifications.append(notification)
        
        return notifications
    
    @staticmethod
    def create_transfert_delivered_notification(transfert):
        """
        Crée une notification lors de la livraison d'un transfert
        """
        abattoir_expediteur = transfert.abattoir_expediteur
        abattoir_destinataire = transfert.abattoir_destinataire
        
        # Notifier les utilisateurs de l'abattoir expéditeur + tous les superusers
        users_to_notify = User.objects.filter(
            Q(abattoir=abattoir_expediteur) | Q(is_superuser=True)
        )
        
        title = f"Transfert livré - {abattoir_expediteur.nom}"
        message = f"Le transfert {transfert.numero_transfert} vers {abattoir_destinataire.nom} a été livré avec succès."
        
        notifications = []
        for user in users_to_notify:
            notification = Notification.create_notification(
                user=user,
                type_notification='TRANSFERT_DELIVERED',
                title=title,
                message=message,
                abattoir=abattoir_expediteur,
                priority='MEDIUM',
                data={
                    'transfert_id': transfert.id,
                    'numero_transfert': transfert.numero_transfert,
                    'abattoir_expediteur': abattoir_expediteur.nom,
                    'abattoir_destinataire': abattoir_destinataire.nom,
                    'date_livraison': transfert.date_livraison.isoformat() if transfert.date_livraison else None
                }
            )
            notifications.append(notification)
        
        return notifications
    
    @staticmethod
    def create_abattoir_updated_notification(abattoir, updated_by, changes):
        """
        Crée une notification lors de la modification d'un abattoir
        """
        # Notifier tous les utilisateurs de l'abattoir + tous les superusers
        users_to_notify = User.objects.filter(
            Q(abattoir=abattoir) | Q(is_superuser=True)
        )
        
        title = f"Abattoir modifié - {abattoir.nom}"
        message = f"L'abattoir {abattoir.nom} a été modifié par {updated_by.username}. Changements: {', '.join(changes)}."
        
        notifications = []
        for user in users_to_notify:
            notification = Notification.create_notification(
                user=user,
                type_notification='ABATTOIR_UPDATED',
                title=title,
                message=message,
                abattoir=abattoir,
                priority='LOW',
                data={
                    'abattoir_id': abattoir.id,
                    'abattoir_nom': abattoir.nom,
                    'updated_by': updated_by.username,
                    'changes': changes
                }
            )
            notifications.append(notification)
        
        return notifications
    
    @staticmethod
    def notify_superusers(notification_type, title, message, data=None):
        """
        Notifie tous les superusers
        """
        superusers = User.objects.filter(is_superuser=True)
        
        notifications = []
        for user in superusers:
            notification = Notification.create_notification(
                user=user,
                type_notification=notification_type,
                title=title,
                message=message,
                priority='MEDIUM',
                data=data or {}
            )
            notifications.append(notification)
        
        return notifications
