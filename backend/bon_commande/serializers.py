from rest_framework import serializers
from .models import BonDeCommande
from abattoir.models import Abattoir
from client.models import Client


class BonDeCommandeSerializer(serializers.ModelSerializer):
    """Serializer pour la lecture des bons de commande"""
    
    abattoir_nom = serializers.CharField(source='abattoir.nom', read_only=True)
    abattoir_info = serializers.SerializerMethodField()
    
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    client_info = serializers.SerializerMethodField()
    
    created_by_nom = serializers.SerializerMethodField()
    
    type_quantite_display = serializers.CharField(source='get_type_quantite_display', read_only=True)
    type_bete_display = serializers.CharField(source='get_type_bete_display', read_only=True)
    type_produit_display = serializers.CharField(source='get_type_produit_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = BonDeCommande
        fields = [
            'id', 'numero_bon', 'type_quantite', 'type_quantite_display',
            'quantite', 'type_bete', 'type_bete_display', 'type_produit',
            'type_produit_display', 'avec_cinquieme_quartier',
            'source', 'source_display',
            'abattoir', 'abattoir_nom', 'abattoir_info',
            'client', 'client_nom', 'client_info',
            'notes', 'versement', 'statut', 'statut_display',
            'date_livraison_prevue', 'date_livraison_reelle',
            'created_by', 'created_by_nom',
            'created_at', 'updated_at',
            'est_modifiable', 'est_annulable'
        ]
        read_only_fields = ['id', 'numero_bon', 'created_at', 'updated_at', 'created_by']
    
    def get_abattoir_info(self, obj):
        if obj.abattoir:
            return {
                'id': obj.abattoir.id,
                'nom': obj.abattoir.nom,
                'wilaya': obj.abattoir.wilaya,
                'commune': obj.abattoir.commune,
            }
        return None
    
    def get_client_info(self, obj):
        if obj.client:
            return {
                'id': obj.client.id,
                'nom': obj.client.nom,
                'telephone': obj.client.telephone,
                'email': obj.client.email,
                'type_client': obj.client.type_client,
            }
        return None
    
    def get_created_by_nom(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name()
        return 'Système'


class BonDeCommandeCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création et mise à jour des bons de commande"""
    
    class Meta:
        model = BonDeCommande
        fields = [
            'type_quantite', 'quantite', 'type_bete', 'type_produit',
            'avec_cinquieme_quartier', 'source', 'abattoir', 'client', 
            'notes', 'versement', 'statut', 
            'date_livraison_prevue', 'date_livraison_reelle'
        ]
    
    def validate_quantite(self, value):
        """Valider que la quantité est positive"""
        if value <= 0:
            raise serializers.ValidationError("La quantité doit être supérieure à 0.")
        return value
    
    def validate_versement(self, value):
        """Valider que le versement est positif"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Le versement ne peut pas être négatif.")
        return value
    
    def validate(self, data):
        """Validations globales"""
        # Vérifier que l'abattoir existe et est actif
        abattoir = data.get('abattoir')
        if abattoir and not abattoir.actif:
            raise serializers.ValidationError({
                'abattoir': "Cet abattoir n'est pas actif."
            })
        
        # Vérifier la cohérence des dates
        date_prevue = data.get('date_livraison_prevue')
        date_reelle = data.get('date_livraison_reelle')
        
        if date_prevue and date_reelle and date_reelle < date_prevue:
            raise serializers.ValidationError({
                'date_livraison_reelle': "La date de livraison réelle ne peut pas être antérieure à la date prévue."
            })
        
        return data


class BonDeCommandeUpdateStatusSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour du statut uniquement"""
    
    class Meta:
        model = BonDeCommande
        fields = ['statut', 'date_livraison_reelle']
    
    def validate_statut(self, value):
        """Valider les transitions de statut"""
        instance = self.instance
        
        if not instance:
            return value
        
        # Définir les transitions valides
        valid_transitions = {
            'BROUILLON': ['CONFIRME', 'ANNULE'],
            'CONFIRME': ['EN_COURS', 'ANNULE'],
            'EN_COURS': ['LIVRE', 'ANNULE'],
            'LIVRE': [],  # Statut final
            'ANNULE': [],  # Statut final
        }
        
        current_status = instance.statut
        if value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Transition de statut invalide de {instance.get_statut_display()} vers {dict(BonDeCommande.STATUT_CHOICES)[value]}."
            )
        
        return value
    
    def validate(self, data):
        """Si le statut passe à LIVRE, vérifier la date de livraison"""
        if data.get('statut') == 'LIVRE' and not data.get('date_livraison_reelle'):
            from datetime import date
            data['date_livraison_reelle'] = date.today()
        
        return data

