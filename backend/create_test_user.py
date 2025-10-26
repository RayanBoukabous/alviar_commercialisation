#!/usr/bin/env python3
"""
Script pour créer un utilisateur de test et obtenir un token d'authentification
"""
import os
import sys
import django
from django.conf import settings

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from abattoir.models import Abattoir

User = get_user_model()

def create_test_user():
    """Créer un utilisateur de test avec token"""
    
    # Créer ou récupérer l'utilisateur
    username = 'testuser'
    email = 'test@example.com'
    password = 'testpassword123'
    
    try:
        user = User.objects.get(username=username)
        print(f"✅ Utilisateur '{username}' existe déjà")
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_superuser=True,
            is_staff=True
        )
        print(f"✅ Utilisateur '{username}' créé avec succès")
    
    # Créer ou récupérer le token
    token, created = Token.objects.get_or_create(user=user)
    if created:
        print(f"✅ Token créé pour l'utilisateur '{username}'")
    else:
        print(f"✅ Token existant pour l'utilisateur '{username}'")
    
    print(f"\n🔑 Token d'authentification: {token.key}")
    print(f"👤 Utilisateur: {username}")
    print(f"📧 Email: {email}")
    print(f"🔒 Mot de passe: {password}")
    
    # Créer un abattoir de test si nécessaire
    try:
        abattoir = Abattoir.objects.get(nom='Abattoir de Test')
        print(f"✅ Abattoir de test existe déjà")
    except Abattoir.DoesNotExist:
        abattoir = Abattoir.objects.create(
            nom='Abattoir de Test',
            wilaya='Blida',
            commune='Blida',
            actif=True,
            capacite_reception_ovin=100,
            capacite_reception_bovin=50,
            capacite_stabulation_ovin=200,
            capacite_stabulation_bovin=100
        )
        print(f"✅ Abattoir de test créé")
    
    # Associer l'utilisateur à l'abattoir
    if not hasattr(user, 'abattoir') or user.abattoir is None:
        user.abattoir = abattoir
        user.save()
        print(f"✅ Utilisateur associé à l'abattoir '{abattoir.nom}'")
    
    print(f"\n🌐 URLs de test:")
    print(f"   - Admin: http://localhost:8000/admin/")
    print(f"   - API: http://localhost:8000/api/")
    print(f"   - Abattoirs: http://localhost:8000/api/abattoirs/abattoirs-for-management/")
    print(f"   - Espèces: http://localhost:8000/api/betes/especes-list/")
    
    print(f"\n📝 Exemple de requête API:")
    print(f"curl -H 'Authorization: Token {token.key}' http://localhost:8000/api/abattoirs/abattoirs-for-management/")
    
    return token.key

if __name__ == '__main__':
    try:
        token = create_test_user()
        print(f"\n🎉 Configuration terminée!")
    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)
