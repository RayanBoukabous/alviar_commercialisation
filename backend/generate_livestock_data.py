#!/usr/bin/env python
"""
Script pour générer des données de bêtes pour chaque abattoir
Génère entre 1000 et 1500 bêtes par abattoir avec des données réalistes
"""

import os
import sys
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from bete.models import Bete, Espece
from abattoir.models import Abattoir
from client.models import Client

User = get_user_model()

def create_species_if_not_exists():
    """Crée les espèces si elles n'existent pas"""
    species_data = [
        {'nom': 'Bovin', 'description': 'Bovins de boucherie'},
        {'nom': 'Ovin', 'description': 'Moutons et brebis'},
        {'nom': 'Caprin', 'description': 'Chèvres'},
    ]
    
    created_species = []
    for species_info in species_data:
        species, created = Espece.objects.get_or_create(
            nom=species_info['nom'],
            defaults={'description': species_info['description']}
        )
        if created:
            print(f"✅ Espèce créée: {species.nom}")
        created_species.append(species)
    
    return created_species

def create_clients_if_not_exists():
    """Crée quelques clients si ils n'existent pas"""
    clients_data = [
        {'nom': 'Client Général 1', 'type_client': 'PARTICULIER'},
        {'nom': 'Client Général 2', 'type_client': 'RESTAURANT'},
        {'nom': 'Client Général 3', 'type_client': 'SUPERMARCHE'},
    ]
    
    created_clients = []
    for client_info in clients_data:
        client, created = Client.objects.get_or_create(
            nom=client_info['nom'],
            defaults={'type_client': client_info['type_client']}
        )
        if created:
            print(f"✅ Client créé: {client.nom}")
        created_clients.append(client)
    
    return created_clients

def get_or_create_admin_user():
    """Récupère ou crée un utilisateur admin pour les bêtes"""
    try:
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            admin_user = User.objects.create_superuser(
                username='admin_livestock',
                email='admin@livestock.com',
                password='admin123',
                first_name='Admin',
                last_name='Livestock',
                user_type='SUPERVISEUR'
            )
            print("✅ Utilisateur admin créé pour les bêtes")
        return admin_user
    except Exception as e:
        print(f"⚠️ Erreur lors de la création de l'utilisateur admin: {e}")
        return None

