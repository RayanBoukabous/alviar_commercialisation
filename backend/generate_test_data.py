#!/usr/bin/env python
"""
Script de génération de données de test pour le système de transfert
"""

import os
import sys
import django
from django.db import transaction
from decimal import Decimal
import random

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from abattoir.models import Abattoir
from bete.models import Bete, Espece
from users.models import User

def create_species():
    """Créer les espèces"""
    print("🔄 Création des espèces...")
    
    species_data = [
        {'nom': 'Bovin', 'description': 'Espèce bovine'},
        {'nom': 'Ovin', 'description': 'Espèce ovine'},
    ]
    
    created_species = []
    for species_info in species_data:
        species, created = Espece.objects.get_or_create(
            nom=species_info['nom'],
            defaults={'description': species_info['description']}
        )
        if created:
            print(f"✅ Espèce créée: {species.nom}")
        else:
            print(f"ℹ️  Espèce existante: {species.nom}")
        created_species.append(species)
    
    return created_species

def create_abattoirs():
    """Créer les abattoirs"""
    print("\n🔄 Création des abattoirs...")
    
    abattoirs_data = [
        {'nom': 'Abattoir Alger Centre', 'wilaya': 'Alger', 'commune': 'Alger Centre'},
        {'nom': 'Abattoir Oran Est', 'wilaya': 'Oran', 'commune': 'Oran Est'},
        {'nom': 'Abattoir Constantine Nord', 'wilaya': 'Constantine', 'commune': 'Constantine Nord'},
        {'nom': 'Abattoir Annaba Sud', 'wilaya': 'Annaba', 'commune': 'Annaba Sud'},
        {'nom': 'Abattoir Blida Ouest', 'wilaya': 'Blida', 'commune': 'Blida Ouest'},
    ]
    
    created_abattoirs = []
    for abattoir_info in abattoirs_data:
        abattoir, created = Abattoir.objects.get_or_create(
            nom=abattoir_info['nom'],
            defaults={
                'wilaya': abattoir_info['wilaya'],
                'commune': abattoir_info['commune']
            }
        )
        if created:
            print(f"✅ Abattoir créé: {abattoir.nom} - {abattoir.wilaya}")
        else:
            print(f"ℹ️  Abattoir existant: {abattoir.nom}")
        created_abattoirs.append(abattoir)
    
    return created_abattoirs

def generate_boucle_number(abattoir_id, espece_nom, index):
    """Générer un numéro de boucle unique"""
    espece_prefix = 'B' if espece_nom == 'Bovin' else 'O'
    return f"{espece_prefix}{abattoir_id:02d}{index:03d}"

def generate_post_abattage_number(abattoir_id, espece_nom, index):
    """Générer un numéro de boucle post-abattage unique"""
    espece_prefix = 'B' if espece_nom == 'Bovin' else 'O'
    return f"POST{espece_prefix}{abattoir_id:02d}{index:03d}"

def create_betes(abattoirs, species):
    """Créer les bêtes pour chaque abattoir"""
    print("\n🔄 Création des bêtes...")
    
    total_created = 0
    
    for abattoir in abattoirs:
        print(f"\n📦 Création des bêtes pour {abattoir.nom}...")
        
        # Nombre de bêtes par espèce (entre 50 et 60)
        bovin_count = random.randint(50, 60)
        ovin_count = random.randint(50, 60)
        
        # Créer les bêtes bovines
        bovin_species = next(s for s in species if s.nom == 'Bovin')
        for i in range(bovin_count):
            num_boucle = generate_boucle_number(abattoir.id, 'Bovin', i + 1)
            
            # Éviter les doublons
            if Bete.objects.filter(num_boucle=num_boucle).exists():
                continue
            
            bete = Bete.objects.create(
                num_boucle=num_boucle,
                num_boucle_post_abattage=None,  # Vide comme demandé
                espece=bovin_species,
                sexe=random.choice(['M', 'F']),
                poids_vif=Decimal(str(random.randint(400, 800))),  # Poids entre 400 et 800 kg
                poids_a_chaud=None,  # Vide comme demandé
                poids_a_froid=None,  # Vide comme demandé
                statut='VIVANT',  # Toutes vivantes comme demandé
                etat_sante=random.choice(['BON', 'MALADE']),
                abattage_urgence=random.choice([True, False]),
                abattoir=abattoir
            )
            total_created += 1
        
        # Créer les bêtes ovines
        ovin_species = next(s for s in species if s.nom == 'Ovin')
        for i in range(ovin_count):
            num_boucle = generate_boucle_number(abattoir.id, 'Ovin', i + 1)
            
            # Éviter les doublons
            if Bete.objects.filter(num_boucle=num_boucle).exists():
                continue
            
            bete = Bete.objects.create(
                num_boucle=num_boucle,
                num_boucle_post_abattage=None,  # Vide comme demandé
                espece=ovin_species,
                sexe=random.choice(['M', 'F']),
                poids_vif=Decimal(str(random.randint(40, 80))),  # Poids entre 40 et 80 kg
                poids_a_chaud=None,  # Vide comme demandé
                poids_a_froid=None,  # Vide comme demandé
                statut='VIVANT',  # Toutes vivantes comme demandé
                etat_sante=random.choice(['BON', 'MALADE']),
                abattage_urgence=random.choice([True, False]),
                abattoir=abattoir
            )
            total_created += 1
        
        print(f"✅ {bovin_count} bovins et {ovin_count} ovins créés pour {abattoir.nom}")
    
    return total_created

def main():
    """Fonction principale"""
    print("🚀 Début de la génération des données de test...")
    
    try:
        with transaction.atomic():
            # Créer les espèces
            species = create_species()
            
            # Créer les abattoirs
            abattoirs = create_abattoirs()
            
            # Créer les bêtes
            total_betes = create_betes(abattoirs, species)
            
            print(f"\n🎉 Génération terminée avec succès!")
            print(f"📊 Statistiques:")
            print(f"   - Espèces: {len(species)}")
            print(f"   - Abattoirs: {len(abattoirs)}")
            print(f"   - Bêtes créées: {total_betes}")
            
            # Afficher le détail par abattoir
            print(f"\n📋 Détail par abattoir:")
            for abattoir in abattoirs:
                bovin_count = Bete.objects.filter(abattoir=abattoir, espece__nom='Bovin').count()
                ovin_count = Bete.objects.filter(abattoir=abattoir, espece__nom='Ovin').count()
                print(f"   - {abattoir.nom}: {bovin_count} bovins, {ovin_count} ovins")
                
    except Exception as e:
        print(f"❌ Erreur lors de la génération: {e}")
        raise

if __name__ == '__main__':
    main()
