from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from datetime import timedelta
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, UserSession, PasswordResetToken, EmailVerificationToken
import uuid
import hashlib


# class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
#     """Serializer JWT personnalisé avec informations utilisateur"""
#     
#     @classmethod
#     def get_token(cls, user):
#         token = super().get_token(user)
#         
#         # Ajouter des claims personnalisés
#         token['user_type'] = user.user_type
#         token['email_verified'] = user.email_verified
#         token['phone_verified'] = user.phone_verified
#         token['language'] = user.language
#         token['timezone'] = user.timezone
#         
#         return token
#     
#     def validate(self, attrs):
#         data = super().validate(attrs)
#         
#         # Vérifier si le compte est verrouillé
#         if self.user.is_locked:
#             raise serializers.ValidationError("Compte temporairement verrouillé. Réessayez plus tard.")
#         
#         # Vérifier si l'email est vérifié
#         if not self.user.email_verified:
#             data['email_verification_required'] = True
#         
#         # Ajouter les informations utilisateur
#         data['user'] = UserSerializer(self.user).data
#         
#         return data


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour les utilisateurs"""
    
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    full_name = serializers.ReadOnlyField()
    is_locked = serializers.ReadOnlyField()
    days_since_password_change = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'user_type', 'user_type_display', 'phone_number', 'address',
            'email_verified', 'phone_verified', 'language', 'timezone',
            'email_notifications', 'sms_notifications', 'push_notifications',
            'is_active', 'is_staff', 'is_locked', 'last_login', 'last_login_ip',
            'date_joined', 'created_at', 'updated_at', 'days_since_password_change'
        ]
        read_only_fields = [
            'id', 'date_joined', 'created_at', 'updated_at', 'last_login',
            'last_login_ip', 'is_locked', 'days_since_password_change'
        ]
    
    def get_days_since_password_change(self, obj):
        """Calcule le nombre de jours depuis le changement de mot de passe"""
        if obj.password_changed_at:
            return (timezone.now().date() - obj.password_changed_at.date()).days
        return 0


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'utilisateurs"""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 'password',
            'password_confirm', 'user_type', 'phone_number', 'address',
            'language', 'timezone', 'email_notifications', 'sms_notifications',
            'push_notifications'
        ]
    
    def validate(self, attrs):
        """Validation des données"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        
        # Vérifier l'unicité de l'email
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError("Un utilisateur avec cet email existe déjà.")
        
        return attrs
    
    def create(self, validated_data):
        """Création d'un nouvel utilisateur"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Créer un token de vérification d'email
        EmailVerificationToken.objects.create(user=user)
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour d'utilisateurs"""
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 'user_type',
            'phone_number', 'address', 'is_active'
        ]
    
    def update(self, instance, validated_data):
        """Mise à jour d'un utilisateur existant"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer pour le changement de mot de passe"""
    
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_old_password(self, value):
        """Validation de l'ancien mot de passe"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("L'ancien mot de passe est incorrect.")
        return value
    
    def validate(self, attrs):
        """Validation des données"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Les nouveaux mots de passe ne correspondent pas.")
        return attrs
    
    def save(self):
        """Sauvegarde du nouveau mot de passe"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


# class LoginSerializer(serializers.Serializer):
#     """Serializer pour l'authentification avec JWT"""
#     
#     username = serializers.CharField()
#     password = serializers.CharField(write_only=True)
#     device_fingerprint = serializers.CharField(required=False)
#     remember_me = serializers.BooleanField(default=False)
#     
#     def validate(self, attrs):
#         """Validation des identifiants"""
#         username = attrs.get('username')
#         password = attrs.get('password')
#         device_fingerprint = attrs.get('device_fingerprint')
#         
#         if username and password:
#             user = authenticate(username=username, password=password)
#             if not user:
#                 # Incrémenter les tentatives de connexion échouées
#                 try:
#                     user_obj = User.objects.get(username=username)
#                     user_obj.increment_login_attempts()
#                 except User.DoesNotExist:
#                     pass
#                 raise serializers.ValidationError("Identifiants invalides.")
#             
#             if not user.is_active:
#                 raise serializers.ValidationError("Ce compte utilisateur est désactivé.")
#             
#             if user.is_locked:
#                 raise serializers.ValidationError("Compte temporairement verrouillé. Réessayez plus tard.")
#             
#             # Réinitialiser les tentatives de connexion
#             user.reset_login_attempts()
#             
#             # Générer les tokens JWT
#             refresh = RefreshToken.for_user(user)
#             access_token = refresh.access_token
#             
#             # Ajouter des claims personnalisés
#             access_token['user_type'] = user.user_type
#             access_token['email_verified'] = user.email_verified
#             
#             # Créer ou mettre à jour la session
#             if device_fingerprint:
#                 session, created = UserSession.objects.get_or_create(
#                     user=user,
#                     device_fingerprint=device_fingerprint,
#                     defaults={
#                         'ip_address': self.context['request'].META.get('REMOTE_ADDR'),
#                         'user_agent': self.context['request'].META.get('HTTP_USER_AGENT', ''),
#                         'expires_at': timezone.now() + timedelta(days=30 if attrs.get('remember_me') else 7)
#                     }
#                 )
#                 if not created:
#                     session.extend_session(30 if attrs.get('remember_me') else 7)
#                     session.is_active = True
#                     session.save()
#             
#             # Mettre à jour les informations de connexion
#             user.update_last_login_info(
#                 ip_address=self.context['request'].META.get('REMOTE_ADDR'),
#                 device_fingerprint=device_fingerprint
#             )
#             
#             attrs['user'] = user
#             attrs['refresh'] = str(refresh)
#             attrs['access'] = str(access_token)
#             return attrs
#         else:
#             raise serializers.ValidationError("Le nom d'utilisateur et le mot de passe sont requis.")


