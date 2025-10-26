#!/usr/bin/env python
"""
Script pour créer une notification de test avec navigation
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

def create_test_notification():
    """Créer une notification de test pour la navigation"""
    print("🔍 Création d'une notification de test...")
    
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
        user=superuser,
        title__contains="Test Navigation"
    ).delete()
    
    # Créer une nouvelle notification de test
    test_notification = Notification.create_notification(
        user=superuser,
        type_notification='TRANSFERT_CREATED',
        title=f'Test Navigation - {transfert.abattoir_expediteur.nom} → {transfert.abattoir_destinataire.nom}',
        message=f'Cliquez sur cette notification pour naviguer vers la page de détail du transfert {transfert.numero_transfert}',
        abattoir=transfert.abattoir_destinataire,
        priority='HIGH',
        data={
            'transfert_id': transfert.id,
            'numero_transfert': transfert.numero_transfert,
            'abattoir_expediteur': transfert.abattoir_expediteur.nom,
            'abattoir_destinataire': transfert.abattoir_destinataire.nom,
            'nombre_betes': transfert.nombre_betes,
            'created_by': transfert.cree_par.username
        }
    )
    
    print(f"✅ Notification de test créée avec l'ID: {test_notification.id}")
    print(f"🔗 URL de navigation: /dashboard/transfert/{transfert.id}")
    print(f"📊 Données de navigation:")
    print(f"   - transfert_id: {test_notification.data.get('transfert_id')}")
    print(f"   - numero_transfert: {test_notification.data.get('numero_transfert')}")
    print(f"   - abattoir_expediteur: {test_notification.data.get('abattoir_expediteur')}")
    print(f"   - abattoir_destinataire: {test_notification.data.get('abattoir_destinataire')}")
    
    print(f"\n🎯 Instructions de test:")
    print(f"1. Connectez-vous en tant que superuser")
    print(f"2. Cliquez sur la cloche de notification")
    print(f"3. Cliquez sur la notification 'Test Navigation'")
    print(f"4. Vous devriez être redirigé vers /dashboard/transfert/{transfert.id}")

if __name__ == '__main__':
    create_test_notification()
