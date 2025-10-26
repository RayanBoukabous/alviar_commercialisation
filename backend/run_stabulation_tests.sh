#!/bin/bash

# Script pour exécuter les tests de finalisation de stabulation
# Usage: ./run_stabulation_tests.sh

echo "🧪 Tests de Finalisation de Stabulation"
echo "========================================"

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "manage.py" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le répertoire backend/"
    exit 1
fi

# Vérifier que le serveur Django est en cours d'exécution
echo "🔍 Vérification du serveur Django..."
if ! curl -s http://localhost:8000/api/ > /dev/null; then
    echo "❌ Le serveur Django n'est pas en cours d'exécution"
    echo "   Veuillez démarrer le serveur avec: python manage.py runserver"
    exit 1
fi
echo "✅ Serveur Django détecté"

# Fonction pour exécuter un test
run_test() {
    local test_name="$1"
    local test_script="$2"
    
    echo ""
    echo "🧪 Exécution du test: $test_name"
    echo "----------------------------------------"
    
    if python "$test_script"; then
        echo "✅ $test_name: RÉUSSI"
        return 0
    else
        echo "❌ $test_name: ÉCHOUÉ"
        return 1
    fi
}

# Fonction pour nettoyer les données de test
cleanup_test_data() {
    echo ""
    echo "🧹 Nettoyage des données de test..."
    
    # Supprimer les stabulations de test
    python manage.py shell -c "
from abattoir.models import Stabulation
from bete.models import Bete
from abattoir.models import Abattoir

# Supprimer les stabulations de test
Stabulation.objects.filter(numero_stabulation__startswith='TEST_STAB_').delete()
print('✅ Stabulations de test supprimées')

# Supprimer les bêtes de test
Bete.objects.filter(num_boucle__startswith='TEST_').delete()
Bete.objects.filter(num_boucle__startswith='EXISTING_').delete()
Bete.objects.filter(num_boucle__startswith='STAB_').delete()
print('✅ Bêtes de test supprimées')

# Supprimer l'abattoir de test
Abattoir.objects.filter(nom__contains='Test').delete()
print('✅ Abattoir de test supprimé')
"
}

# Menu principal
echo ""
echo "Choisissez une option:"
echo "1. Créer des données de test"
echo "2. Exécuter les tests avec commandes Django"
echo "3. Exécuter les tests avec API (nécessite serveur en cours)"
echo "4. Nettoyer les données de test"
echo "5. Exécuter tous les tests"
echo "6. Quitter"

read -p "Votre choix (1-6): " choice

case $choice in
    1)
        echo "🔧 Création des données de test..."
        python create_test_stabulation_data.py
        ;;
    2)
        echo "🧪 Exécution des tests avec commandes Django..."
        python test_stabulation_commands.py
        ;;
    3)
        echo "🧪 Exécution des tests avec API..."
        python test_stabulation_finalization.py
        ;;
    4)
        cleanup_test_data
        ;;
    5)
        echo "🚀 Exécution de tous les tests..."
        
        # Créer les données de test
        echo "1️⃣ Création des données de test..."
        python create_test_stabulation_data.py
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "2️⃣ Test avec commandes Django..."
            python test_stabulation_commands.py
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "3️⃣ Test avec API..."
                python test_stabulation_finalization.py
                
                if [ $? -eq 0 ]; then
                    echo ""
                    echo "🎉 TOUS LES TESTS SONT PASSÉS!"
                else
                    echo ""
                    echo "⚠️ Certains tests ont échoué"
                fi
            else
                echo ""
                echo "⚠️ Les tests avec commandes Django ont échoué"
            fi
        else
            echo ""
            echo "⚠️ Échec de la création des données de test"
        fi
        
        # Nettoyage
        echo ""
        echo "4️⃣ Nettoyage des données de test..."
        cleanup_test_data
        ;;
    6)
        echo "👋 Au revoir!"
        exit 0
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo ""
echo "✅ Script terminé"
