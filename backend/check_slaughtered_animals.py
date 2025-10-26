#!/usr/bin/env python
"""
Script pour vérifier les bêtes abattues dans la base de données
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from bete.models import Bete
from abattoir.models import Stabulation
from django.db.models import Count, Q

def check_slaughtered_animals():
    """Vérifie les bêtes abattues dans la base de données"""
    
    print("🔍 ANALYSE DES BÊTES ABATTUES DANS LA BASE DE DONNÉES")
    print("=" * 60)
    
    # 1. Compter les bêtes par statut
    print("\n📊 RÉPARTITION PAR STATUT :")
    stats = Bete.objects.values('statut').annotate(count=Count('id')).order_by('statut')
    for stat in stats:
        print(f"  - {stat['statut']}: {stat['count']} bêtes")
    
    # 2. Détail des bêtes abattues
    betes_abattues = Bete.objects.filter(statut='ABATTU')
    print(f"\n🥩 BÊTES ABATTUES ({betes_abattues.count()}):")
    
    if betes_abattues.exists():
        for bete in betes_abattues[:10]:  # Limiter à 10 pour l'affichage
            print(f"  - ID: {bete.id}, Boucle: {bete.num_boucle}")
            print(f"    Espèce: {bete.espece.nom}, Poids vif: {bete.poids_vif}kg")
            if bete.poids_a_chaud:
                print(f"    Poids à chaud: {bete.poids_a_chaud}kg")
            if bete.num_boucle_post_abattage:
                print(f"    Boucle post-abattage: {bete.num_boucle_post_abattage}")
            print(f"    Abattoir: {bete.abattoir.nom if bete.abattoir else 'N/A'}")
            print(f"    Date modification: {bete.updated_at}")
            print()
    else:
        print("  ❌ Aucune bête abattue trouvée")
    
    # 3. Vérifier les stabulations terminées
    stabulations_terminees = Stabulation.objects.filter(statut='TERMINE')
    print(f"\n🏭 STABULATIONS TERMINÉES ({stabulations_terminees.count()}):")
    
    for stab in stabulations_terminees:
        betes_count = stab.betes.count()
        betes_abattues_count = stab.betes.filter(statut='ABATTU').count()
        print(f"  - {stab.numero_stabulation} ({stab.abattoir.nom})")
        print(f"    Bêtes totales: {betes_count}")
        print(f"    Bêtes abattues: {betes_abattues_count}")
        print(f"    Cohérent: {'✅' if betes_count == betes_abattues_count else '❌'}")
        print(f"    Date fin: {stab.date_fin}")
        print()
    
    # 4. Statistiques globales
    total_betes = Bete.objects.count()
    betes_vivantes = Bete.objects.filter(statut='VIVANT').count()
    betes_en_stabulation = Bete.objects.filter(statut='EN_STABULATION').count()
    betes_abattues = Bete.objects.filter(statut='ABATTU').count()
    betes_mortes = Bete.objects.filter(statut='MORT').count()
    betes_vendues = Bete.objects.filter(statut='VENDU').count()
    
    print("📈 RÉSUMÉ GLOBAL :")
    print(f"  Total bêtes: {total_betes}")
    print(f"  Vivantes: {betes_vivantes}")
    print(f"  En stabulation: {betes_en_stabulation}")
    print(f"  Abattues: {betes_abattues}")
    print(f"  Mortes: {betes_mortes}")
    print(f"  Vendues: {betes_vendues}")
    
    # 5. Vérification de cohérence
    print(f"\n🔍 VÉRIFICATION DE COHÉRENCE :")
    total_calculated = betes_vivantes + betes_en_stabulation + betes_abattues + betes_mortes + betes_vendues
    print(f"  Total calculé: {total_calculated}")
    print(f"  Total réel: {total_betes}")
    print(f"  Cohérent: {'✅' if total_calculated == total_betes else '❌'}")

if __name__ == "__main__":
    check_slaughtered_animals()
