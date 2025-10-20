#!/usr/bin/env bash

set -euo pipefail

# ------------------------------------------------------------
# Alviar Dashboard - Unified Startup Script
# ------------------------------------------------------------
# Usage:
#   ./start.sh dev      # Local development (Next dev + Django via docker-compose)
#   ./start.sh prod     # Production-like (Dockerized backend + Next start)
#   ./start.sh stop     # Stop all containers
#   ./start.sh down     # Stop and remove containers, networks, volumes (backend stack)
# ------------------------------------------------------------

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$REPO_DIR/backend"

MODE="${1:-dev}"

log() {
  echo "[alviar:start] $*"
}

fail() {
  echo "[alviar:error] $*" >&2
  exit 1
}

# ------------------------------------------------------------
# Env loading (root .env variants, then backend/.env if present)
# ------------------------------------------------------------
load_env() {
  # Load root env if exists
  if [ -f "$REPO_DIR/env.local" ]; then
    export $(grep -v '^#' "$REPO_DIR/env.local" | xargs -I {} echo {}) || true
  elif [ -f "$REPO_DIR/.env" ]; then
    export $(grep -v '^#' "$REPO_DIR/.env" | xargs -I {} echo {}) || true
  fi

  # Load backend env if exists
  if [ -f "$BACKEND_DIR/.env" ]; then
    export $(grep -v '^#' "$BACKEND_DIR/.env" | xargs -I {} echo {}) || true
  fi
}

# ------------------------------------------------------------
# Prerequisites quick checks
# ------------------------------------------------------------
check_prereqs() {
  command -v docker >/dev/null 2>&1 || fail "Docker n'est pas installé."
  command -v docker compose >/dev/null 2>&1 || command -v docker-compose >/dev/null 2>&1 || fail "docker compose ou docker-compose est requis."
  command -v node >/dev/null 2>&1 || fail "Node.js n'est pas installé."
  command -v npm >/dev/null 2>&1 || fail "npm n'est pas installé."
  command -v curl >/dev/null 2>&1 || fail "curl est requis pour vérifier l'état du backend."
}

# ------------------------------------------------------------
# Docker compose wrapper (supports both docker compose and docker-compose)
# ------------------------------------------------------------
dc() {
  if command -v docker compose >/dev/null 2>&1; then
    docker compose -f "$BACKEND_DIR/docker-compose.yml" "$@"
  else
    docker-compose -f "$BACKEND_DIR/docker-compose.yml" "$@"
  fi
}

# ------------------------------------------------------------
# Backend stack up
# ------------------------------------------------------------
backend_up() {
  log "Lancement du stack backend (Postgres, Redis, Django, Celery)..."
  (cd "$BACKEND_DIR" && dc up -d --build db redis)

  # Build app images and start web + workers
  (cd "$BACKEND_DIR" && dc up -d --build web celery celery-beat)

  log "Backend containers en cours de démarrage. Patience..."
}

# ------------------------------------------------------------
# Wait for backend readiness (Django reachable on :8000)
# ------------------------------------------------------------
wait_for_backend() {
  local url="http://localhost:8000/admin/"
  local attempts=0
  local max_attempts=60
  log "Vérification de la disponibilité du backend sur $url"
  until curl -sf "$url" >/dev/null 2>&1; do
    attempts=$((attempts+1))
    if [ "$attempts" -ge "$max_attempts" ]; then
      fail "Le backend n'est pas prêt après $max_attempts tentatives."
    fi
    sleep 2
  done
  log "Backend prêt."
}

# ------------------------------------------------------------
# Frontend dev (Next.js dev)
# ------------------------------------------------------------
frontend_dev() {
  # Ensure dependencies
  if [ ! -d "$REPO_DIR/node_modules" ]; then
    log "Installation des dépendances frontend..."
    (cd "$REPO_DIR" && npm install --no-audit --no-fund)
  fi

  # Prefer local backend URL for dev
  export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:8000}"
  log "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"

  log "Démarrage du frontend (Next dev)..."
  (cd "$REPO_DIR" && npm run dev)
}

# ------------------------------------------------------------
# Frontend prod-like (Next build + start)
# ------------------------------------------------------------
frontend_prod() {
  if [ ! -d "$REPO_DIR/node_modules" ]; then
    log "Installation des dépendances frontend..."
    (cd "$REPO_DIR" && npm install --no-audit --no-fund)
  fi

  # Default to local backend if not provided
  export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:8000}"
  log "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"

  log "Build du frontend..."
  (cd "$REPO_DIR" && npm run build)

  log "Démarrage du frontend (Next start)..."
  (cd "$REPO_DIR" && npm run start)
}

# ------------------------------------------------------------
# Stop/Down helpers
# ------------------------------------------------------------
backend_stop() {
  (cd "$BACKEND_DIR" && dc stop) || true
}

backend_down() {
  (cd "$BACKEND_DIR" && dc down -v) || true
}

# ------------------------------------------------------------
# Main
# ------------------------------------------------------------
load_env
check_prereqs

case "$MODE" in
  dev)
    log "Mode: développement"
    backend_up
    wait_for_backend
    frontend_dev
    ;;
  prod)
    log "Mode: production-like"
    backend_up
    wait_for_backend
    frontend_prod
    ;;
  stop)
    log "Arrêt des containers backend"
    backend_stop
    ;;
  down)
    log "Arrêt et suppression des containers backend"
    backend_down
    ;;
  *)
    echo "Usage: $0 {dev|prod|stop|down}"
    exit 1
    ;;
esac


