#!/usr/bin/env python3
"""
Script pour créer 10 clients de test réalistes
"""
import os
import sys
import django
from datetime import datetime
import random

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings_sqlite')
django.setup()

from client.models import Client
from users.models import User

def create_test_clients():
    """Créer 10 clients de test réalistes"""
    
    # Données de test pour les clients
    clients_data = [
        {
            'nom': 'Boucherie Centrale d\'Alger',
            'type_client': 'GROSSISTE',
            'telephone': '021-45-67-89',
            'email': 'contact@boucherie-centrale.dz',
            'adresse': '123 Rue Didouche Mourad, Alger Centre',
            'nif': '123456789012345',
            'nis': '987654321098765',
            'wilaya': 'Alger',
            'commune': 'Alger Centre',
            'contact_principal': 'Ahmed Benali',
            'telephone_contact': '0555-123-456',
            'notes': 'Client fidèle depuis 5 ans, commandes régulières'
        },
        {
            'nom': 'Super Marché Oranais',
            'type_client': 'SUPERGROSSISTE',
            'telephone': '041-23-45-67',
            'email': 'achats@supermarche-oranais.dz',
            'adresse': '456 Avenue de l\'ANP, Oran',
            'nif': '234567890123456',
            'nis': '876543210987654',
            'wilaya': 'Oran',
            'commune': 'Oran',
            'contact_principal': 'Fatima Zohra',
            'telephone_contact': '0556-234-567',
            'notes': 'Grande chaîne de supermarchés, volumes importants'
        },
        {
            'nom': 'Restaurant El Djazair',
            'type_client': 'PARTICULIER',
            'telephone': '021-78-90-12',
            'email': 'reservation@el-djazair.dz',
            'adresse': '789 Rue Ben M\'hidi, Alger',
            'nif': '345678901234567',
            'nis': '765432109876543',
            'wilaya': 'Alger',
            'commune': 'Sidi M\'hamed',
            'contact_principal': 'Mohamed Cherif',
            'telephone_contact': '0557-345-678',
            'notes': 'Restaurant haut de gamme, viandes de qualité'
        },
        {
            'nom': 'Distributeur Constantinois',
            'type_client': 'GROSSISTE',
            'telephone': '031-12-34-56',
            'email': 'ventes@distrib-constantine.dz',
            'adresse': '321 Boulevard de l\'Abîme, Constantine',
            'nif': '456789012345678',
            'nis': '654321098765432',
            'wilaya': 'Constantine',
            'commune': 'Constantine',
            'contact_principal': 'Yasmine Khelil',
            'telephone_contact': '0558-456-789',
            'notes': 'Distributeur régional, couvre l\'Est algérien'
        },
        {
            'nom': 'Boucherie Familiale Tlemcen',
            'type_client': 'PARTICULIER',
            'telephone': '043-45-67-89',
            'email': 'boucherie@familiale-tlemcen.dz',
            'adresse': '654 Rue de la République, Tlemcen',
            'nif': '567890123456789',
            'nis': '543210987654321',
            'wilaya': 'Tlemcen',
            'commune': 'Tlemcen',
            'contact_principal': 'Omar Benali',
            'telephone_contact': '0559-567-890',
            'notes': 'Boucherie traditionnelle, clientèle locale'
        },
        {
            'nom': 'Chaîne Hyper Marchés Blida',
            'type_client': 'SUPERGROSSISTE',
            'telephone': '025-67-89-01',
            'email': 'approvisionnement@hyper-blida.dz',
            'adresse': '987 Avenue des Martyrs, Blida',
            'nif': '678901234567890',
            'nis': '432109876543210',
            'wilaya': 'Blida',
            'commune': 'Blida',
            'contact_principal': 'Nadia Saadi',
            'telephone_contact': '0560-678-901',
            'notes': 'Chaîne d\'hyper marchés, commandes hebdomadaires'
        },
        {
            'nom': 'Restaurant Le Gourmet',
            'type_client': 'PARTICULIER',
            'telephone': '021-90-12-34',
            'email': 'chef@le-gourmet.dz',
            'adresse': '147 Rue des Frères Bouadou, Alger',
            'nif': '789012345678901',
            'nis': '321098765432109',
            'wilaya': 'Alger',
            'commune': 'Hydra',
            'contact_principal': 'Karim Boudjema',
            'telephone_contact': '0561-789-012',
            'notes': 'Restaurant gastronomique, viandes premium'
        },
        {
            'nom': 'Distributor Ouest Algérie',
            'type_client': 'GROSSISTE',
            'telephone': '041-34-56-78',
            'email': 'distribution@ouest-algerie.dz',
            'adresse': '258 Route Nationale, Oran',
            'nif': '890123456789012',
            'nis': '210987654321098',
            'wilaya': 'Oran',
            'commune': 'Bir El Djir',
            'contact_principal': 'Salima Benkhelil',
            'telephone_contact': '0562-890-123',
            'notes': 'Distributeur pour l\'Ouest algérien'
        },
        {
            'nom': 'Boucherie Artisanale Sétif',
            'type_client': 'PARTICULIER',
            'telephone': '036-78-90-12',
            'email': 'artisan@boucherie-setif.dz',
            'adresse': '369 Rue Aïn El Fouara, Sétif',
            'nif': '901234567890123',
            'nis': '109876543210987',
            'wilaya': 'Sétif',
            'commune': 'Sétif',
            'contact_principal': 'Hakim Meziane',
            'telephone_contact': '0563-901-234',
            'notes': 'Boucherie artisanale, produits traditionnels'
        },
        {
            'nom': 'Groupe Hôtelier Annaba',
            'type_client': 'SUPERGROSSISTE',
            'telephone': '038-12-34-56',
            'email': 'achats@hotels-annaba.dz',
            'adresse': '741 Boulevard de l\'Indépendance, Annaba',
            'nif': '012345678901234',
            'nis': '098765432109876',
            'wilaya': 'Annaba',
            'commune': 'Annaba',
            'contact_principal': 'Amina Boudjellal',
            'telephone_contact': '0564-012-345',
            'notes': 'Groupe hôtelier, besoins importants en viandes'
        }
    ]
    
    # Récupérer l'utilisateur admin pour created_by
    try:
        admin_user = User.objects.get(username='admin')
    except User.DoesNotExist:
        print("❌ Utilisateur admin non trouvé")
        return False
    
    print("🚀 Création de 10 clients de test...")
    print("=" * 50)
    
    created_count = 0
    
    for i, client_data in enumerate(clients_data, 1):
        try:
            # Vérifier si le client existe déjà
            if Client.objects.filter(nom=client_data['nom']).exists():
                print(f"⚠️  Client {i}: {client_data['nom']} existe déjà")
                continue
            
            # Créer le client
            client = Client.objects.create(
                nom=client_data['nom'],
                type_client=client_data['type_client'],
                telephone=client_data['telephone'],
                email=client_data['email'],
                adresse=client_data['adresse'],
                nif=client_data['nif'],
                nis=client_data['nis'],
                wilaya=client_data['wilaya'],
                commune=client_data['commune'],
                contact_principal=client_data['contact_principal'],
                telephone_contact=client_data['telephone_contact'],
                notes=client_data['notes'],
                created_by=admin_user
            )
            
            print(f"✅ Client {i}: {client.nom} créé avec succès")
            print(f"   Type: {client.get_type_client_display()}")
            print(f"   Wilaya: {client.wilaya}")
            print(f"   Contact: {client.contact_principal}")
            print()
            
            created_count += 1
            
        except Exception as e:
            print(f"❌ Erreur lors de la création du client {i}: {e}")
            continue
    
    print("=" * 50)
    print(f"🎉 {created_count} clients créés avec succès sur 10")
    
    # Afficher les statistiques
    total_clients = Client.objects.count()
    print(f"📊 Total des clients dans la base: {total_clients}")
    
    # Statistiques par type
    print("\n📈 Répartition par type de client:")
    for type_code, type_name in Client.TYPE_CLIENT_CHOICES:
        count = Client.objects.filter(type_client=type_code).count()
        print(f"   {type_name}: {count}")
    
    return True

if __name__ == "__main__":
    print("🔧 Création de clients de test pour ALVIAR Dashboard")
    print("=" * 60)
    
    success = create_test_clients()
    
    if success:
        print("\n✅ Script terminé avec succès!")
        print("🌐 Vous pouvez maintenant voir les clients dans l'interface d'administration Django")
        print("   URL: http://localhost:8000/admin/client/client/")
    else:
        print("\n❌ Erreur lors de l'exécution du script")
