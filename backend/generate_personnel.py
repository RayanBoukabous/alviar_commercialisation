#!/usr/bin/env python
"""
Script pour générer du personnel pour tous les abattoirs
- Entre 15 et 70 employés par abattoir
- Chaque abattoir doit avoir un responsable avec toutes les informations
"""

import os
import sys
import django
import random
from datetime import datetime, date, timedelta

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alviar.settings')
django.setup()

from django.contrib.auth import get_user_model
from abattoir.models import Abattoir
from personnel.models import Role, Personnel

User = get_user_model()

# Données pour générer des noms et informations
PRENOMS = [
    'Ahmed', 'Mohamed', 'Ali', 'Omar', 'Youssef', 'Karim', 'Said', 'Hassan',
    'Fatima', 'Aicha', 'Khadija', 'Zineb', 'Naima', 'Samira', 'Latifa', 'Malika',
    'Rayan', 'Yanis', 'Adam', 'Ibrahim', 'Amine', 'Bilal', 'Tarek', 'Nassim',
    'Salma', 'Ines', 'Lina', 'Nour', 'Yasmine', 'Hiba', 'Dina', 'Rania'
]

NOMS = [
    'Boukabous', 'Benali', 'Khelil', 'Mansouri', 'Boumediene', 'Taleb', 'Cherif',
    'Boukhari', 'Saadi', 'Bouaziz', 'Kadri', 'Bouhali', 'Bouchene', 'Boukhari',
    'Bouazza', 'Boukhari', 'Bouaziz', 'Bouhali', 'Bouchene', 'Boukhari', 'Bouazza'
]

VILLES = [
    'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 'Setif',
    'Sidi Bel Abbes', 'Biskra', 'Tebessa', 'El Oued', 'Skikda', 'Tiaret', 'Bejaia',
    'Tlemcen', 'Bordj Bou Arreridj', 'Bechar', 'Mostaganem', 'M\'Sila'
]

WILAYAS = [
    'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 'Setif',
    'Sidi Bel Abbes', 'Biskra', 'Tebessa', 'El Oued', 'Skikda', 'Tiaret', 'Bejaia',
    'Tlemcen', 'Bordj Bou Arreridj', 'Bechar', 'Mostaganem', 'M\'Sila'
]

def fake_first_name():
    return random.choice(PRENOMS)

def fake_last_name():
    return random.choice(NOMS)

def fake_city():
    return random.choice(VILLES)

def fake_phone_number():
    return f"0{random.randint(5, 7)}{random.randint(10000000, 99999999)}"

def fake_email(first_name, last_name):
    domains = ['gmail.com', 'yahoo.fr', 'hotmail.com', 'outlook.com']
    return f"{first_name.lower()}.{last_name.lower()}@{random.choice(domains)}"

def fake_street_address():
    streets = ['Rue de la Paix', 'Avenue des Martyrs', 'Boulevard de la République', 
               'Rue du Commerce', 'Avenue de l\'Indépendance', 'Rue de la Liberté']
    return f"{random.randint(1, 200)} {random.choice(streets)}"

def fake_date_of_birth(min_age=18, max_age=65):
    today = date.today()
    start_date = today.replace(year=today.year - max_age)
    end_date = today.replace(year=today.year - min_age)
    time_between = end_date - start_date
    days_between = time_between.days
    random_days = random.randint(0, days_between)
    return start_date + timedelta(days=random_days)

def fake_date_between(start_date, end_date):
    time_between = end_date - start_date
    days_between = time_between.days
    random_days = random.randint(0, days_between)
    return start_date + timedelta(days=random_days)

def generate_personnel_for_abattoir(abattoir, num_employees):
    """Génère du personnel pour un abattoir donné"""
    print(f"\n🏭 Génération du personnel pour l'abattoir: {abattoir.nom}")
    
    # Récupérer les rôles disponibles
    roles = list(Role.objects.all())
    if not roles:
        print("❌ Aucun rôle trouvé. Création des rôles de base...")
        create_default_roles()
        roles = list(Role.objects.all())
    
    # Trouver le rôle responsable
    responsable_role = Role.objects.filter(nom='RESPONSABLE_ABATTOIR').first()
    if not responsable_role:
        print("❌ Rôle RESPONSABLE_ABATTOIR non trouvé")
        return
    
    # Vérifier si l'abattoir a déjà un responsable
    existing_responsable = Personnel.objects.filter(
        abattoir=abattoir, 
        role=responsable_role,
        statut='ACTIF'
    ).first()
    
    personnel_created = []
    
    # 1. Créer le responsable s'il n'existe pas
    if not existing_responsable:
        print(f"👤 Création du responsable pour {abattoir.nom}")
        responsable = create_responsable(abattoir, responsable_role)
        if responsable:
            personnel_created.append(responsable)
            print(f"✅ Responsable créé: {responsable.prenom} {responsable.nom}")
    else:
        print(f"ℹ️  Responsable existant: {existing_responsable.prenom} {existing_responsable.nom}")
        personnel_created.append(existing_responsable)
    
    # 2. Créer les autres employés
    remaining_employees = num_employees - 1  # -1 pour le responsable
    print(f"👥 Création de {remaining_employees} employés supplémentaires...")
    
    for i in range(remaining_employees):
        # Choisir un rôle aléatoire (sauf responsable)
        other_roles = [role for role in roles if role.nom != 'RESPONSABLE_ABATTOIR']
        if not other_roles:
            other_roles = roles  # Fallback si pas d'autres rôles
        
        role = random.choice(other_roles)
        employee = create_employee(abattoir, role, i + 2)  # +2 car responsable = 1
        if employee:
            personnel_created.append(employee)
    
    print(f"✅ {len(personnel_created)} employés créés pour {abattoir.nom}")
    return personnel_created

