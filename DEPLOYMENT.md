# 🚀 Guide de Déploiement - Alviar Dashboard

## 📋 Prérequis

### Serveur de Production
- **OS** : Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM** : Minimum 4GB (Recommandé 8GB+)
- **CPU** : 2 cœurs minimum
- **Stockage** : 50GB+ d'espace libre
- **Réseau** : Accès internet stable

### Logiciels Requis
```bash
# Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Outils utiles
sudo apt update
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx
```

## 🔧 Configuration Initiale

### 1. Cloner le Repository
```bash
git clone https://github.com/RayanBoukabous/alviar_commercialisation.git
cd alviar_commercialisation
```

### 2. Configuration des Variables d'Environnement
```bash
# Copier le fichier d'exemple
cp backend/env.production.example .env.production

# Éditer les variables
nano .env.production
```

### Variables Obligatoires
```bash
# Django
SECRET_KEY=your-super-secret-key-here-change-this-in-production
DEBUG=False
DOMAIN_NAME=your-domain.com
API_DOMAIN=api.your-domain.com

# Base de données
DB_NAME=alviar_production
DB_USER=alviar_user
DB_PASSWORD=your-super-secure-database-password
DB_HOST=localhost
DB_PORT=5432
DB_SSL=True

# Redis
REDIS_URL=redis://localhost:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@alviar.com

# Frontend
FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

## 🚀 Déploiement

### Méthode 1 : Script Automatique (Recommandé)
```bash
# Vérification pré-déploiement
./check-deployment.sh

# Déploiement automatique
./deploy.sh
```

### Méthode 2 : Déploiement Manuel
```bash
# 1. Créer les répertoires nécessaires
mkdir -p logs ssl backend/logs

# 2. Générer les certificats SSL (auto-signés pour test)
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=FR/ST=Alger/L=Alger/O=Alviar/CN=your-domain.com"

# 3. Construire les images
docker build -t alviar-backend ./backend
docker build -f Dockerfile.frontend -t alviar-frontend .

# 4. Démarrer les services
docker compose -f docker-compose.production.yml up -d

# 5. Migrations et collecte des statiques
docker compose -f docker-compose.production.yml exec web python manage.py migrate --noinput
docker compose -f docker-compose.production.yml exec web python manage.py collectstatic --noinput

# 6. Créer un superutilisateur
docker compose -f docker-compose.production.yml exec web python manage.py createsuperuser
```

## 🔒 Configuration SSL/HTTPS

### Option 1 : Certificats Let's Encrypt (Recommandé)
```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

### Option 2 : Certificats Auto-signés (Test uniquement)
```bash
# Générer les certificats
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=FR/ST=Alger/L=Alger/O=Alviar/CN=your-domain.com"
```

## 📊 Monitoring et Maintenance

### Vérification de l'État des Services
```bash
# État des conteneurs
docker compose -f docker-compose.production.yml ps

# Logs en temps réel
docker compose -f docker-compose.production.yml logs -f

# Logs spécifiques
docker compose -f docker-compose.production.yml logs web
docker compose -f docker-compose.production.yml logs frontend
```

### Sauvegarde de la Base de Données
```bash
# Sauvegarde manuelle
docker compose -f docker-compose.production.yml exec db pg_dump -U alviar_user alviar_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Restauration
docker compose -f docker-compose.production.yml exec -T db psql -U alviar_user alviar_production < backup_file.sql
```

### Mise à Jour de l'Application
```bash
# 1. Sauvegarder la base de données
docker compose -f docker-compose.production.yml exec db pg_dump -U alviar_user alviar_production > backup_before_update.sql

# 2. Arrêter les services
docker compose -f docker-compose.production.yml down

# 3. Mettre à jour le code
git pull origin main

# 4. Reconstruire les images
docker build -t alviar-backend ./backend
docker build -f Dockerfile.frontend -t alviar-frontend .

# 5. Redémarrer les services
docker compose -f docker-compose.production.yml up -d

# 6. Migrations
docker compose -f docker-compose.production.yml exec web python manage.py migrate --noinput
```

## 🛠️ Dépannage

### Problèmes Courants

#### 1. Services ne démarrent pas
```bash
# Vérifier les logs
docker compose -f docker-compose.production.yml logs

# Vérifier les ports
netstat -tulpn | grep :80
netstat -tulpn | grep :443
netstat -tulpn | grep :8000
```

#### 2. Erreurs de base de données
```bash
# Vérifier la connexion PostgreSQL
docker compose -f docker-compose.production.yml exec db pg_isready -U alviar_user

# Tester la connexion
docker compose -f docker-compose.production.yml exec web python manage.py dbshell
```

#### 3. Problèmes de fichiers statiques
```bash
# Recollecter les fichiers statiques
docker compose -f docker-compose.production.yml exec web python manage.py collectstatic --noinput --clear

# Vérifier les permissions
docker compose -f docker-compose.production.yml exec web ls -la /app/staticfiles/
```

#### 4. Problèmes de cache Redis
```bash
# Vérifier Redis
docker compose -f docker-compose.production.yml exec redis redis-cli ping

# Nettoyer le cache
docker compose -f docker-compose.production.yml exec redis redis-cli flushall
```

### Commandes de Diagnostic
```bash
# État des conteneurs
docker compose -f docker-compose.production.yml ps

# Utilisation des ressources
docker stats

# Espace disque
df -h

# Mémoire
free -h

# Processus
htop
```

## 🔐 Sécurité

### Configuration Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# iptables (CentOS/RHEL)
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -j DROP
```

### Mise à Jour du Système
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

## 📈 Optimisation des Performances

### Configuration Nginx
```nginx
# Ajouter dans nginx.conf
worker_processes auto;
worker_connections 1024;

# Compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Cache
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Configuration Django
```python
# Dans settings_production.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://redis:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Session cache
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

## 🌐 URLs de Production

- **Frontend** : `https://your-domain.com`
- **Backend API** : `https://api.your-domain.com`
- **Admin Django** : `https://api.your-domain.com/admin/`
- **Documentation API** : `https://api.your-domain.com/api/docs/`

## 📞 Support

### Logs Importants
- **Django** : `/app/logs/django.log`
- **Nginx** : `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- **PostgreSQL** : `/var/log/postgresql/postgresql.log`

### Contacts
- **Développeur** : Rayan Boukabous
- **GitHub** : [@RayanBoukabous](https://github.com/RayanBoukabous)
- **Issues** : [GitHub Issues](https://github.com/RayanBoukabous/alviar_commercialisation/issues)

---

**🎉 Félicitations ! Votre Alviar Dashboard est maintenant déployé en production !**
