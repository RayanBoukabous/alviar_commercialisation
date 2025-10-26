# Utiliser l'image Python officielle
FROM python:3.11-slim

# Définir les variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    postgresql-client \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copier et installer les dépendances Python
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copier le projet
COPY . /app/

# Créer un utilisateur non-root et configurer les permissions
RUN adduser --disabled-password --gecos '' appuser \
    && chown -R appuser:appuser /app \
    && mkdir -p /app/staticfiles \
    && mkdir -p /app/media \
    && chown -R appuser:appuser /app/staticfiles \
    && chown -R appuser:appuser /app/media
USER appuser

# Exposer le port
EXPOSE 8000

# Commande par défaut
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "backend.wsgi:application"]









