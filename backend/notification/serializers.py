from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les notifications"""
    
    # Champs calculés
    time_since_created = serializers.SerializerMethodField()
    abattoir_nom = serializers.SerializerMethodField()
    type_display = serializers.SerializerMethodField()
    priority_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'type_notification',
            'type_display',
            'title',
            'message',
            'priority',
            'priority_display',
            'is_read',
            'read_at',
            'abattoir',
            'abattoir_nom',
            'data',
            'created_at',
            'updated_at',
            'time_since_created'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'read_at',
            'time_since_created',
            'abattoir_nom',
            'type_display',
            'priority_display'
        ]
    
    def get_time_since_created(self, obj):
        """Retourne le temps écoulé depuis la création"""
        return obj.time_since_created
    
    def get_abattoir_nom(self, obj):
        """Retourne le nom de l'abattoir"""
        return obj.abattoir.nom if obj.abattoir else None
    
    def get_type_display(self, obj):
        """Retourne l'affichage du type de notification"""
        return obj.get_type_notification_display()
    
    def get_priority_display(self, obj):
        """Retourne l'affichage de la priorité"""
        return obj.get_priority_display()


class NotificationListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des notifications"""
    
    abattoir_nom = serializers.SerializerMethodField()
    time_since_created = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'type_notification',
            'title',
            'message',
            'priority',
            'is_read',
            'abattoir_nom',
            'created_at',
            'time_since_created'
        ]
    
    def get_abattoir_nom(self, obj):
        """Retourne le nom de l'abattoir"""
        return obj.abattoir.nom if obj.abattoir else None
    
    def get_time_since_created(self, obj):
        """Retourne le temps écoulé depuis la création"""
        return obj.time_since_created


class NotificationUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour des notifications (marquer comme lu)"""
    
    class Meta:
        model = Notification
        fields = ['is_read']
    
    def update(self, instance, validated_data):
        """Override update pour gérer la date de lecture"""
        if validated_data.get('is_read') and not instance.is_read:
            from django.utils import timezone
            instance.read_at = timezone.now()
        return super().update(instance, validated_data)


class NotificationStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques des notifications"""
    
    total_notifications = serializers.IntegerField()
    unread_count = serializers.IntegerField()
    urgent_count = serializers.IntegerField()
    by_type = serializers.DictField()
    by_priority = serializers.DictField()
