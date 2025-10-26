#!/usr/bin/env python3
"""
Script pour créer des données de test réalistes pour tester la finalisation de stabulation.

Ce script crée :
1. Un abattoir de test
2. Des bêtes avec des numéros post abattage existants
3. Une stabulation en cours
4. Des bêtes prêtes à être finalisées
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

def create_test_abattoir():
    """Créer un abattoir de test"""
    abattoir, created = Abattoir.objects.get_or_create(
        nom="Abattoir Test Finalisation",
        defaults={
            'adresse': '123 Rue Test, Ville Test',
            'telephone': '0123456789',
            'capacite_stabulation_ovin': 100,
            'capacite_stabulation_bovin': 50
        }
    )
    print(f"✅ Abattoir: {abattoir.nom} (ID: {abattoir.id})")
    return abattoir

def create_test_species():
    """Créer les espèces de test"""
    espece_ovin, _ = Espece.objects.get_or_create(nom='OVIN')
    espece_bovin, _ = Espece.objects.get_or_create(nom='BOVIN')
    print(f"✅ Espèces: {espece_ovin.nom}, {espece_bovin.nom}")
    return espece_ovin, espece_bovin

def create_existing_betes_with_post_numbers(abattoir, espece_ovin, espece_bovin):
    """Créer des bêtes existantes avec des numéros post abattage"""
    print("🐑 Création de bêtes existantes avec numéros post abattage...")
    
    existing_betes = []
    
    # Créer 5 bêtes ovines déjà abattues avec numéros post abattage
    for i in range(5):
        bete = Bete.objects.create(
            num_boucle=f'EXISTING_OVIN_{i+1:03d}',
            num_boucle_post_abattage=f'POST_OVIN_{i+1:03d}',
            espece=espece_ovin,
            sexe='F',
            poids_vif=45.0 + i * 3,
            poids_a_chaud=27.0 + i * 2,
            statut='ABATTU',
            etat_sante='BON',
            abattoir=abattoir
        )
        existing_betes.append(bete)
        print(f"  ✅ Bête ovine existante: {bete.num_boucle} -> {bete.num_boucle_post_abattage}")
    
    # Créer 3 bêtes bovines déjà abattues avec numéros post abattage
    for i in range(3):
        bete = Bete.objects.create(
            num_boucle=f'EXISTING_BOVIN_{i+1:03d}',
            num_boucle_post_abattage=f'POST_BOVIN_{i+1:03d}',
            espece=espece_bovin,
            sexe='M',
            poids_vif=300.0 + i * 50,
            poids_a_chaud=180.0 + i * 30,
            statut='ABATTU',
            etat_sante='BON',
            abattoir=abattoir
        )
        existing_betes.append(bete)
        print(f"  ✅ Bête bovine existante: {bete.num_boucle} -> {bete.num_boucle_post_abattage}")
    
    return existing_betes

def create_test_stabulation(abattoir, espece_ovin, espece_bovin):
    """Créer une stabulation de test avec des bêtes"""
    print("🏠 Création de la stabulation de test...")
    
    # Créer la stabulation
    stabulation = Stabulation.objects.create(
        numero_stabulation=f'TEST_STAB_{timezone.now().strftime("%Y%m%d_%H%M%S")}',
        abattoir=abattoir,
        type_bete='OVIN',
        capacite_maximale=20,
        notes='Stabulation de test pour finalisation - Test des contraintes de numéro post abattage'
    )
    
    # Créer des bêtes pour la stabulation
    betes_stabulation = []
    
    # Créer 4 bêtes ovines pour la stabulation
    for i in range(4):
        bete = Bete.objects.create(
            num_boucle=f'STAB_OVIN_{i+1:03d}',
            espece=espece_ovin,
            sexe='F',
            poids_vif=42.0 + i * 4,
            statut='VIVANT',
            etat_sante='BON',
            abattoir=abattoir
        )
        betes_stabulation.append(bete)
        print(f"  ✅ Bête pour stabulation: {bete.num_boucle} (poids: {bete.poids_vif}kg)")
    
    # Créer 2 bêtes bovines pour la stabulation
    for i in range(2):
        bete = Bete.objects.create(
            num_boucle=f'STAB_BOVIN_{i+1:03d}',
            espece=espece_bovin,
            sexe='M',
            poids_vif=280.0 + i * 40,
            statut='VIVANT',
            etat_sante='BON',
            abattoir=abattoir
        )
        betes_stabulation.append(bete)
        print(f"  ✅ Bête pour stabulation: {bete.num_boucle} (poids: {bete.poids_vif}kg)")
    
    # Ajouter les bêtes à la stabulation
    stabulation.ajouter_betes(betes_stabulation)
    
    print(f"✅ Stabulation créée: {stabulation.numero_stabulation}")
    print(f"✅ ID: {stabulation.id}")
    print(f"✅ Statut: {stabulation.statut}")
    print(f"✅ Nombre de bêtes: {len(betes_stabulation)}")
    
    return stabulation, betes_stabulation

def create_test_user(abattoir):
    """Créer un utilisateur de test"""
    user, created = User.objects.get_or_create(
        username='test_finalization_user',
        defaults={
            'email': 'test.finalization@example.com',
            'first_name': 'Test',
            'last_name': 'Finalization',
            'abattoir': abattoir,
            'is_staff': True
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"✅ Utilisateur créé: {user.username}")
    else:
        print(f"✅ Utilisateur existant: {user.username}")
    
    return user

def print_test_scenarios():
    """Afficher les scénarios de test possibles"""
    print("\n" + "=" * 60)
    print("🧪 SCÉNARIOS DE TEST POSSIBLES")
    print("=" * 60)
    
    print("\n1️⃣  Test avec numéro post abattage existant:")
    print("   - Utiliser un numéro comme 'POST_OVIN_001' (déjà utilisé)")
    print("   - La finalisation devrait échouer")
    print("   - La stabulation devrait rester en statut 'EN_COURS'")
    
    print("\n2️⃣  Test avec numéros post abattage uniques:")
    print("   - Utiliser des numéros comme 'POST_NEW_001', 'POST_NEW_002', etc.")
    print("   - La finalisation devrait réussir")
    print("   - La stabulation devrait passer au statut 'TERMINE'")
    print("   - Les bêtes devraient passer au statut 'ABATTU'")
    
    print("\n3️⃣  Test avec mélange de numéros:")
    print("   - Certains numéros existants, d'autres uniques")
    print("   - La finalisation devrait échouer")
    print("   - Seuls les numéros uniques devraient être acceptés")
    
    print("\n📋 Numéros post abattage existants créés:")
    existing_betes = Bete.objects.filter(num_boucle__startswith='EXISTING_')
    for bete in existing_betes:
        print(f"   - {bete.num_boucle_post_abattage} (bête: {bete.num_boucle})")

def main():
    """Fonction principale"""
    print("🔧 Création des données de test pour la finalisation de stabulation")
    print("=" * 70)
    
    try:
        # Créer les données de base
        abattoir = create_test_abattoir()
        espece_ovin, espece_bovin = create_test_species()
        
        # Créer des bêtes existantes avec numéros post abattage
        existing_betes = create_existing_betes_with_post_numbers(abattoir, espece_ovin, espece_bovin)
        
        # Créer une stabulation de test
        stabulation, betes_stabulation = create_test_stabulation(abattoir, espece_ovin, espece_bovin)
        
        # Créer un utilisateur de test
        user = create_test_user(abattoir)
        
        # Afficher les scénarios de test
        print_test_scenarios()
        
        print("\n" + "=" * 70)
        print("✅ DONNÉES DE TEST CRÉÉES AVEC SUCCÈS!")
        print("=" * 70)
        print(f"Abattoir ID: {abattoir.id}")
        print(f"Stabulation ID: {stabulation.id}")
        print(f"Utilisateur: {user.username}")
        print(f"Bêtes existantes: {len(existing_betes)}")
        print(f"Bêtes en stabulation: {len(betes_stabulation)}")
        
        print("\n🚀 Vous pouvez maintenant tester la finalisation de stabulation!")
        print("   - Utilisez l'interface web pour finaliser la stabulation")
        print("   - Testez avec des numéros post abattage existants et uniques")
        print("   - Vérifiez que les contraintes fonctionnent correctement")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Erreur lors de la création des données: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ Données de test créées avec succès!")
        sys.exit(0)
    else:
        print("\n❌ Erreur lors de la création des données de test!")
        sys.exit(1)
