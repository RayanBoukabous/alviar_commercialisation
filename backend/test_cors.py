#!/usr/bin/env python3
"""
Script de test pour vérifier la configuration CORS
"""
import requests
import json

def test_cors():
    """Test de la configuration CORS"""
    base_url = "http://localhost:8000"
    
    print("🔍 Test de la configuration CORS...")
    
    # Test 1: Requête OPTIONS (preflight)
    print("\n1. Test de la requête OPTIONS (preflight):")
    try:
        response = requests.options(
            f"{base_url}/api/users/auth/login/",
            headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, Authorization'
            }
        )
        print(f"   Status: {response.status_code}")
        print(f"   Headers CORS:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"     {header}: {value}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # Test 2: Requête POST normale
    print("\n2. Test de la requête POST:")
    try:
        response = requests.post(
            f"{base_url}/api/users/auth/login/",
            json={
                "username": "test@example.com",
                "password": "testpassword"
            },
            headers={
                'Origin': 'http://localhost:3000',
                'Content-Type': 'application/json'
            }
        )
        print(f"   Status: {response.status_code}")
        print(f"   Headers CORS:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"     {header}: {value}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    print("\n✅ Test CORS terminé!")

if __name__ == "__main__":
    test_cors()




