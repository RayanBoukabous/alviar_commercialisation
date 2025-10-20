#!/bin/sh

# Script de démarrage pour le backend Django Alviar

echo "🚀 Démarrage du backend Django Alviar..."

# Créer les dossiers nécessaires
mkdir -p logs
mkdir -p backups
mkdir -p media
mkdir -p staticfiles

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
    echo "Base de données non disponible - attente..."
    sleep 2
done

echo "✅ Base de données disponible"

# Appliquer les migrations
echo "📦 Application des migrations..."
python manage.py migrate

# Collecter les fichiers statiques
echo "📁 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

# Créer un superutilisateur si nécessaire
echo "👤 Vérification du superutilisateur..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    print('Création du superutilisateur par défaut...')
    User.objects.create_superuser(
        username='admin',
        email='admin@alviar.com',
        password='admin123',
        first_name='Admin',
        last_name='Alviar',
        user_type='SUPERVISEUR'
    )
    print('Superutilisateur créé: admin/admin123')
else:
    print('Superutilisateur existe déjà')
"

# Charger les données initiales si disponibles
if [ -f "fixtures/initial_data.json" ]; then
    echo "📊 Chargement des données initiales..."
    python manage.py loaddata fixtures/initial_data.json
fi

echo "🎉 Backend prêt!"
echo "📊 Admin: http://localhost:8000/admin/"
echo "🔗 API: http://localhost:8000/api/"

# Démarrer le serveur
exec "$@"