# class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer pour demander une réinitialisation de mot de passe"""
    
    email = serializers.EmailField()
    
    def validate_email(self, value):
        """Validation de l'email"""
        try:
            user = User.objects.get(email=value, is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError("Aucun utilisateur actif trouvé avec cet email.")
        return value
    
    def save(self):
        """Créer un token de réinitialisation"""
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        
        # Désactiver les anciens tokens
        PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Créer un nouveau token
        token = PasswordResetToken.objects.create(user=user)
        return token


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer pour confirmer la réinitialisation de mot de passe"""
    
    token = serializers.UUIDField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Validation des données"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Les nouveaux mots de passe ne correspondent pas.")
        
        try:
            reset_token = PasswordResetToken.objects.get(
                token=attrs['token'],
                is_used=False
            )
            if reset_token.is_expired:
                raise serializers.ValidationError("Le token de réinitialisation a expiré.")
            attrs['reset_token'] = reset_token
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Token de réinitialisation invalide.")
        
        return attrs
    
    def save(self):
        """Réinitialiser le mot de passe"""
        reset_token = self.validated_data['reset_token']
        new_password = self.validated_data['new_password']
        
        user = reset_token.user
        user.set_password(new_password)
        user.password_changed_at = timezone.now()
        user.save()
        
        # Marquer le token comme utilisé
        reset_token.is_used = True
        reset_token.save()
        
        # Désactiver toutes les sessions existantes
        UserSession.objects.filter(user=user).update(is_active=False)
        
        return user


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer pour la vérification d'email"""
    
    token = serializers.UUIDField()
    
    def validate_token(self, value):
        """Validation du token"""
        try:
            verification_token = EmailVerificationToken.objects.get(
                token=value,
                is_used=False
            )
            if verification_token.is_expired:
                raise serializers.ValidationError("Le token de vérification a expiré.")
            self.verification_token = verification_token
        except EmailVerificationToken.DoesNotExist:
            raise serializers.ValidationError("Token de vérification invalide.")
        return value
    
    def save(self):
        """Vérifier l'email"""
        verification_token = self.verification_token
        user = verification_token.user
        
        user.email_verified = True
        user.save()
        
        # Marquer le token comme utilisé
        verification_token.is_used = True
        verification_token.save()
        
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer pour le changement de mot de passe"""
    
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_old_password(self, value):
        """Validation de l'ancien mot de passe"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("L'ancien mot de passe est incorrect.")
        return value
    
    def validate(self, attrs):
        """Validation des données"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Les nouveaux mots de passe ne correspondent pas.")
        return attrs
    
    def save(self):
        """Changer le mot de passe"""
        user = self.context['request'].user
        new_password = self.validated_data['new_password']
        
        user.set_password(new_password)
        user.password_changed_at = timezone.now()
        user.save()
        
        # Désactiver toutes les sessions existantes sauf la session actuelle
        current_session = self.context['request'].META.get('HTTP_DEVICE_FINGERPRINT')
        UserSession.objects.filter(user=user).exclude(
            device_fingerprint=current_session
        ).update(is_active=False)
        
        return user


class UserSessionSerializer(serializers.ModelSerializer):
    """Serializer pour les sessions utilisateur"""
    
    device_info = serializers.SerializerMethodField()
    is_current = serializers.SerializerMethodField()
    
    class Meta:
        model = UserSession
        fields = [
            'id', 'session_token', 'device_fingerprint', 'device_info',
            'ip_address', 'is_active', 'created_at', 'last_activity',
            'expires_at', 'is_current'
        ]
        read_only_fields = ['id', 'session_token', 'created_at']
    
    def get_device_info(self, obj):
        """Extraire les informations de l'appareil depuis user_agent"""
        user_agent = obj.user_agent or ''
        # Logique simple pour extraire les informations de l'appareil
        if 'Mobile' in user_agent:
            return 'Mobile'
        elif 'Tablet' in user_agent:
            return 'Tablet'
        else:
            return 'Desktop'
    
    def get_is_current(self, obj):
        """Vérifier si c'est la session actuelle"""
        request = self.context.get('request')
        if request:
            current_fingerprint = request.META.get('HTTP_DEVICE_FINGERPRINT')
            return obj.device_fingerprint == current_fingerprint
        return False
