#!/usr/bin/env python
"""
Script pour ajouter manuellement les champs de suivi des actions
à la table stabulation sans passer par les migrations Django.
"""

import os
import sys
import django
from django.db import connection

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def add_action_tracking_fields():
    """Ajoute les champs de suivi des actions à la table stabulation"""
    
    with connection.cursor() as cursor:
        try:
            # Vérifier si les colonnes existent déjà (SQLite)
            cursor.execute("PRAGMA table_info(abattoir_stabulation)")
            columns_info = cursor.fetchall()
            existing_columns = [col[1] for col in columns_info]  # col[1] est le nom de la colonne
            
            print(f"Colonnes existantes: {existing_columns}")
            
            # Ajouter les colonnes si elles n'existent pas
            if 'annule_par_id' not in existing_columns:
                cursor.execute("ALTER TABLE abattoir_stabulation ADD COLUMN annule_par_id INTEGER")
                print("✓ Colonne annule_par_id ajoutée")
            
            if 'date_annulation' not in existing_columns:
                cursor.execute("ALTER TABLE abattoir_stabulation ADD COLUMN date_annulation DATETIME")
                print("✓ Colonne date_annulation ajoutée")
            
            if 'raison_annulation' not in existing_columns:
                cursor.execute("ALTER TABLE abattoir_stabulation ADD COLUMN raison_annulation TEXT")
                print("✓ Colonne raison_annulation ajoutée")
            
            if 'finalise_par_id' not in existing_columns:
                cursor.execute("ALTER TABLE abattoir_stabulation ADD COLUMN finalise_par_id INTEGER")
                print("✓ Colonne finalise_par_id ajoutée")
            
            if 'date_finalisation' not in existing_columns:
                cursor.execute("ALTER TABLE abattoir_stabulation ADD COLUMN date_finalisation DATETIME")
                print("✓ Colonne date_finalisation ajoutée")
            
            # Ajouter les contraintes de clés étrangères si elles n'existent pas
            try:
                cursor.execute("""
                    ALTER TABLE abattoir_stabulation 
                    ADD CONSTRAINT fk_stabulation_annule_par 
                    FOREIGN KEY (annule_par_id) REFERENCES users_user(id) ON DELETE SET NULL
                """)
                print("✓ Contrainte FK annule_par ajoutée")
            except Exception as e:
                if "already exists" in str(e).lower():
                    print("✓ Contrainte FK annule_par existe déjà")
                else:
                    print(f"⚠ Erreur contrainte annule_par: {e}")
            
            try:
                cursor.execute("""
                    ALTER TABLE abattoir_stabulation 
                    ADD CONSTRAINT fk_stabulation_finalise_par 
                    FOREIGN KEY (finalise_par_id) REFERENCES users_user(id) ON DELETE SET NULL
                """)
                print("✓ Contrainte FK finalise_par ajoutée")
            except Exception as e:
                if "already exists" in str(e).lower():
                    print("✓ Contrainte FK finalise_par existe déjà")
                else:
                    print(f"⚠ Erreur contrainte finalise_par: {e}")
            
            print("\n✅ Tous les champs de suivi des actions ont été ajoutés avec succès!")
            
        except Exception as e:
            print(f"❌ Erreur lors de l'ajout des champs: {e}")
            return False
    
    return True

if __name__ == "__main__":
    print("Ajout des champs de suivi des actions...")
    success = add_action_tracking_fields()
    
    if success:
        print("\n🎉 Script terminé avec succès!")
        print("Les fonctionnalités de suivi des actions sont maintenant disponibles.")
    else:
        print("\n💥 Le script a échoué. Vérifiez les erreurs ci-dessus.")
        sys.exit(1)
