from rest_framework import serializers
from .models import Espece, Bete
from django.contrib.auth import get_user_model

User = get_user_model()


class EspeceSerializer(serializers.ModelSerializer):
    """Serializer pour les espèces"""
    
    class Meta:
        model = Espece
        fields = ['id', 'nom', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']




class BeteSerializer(serializers.ModelSerializer):
    """Serializer pour les bêtes"""
    
    numero_identification = serializers.CharField(source='num_boucle', read_only=True)
    espece_nom = serializers.CharField(source='espece.nom', read_only=True)
    sexe_display = serializers.CharField(source='get_sexe_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    etat_sante_display = serializers.CharField(source='get_etat_sante_display', read_only=True)
    created_by_nom = serializers.CharField(source='created_by.get_full_name', read_only=True)
    abattoir_nom = serializers.CharField(source='abattoir.nom', read_only=True)
    
    # Informations de stabulation
    stabulation_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Bete
        fields = [
            'id', 'numero_identification', 'num_boucle_post_abattage', 'espece', 'espece_nom',
            'sexe', 'sexe_display', 'poids_vif', 'poids_a_chaud', 'poids_a_froid',
            'statut', 'statut_display', 'etat_sante', 'etat_sante_display',
            'abattage_urgence', 'abattoir', 'abattoir_nom', 'client',
            'created_by', 'created_by_nom', 'created_at', 'updated_at', 'stabulation_info'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_stabulation_info(self, obj):
        """Récupère les informations de stabulation si la bête est en stabulation"""
        if obj.statut == 'EN_STABULATION':
            # Récupérer la stabulation active de cette bête
            stabulation = obj.stabulations.filter(statut='EN_COURS').first()
            if stabulation:
                return {
                    'id': stabulation.id,
                    'numero_stabulation': stabulation.numero_stabulation,
                    'date_debut': stabulation.date_debut,
                    'type_bete': stabulation.type_bete,
                    'statut': stabulation.statut,
                    'statut_display': stabulation.get_statut_display(),
                    'created_by': stabulation.created_by.get_full_name() if stabulation.created_by else 'Système',
                    'created_at': stabulation.created_at,
                    'notes': stabulation.notes,
                    'abattoir_nom': stabulation.abattoir.nom if stabulation.abattoir else None
                }
        return None


class BeteCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de bêtes"""
    
    class Meta:
        model = Bete
        fields = [
            'num_boucle', 'num_boucle_post_abattage', 'espece', 'sexe',
            'poids_vif', 'poids_a_chaud', 'poids_a_froid', 'statut',
            'etat_sante', 'abattage_urgence', 'abattoir', 'client'
        ]
    
    def validate_num_boucle(self, value):
        """Validation de l'unicité du numéro d'identification"""
        if Bete.objects.filter(num_boucle=value).exists():
            raise serializers.ValidationError("Ce numéro d'identification existe déjà.")
        return value
    
    def validate_num_boucle_post_abattage(self, value):
        """Validation de l'unicité du numéro post abattage"""
        if Bete.objects.filter(num_boucle_post_abattage=value).exists():
            raise serializers.ValidationError("Ce numéro post abattage existe déjà.")
        return value


class BeteHistorySerializer(serializers.Serializer):
    """Serializer pour l'historique des modifications d'une bête"""
    
    history_id = serializers.IntegerField()
    history_date = serializers.DateTimeField()
    history_type = serializers.CharField()
    history_user = serializers.SerializerMethodField()
    
    # Champs de la bête
    num_boucle = serializers.CharField()
    num_boucle_post_abattage = serializers.CharField()
    espece_nom = serializers.SerializerMethodField()
    sexe = serializers.CharField()
    sexe_display = serializers.SerializerMethodField()
    poids_vif = serializers.DecimalField(max_digits=6, decimal_places=2, allow_null=True)
    poids_a_chaud = serializers.DecimalField(max_digits=6, decimal_places=2, allow_null=True)
    poids_a_froid = serializers.DecimalField(max_digits=6, decimal_places=2, allow_null=True)
    statut = serializers.CharField()
    statut_display = serializers.SerializerMethodField()
    etat_sante = serializers.CharField()
    etat_sante_display = serializers.SerializerMethodField()
    abattage_urgence = serializers.BooleanField()
    abattoir_nom = serializers.SerializerMethodField()
    
    # Informations sur les changements
    changes = serializers.SerializerMethodField()
    
    def get_history_user(self, obj):
        """Récupère l'utilisateur qui a effectué la modification"""
        if obj.history_user_id:
            try:
                user = User.objects.get(id=obj.history_user_id)
                return {
                    'id': user.id,
                    'username': user.username,
                    'full_name': user.get_full_name(),
                }
            except User.DoesNotExist:
                return None
        return None
    
    def get_espece_nom(self, obj):
        """Récupère le nom de l'espèce"""
        return obj.espece.nom if obj.espece else None
    
    def get_sexe_display(self, obj):
        """Récupère le libellé du sexe"""
        return dict(Bete.SEXE_CHOICES).get(obj.sexe, obj.sexe)
    
    def get_statut_display(self, obj):
        """Récupère le libellé du statut"""
        return dict(Bete.STATUT_CHOICES).get(obj.statut, obj.statut)
    
    def get_etat_sante_display(self, obj):
        """Récupère le libellé de l'état de santé"""
        return dict(Bete.SANTE_CHOICES).get(obj.etat_sante, obj.etat_sante)
    
    def get_abattoir_nom(self, obj):
        """Récupère le nom de l'abattoir"""
        return obj.abattoir.nom if obj.abattoir else None
    
    def get_changes(self, obj):
        """Calcule les changements par rapport à la version précédente"""
        changes = []
        prev_record = obj.prev_record
        
        if not prev_record:
            return None  # Première version
        
        # Liste des champs à comparer
        fields_to_compare = {
            'num_boucle': 'Numéro de boucle',
            'num_boucle_post_abattage': 'Numéro post-abattage',
            'sexe': 'Sexe',
            'poids_vif': 'Poids vif',
            'poids_a_chaud': 'Poids à chaud',
            'poids_a_froid': 'Poids à froid',
            'statut': 'Statut',
            'etat_sante': 'État de santé',
            'abattage_urgence': 'Abattage urgent',
        }
        
        for field, label in fields_to_compare.items():
            old_value = getattr(prev_record, field, None)
            new_value = getattr(obj, field, None)
            
            if old_value != new_value:
                changes.append({
                    'field': field,
                    'label': label,
                    'old_value': str(old_value) if old_value is not None else None,
                    'new_value': str(new_value) if new_value is not None else None,
                })
        
        # Comparer les relations
        if prev_record.espece_id != obj.espece_id:
            changes.append({
                'field': 'espece',
                'label': 'Espèce',
                'old_value': prev_record.espece.nom if prev_record.espece else None,
                'new_value': obj.espece.nom if obj.espece else None,
            })
        
        if prev_record.abattoir_id != obj.abattoir_id:
            changes.append({
                'field': 'abattoir',
                'label': 'Abattoir',
                'old_value': prev_record.abattoir.nom if prev_record.abattoir else None,
                'new_value': obj.abattoir.nom if obj.abattoir else None,
            })
        
        return changes if changes else None


