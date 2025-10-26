#!/usr/bin/env python
"""
Script de test pour vérifier que la finalisation des stabulations fonctionne correctement
et que les bêtes restent au statut ABATTU
"""
import os
import sys
import django

# Ajouter le chemin du projet
sys.path.append('/Users/rayan/ALVIAR DASHBOARD COMMERCIALISATION/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from bete.models import Bete
from abattoir.models import Stabulation
from bete.status_manager import BeteStatusManager

def test_finalization_fix():
    print("🧪 TEST DE LA FINALISATION DES STABULATIONS")
    print("=" * 60)
    
    # 1. Vérifier l'état initial
    print("\n1. État initial:")
    for statut in ['VIVANT', 'EN_STABULATION', 'ABATTU', 'MORT', 'VENDU']:
        count = Bete.objects.filter(statut=statut).count()
        print(f"   - {statut}: {count}")
    
    # 2. Créer une stabulation de test
    print("\n2. Création d'une stabulation de test...")
    
    # Récupérer quelques bêtes vivantes
    betes_vivantes = Bete.objects.filter(statut='VIVANT')[:3]
    if not betes_vivantes.exists():
        print("❌ Aucune bête vivante trouvée pour le test")
        return
    
    print(f"   Bêtes sélectionnées: {[b.num_boucle for b in betes_vivantes]}")
    
    # Créer une stabulation
    stabulation = Stabulation.objects.create(
        abattoir=betes_vivantes.first().abattoir,
        type_bete='BOVIN',
        date_debut=django.utils.timezone.now()
    )
    
    # Ajouter les bêtes à la stabulation
    stabulation.betes.set(betes_vivantes)
    
    print(f"   Stabulation créée: {stabulation.numero_stabulation}")
    print(f"   Bêtes dans la stabulation: {stabulation.betes.count()}")
    
    # 3. Vérifier le statut après ajout
    print("\n3. Statut après ajout à la stabulation:")
    for bete in betes_vivantes:
        bete.refresh_from_db()
        print(f"   - {bete.num_boucle}: {bete.statut}")
    
    # 4. Finaliser la stabulation
    print("\n4. Finalisation de la stabulation...")
    try:
        stabulation.terminer_stabulation()
        print("   ✅ Stabulation finalisée")
    except Exception as e:
        print(f"   ❌ Erreur lors de la finalisation: {e}")
        return
    
    # 5. Vérifier le statut après finalisation
    print("\n5. Statut après finalisation:")
    for bete in betes_vivantes:
        bete.refresh_from_db()
        print(f"   - {bete.num_boucle}: {bete.statut}")
    
    # 6. Vérifier que les bêtes sont bien ABATTU
    betes_abattues = [b for b in betes_vivantes if b.statut == 'ABATTU']
    if len(betes_abattues) == len(betes_vivantes):
        print("   ✅ TOUTES les bêtes sont au statut ABATTU")
    else:
        print(f"   ❌ PROBLÈME: {len(betes_abattues)}/{len(betes_vivantes)} bêtes sont ABATTU")
        return False
    
    # 7. Attendre un peu et vérifier à nouveau (simuler navigation)
    print("\n6. Vérification après délai (simulation navigation)...")
    import time
    time.sleep(2)
    
    for bete in betes_vivantes:
        bete.refresh_from_db()
        print(f"   - {bete.num_boucle}: {bete.statut}")
    
    # 8. Vérifier l'état final
    print("\n7. État final:")
    for statut in ['VIVANT', 'EN_STABULATION', 'ABATTU', 'MORT', 'VENDU']:
        count = Bete.objects.filter(statut=statut).count()
        print(f"   - {statut}: {count}")
    
    # 9. Nettoyer
    print("\n8. Nettoyage...")
    stabulation.delete()
    print("   ✅ Stabulation de test supprimée")
    
    print("\n🎉 Test terminé avec succès!")
    return True

if __name__ == "__main__":
    test_finalization_fix()
