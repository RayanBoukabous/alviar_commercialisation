from rest_framework import serializers
from django.conf import settings
from django.contrib.auth import get_user_model
from abattoir.models import Abattoir
from bete.models import Bete
from .models import Transfert

User = get_user_model()


class AbattoirSerializer(serializers.ModelSerializer):
    """Serializer pour les informations d'abattoir"""
    
    class Meta:
        model = Abattoir
        fields = ['id', 'nom', 'wilaya', 'commune']


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour les informations d'utilisateur"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['nom'] = f"{instance.first_name} {instance.last_name}".strip() or instance.username
        return data


class BeteSerializer(serializers.ModelSerializer):
    """Serializer pour les informations de bête"""
    
    espece_nom = serializers.CharField(source='espece.nom', read_only=True)
    
    class Meta:
        model = Bete
        fields = ['id', 'num_boucle', 'espece_nom', 'sexe', 'poids_vif']


class TransfertSerializer(serializers.ModelSerializer):
    """Serializer pour les transferts"""
    
    abattoir_expediteur = AbattoirSerializer(read_only=True)
    abattoir_destinataire = AbattoirSerializer(read_only=True)
    cree_par = UserSerializer(read_only=True)
    valide_par = UserSerializer(read_only=True)
    betes = BeteSerializer(many=True, read_only=True)
    nombre_betes = serializers.ReadOnlyField()
    est_modifiable = serializers.ReadOnlyField()
    est_annulable = serializers.ReadOnlyField()
    est_livrable = serializers.ReadOnlyField()
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Transfert
        fields = [
            'id',
            'numero_transfert',
            'abattoir_expediteur',
            'abattoir_destinataire',
            'betes',
            'nombre_betes',
            'statut',
            'statut_display',
            'date_creation',
            'date_livraison',
            'date_annulation',
            'cree_par',
            'valide_par',
            'note',
            'est_modifiable',
            'est_annulable',
            'est_livrable',
            'created_at',
            'updated_at'
        ]


class CreateTransfertSerializer(serializers.ModelSerializer):
    """Serializer pour la création de transferts"""
    
    abattoir_expediteur_id = serializers.IntegerField(write_only=True, required=False)
    abattoir_destinataire_id = serializers.IntegerField(write_only=True)
    betes_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    nombre_betes_aleatoire = serializers.IntegerField(
        write_only=True,
        required=False,
        min_value=1
    )
    
    class Meta:
        model = Transfert
        fields = [
            'abattoir_expediteur_id',
            'abattoir_destinataire_id',
            'betes_ids',
            'nombre_betes_aleatoire',
            'note'
        ]
    
    def validate_abattoir_expediteur_id(self, value):
        """Valide que l'abattoir expéditeur existe"""
        try:
            abattoir = Abattoir.objects.get(id=value, actif=True)
        except Abattoir.DoesNotExist:
            raise serializers.ValidationError("Abattoir expéditeur invalide")
        return value
    
    def validate_abattoir_destinataire_id(self, value):
        """Valide que l'abattoir destinataire existe"""
        try:
            abattoir = Abattoir.objects.get(id=value, actif=True)
        except Abattoir.DoesNotExist:
            raise serializers.ValidationError("Abattoir destinataire invalide")
        return value
    
    def validate(self, data):
        """Validation globale"""
        betes_ids = data.get('betes_ids', [])
        nombre_betes_aleatoire = data.get('nombre_betes_aleatoire')
        abattoir_expediteur_id = data.get('abattoir_expediteur_id')
        abattoir_destinataire_id = data.get('abattoir_destinataire_id')
        
        # Vérifier que les abattoirs sont différents
        if abattoir_expediteur_id and abattoir_destinataire_id:
            if abattoir_expediteur_id == abattoir_destinataire_id:
                raise serializers.ValidationError(
                    "L'abattoir destinataire doit être différent de l'abattoir expéditeur"
                )
        
        # Vérifier qu'au moins une méthode de sélection est fournie
        if not betes_ids and not nombre_betes_aleatoire:
            raise serializers.ValidationError(
                "Vous devez spécifier soit les bêtes à transférer, soit le nombre de bêtes à sélectionner aléatoirement"
            )
        
        # Vérifier qu'une seule méthode est utilisée
        if betes_ids and nombre_betes_aleatoire:
            raise serializers.ValidationError(
                "Vous ne pouvez pas spécifier à la fois les bêtes et le nombre aléatoire"
            )
        
        return data


class UpdateTransfertStatusSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour du statut"""
    
    class Meta:
        model = Transfert
        fields = ['statut']
    
    def validate_statut(self, value):
        """Valide le changement de statut"""
        if self.instance:
            current_statut = self.instance.statut
            
            # Règles de transition de statut
            valid_transitions = {
                'EN_COURS': ['LIVRE', 'ANNULE'],
                'LIVRE': [],  # Une fois livré, pas de changement
                'ANNULE': [],  # Une fois annulé, pas de changement
            }
            
            if value not in valid_transitions.get(current_statut, []):
                raise serializers.ValidationError(
                    f"Transition de statut invalide de {current_statut} vers {value}"
                )
        
        return value


class TransfertStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques des transferts"""
    
    total_transferts = serializers.IntegerField()
    transferts_en_cours = serializers.IntegerField()
    transferts_livres = serializers.IntegerField()
    transferts_annules = serializers.IntegerField()
    taux_livraison = serializers.FloatField()


class ReceptionDetailleeSerializer(serializers.Serializer):
    """Serializer pour la réception détaillée d'un transfert"""
    
    received_count = serializers.IntegerField(min_value=0)
    missing_betes = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    received_betes = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True
    )
    
    def validate_received_count(self, value):
        """Valider le nombre de bêtes reçues"""
        if value < 0:
            raise serializers.ValidationError("Le nombre de bêtes reçues ne peut pas être négatif")
        return value
    
    def validate(self, data):
        """Validation globale"""
        received_count = data.get('received_count', 0)
        missing_betes = data.get('missing_betes', [])
        received_betes = data.get('received_betes', [])
        
        # Vérifier que le nombre de bêtes reçues correspond au nombre déclaré
        if len(received_betes) != received_count:
            raise serializers.ValidationError(
                f"Le nombre de bêtes reçues ({len(received_betes)}) ne correspond pas au nombre déclaré ({received_count})"
            )
        
        # Vérifier qu'il n'y a pas de doublons entre reçues et manquantes
        if missing_betes and received_betes:
            # Vérifier que les numéros de boucles manquantes ne sont pas dans les reçues
            # (cette vérification sera faite dans la vue avec les vrais numéros de boucles)
            pass
        
        return data
