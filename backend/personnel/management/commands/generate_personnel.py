from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from abattoir.models import Abattoir
from personnel.models import Role, Personnel
import random
from datetime import date, timedelta

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

class Command(BaseCommand):
    help = 'Génère du personnel pour tous les abattoirs (15-70 employés par abattoir)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Supprime tout le personnel existant avant de générer',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 Début de la génération du personnel pour tous les abattoirs')
        )
        
        # Récupérer tous les abattoirs
        abattoirs = Abattoir.objects.all()
        if not abattoirs.exists():
            self.stdout.write(
                self.style.ERROR('❌ Aucun abattoir trouvé dans la base de données')
            )
            return
        
        self.stdout.write(f'📊 {abattoirs.count()} abattoirs trouvés')
        
        # Créer les rôles par défaut
        self.create_default_roles()
        
        # Supprimer le personnel existant si demandé
        if options['clear']:
            Personnel.objects.all().delete()
            self.stdout.write(
                self.style.WARNING('🗑️  Tout le personnel existant a été supprimé')
            )
        
        total_personnel_created = 0
        
        for abattoir in abattoirs:
            # Générer un nombre aléatoire d'employés entre 15 et 70
            num_employees = random.randint(15, 70)
            self.stdout.write(f'\n🏭 Abattoir: {abattoir.nom} - {num_employees} employés à créer')
            
            # Vérifier le personnel existant
            existing_count = Personnel.objects.filter(abattoir=abattoir).count()
            if existing_count > 0:
                self.stdout.write(f'ℹ️  {existing_count} employés existants trouvés')
                # Supprimer le personnel existant pour recommencer proprement
                Personnel.objects.filter(abattoir=abattoir).delete()
                self.stdout.write(f'🗑️  Personnel existant supprimé')
            
            # Générer le nouveau personnel
            personnel_created = self.generate_personnel_for_abattoir(abattoir, num_employees)
            if personnel_created:
                total_personnel_created += len(personnel_created)
        
        self.stdout.write(f'\n🎉 Génération terminée!')
        self.stdout.write(f'📊 Total: {total_personnel_created} employés créés')
        
        # Statistiques finales
        self.stdout.write(f'\n📈 Statistiques finales:')
        for abattoir in abattoirs:
            count = Personnel.objects.filter(abattoir=abattoir).count()
            responsable = Personnel.objects.filter(
                abattoir=abattoir, 
                role__nom='RESPONSABLE_ABATTOIR'
            ).first()
            responsable_name = f"{responsable.prenom} {responsable.nom}" if responsable else "Non assigné"
            self.stdout.write(f'  • {abattoir.nom}: {count} employés - Responsable: {responsable_name}')

    def create_default_roles(self):
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
                self.stdout.write(f'✅ Rôle créé: {nom}')

    def generate_personnel_for_abattoir(self, abattoir, num_employees):
        """Génère du personnel pour un abattoir donné"""
        self.stdout.write(f"\n🏭 Génération du personnel pour l'abattoir: {abattoir.nom}")
        
        # Récupérer les rôles disponibles
        roles = list(Role.objects.all())
        
        # Trouver le rôle responsable
        responsable_role = Role.objects.filter(nom='RESPONSABLE_ABATTOIR').first()
        if not responsable_role:
            self.stdout.write(self.style.ERROR("❌ Rôle RESPONSABLE_ABATTOIR non trouvé"))
            return []
        
        # Vérifier si l'abattoir a déjà un responsable
        existing_responsable = Personnel.objects.filter(
            abattoir=abattoir, 
            role=responsable_role,
            statut='ACTIF'
        ).first()
        
        personnel_created = []
        
        # 1. Créer le responsable s'il n'existe pas
        if not existing_responsable:
            self.stdout.write(f"👤 Création du responsable pour {abattoir.nom}")
            responsable = self.create_responsable(abattoir, responsable_role)
            if responsable:
                personnel_created.append(responsable)
                self.stdout.write(f"✅ Responsable créé: {responsable.prenom} {responsable.nom}")
        else:
            self.stdout.write(f"ℹ️  Responsable existant: {existing_responsable.prenom} {existing_responsable.nom}")
            personnel_created.append(existing_responsable)
        
        # 2. Créer les autres employés
        remaining_employees = num_employees - 1  # -1 pour le responsable
        self.stdout.write(f"👥 Création de {remaining_employees} employés supplémentaires...")
        
        for i in range(remaining_employees):
            # Choisir un rôle aléatoire (sauf responsable)
            other_roles = [role for role in roles if role.nom != 'RESPONSABLE_ABATTOIR']
            if not other_roles:
                other_roles = roles  # Fallback si pas d'autres rôles
            
            role = random.choice(other_roles)
            employee = self.create_employee(abattoir, role, i + 2)  # +2 car responsable = 1
            if employee:
                personnel_created.append(employee)
        
        self.stdout.write(f"✅ {len(personnel_created)} employés créés pour {abattoir.nom}")
        return personnel_created

    def create_responsable(self, abattoir, role):
        """Crée un responsable avec toutes les informations"""
        try:
            # Générer des données complètes
            prenom = random.choice(PRENOMS)
            nom = random.choice(NOMS)
            date_naissance = self.fake_date_of_birth(min_age=30, max_age=60)
            
            # Créer le responsable
            responsable = Personnel.objects.create(
                nom=nom,
                prenom=prenom,
                date_naissance=date_naissance,
                lieu_naissance=random.choice(VILLES),
                sexe=random.choice(['M', 'F']),
                nationalite='Algérienne',
                numero_carte_identite=f"{random.randint(1000000000, 9999999999)}",
                date_emission_carte=self.fake_date_between(
                    start_date=date.today() - timedelta(days=365*10), 
                    end_date=date.today()
                ),
                lieu_emission_carte=random.choice(VILLES),
                telephone=self.fake_phone_number(),
                telephone_urgence=self.fake_phone_number(),
                email=self.fake_email(prenom, nom),
                adresse=self.fake_street_address(),
                wilaya=abattoir.wilaya,
                commune=abattoir.commune,
                abattoir=abattoir,
                role=role,
                numero_employe=f"EMP{str(abattoir.id).zfill(3)}0001",  # Premier employé
                date_embauche=self.fake_date_between(
                    start_date=date.today() - timedelta(days=365*5), 
                    end_date=date.today() - timedelta(days=365)
                ),
                statut='ACTIF',
                notes=f"Responsable de l'abattoir {abattoir.nom} depuis {self.fake_date_between(start_date=date.today() - timedelta(days=365*5), end_date=date.today() - timedelta(days=365)).year}",
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
            self.stdout.write(self.style.ERROR(f"❌ Erreur lors de la création du responsable: {e}"))
            return None

    def create_employee(self, abattoir, role, employee_number):
        """Crée un employé avec des informations complètes"""
        try:
            # Générer des données
            prenom = random.choice(PRENOMS)
            nom = random.choice(NOMS)
            date_naissance = self.fake_date_of_birth(min_age=18, max_age=65)
            
            # Créer l'employé
            employee = Personnel.objects.create(
                nom=nom,
                prenom=prenom,
                date_naissance=date_naissance,
                lieu_naissance=random.choice(VILLES),
                sexe=random.choice(['M', 'F']),
                nationalite='Algérienne',
                numero_carte_identite=f"{random.randint(1000000000, 9999999999)}",
                date_emission_carte=self.fake_date_between(
                    start_date=date.today() - timedelta(days=365*10), 
                    end_date=date.today()
                ),
                lieu_emission_carte=random.choice(VILLES),
                telephone=self.fake_phone_number(),
                telephone_urgence=self.fake_phone_number(),
                email=self.fake_email(prenom, nom),
                adresse=self.fake_street_address(),
                wilaya=abattoir.wilaya,
                commune=abattoir.commune,
                abattoir=abattoir,
                role=role,
                numero_employe=f"EMP{str(abattoir.id).zfill(3)}{str(employee_number).zfill(4)}",
                date_embauche=self.fake_date_between(
                    start_date=date.today() - timedelta(days=365*3), 
                    end_date=date.today()
                ),
                statut=random.choice(['ACTIF', 'ACTIF', 'ACTIF', 'CONGE']),  # 75% actif, 25% congé
                notes=f"Employé {role.get_nom_display()} à l'abattoir {abattoir.nom}",
                competences=self.generate_competences_for_role(role),
                formations=self.generate_formations_for_role(role)
            )
            
            return employee
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Erreur lors de la création de l'employé: {e}"))
            return None

    def generate_competences_for_role(self, role):
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

    def generate_formations_for_role(self, role):
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

    def fake_phone_number(self):
        return f"0{random.randint(5, 7)}{random.randint(10000000, 99999999)}"

    def fake_email(self, first_name, last_name):
        domains = ['gmail.com', 'yahoo.fr', 'hotmail.com', 'outlook.com']
        return f"{first_name.lower()}.{last_name.lower()}@{random.choice(domains)}"

    def fake_street_address(self):
        streets = ['Rue de la Paix', 'Avenue des Martyrs', 'Boulevard de la République', 
                   'Rue du Commerce', 'Avenue de l\'Indépendance', 'Rue de la Liberté']
        return f"{random.randint(1, 200)} {random.choice(streets)}"

    def fake_date_of_birth(self, min_age=18, max_age=65):
        today = date.today()
        start_date = today.replace(year=today.year - max_age)
        end_date = today.replace(year=today.year - min_age)
        time_between = end_date - start_date
        days_between = time_between.days
        random_days = random.randint(0, days_between)
        return start_date + timedelta(days=random_days)

    def fake_date_between(self, start_date, end_date):
        time_between = end_date - start_date
        days_between = time_between.days
        random_days = random.randint(0, days_between)
        return start_date + timedelta(days=random_days)