def create_responsable(abattoir, role):
    """Crée un responsable avec toutes les informations"""
    try:
        # Générer des données complètes
        prenom = fake_first_name()
        nom = fake_last_name()
        date_naissance = fake_date_of_birth(min_age=30, max_age=60)
        
        # Créer le responsable
        responsable = Personnel.objects.create(
            nom=nom,
            prenom=prenom,
            date_naissance=date_naissance,
            lieu_naissance=fake_city(),
            sexe=random.choice(['M', 'F']),
            nationalite='Algérienne',
            numero_carte_identite=f"{random.randint(1000000000, 9999999999)}",
            date_emission_carte=fake_date_between(
                start_date=date.today() - timedelta(days=365*10), 
                end_date=date.today()
            ),
            lieu_emission_carte=fake_city(),
            telephone=fake_phone_number(),
            telephone_urgence=fake_phone_number(),
            email=fake_email(prenom, nom),
            adresse=fake_street_address(),
            wilaya=abattoir.wilaya,
            commune=abattoir.commune,
            abattoir=abattoir,
            role=role,
            numero_employe=f"EMP{str(abattoir.id).zfill(3)}0001",  # Premier employé
            date_embauche=fake_date_between(
                start_date=date.today() - timedelta(days=365*5), 
                end_date=date.today() - timedelta(days=365)
            ),
            statut='ACTIF',
            notes=f"Responsable de l'abattoir {abattoir.nom} depuis {fake_date_between(start_date=date.today() - timedelta(days=365*5), end_date=date.today() - timedelta(days=365)).year}",
            competences=[
                "Gestion d'équipe",
                "Planification de production",
                "Contrôle qualité",
                "Gestion administrative",
                "Sécurité au travail"
            ],
            formations=[
                "Formation HACCP",
                "Gestion d'abattoir",
                "Sécurité alimentaire",
                "Management d'équipe"
            ]
        )
        
        return responsable
        
    except Exception as e:
        print(f"❌ Erreur lors de la création du responsable: {e}")
        return None

def create_employee(abattoir, role, employee_number):
    """Crée un employé avec des informations complètes"""
    try:
        # Générer des données
        prenom = fake_first_name()
        nom = fake_last_name()
        date_naissance = fake_date_of_birth(min_age=18, max_age=65)
        
        # Créer l'employé
        employee = Personnel.objects.create(
            nom=nom,
            prenom=prenom,
            date_naissance=date_naissance,
            lieu_naissance=fake_city(),
            sexe=random.choice(['M', 'F']),
            nationalite='Algérienne',
            numero_carte_identite=f"{random.randint(1000000000, 9999999999)}",
            date_emission_carte=fake_date_between(
                start_date=date.today() - timedelta(days=365*10), 
                end_date=date.today()
            ),
            lieu_emission_carte=fake_city(),
            telephone=fake_phone_number(),
            telephone_urgence=fake_phone_number(),
            email=fake_email(prenom, nom),
            adresse=fake_street_address(),
            wilaya=abattoir.wilaya,
            commune=abattoir.commune,
            abattoir=abattoir,
            role=role,
            numero_employe=f"EMP{str(abattoir.id).zfill(3)}{str(employee_number).zfill(4)}",
            date_embauche=fake_date_between(
                start_date=date.today() - timedelta(days=365*3), 
                end_date=date.today()
            ),
            statut=random.choice(['ACTIF', 'ACTIF', 'ACTIF', 'CONGE']),  # 75% actif, 25% congé
            notes=f"Employé {role.get_nom_display()} à l'abattoir {abattoir.nom}",
            competences=generate_competences_for_role(role),
            formations=generate_formations_for_role(role)
        )
        
        return employee
        
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'employé: {e}")
        return None

