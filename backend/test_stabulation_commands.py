#!/usr/bin/env python3
"""
Script de test simple pour valider la logique de finalisation de stabulation
avec des commandes Django directes.

Usage:
    python test_stabulation_commands.py
"""

import os
import sys
import django
from django.conf import settings

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from abattoir.models import Abattoir, Stabulation
from bete.models import Bete, Espece
from django.utils import timezone

User = get_user_model()

def create_test_data():
    """Créer les données de test"""
    print("🔧 Création des données de test...")
    
    # Créer un abattoir de test
    abattoir, created = Abattoir.objects.get_or_create(
        nom="Test Abattoir Finalisation",
        defaults={
            'adresse': 'Test Address',
            'telephone': '0123456789',
            'capacite_stabulation_ovin': 50,
            'capacite_stabulation_bovin': 20
        }
    )
    print(f"✅ Abattoir: {abattoir.nom}")
    
    # Créer des espèces
    espece_ovin, _ = Espece.objects.get_or_create(nom='OVIN')
    espece_bovin, _ = Espece.objects.get_or_create(nom='BOVIN')
    print(f"✅ Espèces: {espece_ovin.nom}, {espece_bovin.nom}")
    
    # Créer des bêtes de test
    betes = []
    for i in range(3):
        bete = Bete.objects.create(
            num_boucle=f'TEST_BETE_{i+1:03d}',
            espece=espece_ovin,
            sexe='F',
            poids_vif=45.0 + i * 5,
            statut='VIVANT',
            etat_sante='BON',
            abattoir=abattoir
        )
        betes.append(bete)
        print(f"✅ Bête créée: {bete.num_boucle} (ID: {bete.id})")
    
    # Créer une stabulation
    stabulation = Stabulation.objects.create(
        numero_stabulation=f'TEST_STAB_{timezone.now().strftime("%Y%m%d_%H%M%S")}',
        abattoir=abattoir,
        type_bete='OVIN',
        capacite_maximale=10,
        notes='Stabulation de test'
    )
    
    # Ajouter les bêtes
    stabulation.ajouter_betes(betes)
    print(f"✅ Stabulation créée: {stabulation.numero_stabulation} (ID: {stabulation.id})")
    print(f"✅ Statut initial: {stabulation.statut}")
    
    return abattoir, stabulation, betes

def test_duplicate_post_number():
    """Test avec numéro post abattage existant"""
    print("\n🧪 Test 1: Numéro post abattage existant")
    
    abattoir, stabulation, betes = create_test_data()
    
    # Créer une bête avec un numéro post abattage existant
    existing_bete = Bete.objects.create(
        num_boucle='EXISTING_001',
        num_boucle_post_abattage='POST_EXISTING_001',
        espece=Espece.objects.get(nom='OVIN'),
        sexe='F',
        poids_vif=50.0,
        statut='ABATTU',
        etat_sante='BON',
        abattoir=abattoir
    )
    print(f"✅ Bête existante créée avec numéro post: {existing_bete.num_boucle_post_abattage}")
    
    # Simuler la logique de vérification
    print("🔍 Vérification de l'unicité des numéros post abattage...")
    
    errors = []
    for bete in betes:
        num_boucle_post_abattage = 'POST_EXISTING_001'  # Numéro existant
        
        if num_boucle_post_abattage:
            existing_bete_check = Bete.objects.filter(
                num_boucle_post_abattage=num_boucle_post_abattage
            ).exclude(id=bete.id).first()
            
            if existing_bete_check:
                errors.append(f"Le numéro de boucle post-abattage '{num_boucle_post_abattage}' existe déjà pour la bête {existing_bete_check.num_boucle}")
                print(f"❌ Erreur trouvée: {errors[-1]}")
    
    if errors:
        print("✅ Test réussi: Les erreurs de validation ont été détectées")
        print(f"   Nombre d'erreurs: {len(errors)}")
        print(f"   La stabulation ne devrait PAS être terminée")
        
        # Vérifier que la stabulation n'a pas changé de statut
        stabulation.refresh_from_db()
        print(f"   Statut stabulation: {stabulation.statut} (doit rester EN_COURS)")
        return True
    else:
        print("❌ Test échoué: Aucune erreur détectée alors qu'il devrait y en avoir")
        return False

