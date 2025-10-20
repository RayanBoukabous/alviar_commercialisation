# 🔐 Configuration JWT Avancée - Alviar Dashboard

## 📋 Vue d'ensemble

Le système d'authentification JWT a été conçu avec des fonctionnalités avancées de sécurité et de gestion des sessions. Voici comment l'activer et l'utiliser.

## 🚀 Installation des dépendances JWT

```bash
pip install djangorestframework-simplejwt
```

## ⚙️ Configuration

### 1. Activer JWT dans settings.py

```python
INSTALLED_APPS = [
    # ... autres apps
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
]

# Configuration JWT
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}
```

### 2. Activer l'authentification JWT

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
}
```

### 3. Restaurer les fichiers JWT

```bash
# Restaurer les serializers JWT
mv users/serializers.py users/serializers_basic.py
mv users/serializers_jwt.py users/serializers.py

# Restaurer les vues JWT
mv users/views.py users/views_basic.py
mv users/views_jwt.py users/views.py

# Restaurer les URLs JWT
# Décommenter les URLs JWT dans users/urls.py
```

## 🔑 Fonctionnalités JWT Avancées

### 1. Authentification avec Sessions Multi-Appareils

```python
# Login avec empreinte d'appareil
POST /api/users/auth/login/
{
    "username": "admin",
    "password": "password123",
    "device_fingerprint": "unique_device_id",
    "remember_me": true
}
```

### 2. Gestion des Sessions

```python
# Lister les sessions actives
GET /api/users/sessions/

# Révoquer une session spécifique
POST /api/users/sessions/{session_id}/revoke/

# Déconnecter tous les appareils
POST /api/users/auth/logout-all/
```

### 3. Réinitialisation de Mot de Passe

```python
# Demander une réinitialisation
POST /api/users/auth/password-reset/
{
    "email": "user@example.com"
}

# Confirmer la réinitialisation
POST /api/users/auth/password-reset/confirm/
{
    "token": "uuid-token",
    "new_password": "newpassword123",
    "new_password_confirm": "newpassword123"
}
```

### 4. Vérification d'Email

```python
# Vérifier l'email
POST /api/users/auth/verify-email/
{
    "token": "uuid-token"
}

# Renvoyer l'email de vérification
POST /api/users/auth/resend-verification/
```

## 🛡️ Sécurité Avancée

### 1. Verrouillage de Compte

- **Tentatives échouées** : 5 tentatives maximum
- **Durée de verrouillage** : 30 minutes
- **Réinitialisation automatique** après connexion réussie

### 2. Gestion des Tokens

- **Access Token** : 60 minutes
- **Refresh Token** : 7 jours
- **Rotation automatique** des tokens
- **Blacklist** des anciens tokens

### 3. Sessions Multi-Appareils

- **Empreinte d'appareil** unique
- **Géolocalisation** par IP
- **User-Agent** tracking
- **Expiration** configurable

## 📊 Modèles de Données

### User (Modèle Principal)
```python
class User(AbstractUser):
    # Authentification
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    
    # Sécurité
    last_login_ip = models.GenericIPAddressField()
    login_attempts = models.PositiveIntegerField(default=0)
    locked_until = models.DateTimeField()
    password_changed_at = models.DateTimeField()
    
    # Sessions
    device_fingerprint = models.CharField(max_length=255)
    
    # Préférences
    language = models.CharField(max_length=10, default='fr')
    timezone = models.CharField(max_length=50, default='Africa/Algiers')
    
    # Notifications
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=True)
```

### UserSession
```python
class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_token = models.UUIDField(unique=True)
    device_fingerprint = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField()
```

### PasswordResetToken
```python
class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(unique=True)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
```

## 🔄 Migration des Données

```bash
# Appliquer les migrations JWT
python manage.py makemigrations users
python manage.py migrate

# Créer les tokens de vérification pour les utilisateurs existants
python manage.py shell
>>> from users.models import User, EmailVerificationToken
>>> for user in User.objects.filter(email_verified=False):
...     EmailVerificationToken.objects.create(user=user)
```

## 🧪 Tests

```python
# Test de connexion
def test_login():
    response = client.post('/api/users/auth/login/', {
        'username': 'admin',
        'password': 'password123',
        'device_fingerprint': 'test_device'
    })
    assert response.status_code == 200
    assert 'access' in response.data
    assert 'refresh' in response.data

# Test de session
def test_sessions():
    client.force_authenticate(user=user)
    response = client.get('/api/users/sessions/')
    assert response.status_code == 200
```

## 📱 Intégration Frontend

### 1. Stockage des Tokens

```javascript
// Stocker les tokens
localStorage.setItem('access_token', response.data.access);
localStorage.setItem('refresh_token', response.data.refresh);

// Headers d'authentification
const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Device-Fingerprint': deviceFingerprint
};
```

### 2. Gestion des Sessions

```javascript
// Vérifier les sessions actives
const sessions = await api.get('/api/users/sessions/');

// Révoquer une session
await api.post(`/api/users/sessions/${sessionId}/revoke/`);
```

## 🚨 Sécurité en Production

1. **HTTPS obligatoire** pour tous les endpoints
2. **Rate limiting** sur les endpoints d'authentification
3. **Monitoring** des tentatives de connexion
4. **Rotation** régulière des clés de signature
5. **Logs** détaillés des activités d'authentification

## 📞 Support

Pour toute question sur l'implémentation JWT, consultez :
- [Documentation Django REST Framework JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- [Guide de sécurité JWT](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

**Note** : Ce système JWT est prêt pour la production avec toutes les fonctionnalités de sécurité modernes ! 🚀






