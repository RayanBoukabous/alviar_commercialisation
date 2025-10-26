# Tests de Finalisation de Stabulation

Ce dossier contient des scripts de test pour valider la logique de finalisation de stabulation avec les contraintes de numéro post abattage.

## 🎯 Objectif

Tester la logique de finalisation de stabulation qui :
1. Vérifie l'unicité des numéros post abattage avant de finaliser
2. Empêche la finalisation si des numéros existent déjà
3. Permet la finalisation seulement avec des numéros uniques
4. Change correctement le statut de la stabulation et des bêtes

## 📁 Fichiers de Test

### Scripts Principaux
- `test_stabulation_finalization.py` - Tests complets avec API
- `test_stabulation_commands.py` - Tests simples avec commandes Django
- `create_test_stabulation_data.py` - Création de données de test
- `run_stabulation_tests.sh` - Script principal d'exécution

### Scripts de Test
- `test_stabulation_finalization.py` - Tests avec API REST
- `test_stabulation_commands.py` - Tests avec commandes Django directes

## 🚀 Utilisation

### Option 1: Script Principal (Recommandé)
```bash
cd backend/
./run_stabulation_tests.sh
```

### Option 2: Tests Individuels

#### 1. Créer des données de test
```bash
python create_test_stabulation_data.py
```

#### 2. Tester avec commandes Django
```bash
python test_stabulation_commands.py
```

#### 3. Tester avec API (nécessite serveur en cours)
```bash
# Démarrer le serveur Django
python manage.py runserver

# Dans un autre terminal
python test_stabulation_finalization.py
```

## 🧪 Scénarios de Test

### Test 1: Numéro Post Abattage Existant
- **Objectif**: Vérifier que la finalisation échoue avec un numéro existant
- **Données**: Utilise un numéro post abattage déjà utilisé
- **Résultat attendu**: 
  - ❌ Finalisation rejetée
  - 📊 Statut stabulation reste "EN_COURS"
  - 📊 Bêtes restent en statut "VIVANT"

### Test 2: Numéros Post Abattage Uniques
- **Objectif**: Vérifier que la finalisation réussit avec des numéros uniques
- **Données**: Utilise des numéros post abattage nouveaux
- **Résultat attendu**:
  - ✅ Finalisation acceptée
  - 📊 Statut stabulation devient "TERMINE"
  - 📊 Bêtes passent au statut "ABATTU"
  - 📊 Numéros post abattage enregistrés

## 🔍 Vérifications Effectuées

### Contraintes Testées
1. **Unicité des numéros post abattage**
   - Vérification avant finalisation
   - Rejet si numéro existe déjà
   - Acceptation si numéro unique

2. **Changement de statut**
   - Stabulation: EN_COURS → TERMINE
   - Bêtes: VIVANT → ABATTU

3. **Enregistrement des données**
   - Poids à chaud
   - Numéros post abattage
   - Dates de finalisation

### Données de Test Créées
- **Abattoir**: "Abattoir Test Finalisation"
- **Bêtes existantes**: 8 bêtes avec numéros post abattage
- **Stabulation**: 6 bêtes prêtes à être finalisées
- **Utilisateur**: test_finalization_user

## 📊 Résultats Attendus

### Succès
```
🎉 TOUS LES TESTS SONT PASSÉS!
La logique de finalisation de stabulation fonctionne correctement.
```

### Échec
```
⚠️ CERTAINS TESTS ONT ÉCHOUÉ
Vérifiez la logique de finalisation.
```

## 🛠️ Dépannage

### Problèmes Courants

#### 1. Serveur Django non démarré
```bash
# Erreur: Impossible de se connecter au serveur Django
# Solution: Démarrer le serveur
python manage.py runserver
```

#### 2. Permissions insuffisantes
```bash
# Erreur: Permission denied
# Solution: Rendre le script exécutable
chmod +x run_stabulation_tests.sh
```

#### 3. Données de test corrompues
```bash
# Solution: Nettoyer et recréer
python manage.py shell -c "
from abattoir.models import Stabulation
from bete.models import Bete
from abattoir.models import Abattoir

Stabulation.objects.filter(numero_stabulation__startswith='TEST_').delete()
Bete.objects.filter(num_boucle__startswith='TEST_').delete()
Bete.objects.filter(num_boucle__startswith='EXISTING_').delete()
Bete.objects.filter(num_boucle__startswith='STAB_').delete()
Abattoir.objects.filter(nom__contains='Test').delete()
print('Données de test nettoyées')
"
```

## 🔧 Configuration

### Prérequis
- Django 4.x
- Python 3.8+
- Serveur Django en cours d'exécution (pour tests API)

### Variables d'Environnement
- `DJANGO_SETTINGS_MODULE=backend.settings`
- Base de données configurée
- Migrations appliquées

## 📝 Logs et Debug

### Niveau de Log
Les scripts affichent des logs détaillés :
- ✅ Succès
- ❌ Échec
- 🔍 Vérifications
- 📊 Résultats

### Debug
Pour plus de détails, modifiez les scripts pour ajouter :
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🎯 Prochaines Étapes

Après validation des tests :
1. ✅ Logique de finalisation validée
2. 🔄 Tests d'intégration
3. 🚀 Déploiement en production
4. 📊 Monitoring des performances

## 📞 Support

En cas de problème :
1. Vérifier les logs d'erreur
2. Nettoyer les données de test
3. Relancer les tests
4. Contacter l'équipe de développement
