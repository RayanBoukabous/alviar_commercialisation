# Backend Django - Alviar Dashboard

Backend Django professionnel et conteneurisé pour le système de gestion d'abattoir et de commercialisation Alviar.

## 🚀 Fonctionnalités

### Gestion des utilisateurs
- **3 types d'utilisateurs professionnels** :
  - `ALIMENT_SHEPTEL` : Gestion Aliments et Cheptel
  - `PRODUCTION` : Gestion Abattage et Production  
  - `SUPERVISEUR` : Superviseur Général
- Authentification sécurisée avec tokens
- Gestion des permissions par type d'utilisateur

### Gestion du cheptel (App `bete`)
- **Espèces et races** d'animaux
- **Suivi des bêtes** : identification, poids, statut, alimentation
- **Gestion des aliments** : stock, prix, types
- **Historique d'alimentation** détaillé
- Statistiques complètes

### Gestion de l'abattage (App `abattoir`)
- **Abattoirs** avec capacités et responsables
- **Sessions d'abattage** planifiées et suivies
- **Processus d'abattage** étape par étape
- **Carcasses** avec contrôle qualité et rendement
- **Découpes** avec classification et prix

### Gestion commerciale (App `client`)
- **Clients** avec types et limites de crédit
- **Commandes** complètes avec lignes détaillées
- **Facturation** automatique
- **Suivi des paiements** et créances
- Statistiques commerciales

## 🏗️ Architecture

```
backend/
├── Dockerfile                 # Image Docker
├── docker-compose.yml         # Orchestration des services
├── requirements.txt           # Dépendances Python
├── env.example               # Variables d'environnement
├── manage.py                 # Script Django
├── backend/                  # Configuration Django
│   ├── settings.py           # Paramètres
│   ├── urls.py              # URLs principales
│   └── wsgi.py              # WSGI
├── users/                    # App utilisateurs
├── bete/                     # App cheptel
├── abattoir/                 # App abattage
└── client/                   # App commerciale
```

## 🐳 Déploiement avec Docker

### Prérequis
- Docker et Docker Compose installés
- Ports 8000, 5432, 6379 disponibles

### Démarrage rapide

1. **Cloner et configurer** :
```bash
cd backend
cp env.example .env
# Éditer .env avec vos paramètres
```

2. **Démarrer les services** :
```bash
docker-compose up -d
```

3. **Créer un superutilisateur** :
```bash
docker-compose exec web python manage.py createsuperuser
```

4. **Accéder à l'application** :
- API : http://localhost:8000/api/
- Admin : http://localhost:8000/admin/

### Services inclus
- **PostgreSQL** : Base de données principale
- **Redis** : Cache et broker Celery
- **Django** : Application web
- **Celery** : Tâches asynchrones
- **Nginx** : Reverse proxy (production)

## 📚 API Endpoints

### Authentification
- `POST /api/users/login/` - Connexion
- `POST /api/users/logout/` - Déconnexion
- `GET /api/users/profile/` - Profil utilisateur

### Utilisateurs
- `GET /api/users/` - Liste des utilisateurs
- `POST /api/users/` - Créer un utilisateur
- `GET /api/users/{id}/` - Détails utilisateur
- `PUT /api/users/{id}/` - Modifier utilisateur

### Cheptel
- `GET /api/betes/` - Liste des bêtes
- `POST /api/betes/` - Ajouter une bête
- `GET /api/betes/aliments/` - Liste des aliments
- `GET /api/betes/stats/` - Statistiques cheptel

### Abattage
- `GET /api/abattoirs/` - Liste des abattoirs
- `GET /api/abattoirs/sessions/` - Sessions d'abattage
- `POST /api/abattoirs/abattages/{id}/start/` - Démarrer abattage
- `GET /api/abattoirs/stats/` - Statistiques abattage

### Clients
- `GET /api/clients/` - Liste des clients
- `GET /api/clients/commandes/` - Commandes
- `POST /api/clients/commandes/{id}/confirmer/` - Confirmer commande
- `GET /api/clients/stats/` - Statistiques commerciales

## 🔧 Développement

### Installation locale

1. **Créer un environnement virtuel** :
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

2. **Installer les dépendances** :
```bash
pip install -r requirements.txt
```

3. **Configurer la base de données** :
```bash
# Créer .env à partir de env.example
cp env.example .env
# Éditer .env avec vos paramètres

# Migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser
```

4. **Démarrer le serveur** :
```bash
python manage.py runserver
```

### Commandes utiles

```bash
# Migrations
python manage.py makemigrations
python manage.py migrate

# Collecter les fichiers statiques
python manage.py collectstatic

# Shell Django
python manage.py shell

# Tests
python manage.py test

# Créer des données de test
python manage.py loaddata fixtures/initial_data.json
```

## 🔐 Sécurité

### Configuration de production
- Variables d'environnement pour les secrets
- HTTPS obligatoire
- Headers de sécurité configurés
- Rate limiting sur l'API
- Validation des données strictes

### Permissions
- Authentification requise pour toutes les API
- Permissions basées sur le type d'utilisateur
- Validation des données côté serveur

## 📊 Monitoring

### Logs
- Logs structurés avec niveaux
- Rotation automatique
- Intégration avec les outils de monitoring

### Métriques
- Statistiques en temps réel
- Endpoints de santé
- Monitoring des performances

## 🚀 Déploiement en production

### Avec Docker Compose
```bash
# Production avec Nginx
docker-compose --profile production up -d
```

### Variables d'environnement importantes
```env
DEBUG=False
SECRET_KEY=your-production-secret-key
DB_PASSWORD=strong-password
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

### Sauvegarde
- Sauvegarde automatique de la base de données
- Rotation des sauvegardes
- Restauration facile

## 📝 Documentation API

La documentation complète de l'API est disponible à :
- `/api/schema/` - Schéma OpenAPI
- `/api/docs/` - Interface de documentation interactive

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Consulter la documentation
- Contacter l'équipe de développement

---

**Alviar Dashboard Backend** - Système professionnel de gestion d'abattoir et de commercialisation






