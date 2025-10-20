"""
Commande Django pour générer des données de bêtes
Usage: python manage.py generate_livestock --count 1200 --abattoir-id 1
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from bete.models import Bete, Espece
from abattoir.models import Abattoir
from client.models import Client
import random
from decimal import Decimal

User = get_user_model()

class Command(BaseCommand):
    help = 'Génère des données de bêtes pour les abattoirs'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=1200,
            help='Nombre de bêtes à générer par abattoir (défaut: 1200)'
        )
        parser.add_argument(
            '--abattoir-id',
            type=int,
            help='ID de l\'abattoir spécifique (optionnel)'
        )
        parser.add_argument(
            '--min-count',
            type=int,
            default=1000,
            help='Nombre minimum de bêtes par abattoir (défaut: 1000)'
        )
        parser.add_argument(
            '--max-count',
            type=int,
            default=1500,
            help='Nombre maximum de bêtes par abattoir (défaut: 1500)'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Forcer la génération même si des bêtes existent déjà'
        )

    def handle(self, *args, **options):
        count = options['count']
        abattoir_id = options.get('abattoir_id')
        min_count = options['min_count']
        max_count = options['max_count']
        force = options['force']

        self.stdout.write(
            self.style.SUCCESS('🚀 Début de la génération des données de bêtes...')
        )

        # Vérifier les abattoirs
        if abattoir_id:
            try:
                abattoirs = [Abattoir.objects.get(id=abattoir_id, actif=True)]
            except Abattoir.DoesNotExist:
                raise CommandError(f'Abattoir avec ID {abattoir_id} non trouvé ou inactif')
        else:
            abattoirs = Abattoir.objects.filter(actif=True)
            if not abattoirs.exists():
                raise CommandError('Aucun abattoir actif trouvé')

        self.stdout.write(f'📋 {len(abattoirs)} abattoir(s) trouvé(s)')

        # Vérifier si des bêtes existent déjà
        if not force and Bete.objects.exists():
            self.stdout.write(
                self.style.WARNING('⚠️ Des bêtes existent déjà dans la base de données.')
            )
            response = input('Voulez-vous continuer? (y/N): ')
            if response.lower() != 'y':
                self.stdout.write('❌ Génération annulée')
                return

        # Créer les espèces si nécessaire
        species_list = self.create_species_if_not_exists()
        self.stdout.write(f'📋 {len(species_list)} espèce(s) disponible(s)')

        # Créer les clients si nécessaire
        clients_list = self.create_clients_if_not_exists()
        self.stdout.write(f'📋 {len(clients_list)} client(s) disponible(s)')

        # Récupérer l'utilisateur admin
        admin_user = self.get_or_create_admin_user()
        if not admin_user:
            raise CommandError('Impossible de créer/récupérer un utilisateur admin')

        # Générer les bêtes
        total_created = 0
        for abattoir in abattoirs:
            try:
                # Utiliser count fixe ou aléatoire selon les options
                if count:
                    num_livestock = count
                else:
                    num_livestock = random.randint(min_count, max_count)

                created_count = self.generate_livestock_for_abattoir(
                    abattoir, species_list, clients_list, admin_user, num_livestock
                )
                total_created += created_count
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ Erreur pour {abattoir.nom}: {e}')
                )
                continue

        self.stdout.write(
            self.style.SUCCESS(f'\n🎉 Génération terminée!')
        )
        self.stdout.write(f'📊 Total: {total_created} bêtes créées pour {len(abattoirs)} abattoir(s)')

        # Statistiques finales
        self.show_final_statistics()

    def create_species_if_not_exists(self):
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
                self.stdout.write(f'✅ Espèce créée: {species.nom}')
            created_species.append(species)
        
        return created_species

    def create_clients_if_not_exists(self):
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
                self.stdout.write(f'✅ Client créé: {client.nom}')
            created_clients.append(client)
        
        return created_clients

    def get_or_create_admin_user(self):
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
                self.stdout.write('✅ Utilisateur admin créé pour les bêtes')
            return admin_user
        except Exception as e:
            self.stdout.write(f'⚠️ Erreur lors de la création de l\'utilisateur admin: {e}')
            return None

    def generate_livestock_for_abattoir(self, abattoir, species_list, clients_list, admin_user, num_livestock):
        """Génère des bêtes pour un abattoir spécifique"""
        self.stdout.write(f'\n🏭 Génération de {num_livestock} bêtes pour: {abattoir.nom}')
        
        # Distribution par espèce
        species_distribution = {
            'Bovin': 0.4,
            'Ovin': 0.5,
            'Caprin': 0.1
        }
        
        # Poids moyens par espèce
        weight_ranges = {
            'Bovin': {'min': 300, 'max': 800},
            'Ovin': {'min': 30, 'max': 80},
            'Caprin': {'min': 25, 'max': 60}
        }
        
        created_count = 0
        
        for i in range(num_livestock):
            try:
                # Sélectionner l'espèce
                species_choice = random.choices(
                    [s.nom for s in species_list],
                    weights=[species_distribution.get(s.nom, 0.1) for s in species_list]
                )[0]
                species = next(s for s in species_list if s.nom == species_choice)
                
                # Générer les données
                sexe = random.choice(['M', 'F'])
                statut = random.choices(
                    ['VIVANT', 'ABATTU', 'VENDU', 'MORT'],
                    weights=[0.7, 0.2, 0.08, 0.02]
                )[0]
                etat_sante = random.choices(['BON', 'MALADE'], weights=[0.85, 0.15])[0]
                
                # Numéros de boucle
                num_boucle = f"{abattoir.id:03d}{species.id:02d}{i+1:06d}"
                num_boucle_post = f"PA{abattoir.id:03d}{species.id:02d}{i+1:06d}"
                
                # Poids
                weight_range = weight_ranges.get(species.nom, {'min': 50, 'max': 200})
                poids_vif = Decimal(str(round(random.uniform(weight_range['min'], weight_range['max']), 2)))
                
                poids_a_chaud = None
                poids_a_froid = None
                if statut in ['ABATTU', 'VENDU']:
                    poids_a_chaud = Decimal(str(round(float(poids_vif) * random.uniform(0.60, 0.65), 2)))
                    poids_a_froid = Decimal(str(round(float(poids_a_chaud) * random.uniform(0.95, 0.98), 2)))
                
                client = random.choice(clients_list) if clients_list else None
                
                # Créer la bête
                Bete.objects.create(
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
                
                if created_count % 100 == 0:
                    self.stdout.write(f'  📊 {created_count}/{num_livestock} bêtes créées...')
                    
            except Exception as e:
                self.stdout.write(f'❌ Erreur bête {i+1}: {e}')
                continue
        
        self.stdout.write(f'✅ {created_count} bêtes créées pour {abattoir.nom}')
        return created_count

    def show_final_statistics(self):
        """Affiche les statistiques finales"""
        self.stdout.write(f'\n📈 Statistiques finales:')
        self.stdout.write(f'   - Total bêtes en base: {Bete.objects.count()}')
        self.stdout.write(f'   - Bêtes vivantes: {Bete.objects.filter(statut="VIVANT").count()}')
        self.stdout.write(f'   - Bêtes abattues: {Bete.objects.filter(statut="ABATTU").count()}')
        self.stdout.write(f'   - Bêtes vendues: {Bete.objects.filter(statut="VENDU").count()}')
        self.stdout.write(f'   - Bêtes mortes: {Bete.objects.filter(statut="MORT").count()}')
