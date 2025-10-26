#!/usr/bin/env python
"""
Script pour créer des notifications de test professionnelles et sobres
"""
import os
import sys
import django

# Ajouter le répertoire backend au path
sys.path.append('/Users/rayan/ALVIAR DASHBOARD COMMERCIALISATION/backend')

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from notification.models import Notification
from transfert.models import Transfert

User = get_user_model()

def create_professional_test_notifications():
    """Créer des notifications de test professionnelles"""
    print("💼 Création de notifications professionnelles...")
    
    # Récupérer un transfert existant
    transfert = Transfert.objects.first()
    if not transfert:
        print("❌ Aucun transfert trouvé")
        return
    
    print(f"📦 Transfert trouvé: {transfert.numero_transfert} (ID: {transfert.id})")
    
    # Récupérer un superuser
    superuser = User.objects.filter(is_superuser=True).first()
    if not superuser:
        print("❌ Aucun superuser trouvé")
        return
    
    print(f"👤 Superuser: {superuser.username}")
    
    # Supprimer les anciennes notifications de test
    Notification.objects.filter(
        title__contains="PROFESSIONAL"
    ).delete()
    
    # Créer des notifications professionnelles et sobres
    professional_notifications = [
        {
            'title': 'Nouveau transfert créé',
            'message': f'Un transfert de {transfert.nombre_betes} bêtes a été créé depuis {transfert.abattoir_expediteur.nom} vers {transfert.abattoir_destinataire.nom}.',
            'priority': 'MEDIUM',
            'type': 'TRANSFERT_CREATED'
        },
        {
            'title': 'Stabulation terminée',
            'message': f'La stabulation dans l\'abattoir {transfert.abattoir_destinataire.nom} a été terminée avec succès.',
            'priority': 'HIGH',
            'type': 'STABULATION_TERMINATED'
        },
        {
            'title': 'Bon de commande confirmé',
            'message': f'Le bon de commande pour l\'abattoir {transfert.abattoir_destinataire.nom} a été confirmé.',
            'priority': 'MEDIUM',
            'type': 'BON_COMMANDE_CONFIRMED'
        },
        {
            'title': 'Modification d\'abattoir',
            'message': f'Les informations de l\'abattoir {transfert.abattoir_destinataire.nom} ont été mises à jour.',
            'priority': 'LOW',
            'type': 'ABATTOIR_UPDATED'
        }
    ]
    
    created_notifications = []
    
    for i, notification_data in enumerate(professional_notifications):
        # Données de base
        data = {
            'transfert_id': transfert.id,
            'numero_transfert': transfert.numero_transfert,
            'abattoir_expediteur': transfert.abattoir_expediteur.nom,
            'abattoir_destinataire': transfert.abattoir_destinataire.nom,
            'nombre_betes': transfert.nombre_betes,
            'created_by': transfert.cree_par.username
        }
        
        # Adapter les données selon le type
        if notification_data['type'] == 'STABULATION_TERMINATED':
            data['stabulation_id'] = transfert.id
        elif notification_data['type'] == 'BON_COMMANDE_CONFIRMED':
            data['bon_commande_id'] = transfert.id
        elif notification_data['type'] == 'ABATTOIR_UPDATED':
            data['abattoir_id'] = transfert.abattoir_destinataire.id
        
        notification = Notification.create_notification(
            user=superuser,
            type_notification=notification_data['type'],
            title=notification_data['title'],
            message=notification_data['message'],
            abattoir=transfert.abattoir_destinataire,
            priority=notification_data['priority'],
            data=data
        )
        
        created_notifications.append(notification)
        print(f"✅ Notification {i+1} créée: {notification.title}")
    
    print(f"\n🎯 Instructions de test professionnel:")
    print(f"1. Connectez-vous en tant que superuser")
    print(f"2. Cliquez sur la cloche de notification")
    print(f"3. Vous devriez voir un dropdown sobre et professionnel avec:")
    print(f"   - Design simple et épuré")
    print(f"   - Informations importantes clairement affichées")
    print(f"   - Indicateurs de priorité discrets (points colorés)")
    print(f"   - Actions simples (marquer comme lu, supprimer)")
    print(f"   - Navigation fonctionnelle vers les pages de détail")
    print(f"4. Testez la navigation en cliquant sur les notifications")
    print(f"5. Testez les actions (marquer comme lu, supprimer)")

if __name__ == '__main__':
    create_professional_test_notifications()
