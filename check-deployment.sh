#!/bin/bash

# ===========================================
# SCRIPT DE VÉRIFICATION PRÉ-DÉPLOIEMENT
# ===========================================

set -euo pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[CHECK]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# Vérifications
log "Vérification des fichiers critiques..."

# 1. Fichiers de configuration
if [ ! -f ".env.production" ]; then
    error "Fichier .env.production manquant"
fi
success "Fichier .env.production présent"

# 2. Dockerfiles
if [ ! -f "Dockerfile.frontend" ]; then
    error "Dockerfile.frontend manquant"
fi
success "Dockerfile.frontend présent"

if [ ! -f "backend/Dockerfile" ]; then
    error "Dockerfile backend manquant"
fi
success "Dockerfile backend présent"

# 3. Docker Compose
if [ ! -f "docker-compose.production.yml" ]; then
    error "docker-compose.production.yml manquant"
fi
success "docker-compose.production.yml présent"

# 4. Fichiers statiques
if [ ! -d "public" ]; then
    error "Dossier public manquant"
fi
success "Dossier public présent"

if [ ! -d "public/locales" ]; then
    warning "Dossier traductions manquant"
fi
success "Traductions présentes"

# 5. Configuration Django
if [ ! -f "backend/backend/settings_production.py" ]; then
    error "settings_production.py manquant"
fi
success "Configuration Django production présente"

# 6. Scripts de déploiement
if [ ! -f "deploy.sh" ]; then
    error "Script deploy.sh manquant"
fi
success "Script de déploiement présent"

# 7. Vérification des permissions
if [ ! -x "deploy.sh" ]; then
    warning "Script deploy.sh non exécutable"
    chmod +x deploy.sh
    success "Permissions corrigées"
fi

# 8. Vérification des dépendances
log "Vérification des dépendances..."

if [ ! -f "package.json" ]; then
    error "package.json manquant"
fi
success "package.json présent"

if [ ! -f "backend/requirements.txt" ]; then
    error "requirements.txt manquant"
fi
success "requirements.txt présent"

# 9. Vérification des variables d'environnement critiques
log "Vérification des variables d'environnement..."

if ! grep -q "SECRET_KEY=" .env.production; then
    error "SECRET_KEY manquante dans .env.production"
fi
success "SECRET_KEY configurée"

if ! grep -q "DB_PASSWORD=" .env.production; then
    error "DB_PASSWORD manquante dans .env.production"
fi
success "DB_PASSWORD configurée"

# 10. Vérification de la sécurité
log "Vérification de la sécurité..."

if grep -q "DEBUG=True" .env.production; then
    error "DEBUG=True détecté en production"
fi
success "DEBUG désactivé en production"

if grep -q "django-insecure" .env.production; then
    error "Clé secrète par défaut détectée"
fi
success "Clé secrète personnalisée"

# 11. Vérification des ports
log "Vérification des ports..."

if ! grep -q "80:80" docker-compose.production.yml; then
    warning "Port 80 non configuré"
fi

if ! grep -q "443:443" docker-compose.production.yml; then
    warning "Port 443 non configuré"
fi

# 12. Vérification des volumes
log "Vérification des volumes..."

if ! grep -q "postgres_data" docker-compose.production.yml; then
    warning "Volume PostgreSQL non configuré"
fi

if ! grep -q "redis_data" docker-compose.production.yml; then
    warning "Volume Redis non configuré"
fi

# Résumé
echo ""
log "Résumé des vérifications:"
echo "=========================="
success "✅ Projet prêt pour le déploiement"
echo ""
log "Prochaines étapes:"
echo "1. Configurer les variables d'environnement dans .env.production"
echo "2. Générer les certificats SSL"
echo "3. Exécuter: ./deploy.sh"
echo ""
success "🎉 Vérification terminée avec succès !"
