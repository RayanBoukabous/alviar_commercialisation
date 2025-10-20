from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    """Serializer pour les clients"""
    
    type_client_display = serializers.CharField(source='get_type_client_display', read_only=True)
    commercial_nom = serializers.CharField(source='commercial.get_full_name', read_only=True)
    created_by_nom = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Client
        fields = [
            'id', 'nom', 'type_client', 'type_client_display', 'telephone', 'email',
            'adresse', 'nif', 'nis', 'wilaya', 'commune', 'contact_principal', 
            'telephone_contact', 'commercial', 'commercial_nom', 'notes', 
            'created_at', 'updated_at', 'created_by', 'created_by_nom'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClientCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de clients"""
    
    class Meta:
        model = Client
        fields = [
            'nom', 'type_client', 'telephone', 'email', 'adresse', 'nif', 'nis', 
            'wilaya', 'commune', 'contact_principal', 'telephone_contact', 'commercial', 'notes'
        ]


class ClientStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques des clients"""
    
    total_clients = serializers.IntegerField()
    par_type = serializers.DictField()
    par_wilaya = serializers.DictField()
    par_commune = serializers.DictField()