def generate_competences_for_role(role):
    """Génère des compétences selon le rôle"""
    competences_base = {
        'RESPONSABLE_ABATTOIR': [
            "Gestion d'équipe",
            "Planification de production",
            "Contrôle qualité",
            "Gestion administrative"
        ],
        'BOUCHER': [
            "Découpe de viande",
            "Hygiène alimentaire",
            "Utilisation d'outils",
            "Contrôle qualité"
        ],
        'VETERINAIRE': [
            "Inspection sanitaire",
            "Diagnostic vétérinaire",
            "Contrôle qualité",
            "Réglementation sanitaire"
        ],
        'TECHNICIEN': [
            "Maintenance d'équipements",
            "Réparation mécanique",
            "Électricité",
            "Sécurité au travail"
        ],
        'EMPLOYE_GENERAL': [
            "Nettoyage",
            "Manutention",
            "Hygiène",
            "Travail d'équipe"
        ]
    }
    
    return competences_base.get(role.nom, [
        "Travail d'équipe",
        "Hygiène",
        "Sécurité au travail"
    ])

def generate_formations_for_role(role):
    """Génère des formations selon le rôle"""
    formations_base = {
        'RESPONSABLE_ABATTOIR': [
            "Formation HACCP",
            "Gestion d'abattoir",
            "Management d'équipe",
            "Sécurité alimentaire"
        ],
        'BOUCHER': [
            "Formation découpe",
            "Hygiène alimentaire",
            "Sécurité au travail"
        ],
        'VETERINAIRE': [
            "Formation vétérinaire",
            "Inspection sanitaire",
            "Réglementation"
        ],
        'TECHNICIEN': [
            "Formation technique",
            "Sécurité au travail",
            "Maintenance préventive"
        ],
        'EMPLOYE_GENERAL': [
            "Hygiène et sécurité",
            "Travail d'équipe"
        ]
    }
    
    return formations_base.get(role.nom, [
        "Formation de base",
        "Hygiène et sécurité"
    ])

def create_default_roles():
    """Crée les rôles par défaut s'ils n'existent pas"""
    roles_data = [
        ('RESPONSABLE_ABATTOIR', 'Responsable de l\'abattoir'),
        ('BOUCHER', 'Boucher'),
        ('VETERINAIRE', 'Vétérinaire'),
        ('TECHNICIEN', 'Technicien'),
        ('EMPLOYE_GENERAL', 'Employé général'),
        ('SECURITE', 'Agent de sécurité'),
        ('NETTOYAGE', 'Agent de nettoyage'),
        ('MANUTENTION', 'Agent de manutention')
    ]
    
    for code, nom in roles_data:
        role, created = Role.objects.get_or_create(
            nom=code,
            defaults={'description': f'Rôle de {nom.lower()}'}
        )
        if created:
            print(f"✅ Rôle créé: {nom}")

def main():
    """Fonction principale"""
    print("🚀 Début de la génération du personnel pour tous les abattoirs")
    
    # Récupérer tous les abattoirs
    abattoirs = Abattoir.objects.all()
    if not abattoirs.exists():
        print("❌ Aucun abattoir trouvé dans la base de données")
        return
    
    print(f"📊 {abattoirs.count()} abattoirs trouvés")
    
    total_personnel_created = 0
    
    for abattoir in abattoirs:
        # Générer un nombre aléatoire d'employés entre 15 et 70
        num_employees = random.randint(15, 70)
        print(f"\n🏭 Abattoir: {abattoir.nom} - {num_employees} employés à créer")
        
        # Vérifier le personnel existant
        existing_count = Personnel.objects.filter(abattoir=abattoir).count()
        if existing_count > 0:
            print(f"ℹ️  {existing_count} employés existants trouvés")
            # Supprimer le personnel existant pour recommencer proprement
            Personnel.objects.filter(abattoir=abattoir).delete()
            print(f"🗑️  Personnel existant supprimé")
        
        # Générer le nouveau personnel
        personnel_created = generate_personnel_for_abattoir(abattoir, num_employees)
        if personnel_created:
            total_personnel_created += len(personnel_created)
    
    print(f"\n🎉 Génération terminée!")
    print(f"📊 Total: {total_personnel_created} employés créés")
    
    # Statistiques finales
    print(f"\n📈 Statistiques finales:")
    for abattoir in abattoirs:
        count = Personnel.objects.filter(abattoir=abattoir).count()
        responsable = Personnel.objects.filter(
            abattoir=abattoir, 
            role__nom='RESPONSABLE_ABATTOIR'
        ).first()
        responsable_name = f"{responsable.prenom} {responsable.nom}" if responsable else "Non assigné"
        print(f"  • {abattoir.nom}: {count} employés - Responsable: {responsable_name}")

if __name__ == '__main__':
    main()
