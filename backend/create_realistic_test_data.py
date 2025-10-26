#!/usr/bin/env python3
"""
Script pour créer des données de test réalistes
- 2 espèces : BOVIN et OVIN
- 5 abattoirs
- 100-120 bêtes de chaque type dans chaque abattoir
"""

import os
import sys
import django
from django.conf import settings

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings_sqlite')
django.setup()

from django.contrib.auth import get_user_model
from abattoir.models import Abattoir
from bete.models import Bete, Espece
from users.models import User
import random
from datetime import datetime, timedelta

User = get_user_model()

def create_especes():
    """Créer les espèces BOVIN et OVIN"""
    print("🐄 Création des espèces...")
    
    especes_data = [
        {'nom': 'BOVIN', 'description': 'Bovins (vaches, taureaux, génisses)'},
        {'nom': 'OVIN', 'description': 'Ovins (moutons, brebis, agneaux)'}
    ]
    
    especes = []
    for data in especes_data:
        espece, created = Espece.objects.get_or_create(
            nom=data['nom'],
            defaults={'description': data['description']}
        )
        especes.append(espece)
        if created:
            print(f"✅ Espèce {espece.nom} créée")
        else:
            print(f"ℹ️  Espèce {espece.nom} existe déjà")
    
    return especes

def create_abattoirs():
    """Créer 5 abattoirs réalistes"""
    print("🏭 Création des abattoirs...")
    
    abattoirs_data = [
        {
            'nom': 'Abattoir de Blida',
            'wilaya': 'Blida',
            'commune': 'Blida',
            'telephone': '025-123456',
            'email': 'contact@abattoir-blida.dz',
            'capacite_reception_ovin': 200,
            'capacite_reception_bovin': 100,
            'capacite_stabulation_ovin': 300,
            'capacite_stabulation_bovin': 150
        },
        {
            'nom': 'Abattoir d\'Alger',
            'wilaya': 'Alger',
            'commune': 'Alger Centre',
            'telephone': '021-789012',
            'email': 'info@abattoir-alger.dz',
            'capacite_reception_ovin': 250,
            'capacite_reception_bovin': 120,
            'capacite_stabulation_ovin': 400,
            'capacite_stabulation_bovin': 200
        },
        {
            'nom': 'Abattoir d\'Oran',
            'wilaya': 'Oran',
            'commune': 'Oran',
            'telephone': '041-345678',
            'email': 'contact@abattoir-oran.dz',
            'capacite_reception_ovin': 180,
            'capacite_reception_bovin': 90,
            'capacite_stabulation_ovin': 250,
            'capacite_stabulation_bovin': 120
        },
        {
            'nom': 'Abattoir de Constantine',
            'wilaya': 'Constantine',
            'commune': 'Constantine',
            'telephone': '031-567890',
            'email': 'info@abattoir-constantine.dz',
            'capacite_reception_ovin': 220,
            'capacite_reception_bovin': 110,
            'capacite_stabulation_ovin': 350,
            'capacite_stabulation_bovin': 180
        },
        {
            'nom': 'Abattoir de Tlemcen',
            'wilaya': 'Tlemcen',
            'commune': 'Tlemcen',
            'telephone': '043-901234',
            'email': 'contact@abattoir-tlemcen.dz',
            'capacite_reception_ovin': 160,
            'capacite_reception_bovin': 80,
            'capacite_stabulation_ovin': 200,
            'capacite_stabulation_bovin': 100
        }
    ]
    
    abattoirs = []
    for data in abattoirs_data:
        abattoir, created = Abattoir.objects.get_or_create(
            nom=data['nom'],
            defaults={
                'wilaya': data['wilaya'],
                'commune': data['commune'],
                'telephone': data['telephone'],
                'email': data['email'],
                'capacite_reception_ovin': data['capacite_reception_ovin'],
                'capacite_reception_bovin': data['capacite_reception_bovin'],
                'capacite_stabulation_ovin': data['capacite_stabulation_ovin'],
                'capacite_stabulation_bovin': data['capacite_stabulation_bovin'],
                'actif': True
            }
        )
        abattoirs.append(abattoir)
        if created:
            print(f"✅ Abattoir {abattoir.nom} créé")
        else:
            print(f"ℹ️  Abattoir {abattoir.nom} existe déjà")
    
    return abattoirs

def create_betes(abattoirs, especes):
    """Créer 100-120 bêtes de chaque type dans chaque abattoir"""
    print("🐄🐑 Création des bêtes...")
    
    # Récupérer l'utilisateur admin
    try:
        admin_user = User.objects.get(username='admin')
    except User.DoesNotExist:
        print("❌ Utilisateur admin non trouvé")
        return
    
    total_betes = 0
    
    for abattoir in abattoirs:
        print(f"\n📊 Création des bêtes pour {abattoir.nom}:")
        
        for espece in especes:
            # Nombre aléatoire entre 100 et 120
            nombre_betes = random.randint(100, 120)
            
            print(f"  - {espece.nom}: {nombre_betes} bêtes")
            
            for i in range(nombre_betes):
                # Générer des données réalistes
                poids = random.uniform(200, 800) if espece.nom == 'BOVIN' else random.uniform(30, 80)
                age_mois = random.randint(6, 60)
                
                # Date d'arrivée aléatoire dans les 30 derniers jours
                date_arrivee = datetime.now() - timedelta(days=random.randint(0, 30))
                
                # Statut aléatoire
                statuts = ['VIVANT', 'EN_STABULATION', 'ABATTU']
                statut = random.choice(statuts)
                
                # Créer la bête
                bete = Bete.objects.create(
                    num_boucle=f"{espece.nom[:3]}{abattoir.id:02d}{i+1:04d}",
                    num_boucle_post_abattage=f"PA{espece.nom[:3]}{abattoir.id:02d}{i+1:04d}",
                    espece=espece,
                    sexe=random.choice(['M', 'F']),
                    poids_vif=poids,
                    statut=statut,
                    etat_sante=random.choice(['BON', 'MALADE']),
                    abattage_urgence=random.choice([True, False]),
                    abattoir=abattoir,
                    created_by=admin_user
                )
                
                total_betes += 1
    
    print(f"\n🎉 Total de {total_betes} bêtes créées !")

def main():
    """Fonction principale"""
    print("🚀 Création des données de test réalistes...")
    print("=" * 50)
    
    # Créer les espèces
    especes = create_especes()
    
    # Créer les abattoirs
    abattoirs = create_abattoirs()
    
    # Créer les bêtes
    create_betes(abattoirs, especes)
    
    print("\n" + "=" * 50)
    print("✅ Données de test créées avec succès !")
    print(f"📊 Résumé:")
    print(f"   - {len(especes)} espèces")
    print(f"   - {len(abattoirs)} abattoirs")
    print(f"   - ~{len(abattoirs) * len(especes) * 110} bêtes au total")

if __name__ == '__main__':
    main()
