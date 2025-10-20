# 🐄 Alviar Dashboard - Commercialisation

Dashboard professionnel pour la gestion commerciale du bétail et des abattoirs.

## 🚀 Fonctionnalités

- **Gestion du bétail** : Suivi complet des animaux
- **Abattoirs** : Gestion des abattoirs et chambres froides
- **Personnel** : Gestion des employés et rôles
- **Clients** : Base de données clients
- **Bons de commande** : Système de commandes
- **Transferts** : Suivi des transferts de bétail
- **Analytics** : Tableaux de bord et statistiques

## 🛠️ Technologies

### Backend
- **Django 4.2** - Framework web Python
- **Django REST Framework** - API REST
- **PostgreSQL** - Base de données
- **Redis** - Cache et broker Celery
- **Celery** - Tâches asynchrones
- **JWT** - Authentification

### Frontend
- **Next.js 15** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **React Query** - Gestion d'état
- **Chart.js** - Graphiques

### Infrastructure
- **Docker** - Containerisation
- **Nginx** - Reverse proxy
- **Gunicorn** - Serveur WSGI

## 📋 Prérequis

- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- PostgreSQL
- Redis

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/RayanBoukabous/alviar_commercialisation.git
cd alviar_commercialisation
```

### 2. Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp backend/env.production.example .env.production

# Éditer les variables
nano .env.production
```

### 3. Déploiement

#### Développement
```bash
./start.sh dev
```

#### Production
```bash
./deploy.sh
```

## 🔧 Configuration

### Variables d'environnement obligatoires

```bash
# Django
SECRET_KEY=your-super-secret-key
DEBUG=False
DOMAIN_NAME=your-domain.com

# Base de données
DB_NAME=alviar_production
DB_USER=alviar_user
DB_PASSWORD=your-secure-password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Frontend
FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## 📁 Structure du projet

```
alviar_commercialisation/
├── backend/                 # Backend Django
│   ├── backend/            # Configuration Django
│   ├── users/              # App utilisateurs
│   ├── bete/               # App bétail
│   ├── abattoir/           # App abattoirs
│   ├── client/             # App clients
│   ├── personnel/          # App personnel
│   ├── bon_commande/       # App bons de commande
│   ├── transfert/           # App transferts
│   ├── docker-compose.yml  # Docker dev
│   └── Dockerfile          # Image backend
├── src/                    # Frontend Next.js
│   ├── app/                # Pages Next.js
│   ├── components/         # Composants React
│   ├── lib/                # Utilitaires
│   └── types/              # Types TypeScript
├── docker-compose.production.yml  # Docker production
├── deploy.sh              # Script déploiement
└── start.sh                # Script développement
```

## 🌐 URLs

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **Admin Django** : http://localhost:8000/admin/

## 🔐 Authentification

Le système utilise JWT (JSON Web Tokens) pour l'authentification.

### Endpoints d'authentification

- `POST /api/users/login/` - Connexion
- `POST /api/users/logout/` - Déconnexion
- `POST /api/users/register/` - Inscription
- `GET /api/users/me/` - Profil utilisateur

## 📊 API Endpoints

### Bétail
- `GET /api/betes/` - Liste des bêtes
- `POST /api/betes/` - Créer une bête
- `GET /api/betes/{id}/` - Détails d'une bête
- `PUT /api/betes/{id}/` - Modifier une bête
- `DELETE /api/betes/{id}/` - Supprimer une bête

### Abattoirs
- `GET /api/abattoirs/` - Liste des abattoirs
- `POST /api/abattoirs/` - Créer un abattoir
- `GET /api/abattoirs/{id}/` - Détails d'un abattoir
- `GET /api/abattoirs/stats/` - Statistiques

### Personnel
- `GET /api/personnel/` - Liste du personnel
- `POST /api/personnel/` - Ajouter du personnel
- `GET /api/personnel/{id}/` - Détails d'un employé

### Clients
- `GET /api/clients/` - Liste des clients
- `POST /api/clients/` - Créer un client
- `GET /api/clients/{id}/` - Détails d'un client

### Bons de commande
- `GET /api/bons-commande/` - Liste des bons
- `POST /api/bons-commande/` - Créer un bon
- `GET /api/bons-commande/{id}/` - Détails d'un bon

### Transferts
- `GET /api/transferts/` - Liste des transferts
- `POST /api/transferts/` - Créer un transfert
- `GET /api/transferts/{id}/` - Détails d'un transfert

## 🐳 Docker

### Développement
```bash
# Démarrer tous les services
docker compose up -d

# Voir les logs
docker compose logs -f

# Arrêter les services
docker compose down
```

### Production
```bash
# Déploiement complet
./deploy.sh

# Ou manuellement
docker compose -f docker-compose.production.yml up -d
```

## 📝 Scripts disponibles

- `./start.sh dev` - Mode développement
- `./start.sh prod` - Mode production
- `./start.sh stop` - Arrêter les services
- `./deploy.sh` - Déploiement production

## 🔧 Développement

### Backend
```bash
cd backend
python manage.py runserver
python manage.py migrate
python manage.py createsuperuser
```

### Frontend
```bash
npm run dev
npm run build
npm run start
```

## 📊 Monitoring

- **Logs** : `/app/logs/django.log`
- **Health checks** : Intégrés dans Docker
- **Métriques** : Via Django admin

## 🚀 Déploiement en production

1. **Configurer le serveur**
   ```bash
   # Installer Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Installer Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Cloner et configurer**
   ```bash
   git clone https://github.com/RayanBoukabous/alviar_commercialisation.git
   cd alviar_commercialisation
   cp backend/env.production.example .env.production
   nano .env.production
   ```

3. **Déployer**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Rayan Boukabous**
- GitHub: [@RayanBoukabous](https://github.com/RayanBoukabous)

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

---

**Alviar Dashboard** - Solution professionnelle pour la gestion commerciale du bétail 🐄