#!/bin/bash

# ===========================================
# SCRIPT DE DÉPLOIEMENT PRODUCTION - ALVIAR
# ===========================================

set -euo pipefail

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Vérification des prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    command -v docker >/dev/null 2>&1 || error "Docker n'est pas installé"
    command -v docker compose >/dev/null 2>&1 || command -v docker-compose >/dev/null 2>&1 || error "docker compose n'est pas installé"
    command -v openssl >/dev/null 2>&1 || warning "OpenSSL n'est pas installé (requis pour SSL)"
    
    success "Prérequis vérifiés"
}

# Chargement des variables d'environnement
load_environment() {
    log "Chargement des variables d'environnement..."
    
    if [ ! -f ".env.production" ]; then
        error "Fichier .env.production non trouvé. Copiez env.production.example et configurez-le."
    fi
    
    export $(grep -v '^#' .env.production | xargs)
    success "Variables d'environnement chargées"
}

# Création des répertoires nécessaires
create_directories() {
    log "Création des répertoires nécessaires..."
    
    mkdir -p logs
    mkdir -p ssl
    mkdir -p backend/logs
    
    success "Répertoires créés"
}

# Génération des certificats SSL (auto-signés pour le test)
generate_ssl_certificates() {
    log "Génération des certificats SSL..."
    
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=FR/ST=Alger/L=Alger/O=Alviar/CN=${DOMAIN_NAME:-localhost}"
        success "Certificats SSL générés"
    else
        warning "Certificats SSL déjà présents"
    fi
}

# Construction des images Docker
build_images() {
    log "Construction des images Docker..."
    
    # Backend
    log "Construction de l'image backend..."
    docker build -t alviar-backend ./backend
    
    # Frontend
    log "Construction de l'image frontend..."
    docker build -f Dockerfile.frontend -t alviar-frontend .
    
    success "Images construites"
}

# Déploiement avec Docker Compose
deploy() {
    log "Déploiement avec Docker Compose..."
    
    # Arrêt des services existants
    log "Arrêt des services existants..."
    docker compose -f docker-compose.production.yml down || true
    
    # Démarrage des services
    log "Démarrage des services..."
    docker compose -f docker-compose.production.yml up -d
    
    success "Services déployés"
}

# Vérification de la santé des services
health_check() {
    log "Vérification de la santé des services..."
    
    # Attendre que les services soient prêts
    sleep 30
    
    # Vérifier PostgreSQL
    if docker compose -f docker-compose.production.yml exec -T db pg_isready -U ${DB_USER:-alviar_user} >/dev/null 2>&1; then
        success "PostgreSQL est prêt"
    else
        error "PostgreSQL n'est pas prêt"
    fi
    
    # Vérifier Redis
    if docker compose -f docker-compose.production.yml exec -T redis redis-cli ping >/dev/null 2>&1; then
        success "Redis est prêt"
    else
        error "Redis n'est pas prêt"
    fi
    
    # Vérifier Django
    if curl -f http://localhost:8000/admin/ >/dev/null 2>&1; then
        success "Django est prêt"
    else
        error "Django n'est pas prêt"
    fi
    
    # Vérifier Next.js
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        success "Next.js est prêt"
    else
        error "Next.js n'est pas prêt"
    fi
}

# Migration de la base de données
run_migrations() {
    log "Exécution des migrations de base de données..."
    
    docker compose -f docker-compose.production.yml exec -T web python manage.py migrate --noinput
    
    success "Migrations exécutées"
}

# Collecte des fichiers statiques
collect_static() {
    log "Collecte des fichiers statiques..."
    
    docker compose -f docker-compose.production.yml exec -T web python manage.py collectstatic --noinput
    
    success "Fichiers statiques collectés"
}

# Création d'un superutilisateur (optionnel)
create_superuser() {
    log "Création d'un superutilisateur..."
    
    read -p "Voulez-vous créer un superutilisateur ? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose -f docker-compose.production.yml exec -T web python manage.py createsuperuser
        success "Superutilisateur créé"
    fi
}

# Affichage des informations de déploiement
show_deployment_info() {
    log "Informations de déploiement:"
    echo "=================================="
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8000"
    echo "📊 Admin Django: http://localhost:8000/admin/"
    echo "🗄️  Base de données: PostgreSQL sur port 5432"
    echo "📦 Cache: Redis sur port 6379"
    echo "=================================="
    
    success "Déploiement terminé avec succès !"
}

# Fonction principale
main() {
    log "Début du déploiement Alviar Dashboard..."
    
    check_prerequisites
    load_environment
    create_directories
    generate_ssl_certificates
    build_images
    deploy
    run_migrations
    collect_static
    create_superuser
    health_check
    show_deployment_info
}

# Exécution du script
main "$@"