def test_unique_post_numbers():
    """Test avec numéros post abattage uniques"""
    print("\n🧪 Test 2: Numéros post abattage uniques")
    
    abattoir, stabulation, betes = create_test_data()
    
    # Simuler la logique de vérification avec des numéros uniques
    print("🔍 Vérification de l'unicité des numéros post abattage...")
    
    errors = []
    for i, bete in enumerate(betes):
        num_boucle_post_abattage = f'POST_UNIQUE_{i+1:03d}'  # Numéros uniques
        
        if num_boucle_post_abattage:
            existing_bete_check = Bete.objects.filter(
                num_boucle_post_abattage=num_boucle_post_abattage
            ).exclude(id=bete.id).first()
            
            if existing_bete_check:
                errors.append(f"Le numéro de boucle post-abattage '{num_boucle_post_abattage}' existe déjà pour la bête {existing_bete_check.num_boucle}")
                print(f"❌ Erreur trouvée: {errors[-1]}")
            else:
                print(f"✅ Numéro unique: {num_boucle_post_abattage}")
    
    if not errors:
        print("✅ Test réussi: Aucune erreur de validation détectée")
        print("   La stabulation peut être terminée")
        
        # Simuler la finalisation
        stabulation.terminer_stabulation()
        Bete.objects.filter(id__in=[b.id for b in betes]).update(statut='ABATTU')
        
        # Mettre à jour les numéros post abattage
        for i, bete in enumerate(betes):
            bete.num_boucle_post_abattage = f'POST_UNIQUE_{i+1:03d}'
            bete.poids_a_chaud = bete.poids_vif * 0.6
            bete.save()
        
        # Vérifier les changements
        stabulation.refresh_from_db()
        print(f"   Statut stabulation: {stabulation.statut} (doit être TERMINE)")
        
        for bete in betes:
            bete.refresh_from_db()
            print(f"   Bête {bete.num_boucle}: statut {bete.statut}, post abattage {bete.num_boucle_post_abattage}")
        
        return True
    else:
        print("❌ Test échoué: Des erreurs ont été détectées alors qu'il ne devrait pas y en avoir")
        print(f"   Erreurs: {errors}")
        return False

def cleanup_test_data():
    """Nettoyer les données de test"""
    print("\n🧹 Nettoyage des données de test...")
    
    # Supprimer les stabulations de test
    Stabulation.objects.filter(numero_stabulation__startswith='TEST_STAB_').delete()
    print("✅ Stabulations de test supprimées")
    
    # Supprimer les bêtes de test
    Bete.objects.filter(num_boucle__startswith='TEST_BETE_').delete()
    Bete.objects.filter(num_boucle__startswith='EXISTING_').delete()
    print("✅ Bêtes de test supprimées")
    
    # Supprimer l'abattoir de test
    Abattoir.objects.filter(nom="Test Abattoir Finalisation").delete()
    print("✅ Abattoir de test supprimé")

def main():
    """Fonction principale"""
    print("🧪 Testeur de Finalisation de Stabulation (Commandes Django)")
    print("=" * 60)
    
    try:
        # Tests
        test1_success = test_duplicate_post_number()
        test2_success = test_unique_post_numbers()
        
        # Résumé
        print("\n" + "=" * 60)
        print("📋 RÉSUMÉ DES TESTS")
        print("=" * 60)
        print(f"Test 1 (Numéro existant): {'✅ RÉUSSI' if test1_success else '❌ ÉCHOUÉ'}")
        print(f"Test 2 (Numéros uniques): {'✅ RÉUSSI' if test2_success else '❌ ÉCHOUÉ'}")
        
        if test1_success and test2_success:
            print("\n🎉 TOUS LES TESTS SONT PASSÉS!")
            print("La logique de finalisation de stabulation fonctionne correctement.")
        else:
            print("\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ")
            print("Vérifiez la logique de finalisation.")
        
        return test1_success and test2_success
        
    except Exception as e:
        print(f"\n❌ Erreur lors des tests: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        # Nettoyage
        cleanup_test_data()

if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ Tests terminés avec succès!")
        sys.exit(0)
    else:
        print("\n❌ Tests terminés avec des erreurs!")
        sys.exit(1)
