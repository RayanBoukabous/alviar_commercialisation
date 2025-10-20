#!/usr/bin/env python3
"""
Script pour créer des données de bétail pour chaque abattoir
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

from bete.models import Bete, Espece
from abattoir.models import Abattoir
from users.models import User
from client.models import Client

def create_livestock_data():
    """Créer des données de bétail pour chaque abattoir"""
    
    print("🐄 Création des données de bétail...")
    
    # Récupérer tous les abattoirs
    abattoirs = Abattoir.objects.all()
    if not abattoirs.exists():
        print("❌ Aucun abattoir trouvé. Créez d'abord des abattoirs.")
        return
    
    # Récupérer les espèces
    especes = Espece.objects.all()
    if not especes.exists():
        print("❌ Aucune espèce trouvée. Créez d'abord des espèces.")
        return
    
    # Récupérer les clients
    clients = Client.objects.all()
    if not clients.exists():
        print("❌ Aucun client trouvé. Créez d'abord des clients.")
        return
    
    # Récupérer un utilisateur pour created_by
    user = User.objects.first()
    if not user:
        print("❌ Aucun utilisateur trouvé. Créez d'abord un utilisateur.")
        return
    
    # Statistiques
    total_created = 0
    
    for abattoir in abattoirs:
        print(f"\n🏭 Traitement de l'abattoir: {abattoir.nom}")
        
        # Nombre de bêtes à créer pour cet abattoir (entre 1000 et 1500)
        num_betes = random.randint(1000, 1500)
        print(f"   📊 Création de {num_betes} bêtes...")
        
        # Créer les bêtes pour cet abattoir
        betes_to_create = []
        
        for i in range(num_betes):
            # Générer un numéro de boucle unique
            num_boucle = f"DZ-{abattoir.wilaya[:3].upper()}-{datetime.now().year}-{abattoir.id}-{str(i+1).zfill(6)}"
            
            # Générer un numéro de boucle post-abattage unique
            num_boucle_post_abattage = f"POST-{abattoir.wilaya[:3].upper()}-{datetime.now().year}-{abattoir.id}-{str(i+1).zfill(6)}"
            
            # Choisir une espèce aléatoire
            espece = random.choice(especes)
            
            # Choisir un client aléatoire
            client = random.choice(clients)
            
            # Générer des données réalistes
            sexe = random.choice(['MALE', 'FEMALE'])
            statut = random.choices(
                ['VIVANT', 'ABATTU', 'MORT'],
                weights=[70, 25, 5]  # 70% vivant, 25% abattu, 5% mort
            )[0]
            
            etat_sante = random.choices(
                ['BON', 'MALADE'],
                weights=[85, 15]  # 85% bon état, 15% malade
            )[0]
            
            # Poids selon l'espèce
            if espece.nom.upper() == 'BOVIN':
                poids_vif = random.randint(300, 600)
                poids_a_chaud = round(poids_vif * random.uniform(0.55, 0.65), 2)
                poids_a_froid = round(poids_a_chaud * random.uniform(0.95, 0.98), 2)
            elif espece.nom.upper() == 'OVIN':
                poids_vif = random.randint(25, 80)
                poids_a_chaud = round(poids_vif * random.uniform(0.50, 0.60), 2)
                poids_a_froid = round(poids_a_chaud * random.uniform(0.95, 0.98), 2)
            else:  # CAPRIN ou autres
                poids_vif = random.randint(20, 60)
                poids_a_chaud = round(poids_vif * random.uniform(0.50, 0.60), 2)
                poids_a_froid = round(poids_a_chaud * random.uniform(0.95, 0.98), 2)
            
            # Date d'arrivée (derniers 6 mois)
            days_ago = random.randint(1, 180)
            created_at = datetime.now() - timedelta(days=days_ago)
            updated_at = created_at + timedelta(days=random.randint(0, 30))
            
            # Urgence d'abattage
            abattage_urgence = random.choice([True, False])
            
            # Notes
            notes_options = [
                "Animal en bonne santé",
                "Vérification vétérinaire effectuée",
                "Prêt pour l'abattage",
                "Surveillance particulière",
                "Origine certifiée",
                "Contrôle qualité validé",
                "",
                "",
                ""  # Plus d'options vides pour avoir moins de notes
            ]
            notes = random.choice(notes_options)
            
            # Créer l'objet Bete
            bete = Bete(
                num_boucle=num_boucle,
                num_boucle_post_abattage=num_boucle_post_abattage,
                espece=espece,
                sexe=sexe,
                statut=statut,
                etat_sante=etat_sante,
                poids_vif=Decimal(str(poids_vif)),
                poids_a_chaud=Decimal(str(poids_a_chaud)),
                poids_a_froid=Decimal(str(poids_a_froid)),
                abattage_urgence=abattage_urgence,
                abattoir=abattoir,
                client=client,
                created_by=user,
                notes=notes,
                created_at=created_at,
                updated_at=updated_at
            )
            
            betes_to_create.append(bete)
            
            # Afficher le progrès tous les 100 bêtes
            if (i + 1) % 100 == 0:
                print(f"   ⏳ {i + 1}/{num_betes} bêtes préparées...")
        
        # Créer toutes les bêtes en une seule fois (bulk_create)
        print(f"   💾 Sauvegarde de {len(betes_to_create)} bêtes...")
        Bete.objects.bulk_create(betes_to_create, batch_size=1000)
        
        total_created += len(betes_to_create)
        print(f"   ✅ {len(betes_to_create)} bêtes créées pour {abattoir.nom}")
    
    print(f"\n🎉 Terminé ! {total_created} bêtes créées au total.")
    
    # Afficher les statistiques finales
    print("\n📊 Statistiques finales:")
    for abattoir in abattoirs:
        count = Bete.objects.filter(abattoir=abattoir).count()
        print(f"   {abattoir.nom}: {count} bêtes")
    
    total_betes = Bete.objects.count()
    print(f"\n🐄 Total général: {total_betes} bêtes dans le système")

if __name__ == "__main__":
    try:
        create_livestock_data()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)
