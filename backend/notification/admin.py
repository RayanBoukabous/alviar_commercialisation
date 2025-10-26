from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'user',
        'type_notification',
        'title',
        'priority',
        'is_read',
        'abattoir',
        'created_at'
    ]
    
    list_filter = [
        'type_notification',
        'priority',
        'is_read',
        'abattoir',
        'created_at'
    ]
    
    search_fields = [
        'title',
        'message',
        'user__username',
        'user__email',
        'abattoir__nom'
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
        'read_at'
    ]
    
    fieldsets = (
        ('Informations générales', {
            'fields': (
                'user',
                'abattoir',
                'type_notification',
                'title',
                'message'
            )
        }),
        ('Priorité et statut', {
            'fields': (
                'priority',
                'is_read',
                'read_at'
            )
        }),
        ('Données contextuelles', {
            'fields': (
                'data',
            ),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': (
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        })
    )
    
    ordering = ['-created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'abattoir')
