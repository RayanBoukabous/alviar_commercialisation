#!/usr/bin/env python
"""
Script pour tester les notifications
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
from abattoir.models import Abattoir

User = get_user_model()

def test_notifications():
    """Test des notifications"""
    print("🔍 Test des notifications...")
    
    # Vérifier les utilisateurs
    users = User.objects.all()
    print(f"👥 Utilisateurs trouvés: {users.count()}")
    for user in users:
        print(f"  - {user.username} (superuser: {user.is_superuser}, abattoir: {user.abattoir})")
    
    # Vérifier les abattoirs
    abattoirs = Abattoir.objects.all()
    print(f"🏢 Abattoirs trouvés: {abattoirs.count()}")
    for abattoir in abattoirs:
        print(f"  - {abattoir.nom} (ID: {abattoir.id})")
    
    # Vérifier les notifications
    notifications = Notification.objects.all()
    print(f"🔔 Notifications trouvées: {notifications.count()}")
    for notification in notifications:
        print(f"  - {notification.title} (user: {notification.user.username}, lu: {notification.is_read})")
    
    # Créer une notification de test pour un superuser
    superuser = User.objects.filter(is_superuser=True).first()
    if superuser:
        print(f"\n🧪 Création d'une notification de test pour {superuser.username}...")
        test_notification = Notification.create_notification(
            user=superuser,
            type_notification='TRANSFERT_CREATED',
            title='Test - Transfert créé',
            message='Ceci est une notification de test pour vérifier le système.',
            priority='HIGH',
            data={'test': True}
        )
        print(f"✅ Notification créée avec l'ID: {test_notification.id}")
    else:
        print("❌ Aucun superuser trouvé")

if __name__ == '__main__':
    test_notifications()
