from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .models import User


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
            'user_type', 'user_type_display', 'abattoir', 'phone_number', 'address',
            'email_verified', 'phone_verified', 'language', 'timezone',
            'email_notifications', 'sms_notifications', 'push_notifications',
            'is_active', 'is_staff', 'is_superuser', 'is_locked', 'last_login', 'last_login_ip',
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
            'password_confirm', 'user_type', 'abattoir', 'phone_number', 'address',
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
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour d'utilisateurs"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number', 'address',
            'language', 'timezone', 'email_notifications', 'sms_notifications',
            'push_notifications'
        ]


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
        """Changer le mot de passe"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer pour l'authentification"""
    
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Validation des identifiants"""
        username_or_email = attrs.get('username')
        password = attrs.get('password')
        
        if username_or_email and password:
            user = None
            
            # Essayer d'abord avec le username
            user = authenticate(username=username_or_email, password=password)
            
            # Si ça ne marche pas et que ça ressemble à un email, essayer avec l'email
            if not user and '@' in username_or_email:
                try:
                    # Trouver l'utilisateur par email
                    user_obj = User.objects.get(email=username_or_email)
                    # Authentifier avec le username de cet utilisateur
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            
            if not user:
                raise serializers.ValidationError("Identifiants invalides.")
            if not user.is_active:
                raise serializers.ValidationError("Ce compte utilisateur est désactivé.")
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError("Le nom d'utilisateur/email et le mot de passe sont requis.")
