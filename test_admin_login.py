#!/usr/bin/env python3
"""
Script pour tester la connexion à l'interface d'administration Django
"""
import requests
import sys

def test_admin_login():
    base_url = "http://localhost:8000"
    admin_url = f"{base_url}/admin/"
    login_url = f"{base_url}/admin/login/"
    
    # Session pour maintenir les cookies
    session = requests.Session()
    
    try:
        # 1. Accéder à la page de login
        print("🔍 Accès à la page de login...")
        response = session.get(login_url)
        print(f"Status: {response.status_code}")
        
        if response.status_code != 200:
            print("❌ Impossible d'accéder à la page de login")
            return False
            
        # 2. Extraire le token CSRF si présent
        csrf_token = None
        if 'csrfmiddlewaretoken' in response.text:
            import re
            csrf_match = re.search(r'name="csrfmiddlewaretoken" value="([^"]+)"', response.text)
            if csrf_match:
                csrf_token = csrf_match.group(1)
                print(f"🔑 Token CSRF trouvé: {csrf_token[:20]}...")
        
        # 3. Tentative de connexion
        print("🔐 Tentative de connexion...")
        login_data = {
            'username': 'admin',
            'password': 'admin123',
        }
        
        if csrf_token:
            login_data['csrfmiddlewaretoken'] = csrf_token
            
        # Ajouter le header Referer pour le CSRF
        headers = {
            'Referer': login_url,
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        
        response = session.post(login_url, data=login_data, headers=headers, allow_redirects=True)
        print(f"Status après login: {response.status_code}")
        
        # 4. Vérifier si on est connecté
        if "Django administration" in response.text and "Log out" in response.text:
            print("✅ Connexion réussie à l'interface d'administration Django!")
            print(f"URL d'administration: {admin_url}")
            return True
        else:
            print("❌ Échec de la connexion")
            print("Contenu de la réponse:")
            print(response.text[:500])
            return False
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Test de connexion à Django Admin")
    print("=" * 50)
    
    success = test_admin_login()
    
    if success:
        print("\n🎉 Vous pouvez maintenant accéder à l'interface d'administration Django à:")
        print("   http://localhost:8000/admin/")
        print("   Identifiants: admin / admin123")
    else:
        print("\n❌ Impossible de se connecter à l'interface d'administration")
        sys.exit(1)
