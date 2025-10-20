from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import login, logout
from django.db.models import Q
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import User, UserSession, PasswordResetToken, EmailVerificationToken
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    # CustomTokenObtainPairSerializer, LoginSerializer,
    # PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    # EmailVerificationSerializer, ChangePasswordSerializer,
    # UserSessionSerializer
)


class UserListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer des utilisateurs"""
    
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer
    
    def get_queryset(self):
        """Filtrage des utilisateurs selon les permissions"""
        queryset = User.objects.all()
        
        # Filtrage par type d'utilisateur
        user_type = self.request.query_params.get('user_type', None)
        if user_type:
            queryset = queryset.filter(user_type=user_type)
        
        # Filtrage par recherche
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        
        return queryset.order_by('-created_at')


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer un utilisateur"""
    
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Vue pour le profil de l'utilisateur connecté"""
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """Changement de mot de passe"""
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Mot de passe modifié avec succès.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Vue JWT personnalisée avec informations utilisateur"""
    serializer_class = CustomTokenObtainPairSerializer


class LoginView(APIView):
    """Vue de connexion avec JWT et gestion des sessions"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh_token = serializer.validated_data['refresh']
            access_token = serializer.validated_data['access']
            
            return Response({
                'access': access_token,
                'refresh': refresh_token,
                'user': UserSerializer(user).data,
                'message': 'Connexion réussie.'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Vue de déconnexion avec invalidation des tokens"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            # Désactiver la session actuelle
            device_fingerprint = request.META.get('HTTP_DEVICE_FINGERPRINT')
            if device_fingerprint:
                UserSession.objects.filter(
                    user=request.user,
                    device_fingerprint=device_fingerprint
                ).update(is_active=False)
            
            return Response({'message': 'Déconnexion réussie.'})
        except TokenError:
            return Response(
                {'error': 'Token invalide.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class LogoutAllView(APIView):
    """Vue pour déconnecter tous les appareils"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Désactiver toutes les sessions
        UserSession.objects.filter(user=request.user).update(is_active=False)
        
        return Response({'message': 'Déconnexion de tous les appareils réussie.'})


class PasswordResetRequestView(APIView):
    """Vue pour demander une réinitialisation de mot de passe"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.save()
            
            # Envoyer l'email de réinitialisation
            user = token.user
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{token.token}"
            
            send_mail(
                subject='Réinitialisation de votre mot de passe - Alviar Dashboard',
                message=f'''
Bonjour {user.full_name},

Vous avez demandé une réinitialisation de votre mot de passe.

Cliquez sur le lien suivant pour réinitialiser votre mot de passe :
{reset_url}

Ce lien est valide pendant 24 heures.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cordialement,
L'équipe Alviar Dashboard
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'Email de réinitialisation envoyé avec succès.'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """Vue pour confirmer la réinitialisation de mot de passe"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            return Response({
                'message': 'Mot de passe réinitialisé avec succès.',
                'user': UserSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmailVerificationView(APIView):
    """Vue pour vérifier l'email"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            return Response({
                'message': 'Email vérifié avec succès.',
                'user': UserSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendEmailVerificationView(APIView):
    """Vue pour renvoyer l'email de vérification"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        if user.email_verified:
            return Response(
                {'error': 'Email déjà vérifié.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Désactiver les anciens tokens
        EmailVerificationToken.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Créer un nouveau token
        token = EmailVerificationToken.objects.create(user=user)
        
        # Envoyer l'email de vérification
        verification_url = f"{settings.FRONTEND_URL}/verify-email/{token.token}"
        
        send_mail(
            subject='Vérification de votre email - Alviar Dashboard',
            message=f'''
Bonjour {user.full_name},

Veuillez cliquer sur le lien suivant pour vérifier votre adresse email :
{verification_url}

Ce lien est valide pendant 24 heures.

Cordialement,
L'équipe Alviar Dashboard
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        return Response({
            'message': 'Email de vérification renvoyé avec succès.'
        })


class ChangePasswordView(APIView):
    """Vue pour changer le mot de passe"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()
            
            return Response({
                'message': 'Mot de passe changé avec succès.',
                'user': UserSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserSessionsView(generics.ListAPIView):
    """Vue pour lister les sessions utilisateur"""
    serializer_class = UserSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserSession.objects.filter(
            user=self.request.user,
            is_active=True
        ).order_by('-last_activity')


class RevokeSessionView(APIView):
    """Vue pour révoquer une session"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, session_id):
        try:
            session = UserSession.objects.get(
                id=session_id,
                user=request.user
            )
            session.is_active = False
            session.save()
            
            return Response({'message': 'Session révoquée avec succès.'})
        except UserSession.DoesNotExist:
            return Response(
                {'error': 'Session non trouvée.'},
                status=status.HTTP_404_NOT_FOUND
            )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """Statistiques des utilisateurs"""
    stats = {
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(is_active=True).count(),
        'aliment_sheptel': User.objects.filter(user_type='ALIMENT_SHEPTEL').count(),
        'production': User.objects.filter(user_type='PRODUCTION').count(),
        'superviseur': User.objects.filter(user_type='SUPERVISEUR').count(),
    }
    return Response(stats)