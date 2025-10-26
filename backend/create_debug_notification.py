#!/usr/bin/env python
"""
Script pour créer une notification de debug avec des données complètes
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

def create_debug_notification():
    """Créer une notification de debug"""
    print("🔍 Création d'une notification de debug...")
    
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
    
    # Supprimer les anciennes notifications de debug
    Notification.objects.filter(
        title__contains="DEBUG"
    ).delete()
    
    # Créer une notification de debug
    debug_notification = Notification.create_notification(
        user=superuser,
        type_notification='TRANSFERT_CREATED',
        title='DEBUG - Test Navigation Transfert',
        message='Notification de debug pour tester la navigation vers le transfert',
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
    
    print(f"✅ Notification de debug créée avec l'ID: {debug_notification.id}")
    print(f"🔗 URL de navigation: /dashboard/transfert/{transfert.id}")
    print(f"📊 Données complètes:")
    print(f"   - transfert_id: {debug_notification.data.get('transfert_id')}")
    print(f"   - numero_transfert: {debug_notification.data.get('numero_transfert')}")
    print(f"   - abattoir_expediteur: {debug_notification.data.get('abattoir_expediteur')}")
    print(f"   - abattoir_destinataire: {debug_notification.data.get('abattoir_destinataire')}")
    
    print(f"\n🎯 Instructions de test:")
    print(f"1. Connectez-vous en tant que superuser")
    print(f"2. Ouvrez la console du navigateur (F12)")
    print(f"3. Cliquez sur la cloche de notification")
    print(f"4. Cherchez la notification 'DEBUG - Test Navigation Transfert'")
    print(f"5. Cliquez sur cette notification")
    print(f"6. Vérifiez les logs dans la console")
    print(f"7. Vous devriez être redirigé vers /dashboard/transfert/{transfert.id}")

if __name__ == '__main__':
    create_debug_notification()
