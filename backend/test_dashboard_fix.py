#!/usr/bin/env python
"""
Script de test pour vérifier que le Dashboard ne remet plus les bêtes ABATTU en VIVANT
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
from django.contrib.auth import get_user_model

User = get_user_model()

def test_dashboard_fix():
    print("🧪 TEST DU FIX DASHBOARD")
    print("=" * 50)
    
    # 1. Créer quelques bêtes ABATTU pour le test
    print("\n1. Création de bêtes ABATTU pour le test...")
    
    # Récupérer quelques bêtes vivantes
    betes_vivantes = Bete.objects.filter(statut='VIVANT')[:3]
    if not betes_vivantes.exists():
        print("❌ Aucune bête vivante trouvée pour le test")
        return
    
    # Créer une stabulation et la finaliser
    stabulation = Stabulation.objects.create(
        abattoir=betes_vivantes.first().abattoir,
        type_bete='BOVIN',
        date_debut=django.utils.timezone.now()
    )
    
    # Ajouter les bêtes à la stabulation
    stabulation.betes.set(betes_vivantes)
    
    # Finaliser la stabulation
    stabulation.terminer_stabulation()
    
    print(f"   Stabulation créée et finalisée: {stabulation.numero_stabulation}")
    
    # 2. Vérifier que les bêtes sont ABATTU
    print("\n2. Vérification des statuts après finalisation:")
    for bete in betes_vivantes:
        bete.refresh_from_db()
        print(f"   - {bete.num_boucle}: {bete.statut}")
    
    betes_abattues = [b for b in betes_vivantes if b.statut == 'ABATTU']
    if len(betes_abattues) != len(betes_vivantes):
        print("❌ PROBLÈME: Les bêtes ne sont pas toutes ABATTU")
        return False
    
    print("   ✅ Toutes les bêtes sont ABATTU")
    
    # 3. Simuler l'accès au Dashboard (appel de dashboard_statistics)
    print("\n3. Simulation de l'accès au Dashboard...")
    
    # Récupérer un utilisateur pour simuler l'appel
    user = User.objects.filter(is_superuser=True).first()
    if not user:
        print("❌ Aucun utilisateur superuser trouvé")
        return False
    
    # Simuler l'appel à dashboard_statistics
    from abattoir.views import dashboard_statistics
    from django.test import RequestFactory
    
    factory = RequestFactory()
    request = factory.get('/api/abattoirs/dashboard-statistics/')
    request.user = user
    
    try:
        response = dashboard_statistics(request)
        print("   ✅ Appel dashboard_statistics réussi")
    except Exception as e:
        print(f"   ❌ Erreur lors de l'appel dashboard_statistics: {e}")
        return False
    
    # 4. Vérifier que les bêtes sont TOUJOURS ABATTU
    print("\n4. Vérification des statuts après accès Dashboard:")
    for bete in betes_vivantes:
        bete.refresh_from_db()
        print(f"   - {bete.num_boucle}: {bete.statut}")
    
    betes_encore_abattues = [b for b in betes_vivantes if b.statut == 'ABATTU']
    if len(betes_encore_abattues) == len(betes_vivantes):
        print("   ✅ TOUTES les bêtes restent ABATTU après accès Dashboard")
        success = True
    else:
        print(f"   ❌ PROBLÈME: {len(betes_encore_abattues)}/{len(betes_vivantes)} bêtes restent ABATTU")
        success = False
    
    # 5. Nettoyer
    print("\n5. Nettoyage...")
    stabulation.delete()
    print("   ✅ Stabulation de test supprimée")
    
    if success:
        print("\n🎉 Test terminé avec succès! Le Dashboard ne remet plus les bêtes en VIVANT")
    else:
        print("\n❌ Test échoué! Le problème persiste")
    
    return success

if __name__ == "__main__":
    test_dashboard_fix()
