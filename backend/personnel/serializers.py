from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Role, Personnel
from abattoir.models import Abattoir

User = get_user_model()


class RoleSerializer(serializers.ModelSerializer):
    """Serializer pour les rôles"""
    
    class Meta:
        model = Role
        fields = [
            'id', 'nom', 'description', 'permissions', 'actif',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PersonnelListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste du personnel (version allégée)"""
    
    abattoir_nom = serializers.CharField(source='abattoir.nom', read_only=True)
    role_nom = serializers.CharField(source='role.get_nom_display', read_only=True)
    age = serializers.ReadOnlyField()
    anciennete = serializers.ReadOnlyField()
    created_by_nom = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Personnel
        fields = [
            'id', 'nom', 'prenom', 'nom_complet', 'numero_employe', 'abattoir_nom', 'role_nom',
            'telephone', 'email', 'statut', 'date_embauche', 'age', 'anciennete',
            'photo', 'created_by_nom', 'created_at'
        ]


class PersonnelDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour le personnel"""
    
    abattoir_nom = serializers.CharField(source='abattoir.nom', read_only=True)
    abattoir_id = serializers.IntegerField(source='abattoir.id', read_only=True)
    role_nom = serializers.CharField(source='role.get_nom_display', read_only=True)
    role_id = serializers.IntegerField(source='role.id', read_only=True)
    age = serializers.ReadOnlyField()
    anciennete = serializers.ReadOnlyField()
    created_by_nom = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Personnel
        fields = [
            'id', 'nom', 'prenom', 'nom_complet', 'date_naissance', 'lieu_naissance',
            'sexe', 'nationalite', 'numero_carte_identite', 'date_emission_carte',
            'lieu_emission_carte', 'telephone', 'telephone_urgence', 'email',
            'adresse', 'wilaya', 'commune', 'abattoir', 'abattoir_nom', 'abattoir_id',
            'role', 'role_nom', 'role_id', 'numero_employe', 'date_embauche',
            'statut', 'photo', 'carte_identite_recto', 'carte_identite_verso',
            'created_by', 'created_by_nom',
            'created_at', 'updated_at', 'notes', 'competences', 'formations',
            'age', 'anciennete'
        ]
        read_only_fields = [
            'id', 'nom_complet', 'age', 'anciennete', 'created_at', 'updated_at'
        ]


class PersonnelCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la création et mise à jour du personnel"""
    
    class Meta:
        model = Personnel
        fields = [
            'nom', 'prenom', 'date_naissance', 'lieu_naissance', 'sexe', 'nationalite',
            'numero_carte_identite', 'date_emission_carte', 'lieu_emission_carte',
            'telephone', 'telephone_urgence', 'email', 'adresse', 'wilaya', 'commune',
            'abattoir', 'role', 'numero_employe', 'date_embauche', 'statut',
            'photo', 'carte_identite_recto', 'carte_identite_verso',
            'notes', 'competences', 'formations'
        ]
    
    def validate_numero_employe(self, value):
        """Valider l'unicité du numéro d'employé dans l'abattoir"""
        abattoir = self.initial_data.get('abattoir')
        if abattoir:
            queryset = Personnel.objects.filter(abattoir=abattoir, numero_employe=value)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError(
                    "Ce numéro d'employé existe déjà dans cet abattoir."
                )
        return value
    
    def validate_numero_carte_identite(self, value):
        """Valider l'unicité du numéro de carte d'identité"""
        queryset = Personnel.objects.filter(numero_carte_identite=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError(
                "Ce numéro de carte d'identité existe déjà."
            )
        return value




class PersonnelStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques du personnel"""
    
    total_personnel = serializers.IntegerField()
    personnel_actif = serializers.IntegerField()
    personnel_inactif = serializers.IntegerField()
    personnel_par_role = serializers.DictField()
    personnel_par_abattoir = serializers.DictField()
    personnel_par_wilaya = serializers.DictField()
    moyenne_age = serializers.FloatField()
    moyenne_anciennete = serializers.FloatField()


class PersonnelSearchSerializer(serializers.Serializer):
    """Serializer pour la recherche de personnel"""
    
    query = serializers.CharField(max_length=100)
    abattoir = serializers.IntegerField(required=False)
    role = serializers.IntegerField(required=False)
    statut = serializers.CharField(required=False)
    wilaya = serializers.CharField(required=False)
