#!/bin/bash

# Script pour générer des données de bêtes
# Usage: ./run_livestock_generation.sh [options]

echo "🚀 Script de génération de données de bêtes pour Alviar Dashboard"
echo "=================================================================="

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "manage.py" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le répertoire backend/"
    echo "   Utilisez: cd backend && ./run_livestock_generation.sh"
    exit 1
fi

# Vérifier si l'environnement virtuel est activé
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  Avertissement: Aucun environnement virtuel détecté"
    echo "   Il est recommandé d'activer un environnement virtuel Python"
fi

# Fonction d'aide
show_help() {
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Afficher cette aide"
    echo "  -c, --count NUMBER      Nombre de bêtes par abattoir (défaut: 1200)"
    echo "  -a, --abattoir ID       ID de l'abattoir spécifique (optionnel)"
    echo "  --min NUMBER            Nombre minimum par abattoir (défaut: 1000)"
    echo "  --max NUMBER            Nombre maximum par abattoir (défaut: 1500)"
    echo "  -f, --force             Forcer la génération même si des bêtes existent"
    echo "  --random                Utiliser un nombre aléatoire entre min et max"
    echo ""
    echo "Exemples:"
    echo "  $0                      # Génère 1200 bêtes par abattoir"
    echo "  $0 -c 1000             # Génère 1000 bêtes par abattoir"
    echo "  $0 --random            # Génère entre 1000-1500 bêtes par abattoir"
    echo "  $0 -a 1 -c 500         # Génère 500 bêtes pour l'abattoir ID 1"
    echo "  $0 -f                  # Force la génération même si des bêtes existent"
    echo ""
}

# Variables par défaut
COUNT=""
ABATTOIR_ID=""
MIN_COUNT="1000"
MAX_COUNT="1500"
FORCE=""
RANDOM_COUNT=""

# Parser les arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -c|--count)
            COUNT="$2"
            shift 2
            ;;
        -a|--abattoir)
            ABATTOIR_ID="$2"
            shift 2
            ;;
        --min)
            MIN_COUNT="$2"
            shift 2
            ;;
        --max)
            MAX_COUNT="$2"
            shift 2
            ;;
        -f|--force)
            FORCE="--force"
            shift
            ;;
        --random)
            RANDOM_COUNT="true"
            shift
            ;;
        *)
            echo "❌ Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Construire la commande Django
DJANGO_CMD="python manage.py generate_livestock"

if [ -n "$COUNT" ]; then
    DJANGO_CMD="$DJANGO_CMD --count $COUNT"
fi

if [ -n "$ABATTOIR_ID" ]; then
    DJANGO_CMD="$DJANGO_CMD --abattoir-id $ABATTOIR_ID"
fi

if [ -n "$MIN_COUNT" ]; then
    DJANGO_CMD="$DJANGO_CMD --min-count $MIN_COUNT"
fi

if [ -n "$MAX_COUNT" ]; then
    DJANGO_CMD="$DJANGO_CMD --max-count $MAX_COUNT"
fi

if [ -n "$FORCE" ]; then
    DJANGO_CMD="$DJANGO_CMD $FORCE"
fi

if [ "$RANDOM_COUNT" = "true" ]; then
    DJANGO_CMD="$DJANGO_CMD --count ''"
fi

# Afficher la configuration
echo ""
echo "📋 Configuration:"
if [ -n "$COUNT" ]; then
    echo "   - Nombre de bêtes par abattoir: $COUNT"
elif [ "$RANDOM_COUNT" = "true" ]; then
    echo "   - Nombre de bêtes par abattoir: Aléatoire entre $MIN_COUNT et $MAX_COUNT"
else
    echo "   - Nombre de bêtes par abattoir: 1200 (défaut)"
fi

if [ -n "$ABATTOIR_ID" ]; then
    echo "   - Abattoir spécifique: ID $ABATTOIR_ID"
else
    echo "   - Tous les abattoirs actifs"
fi

if [ -n "$FORCE" ]; then
    echo "   - Mode forcé: Oui"
else
    echo "   - Mode forcé: Non"
fi

echo ""
echo "🔧 Commande Django: $DJANGO_CMD"
echo ""

# Demander confirmation
read -p "Voulez-vous continuer? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Génération annulée"
    exit 0
fi

echo ""
echo "🚀 Démarrage de la génération..."
echo "=================================="

# Exécuter la commande
eval $DJANGO_CMD

# Vérifier le code de sortie
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Génération terminée avec succès!"
    echo ""
    echo "💡 Conseils:"
    echo "   - Vérifiez les données dans l'interface d'administration Django"
    echo "   - Les bêtes sont réparties entre les espèces (Bovin, Ovin, Caprin)"
    echo "   - Les statuts sont variés (Vivant, Abattu, Vendu, Mort)"
    echo "   - Les poids sont réalistes selon l'espèce"
else
    echo ""
    echo "❌ Erreur lors de la génération"
    echo "   Vérifiez les logs ci-dessus pour plus de détails"
    exit 1
fi
