#!/usr/bin/env python
"""
Script pour créer une notification de test simple
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

def create_simple_test_notification():
    """Créer une notification de test simple"""
    print("🔍 Création d'une notification de test simple...")
    
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
        title__contains="TEST SIMPLE"
    ).delete()
    
    # Créer une notification de test simple
    test_notification = Notification.create_notification(
        user=superuser,
        type_notification='TRANSFERT_CREATED',
        title='TEST SIMPLE - Navigation',
        message='Test simple pour vérifier la navigation. Cliquez sur le bouton vert.',
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
    print(f"📊 Données: {test_notification.data}")
    
    print(f"\n🎯 Instructions de test:")
    print(f"1. Connectez-vous en tant que superuser")
    print(f"2. Ouvrez la console du navigateur (F12)")
    print(f"3. Cliquez sur la cloche de notification")
    print(f"4. Cherchez la notification 'TEST SIMPLE - Navigation'")
    print(f"5. Vous devriez voir un bouton vert 'Voir les détails'")
    print(f"6. Cliquez sur ce bouton")
    print(f"7. Vérifiez les logs dans la console")
    print(f"8. Vous devriez être redirigé vers /dashboard/transfert/{transfert.id}")

if __name__ == '__main__':
    create_simple_test_notification()