def generate_livestock_for_abattoir(abattoir, species_list, clients_list, admin_user):
    """Génère des bêtes pour un abattoir spécifique"""
    # Nombre de bêtes à générer (entre 1000 et 1500)
    num_livestock = random.randint(1000, 1500)
    
    print(f"\n🏭 Génération de {num_livestock} bêtes pour l'abattoir: {abattoir.nom}")
    
    # Statistiques par espèce (distribution réaliste)
    species_distribution = {
        'Bovin': 0.4,  # 40% bovins
        'Ovin': 0.5,   # 50% ovins
        'Caprin': 0.1  # 10% caprins
    }
    
    # Poids moyens par espèce (en kg)
    weight_ranges = {
        'Bovin': {'min': 300, 'max': 800},
        'Ovin': {'min': 30, 'max': 80},
        'Caprin': {'min': 25, 'max': 60}
    }
    
    # Statuts possibles avec probabilités
    status_choices = [
        ('VIVANT', 0.7),    # 70% vivants
        ('ABATTU', 0.2),    # 20% abattus
        ('VENDU', 0.08),    # 8% vendus
        ('MORT', 0.02)      # 2% morts
    ]
    
    # Santé
    health_choices = [('BON', 0.85), ('MALADE', 0.15)]
    
    # Sexe
    sex_choices = [('M', 0.5), ('F', 0.5)]
    
    created_count = 0
    
    for i in range(num_livestock):
        try:
            # Sélectionner l'espèce selon la distribution
            species_choice = random.choices(
                [s.nom for s in species_list],
                weights=[species_distribution.get(s.nom, 0.1) for s in species_list]
            )[0]
            species = next(s for s in species_list if s.nom == species_choice)
            
            # Générer les données de la bête
            sexe = random.choices(['M', 'F'], weights=[0.5, 0.5])[0]
            statut = random.choices(
                ['VIVANT', 'ABATTU', 'VENDU', 'MORT'],
                weights=[0.7, 0.2, 0.08, 0.02]
            )[0]
            etat_sante = random.choices(['BON', 'MALADE'], weights=[0.85, 0.15])[0]
            
            # Générer les numéros de boucle uniques
            num_boucle = f"{abattoir.id:03d}{species.id:02d}{i+1:06d}"
            num_boucle_post = f"PA{abattoir.id:03d}{species.id:02d}{i+1:06d}"
            
            # Générer les poids selon l'espèce
            weight_range = weight_ranges.get(species.nom, {'min': 50, 'max': 200})
            poids_vif = Decimal(str(round(random.uniform(weight_range['min'], weight_range['max']), 2)))
            
            # Poids à chaud et à froid (si abattu)
            poids_a_chaud = None
            poids_a_froid = None
            if statut in ['ABATTU', 'VENDU']:
                # Poids à chaud = 60-65% du poids vif
                poids_a_chaud = Decimal(str(round(float(poids_vif) * random.uniform(0.60, 0.65), 2)))
                # Poids à froid = 95-98% du poids à chaud
                poids_a_froid = Decimal(str(round(float(poids_a_chaud) * random.uniform(0.95, 0.98), 2)))
            
            # Sélectionner un client aléatoire
            client = random.choice(clients_list) if clients_list else None
            
            # Créer la bête
            bete = Bete.objects.create(
                num_boucle=num_boucle,
                num_boucle_post_abattage=num_boucle_post,
                espece=species,
                sexe=sexe,
                poids_vif=poids_vif,
                poids_a_chaud=poids_a_chaud,
                poids_a_froid=poids_a_froid,
                statut=statut,
                etat_sante=etat_sante,
                abattage_urgence=random.choice([True, False]) if etat_sante == 'MALADE' else False,
                abattoir=abattoir,
                client=client,
                notes=f"Bête générée automatiquement pour {abattoir.nom}",
                created_by=admin_user
            )
            
            created_count += 1
            
            # Afficher le progrès tous les 100 bêtes
            if created_count % 100 == 0:
                print(f"  📊 {created_count}/{num_livestock} bêtes créées...")
                
        except Exception as e:
            print(f"❌ Erreur lors de la création de la bête {i+1}: {e}")
            continue
    
    print(f"✅ {created_count} bêtes créées pour {abattoir.nom}")
    return created_count

def main():
    """Fonction principale"""
    print("🚀 Début de la génération des données de bêtes...")
    
    # Vérifier les abattoirs existants
    abattoirs = Abattoir.objects.filter(actif=True)
    if not abattoirs.exists():
        print("❌ Aucun abattoir actif trouvé. Veuillez d'abord créer des abattoirs.")
        return
    
    print(f"📋 {abattoirs.count()} abattoir(s) trouvé(s)")
    
    # Créer les espèces si nécessaire
    species_list = create_species_if_not_exists()
    print(f"📋 {len(species_list)} espèce(s) disponible(s)")
    
    # Créer les clients si nécessaire
    clients_list = create_clients_if_not_exists()
    print(f"📋 {len(clients_list)} client(s) disponible(s)")
    
    # Récupérer ou créer l'utilisateur admin
    admin_user = get_or_create_admin_user()
    if not admin_user:
        print("❌ Impossible de créer/récupérer un utilisateur admin")
        return
    
    # Générer les bêtes pour chaque abattoir
    total_created = 0
    for abattoir in abattoirs:
        try:
            count = generate_livestock_for_abattoir(abattoir, species_list, clients_list, admin_user)
            total_created += count
        except Exception as e:
            print(f"❌ Erreur lors de la génération pour {abattoir.nom}: {e}")
            continue
    
    print(f"\n🎉 Génération terminée!")
    print(f"📊 Total: {total_created} bêtes créées pour {abattoirs.count()} abattoir(s)")
    
    # Afficher les statistiques finales
    print(f"\n📈 Statistiques finales:")
    print(f"   - Total bêtes en base: {Bete.objects.count()}")
    print(f"   - Bêtes vivantes: {Bete.objects.filter(statut='VIVANT').count()}")
    print(f"   - Bêtes abattues: {Bete.objects.filter(statut='ABATTU').count()}")
    print(f"   - Bêtes vendues: {Bete.objects.filter(statut='VENDU').count()}")
    print(f"   - Bêtes mortes: {Bete.objects.filter(statut='MORT').count()}")

if __name__ == '__main__':
    main()
