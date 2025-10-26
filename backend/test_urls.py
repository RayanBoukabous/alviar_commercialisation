#!/usr/bin/env python
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.urls import reverse
from django.conf import settings

# Test des URLs
try:
    url = reverse('abattoir:historique-list')
    print(f"URL trouvée: {url}")
except Exception as e:
    print(f"Erreur: {e}")

# Lister toutes les URLs de l'app abattoir
from django.urls import get_resolver
resolver = get_resolver()
abattoir_urls = []

for pattern in resolver.url_patterns:
    if hasattr(pattern, 'app_name') and pattern.app_name == 'abattoir':
        for url_pattern in pattern.url_patterns:
            abattoir_urls.append(str(url_pattern.pattern))

print("URLs de l'app abattoir:")
for url in abattoir_urls:
    print(f"  {url}")
