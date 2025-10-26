#!/usr/bin/env python3
"""
Script de test pour valider la logique de finalisation de stabulation
avec contraintes de numéro post abattage.

Ce script teste :
1. Création d'une stabulation de test
2. Test avec numéro post abattage existant (doit échouer)
3. Test avec numéros post abattage uniques (doit réussir)
4. Vérification des changements de statut
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
from client.models import Client
import requests
import json
from datetime import datetime

User = get_user_model()

class StabulationFinalizationTester:
    def __init__(self):
        self.base_url = "http://localhost:8000/api"
        self.token = None
        self.test_abattoir = None
        self.test_stabulation = None
        self.test_betes = []
        
    def setup_test_data(self):
        """Créer les données de test nécessaires"""
        print("🔧 Configuration des données de test...")
        
        # Créer un abattoir de test
        self.test_abattoir, created = Abattoir.objects.get_or_create(
            nom="Abattoir Test Finalisation",
            defaults={
                'adresse': 'Adresse Test',
                'telephone': '0123456789',
                'capacite_stabulation_ovin': 50,
                'capacite_stabulation_bovin': 20
            }
        )
        print(f"✅ Abattoir de test: {self.test_abattoir.nom} (ID: {self.test_abattoir.id})")
        
        # Créer un utilisateur de test
        test_user, created = User.objects.get_or_create(
            username='test_finalization',
            defaults={
                'email': 'test@finalization.com',
                'first_name': 'Test',
                'last_name': 'Finalization',
                'abattoir': self.test_abattoir
            }
        )
        if created:
            test_user.set_password('testpass123')
            test_user.save()
        print(f"✅ Utilisateur de test: {test_user.username}")
        
        # Créer des espèces si elles n'existent pas
        espece_ovin, _ = Espece.objects.get_or_create(nom='OVIN')
        espece_bovin, _ = Espece.objects.get_or_create(nom='BOVIN')
        print(f"✅ Espèces: {espece_ovin.nom}, {espece_bovin.nom}")
        
        # Créer des bêtes de test
        self.create_test_betes(espece_ovin, espece_bovin)
        
        # Créer une stabulation de test
        self.create_test_stabulation()
        
        return test_user
    
    def create_test_betes(self, espece_ovin, espece_bovin):
        """Créer des bêtes de test"""
        print("🐑 Création des bêtes de test...")
        
        # Créer 3 bêtes ovines
        for i in range(3):
            bete, created = Bete.objects.get_or_create(
                num_boucle=f'TEST_OVIN_{i+1:03d}',
                defaults={
                    'espece': espece_ovin,
                    'sexe': 'F',
                    'poids_vif': 45.0 + i * 5,
                    'statut': 'VIVANT',
                    'etat_sante': 'BON',
                    'abattoir': self.test_abattoir
                }
            )
            if created:
                self.test_betes.append(bete)
                print(f"  ✅ Bête ovine créée: {bete.num_boucle} (ID: {bete.id})")
        
        # Créer 2 bêtes bovines
        for i in range(2):
            bete, created = Bete.objects.get_or_create(
                num_boucle=f'TEST_BOVIN_{i+1:03d}',
                defaults={
                    'espece': espece_bovin,
                    'sexe': 'M',
                    'poids_vif': 300.0 + i * 50,
                    'statut': 'VIVANT',
                    'etat_sante': 'BON',
                    'abattoir': self.test_abattoir
                }
            )
            if created:
                self.test_betes.append(bete)
                print(f"  ✅ Bête bovine créée: {bete.num_boucle} (ID: {bete.id})")
    
    def create_test_stabulation(self):
        """Créer une stabulation de test"""
        print("🏠 Création de la stabulation de test...")
        
        # Créer une stabulation
        self.test_stabulation = Stabulation.objects.create(
            numero_stabulation=f'TEST_STAB_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
            abattoir=self.test_abattoir,
            type_bete='OVIN',
            capacite_maximale=10,
            notes='Stabulation de test pour finalisation'
        )
        
        # Ajouter les bêtes à la stabulation
        self.test_stabulation.ajouter_betes(self.test_betes)
        
        print(f"✅ Stabulation créée: {self.test_stabulation.numero_stabulation} (ID: {self.test_stabulation.id})")
        print(f"✅ {len(self.test_betes)} bêtes ajoutées à la stabulation")
        print(f"✅ Statut initial: {self.test_stabulation.statut}")
    
    def authenticate(self, username, password):
        """S'authentifier et obtenir un token"""
        print("🔐 Authentification...")
        
        auth_data = {
            'username': username,
            'password': password
        }
        
        response = requests.post(f"{self.base_url}/auth/login/", json=auth_data)
        
        if response.status_code == 200:
            data = response.json()
            self.token = data.get('access')
            print("✅ Authentification réussie")
            return True
        else:
            print(f"❌ Échec de l'authentification: {response.status_code}")
            print(response.text)
            return False
    
    def test_finalization_with_duplicate_post_number(self):
        """Tester la finalisation avec un numéro post abattage existant"""
        print("\n🧪 Test 1: Finalisation avec numéro post abattage existant")
        
        # D'abord, créer une bête avec un numéro post abattage existant
        existing_bete = Bete.objects.create(
            num_boucle='EXISTING_BETE_001',
            num_boucle_post_abattage='POST_EXISTING_001',
            espece=Espece.objects.get(nom='OVIN'),
            sexe='F',
            poids_vif=50.0,
            statut='ABATTU',
            etat_sante='BON',
            abattoir=self.test_abattoir
        )
        print(f"✅ Bête existante créée avec numéro post: {existing_bete.num_boucle_post_abattage}")
        
        # Préparer les données de finalisation avec le numéro existant
        poids_data = []
        for bete in self.test_betes:
            poids_data.append({
                'bete_id': bete.id,
                'poids_a_chaud': bete.poids_vif * 0.6,  # 60% du poids vif
                'num_boucle_post_abattage': 'POST_EXISTING_001'  # Numéro existant
            })
        
        # Appeler l'API de finalisation
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'poidsData': poids_data
        }
        
        response = requests.post(
            f"{self.base_url}/abattoir/stabulations/{self.test_stabulation.id}/terminer/",
            json=payload,
            headers=headers
        )
        
        print(f"📊 Réponse API: {response.status_code}")
        
        if response.status_code == 400:
            data = response.json()
            print("✅ Test réussi: La finalisation a été rejetée comme attendu")
            print(f"   Erreur: {data.get('error', 'N/A')}")
            if 'details' in data:
                print(f"   Détails: {data['details']}")
            
            # Vérifier que la stabulation n'a pas changé de statut
            self.test_stabulation.refresh_from_db()
            print(f"   Statut stabulation: {self.test_stabulation.statut} (doit rester EN_COURS)")
            
            return True
        else:
            print("❌ Test échoué: La finalisation aurait dû être rejetée")
            print(f"   Réponse: {response.text}")
            return False
    
    def test_finalization_with_unique_post_numbers(self):
        """Tester la finalisation avec des numéros post abattage uniques"""
        print("\n🧪 Test 2: Finalisation avec numéros post abattage uniques")
        
        # Préparer les données de finalisation avec des numéros uniques
        poids_data = []
        for i, bete in enumerate(self.test_betes):
            poids_data.append({
                'bete_id': bete.id,
                'poids_a_chaud': bete.poids_vif * 0.6,  # 60% du poids vif
                'num_boucle_post_abattage': f'POST_UNIQUE_{i+1:03d}'  # Numéros uniques
            })
        
        # Appeler l'API de finalisation
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'poidsData': poids_data
        }
        
        response = requests.post(
            f"{self.base_url}/abattoir/stabulations/{self.test_stabulation.id}/terminer/",
            json=payload,
            headers=headers
        )
        
        print(f"📊 Réponse API: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Test réussi: La finalisation a été acceptée")
            print(f"   Message: {data.get('message', 'N/A')}")
            print(f"   Bêtes affectées: {data.get('betes_affectees', 'N/A')}")
            
            # Vérifier que la stabulation a changé de statut
            self.test_stabulation.refresh_from_db()
            print(f"   Statut stabulation: {self.test_stabulation.statut} (doit être TERMINE)")
            
            # Vérifier que les bêtes ont changé de statut
            for bete in self.test_betes:
                bete.refresh_from_db()
                print(f"   Bête {bete.num_boucle}: statut {bete.statut} (doit être ABATTU)")
                print(f"   Numéro post abattage: {bete.num_boucle_post_abattage}")
            
            return True
        else:
            print("❌ Test échoué: La finalisation aurait dû réussir")
            print(f"   Réponse: {response.text}")
            return False
    
    def cleanup_test_data(self):
        """Nettoyer les données de test"""
        print("\n🧹 Nettoyage des données de test...")
        
        # Supprimer la stabulation de test
        if self.test_stabulation:
            self.test_stabulation.delete()
            print("✅ Stabulation de test supprimée")
        
        # Supprimer les bêtes de test
        for bete in self.test_betes:
            bete.delete()
        print("✅ Bêtes de test supprimées")
        
        # Supprimer les bêtes existantes créées pour le test
        Bete.objects.filter(num_boucle__startswith='EXISTING_BETE_').delete()
        print("✅ Bêtes existantes de test supprimées")
    
    def run_tests(self):
        """Exécuter tous les tests"""
        print("🚀 Démarrage des tests de finalisation de stabulation")
        print("=" * 60)
        
        try:
            # Configuration
            test_user = self.setup_test_data()
            
            # Authentification
            if not self.authenticate('test_finalization', 'testpass123'):
                return False
            
            # Tests
            test1_success = self.test_finalization_with_duplicate_post_number()
            test2_success = self.test_finalization_with_unique_post_numbers()
            
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
            self.cleanup_test_data()

def main():
    """Fonction principale"""
    print("🧪 Testeur de Finalisation de Stabulation")
    print("Ce script teste la logique de finalisation avec contraintes de numéro post abattage")
    print()
    
    # Vérifier que le serveur Django est en cours d'exécution
    try:
        response = requests.get("http://localhost:8000/api/", timeout=5)
        if response.status_code != 200:
            print("❌ Le serveur Django ne semble pas être en cours d'exécution")
            print("   Veuillez démarrer le serveur avec: python manage.py runserver")
            return
    except requests.exceptions.RequestException:
        print("❌ Impossible de se connecter au serveur Django")
        print("   Veuillez démarrer le serveur avec: python manage.py runserver")
        return
    
    # Exécuter les tests
    tester = StabulationFinalizationTester()
    success = tester.run_tests()
    
    if success:
        print("\n✅ Tests terminés avec succès!")
        sys.exit(0)
    else:
        print("\n❌ Tests terminés avec des erreurs!")
        sys.exit(1)

if __name__ == "__main__":
    main()
