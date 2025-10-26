from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django.db import transaction
from .models import Abattoir, HistoriqueAbattoir
from .serializers import AbattoirSerializer


class AbattoirUpdateView(generics.UpdateAPIView):
    """Vue personnalisée pour la mise à jour d'abattoirs avec historique"""
    
    queryset = Abattoir.objects.all()
    serializer_class = AbattoirSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        """Override de la méthode update pour enregistrer l'historique"""
        instance = self.get_object()
        
        # Sauvegarder les anciennes valeurs
        anciennes_valeurs = {
            'nom': instance.nom,
            'wilaya': instance.wilaya,
            'commune': instance.commune,
            'actif': instance.actif,
            'capacite_reception_ovin': instance.capacite_reception_ovin,
            'capacite_reception_bovin': instance.capacite_reception_bovin,
            'capacite_stabulation_ovin': instance.capacite_stabulation_ovin,
            'capacite_stabulation_bovin': instance.capacite_stabulation_bovin,
        }
        
        # Effectuer la mise à jour
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            # Sauvegarder l'instance mise à jour
            self.perform_update(serializer)
            
            # Enregistrer l'historique
            self._enregistrer_historique(instance, anciennes_valeurs, request)
        
        return Response(serializer.data)
    
    def _enregistrer_historique(self, instance, anciennes_valeurs, request):
        """Enregistre l'historique des modifications"""
        nouvelles_valeurs = {
            'nom': instance.nom,
            'wilaya': instance.wilaya,
            'commune': instance.commune,
            'actif': instance.actif,
            'capacite_reception_ovin': instance.capacite_reception_ovin,
            'capacite_reception_bovin': instance.capacite_reception_bovin,
            'capacite_stabulation_ovin': instance.capacite_stabulation_ovin,
            'capacite_stabulation_bovin': instance.capacite_stabulation_bovin,
        }
        
        # Identifier les champs modifiés
        champs_modifies = []
        details_modification = {}
        
        for champ, ancienne_valeur in anciennes_valeurs.items():
            nouvelle_valeur = nouvelles_valeurs[champ]
            if ancienne_valeur != nouvelle_valeur:
                champs_modifies.append(champ)
                details_modification[champ] = {
                    'ancienne_valeur': ancienne_valeur,
                    'nouvelle_valeur': nouvelle_valeur
                }
        
        # Si des champs ont été modifiés, enregistrer l'historique
        if champs_modifies:
            # Créer un historique global
            HistoriqueAbattoir.creer_historique(
                abattoir=instance,
                utilisateur=request.user,
                type_action='UPDATE',
                details_modification=details_modification,
                notes=f"Modification des champs: {', '.join(champs_modifies)}",
                request=request
            )
            
            # Créer un historique par champ modifié (optionnel)
            for champ in champs_modifies:
                HistoriqueAbattoir.creer_historique(
                    abattoir=instance,
                    utilisateur=request.user,
                    type_action='UPDATE',
                    champ_modifie=champ,
                    ancienne_valeur=str(anciennes_valeurs[champ]),
                    nouvelle_valeur=str(nouvelles_valeurs[champ]),
                    notes=f"Modification du champ {champ}",
                    request=request
                )
