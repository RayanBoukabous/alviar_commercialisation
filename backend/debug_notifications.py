#!/usr/bin/env python
"""
Script pour déboguer les notifications
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

def debug_notifications():
    """Déboguer les notifications"""
    print("🔍 Débogage des notifications...")
    
    # Récupérer toutes les notifications
    all_notifications = Notification.objects.all().order_by('-created_at')
    print(f"📊 Total des notifications: {all_notifications.count()}")
    
    # Analyser les notifications
    for notification in all_notifications[:10]:  # Limiter à 10
        print(f"\n📋 Notification ID: {notification.id}")
        print(f"   Titre: {notification.title}")
        print(f"   Type: {notification.type_notification}")
        print(f"   Données: {notification.data}")
        print(f"   Type des données: {type(notification.data)}")
        print(f"   Créée: {notification.created_at}")
        
        if notification.data and isinstance(notification.data, dict):
            print(f"   Transfert ID: {notification.data.get('transfert_id', 'N/A')}")
        else:
            print(f"   ⚠️ Données manquantes ou invalides")
    
    # Vérifier les transferts récents
    print(f"\n📦 Transferts récents:")
    recent_transferts = Transfert.objects.all().order_by('-created_at')[:5]
    for transfert in recent_transferts:
        print(f"   - {transfert.numero_transfert} (ID: {transfert.id})")
        print(f"     Expéditeur: {transfert.abattoir_expediteur.nom}")
        print(f"     Destinataire: {transfert.abattoir_destinataire.nom}")
        print(f"     Créé par: {transfert.cree_par.username}")

if __name__ == '__main__':
    debug_notifications()
