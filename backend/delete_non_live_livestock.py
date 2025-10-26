#!/usr/bin/env python3
"""
Script pour supprimer toutes les bêtes avec un statut différent de VIVANT
Ne garde que les bêtes vivantes
"""

import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from bete.models import Bete

def delete_non_live_livestock():
    """Supprimer toutes les bêtes non vivantes"""
    
    print("🐄 Suppression des bêtes non vivantes...")
    
    # Compter les bêtes par statut avant suppression
    total_betes = Bete.objects.count()
    vivant_count = Bete.objects.filter(statut='VIVANT').count()
    abattu_count = Bete.objects.filter(statut='ABATTU').count()
    mort_count = Bete.objects.filter(statut='MORT').count()
    malade_count = Bete.objects.filter(statut='MALADE').count()
    
    print(f"\n📊 Statistiques avant suppression:")
    print(f"   Total bêtes: {total_betes}")
    print(f"   VIVANT: {vivant_count}")
    print(f"   ABATTU: {abattu_count}")
    print(f"   MORT: {mort_count}")
    print(f"   MALADE: {malade_count}")
    
    # Confirmer la suppression
    non_vivant_count = abattu_count + mort_count + malade_count
    print(f"\n⚠️  {non_vivant_count} bêtes vont être supprimées (toutes sauf VIVANT)")
    
    # Supprimer les bêtes non vivantes
    deleted_count, _ = Bete.objects.exclude(statut='VIVANT').delete()
    
    print(f"\n✅ Suppression terminée!")
    print(f"   {deleted_count} bêtes supprimées")
    
    # Statistiques finales
    final_total = Bete.objects.count()
    final_vivant = Bete.objects.filter(statut='VIVANT').count()
    
    print(f"\n📊 Statistiques après suppression:")
    print(f"   Total bêtes restantes: {final_total}")
    print(f"   Bêtes VIVANT: {final_vivant}")
    
    # Vérifier par abattoir
    from abattoir.models import Abattoir
    print(f"\n🏭 Répartition par abattoir:")
    for abattoir in Abattoir.objects.all():
        count = Bete.objects.filter(abattoir=abattoir, statut='VIVANT').count()
        print(f"   {abattoir.nom}: {count} bêtes vivantes")

if __name__ == "__main__":
    try:
        delete_non_live_livestock()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)








